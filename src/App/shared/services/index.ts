import { CustomProvider } from "../modules/di/interfaces";
import { authService } from "./auth.service";
import { bookService } from "./book.service";
import { usersService } from "./users.service";

export function provideServices(): CustomProvider[] {
  return [usersService, authService, bookService];
}
