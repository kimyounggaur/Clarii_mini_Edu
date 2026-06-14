import { PRO_C20_KEY_BY_ID } from "./keys";
import { PRO_C20_MODE_BY_ID } from "./modes";
import { PRO_C20_CHARTS, PRO_C20_FINGERING_ENTRIES } from "./fingeringCharts";
import { PRO_C20_PARTS } from "./parts";
import type { ProC20KeyId } from "./types";

export interface ProC20ValidationError {
  where: string;
  message: string;
}

function hasKey(id: string): id is ProC20KeyId {
  return id in PRO_C20_KEY_BY_ID;
}

export function validateProC20Data(): ProC20ValidationError[] {
  const errors: ProC20ValidationError[] = [];

  for (const modeId of Object.keys(PRO_C20_CHARTS.modes)) {
    if (!(modeId in PRO_C20_MODE_BY_ID)) {
      errors.push({ where: `mode:${modeId}`, message: "Unknown PRO C20 fingering mode" });
    }
  }

  for (const entry of PRO_C20_FINGERING_ENTRIES) {
    if (!(entry.mode in PRO_C20_MODE_BY_ID)) {
      errors.push({ where: `entry:${entry.id}`, message: `Unknown mode ${entry.mode}` });
    }
    if (!entry.source?.manualPage || !entry.source.heading) {
      errors.push({ where: `entry:${entry.id}`, message: "Missing source metadata" });
    }
    for (const key of entry.pressed) {
      if (!hasKey(key)) errors.push({ where: `entry:${entry.id}`, message: `Unknown pressed key ${key}` });
    }
    for (const variant of entry.variants ?? []) {
      for (const key of variant.pressed) {
        if (!hasKey(key)) errors.push({ where: `entry:${entry.id}/variant:${variant.id}`, message: `Unknown variant key ${key}` });
      }
    }
  }

  for (const part of PRO_C20_PARTS) {
    if (!part.source?.manualPage || !part.source.heading) {
      errors.push({ where: `part:${part.id}`, message: "Missing source metadata" });
    }
    for (const key of part.keyIds ?? []) {
      if (!hasKey(key)) errors.push({ where: `part:${part.id}`, message: `Unknown part key ${key}` });
    }
  }

  for (const error of errors) {
    console.error(`[PRO C20 data] ${error.where}: ${error.message}`);
  }

  return errors;
}
