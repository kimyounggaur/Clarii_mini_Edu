import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { validateFingerings } from "./data/validate";
import { runSelfTest } from "./data/selftest";

export const FINGERING_ERRORS = validateFingerings();
if (import.meta.env.DEV) runSelfTest();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
