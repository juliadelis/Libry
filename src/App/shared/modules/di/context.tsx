import React, {
  ComponentType,
  createContext,
  memo,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import { DependencyContainer, InjectionToken } from "tsyringe";

import {
  createChildInjector,
  inject,
  injectAll,
  injector,
  setup,
} from "./global";
import { CustomProvider } from "./interfaces";

const DependencyInjectionContext =
  createContext<DependencyContainer>(injector());

export function useInjector() {
  return useContext(DependencyInjectionContext);
}

export function useInject<T>(token: InjectionToken<T>) {
  const container = useInjector();
  return useMemo(() => {
    return inject(token, container);
  }, [token, container]);
}

export function useInjectAll<T>(token: InjectionToken<T>) {
  const container = useInjector();
  return useMemo(() => {
    return injectAll(token, container);
  }, [token, container]);
}

export const DependencyInjectionContainer = memo(
  ({
    container,
    providers,
    children,
  }: {
    container?: DependencyContainer;
    providers?: CustomProvider[];
    children?: React.ReactNode | React.ReactNode[];
  }) => {
    const [currentContainer, setCurrentContainer] =
      useState<DependencyContainer>();

    const parentContainer = useInjector();

    useLayoutEffect(() => {
      const childContainer = createChildInjector(container ?? parentContainer);

      setCurrentContainer(childContainer);

      return () => {
        childContainer.dispose();
      };
    }, [container, parentContainer]);

    useMemo(() => {
      if (!providers?.length || !currentContainer) {
        return;
      }

      setup(providers, currentContainer, true);
    }, [providers, currentContainer]);

    if (!currentContainer) {
      return null;
    }

    return (
      <DependencyInjectionContext.Provider value={currentContainer}>
        {children}
      </DependencyInjectionContext.Provider>
    );
  },
);

export function withInjectorComp(
  cfg: {
    providers?: CustomProvider[];
    container?: DependencyContainer;
  },
  node: React.ReactNode,
) {
  return (
    <DependencyInjectionContainer
      container={cfg?.container}
      providers={cfg?.providers}>
      {node}
    </DependencyInjectionContainer>
  );
}

export function withInjectorFn<T extends ComponentType<any>>(
  cfg: {
    providers?: CustomProvider[];
    container?: DependencyContainer;
  },
  Fn: T,
): T {
  return ((props: any) => {
    return withInjectorComp(cfg, <Fn {...(props ?? {})}></Fn>);
  }) as any;
}
