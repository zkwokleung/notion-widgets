import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { applyDisplayOptions, readDisplayOptions } from "./lib/display";

applyDisplayOptions(readDisplayOptions(new URLSearchParams(window.location.search)));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
