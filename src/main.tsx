import "reflect-metadata";
import "primereact/resources/themes/lara-dark-cyan/theme.css";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App/App";
import { registerGlobalDeps } from "./App/shared/modules/di/global";

registerGlobalDeps();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
