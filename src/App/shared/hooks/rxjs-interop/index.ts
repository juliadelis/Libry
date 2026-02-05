import React, { useLayoutEffect, useMemo, useRef } from "react";
import {
  BehaviorSubject,
  defer,
  finalize,
  first,
  from,
  mergeMap,
  Observable,
  Observer,
  Subject,
  Subscription,
} from "rxjs";
import { useStateRef } from "../useStateRef";
import { useUnmountEffect, useUpdateEffect } from "../lifecycle";

export function useRxLifecycle(): Observable<void> {
  const lifecycle = useMemo(() => {
    return new Subject<void>();
  }, [1]);

  useUnmountEffect(() => {
    lifecycle.next();
    lifecycle.complete();
  });

  return lifecycle;
}

export function useRxBehaviorSubject<T>(value: T, deps?: React.DependencyList) {
  deps ??= [];

  const subject = useMemo(() => {
    return new BehaviorSubject(value);
  }, deps);

  useUpdateEffect(() => {
    subject.next(value);
  }, [subject, value]);

  useUnmountEffect(() => {
    subject.complete();
    subject.unsubscribe();
  }, [subject]);

  return subject;
}

export function useRxObservableEffect<T>(
  observableOrFactory:
    | Observable<T>
    | undefined
    | null
    | (() => void | Observable<T> | undefined | null),
  observerOrNext?: Partial<Observer<T>> | ((value: T) => void),
  deps?: React.DependencyList
) {
  const factoryMode = typeof observableOrFactory === "function";
  deps ??= [];

  if (!factoryMode) {
    deps = [observableOrFactory, ...deps];
  } else {
    deps = [1, ...deps];
  }

  const observerRef = useRef<Partial<Observer<T>>>({});
  observerRef.current = useMemo<Partial<Observer<T>>>(() => {
    if (typeof observerOrNext === "function") {
      return {
        next: observerOrNext,
      };
    }

    return observerOrNext;
  }, [observerOrNext]);

  const subscriptionRef = useRef<Subscription>(null);
  const subscription = useMemo(() => {
    subscriptionRef.current?.unsubscribe();

    let observableAux: Observable<T>;
    if (factoryMode) {
      observableAux = defer(() => {
        const aux = observableOrFactory() as Observable<T>;
        return from(aux);
      });
    } else {
      observableAux = observableOrFactory;
    }

    return observableAux?.subscribe({
      next: (v) => {
        observerRef.current?.next?.(v);
      },
      error: (err) => {
        observerRef.current?.error?.(err);
      },
      complete: () => {
        observerRef.current?.complete?.();
      },
    });
  }, deps);

  subscriptionRef.current = subscription;

  useLayoutEffect(() => {
    return () => {
      subscription?.unsubscribe();
    };
  }, [subscription]);
}

export function useRxObservable<T>(
  observableOrFactory: Observable<T> | (() => Observable<T>),
  deps?: React.DependencyList
) {
  const nodeRef = useStateRef<T>(null);

  useRxObservableEffect(observableOrFactory, nodeRef.set, deps);

  return nodeRef.asReadonly();
}

export function useRxObservableWhen<T>(
  observableOrFactory: Observable<T> | (() => Observable<T>),
  when: boolean | Observable<boolean>,
  deps?: React.DependencyList
) {
  const factoryMode = typeof observableOrFactory === "function";
  deps ??= [];

  if (!factoryMode) {
    deps = [observableOrFactory, ...deps];
  } else {
    deps = [1, ...deps];
  }

  const observableSource = useMemo(() => {
    let observableAux: Observable<T>;
    if (factoryMode) {
      observableAux = defer(() => {
        const aux = observableOrFactory() as Observable<T>;
        return from(aux);
      });
    } else {
      observableAux = observableOrFactory;
    }

    return observableAux;
  }, deps);

  const emitterWhenSubject = useMemo(() => {
    return new Subject<void>();
  }, deps);

  const nodeRef = useRxObservable(() => {
    return emitterWhenSubject.pipe(
      mergeMap(() => {
        return observableSource;
      })
    );
  }, [emitterWhenSubject, observableSource]);

  const subscriptionRef = useRef<Subscription>(null);
  const subscription = useMemo(() => {
    subscriptionRef.current?.unsubscribe();

    if (typeof when === "boolean") {
      if (when && !emitterWhenSubject.closed) {
        emitterWhenSubject.next();
        emitterWhenSubject.complete();
        emitterWhenSubject.unsubscribe();
      }
    } else if (when instanceof Observable && !emitterWhenSubject.closed) {
      return (when as Observable<boolean>)
        .pipe(
          first((x) => x),
          finalize(() => {
            emitterWhenSubject.unsubscribe();
          })
        )
        .subscribe({
          next: () => {
            emitterWhenSubject.next();
          },
          complete: () => {
            emitterWhenSubject.complete();
          },
          error: (e) => {
            emitterWhenSubject.error(e);
          },
        });
    }

    return null;
  }, [when, emitterWhenSubject]);

  subscriptionRef.current = subscription;

  useLayoutEffect(() => {
    return () => {
      subscription?.unsubscribe();
    };
  }, [subscription]);

  return nodeRef;
}
