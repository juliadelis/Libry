import { RxEventBus } from "@rxjs-toolkit/eventbus";
import { GLOBAL_LOADING, LOADING } from "./shared/constants/app.constants";
import { inject } from "./shared/modules/di/global";
import { CustomProvider } from "./shared/modules/di/interfaces";
import { provideRxAxios } from "./shared/modules/rxjs-axios";
import { provideServices } from "./shared/services";
import { LoadingController } from "./shared/helpers/loading.controller";
import { DestroyRef } from "./shared/modules/di/destroy-ref";

export const providers: CustomProvider[] = [
  provideRxAxios({
    baseURL: import.meta.env.VITE_API_URL,
  }),
  provideServices(),
  {
    provide: GLOBAL_LOADING,
    useFactory: () => {
      return new LoadingController();
    },
  },
  {
    provide: LOADING,
    useToken: GLOBAL_LOADING,
  },
  {
    provide: RxEventBus,
    useFactory: () => {
      const eventBus = new RxEventBus();

      inject(DestroyRef).onDestroy(() => {
        eventBus.dispose();
      });

      return eventBus;
    },
  },
];
