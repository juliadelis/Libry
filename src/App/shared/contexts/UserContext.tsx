import { createContext } from "react";
import { UserModelLike } from "../models/user.model";

export interface UserHolder {
  user: UserModelLike;
}

export const UserContext = createContext<UserHolder | null>(null);
