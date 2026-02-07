import { RxAxios } from "../modules/rxjs-axios";
import { RxEventBus } from "@rxjs-toolkit/eventbus";
import { inject as tsInject, injectable } from "tsyringe";
import { map, Observable, tap } from "rxjs";
import { jwtDecode } from "jwt-decode";
import {
  EditUserModelLike,
  GetLogedUserModelLike,
  LogedUserModelLike,
  UserModelLike,
} from "../models/user.model";
import { TOKENS } from "../modules/di/tokens";
import { inject } from "../modules/di";

@injectable()
export class usersService {
  constructor(
    @tsInject(TOKENS.Http) private http: RxAxios,
    @tsInject(TOKENS.EventBus) private eventBus: RxEventBus,
  ) {}

  private getAuthToken(): string | null {
    return localStorage.getItem("authToken");
  }

  private addAuthHeaders() {
    const token = this.getAuthToken();
    if (token) {
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    }
    return {};
  }

  getCurrent(): LogedUserModelLike | null {
    const token = this.getAuthToken();
    const payload = jwtDecode<GetLogedUserModelLike>(token);
    console.log("Decoded JWT payload:", payload);
    return {
      id: payload.user.id,
      name: payload.user.name,
      email: payload.user.email,
      bio: payload.user.bio,
      photoUrl: payload.user.photoUrl,
    };
  }

  updateUserInfo(userId: number, dto: EditUserModelLike) {
    return this.http
      .put<EditUserModelLike>(`users/${userId}`, dto, this.addAuthHeaders())
      .pipe(map((x) => x.data));
  }

  delete(userId: number): Observable<any> {
    return this.http.delete<any>(`users/${userId}`, this.addAuthHeaders()).pipe(
      map((x) => x.data),
      tap((res) => {}),
    );
  }

  getById(userId: number): Observable<any> {
    return this.http.get<any>(`users/${userId}`, this.addAuthHeaders()).pipe(
      map((x) => x.data),
      tap((res) => {}),
    );
  }
}
