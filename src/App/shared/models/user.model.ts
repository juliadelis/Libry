import { BaseOptions } from "../helpers/query-options/base-options";
import { ISetParamsAdapter } from "../helpers/query-options/interfaces";
import {
  PageOptions,
  type PageOptionsLike,
} from "../helpers/query-options/options/page-options";

export interface UserModelLike {
  name: string;
  email: string;
  password: string;
  bio?: string;
  photoUrl?: string;
}

export interface CreateUserModelLike {
  name: string;
  email: string;
  password: string;
}

export interface EditUserModelLike {
  name?: string;
  email?: string;
  password?: string;
  bio?: string;
  photoUrl?: string;
}

export interface LogedUserModelLike {
  id: number;
  name?: string;
  email?: string;
  bio?: string;
  photoUrl?: string;
}

export interface UsersQueryOptionsDtoLike {
  pageOptions?: PageOptionsLike;
  nameSearch?: string;
}

export class UsersQueryOptionsDto
  extends BaseOptions<UsersQueryOptionsDtoLike, UsersQueryOptionsDto>
  implements UsersQueryOptionsDtoLike
{
  pageOptions?: PageOptions;

  override reset(options?: Partial<UsersQueryOptionsDtoLike>): void {
    this.pageOptions = new PageOptions(options?.pageOptions);
  }

  protected override _handleParamsAdapter(
    paramsAdapter: ISetParamsAdapter,
  ): void {
    this.pageOptions?.applyTo(paramsAdapter);
  }
}
