import { CustomProvider } from "../../modules/di/interfaces";
import { RxAxios } from "./rxjs-axios";
import axios, { CreateAxiosDefaults } from "axios";

export * from "./response";
export * from "./rxjs-axios";

export function provideRxAxios(config?: CreateAxiosDefaults): CustomProvider[] {
  return [
    {
      provide: RxAxios,
      useFactory: () => {
        return new RxAxios(axios.create(config));
      },
    },
  ];
}
