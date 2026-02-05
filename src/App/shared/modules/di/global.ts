import "reflect-metadata";
import {
  container as globalContainer,
  DependencyContainer,
  InjectionToken,
  instanceCachingFactory,
  isClassProvider,
  isFactoryProvider,
  isTokenProvider,
  isValueProvider,
  Lifecycle,
  Provider,
} from "tsyringe";
import constructor, { CustomProvider } from "./interfaces";
import { DestroyRef } from "./destroy-ref";
import { container } from "tsyringe";
import { TOKENS } from "./tokens";

import axios from "axios";
import { RxEventBus } from "@rxjs-toolkit/eventbus";
import { RxAxios } from "../rxjs-axios";
import { usersService } from "../../services/users.service";
import { authService } from "../../services/auth.service";

export function registerGlobalDeps() {
  if (!container.isRegistered(TOKENS.Http)) {
    container.register(TOKENS.Http, {
      useFactory: () =>
        new RxAxios(
          axios.create({
            baseURL: import.meta.env.VITE_API_URL,
          }),
        ),
    });
  }

  if (!container.isRegistered(TOKENS.EventBus)) {
    container.register(TOKENS.EventBus, { useClass: RxEventBus });
  }

  if (!container.isRegistered(usersService)) {
    container.register(usersService, usersService);
  }

  if (!container.isRegistered(authService)) {
    container.register(authService, authService);
  }
}

const providers: CustomProvider[] = [DestroyRef];

function _setupInjectorContainer(container: DependencyContainer) {
  setup(providers, container, true);
}

_setupInjectorContainer(globalContainer);

let CURRENT_CONTAINER = globalContainer;

export function setCurrentContainer(container: DependencyContainer) {
  const lastContainer = CURRENT_CONTAINER;

  CURRENT_CONTAINER = container;

  return lastContainer;
}

export function runInInjectorContext<T = void>(
  container: DependencyContainer,
  fn: (container: DependencyContainer) => T,
): T {
  const lastContainer = setCurrentContainer(container);

  try {
    return fn(container);
  } finally {
    setCurrentContainer(lastContainer);
  }
}

export function injector(): DependencyContainer {
  return CURRENT_CONTAINER;
}

export function createChildInjector(
  container?: DependencyContainer,
): DependencyContainer {
  const child = (container ?? injector()).createChildContainer();

  _setupInjectorContainer(child);

  return child;
}

export function inject<T>(
  token: InjectionToken<T>,
  container?: DependencyContainer,
) {
  return (container ?? injector()).resolve(token);
}

export function injectAll<T>(
  token: InjectionToken<T>,
  container?: DependencyContainer,
) {
  return (container ?? injector()).resolveAll(token);
}

export function setup(
  providers: CustomProvider[],
  container?: DependencyContainer,
  shouldForce = true,
) {
  if (!providers?.length) {
    return;
  }

  container ??= injector();

  const _setupProvidersRecursive = (
    providerOrProviders: CustomProvider | CustomProvider[],
  ) => {
    if (Array.isArray(providerOrProviders)) {
      for (const provider of providerOrProviders) {
        _setupProvidersRecursive(provider);
      }

      return;
    }

    const provider = providerOrProviders;

    let token: InjectionToken;
    let providerOrConstructorAux: Provider | constructor<any>;
    let lifecycle: Lifecycle;

    if (isProvider(provider)) {
      token = provider.provide;
      providerOrConstructorAux = provider;
      lifecycle = provider.lifecycle;
    } else {
      token = provider;
      providerOrConstructorAux = provider;
    }

    if (!shouldForce && container.isRegistered(token)) {
      return;
    }

    if (isProvider(providerOrConstructorAux)) {
      if (isValueProvider(providerOrConstructorAux)) {
        lifecycle ??= Lifecycle.Transient;
      } else {
        lifecycle ??= Lifecycle.ContainerScoped;
      }

      if (isFactoryProvider(providerOrConstructorAux)) {
        if (lifecycle !== Lifecycle.Transient) {
          const { useFactory } = providerOrConstructorAux;

          providerOrConstructorAux = {
            useFactory: instanceCachingFactory((injector) => {
              return runInInjectorContext(injector, useFactory);
            }),
          };
        }

        lifecycle = null;
      }
    } else {
      lifecycle ??= Lifecycle.ContainerScoped;
    }

    container.register(token, providerOrConstructorAux as any, {
      lifecycle,
    });
  };

  _setupProvidersRecursive(providers);
}

function isProvider(provider: any): provider is Provider {
  return (
    isClassProvider(provider) ||
    isValueProvider(provider) ||
    isTokenProvider(provider) ||
    isFactoryProvider(provider)
  );
}
