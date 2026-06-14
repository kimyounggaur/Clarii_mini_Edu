import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { validateFingerings } from "./data/validate";
import { validateProC20Data } from "./data/proC20/validate";
import { runSelfTest } from "./data/selftest";

export const FINGERING_ERRORS = validateFingerings();
export const PRO_C20_ERRORS = validateProC20Data();
if (import.meta.env.DEV) runSelfTest();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
