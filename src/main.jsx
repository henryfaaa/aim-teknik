import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./router/AppRouter";
import "./index.css";
const API = import.meta.env.VITE_API_URL;

const oldFetch = window.fetch;

window.fetch = (url, options = {}) => {
  if (typeof url === "string" && url.startsWith("/api")) {
    url = API + url;
  }
  return oldFetch(url, options);
};
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
