import { useMemo, useRef, useState } from "react";
import { useRerender } from "./useRerender";

export type NodeRef<T> = {
  (): T;
  value: T;
  set: (value: T) => void;
  update: (fn: (value: T) => T) => void;
  asReadonly: () => () => T;
};

export function useMemoRef<T>(
  factory: () => T,
  deps?: React.DependencyList
): () => T | null {
  deps ??= [];

  const dataRef = useRef<T | null>(null);

  dataRef.current = useMemo(() => {
    return factory();
  }, deps);

  return useMemo<() => T | null>(() => {
    return () => {
      return dataRef.current;
    };
  }, []);
}

function equalsDefault<T>(a: T, b: T) {
  return Object.is(a, b);
}

export function useStateRef<S>(
  initialState?: S | ((oldValue?: S) => S),
  cfg?: {
    deps?: React.DependencyList;
    equalsFn?: (oldValue: S, newValue: S) => boolean;
  }
): NodeRef<S> {
  const deps = cfg?.deps ?? [];

  const reRender = useRerender();
  const dataRef = useRef<S | undefined>(undefined);

  const equalsRef = useRef<(a: S, b: S) => boolean>(equalsDefault);
  equalsRef.current = useMemo(() => {
    return cfg?.equalsFn ?? equalsDefault;
  }, deps);

  const node = useMemo(() => {
    let initialized = false;
    const init = () => {
      if (initialized) {
        return;
      }

      initialized = true;

      if (typeof initialState === "function") {
        dataRef.current = (initialState as Function)(dataRef.current) ?? null;
      } else {
        dataRef.current = initialState ?? dataRef.current ?? null;
      }
    };

    const get = () => {
      init();

      return dataRef.current;
    };

    const aux: NodeRef<S> = (() => {
      return get();
    }) as any;

    aux.asReadonly = function () {
      return get;
    };

    aux.set = (value) => {
      if (!initialized) {
        initialized = true;
        dataRef.current = value;

        return;
      }

      if (!equalsRef.current(dataRef.current, value)) {
        dataRef.current = value;
        reRender();
      }
    };

    aux.update = function (fn) {
      this.set(fn(get()));
    };

    Object.defineProperty(aux, "value", {
      get,
      set: function (this: NodeRef<S>, v) {
        this.set(v);
      },
    });

    return aux;
  }, deps);

  return node;
}
