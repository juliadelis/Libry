import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import Home from "../pages/home/Home";
import Profile from "../pages/profile/Profile";
import Search from "../pages/search/Search";
import Shelf from "../pages/shelf/Shelf";

import { JSX } from "react";
import { jwtDecode } from "jwt-decode";
import { MainLayout } from "../layouts/index";
import { Login } from "../pages/login/Login";
import SignUp from "../pages/signUp/SignUp";

export function routerFactory() {
  return createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          element: <AuthGuard />,
          children: [
            { path: "", element: <Home /> },
            { path: "profile", element: <Profile /> },
            { path: "search", element: <Search /> },
            { path: "shelf", element: <Shelf /> },
          ],
        },
      ],
    },
    {
      path: "login",
      element: <Login />,
    },
    {
      path: "signup",
      element: <SignUp />,
    },
    {
      path: "*",
      element: <Navigate to={"/"} />,
    },
  ]);
}

function lazyRoute(fn: () => Promise<React.FC | (() => React.JSX.Element)>) {
  return async () => {
    const Comp = await fn();

    return {
      element: <Comp />,
    };
  };
}

function AuthGuard() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode<{ exp?: number }>(token);

    if (!decoded.exp) {
      console.warn("Token has no expiration, allowing access");
      return <Outlet />;
    }

    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    if (expirationTime < currentTime) {
      return <Navigate to="/login" replace />;
    }

    return <Outlet />;
  } catch (error) {
    console.error("Error decoding token:", error);
    return <Navigate to="/login" replace />;
  }
}

const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const token = localStorage.getItem("authToken");
  if (!token) return <Navigate to="/login" />;

  try {
    const tokenData = jwtDecode<{ exp?: number }>(token);
    const exp = tokenData?.exp;

    if (!exp || exp < Date.now() / 1000) {
      return <Navigate to="/login" />;
    }

    return element;
  } catch {
    return <Navigate to="/login" />;
  }
};
