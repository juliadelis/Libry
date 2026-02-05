import { InjectionToken } from "tsyringe";
import { LoadingController } from "../helpers/loading.controller";

export const GLOBAL_LOADING: InjectionToken<LoadingController> =
  Symbol("GLOBAL_LOADING");

export const LOADING: InjectionToken<LoadingController> = Symbol("LOADING");
