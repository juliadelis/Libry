import "./index.scss";
import { Outlet, useParams } from "react-router-dom";

import { useMemo } from "react";

import { catchError, defer, finalize, of } from "rxjs";

import { UserContext, type UserHolder } from "../shared/contexts/UserContext";

import { useRxObservable } from "../shared/hooks/rxjs-interop";
import { usersService } from "../shared/services/users.service";
import { useInject } from "../shared/modules/di";
import NavBar from "../shared/components/Navbar/Navbar";

export function MainLayout() {
  const userService = useInject(usersService);

  const params = useParams();
  const userIdFromParams = ((key) => {
    return useMemo(() => {
      return !params[key] ? null : Number(params[key]);
    }, [params[key]]);
  })("rewardId");
  const editMode = !!userIdFromParams;

  const model = useRxObservable(() => {
    if (!userIdFromParams) {
      return of(null);
    }

    return defer(() => {
      return userService.getById(userIdFromParams).pipe(
        finalize(() => {}),
        catchError(() => {
          return of(null);
        }),
      );
    });
  }, [userIdFromParams]);

  const holderContext = useMemo<UserHolder>(() => {
    return {
      user: model(),
    };
  }, [editMode, model()]);

  return (
    <div className="main-layout w-full h-full">
      <UserContext.Provider value={holderContext}>
        <div className="grid grid-cols-12 w-full h-full">
          <div className="col-span-2 left-container flex w-full h-full">
            <NavBar />
          </div>

          <div className="col-span-10 main-container h-full relative text-wrap flex justify-center items-center">
            <Outlet />
          </div>
        </div>
      </UserContext.Provider>
    </div>
  );
}
