export interface LoginDtoModelLike {
  email?: string;
  password?: string;
}

export interface UserDtoModelLike {
  id: number;
  name?: string;
  email?: string;
  role_id?: number;
  password?: string;
}
