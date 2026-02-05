import { RouterProvider } from "react-router";
import "./App.css";
import { useMemo } from "react";
import { routerFactory } from "./routes/Routes";

function App() {
  const router = useMemo(routerFactory, [1]);
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
