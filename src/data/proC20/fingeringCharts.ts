import rawCharts from "./fingeringCharts.json";
import type { ProC20FingeringEntry, ProC20FingeringMode, ProC20SourceRef } from "./types";

export interface ProC20FingeringGroup {
  id: string;
  label: string;
  entries: ProC20FingeringEntry[];
}

export interface ProC20ModeChart {
  label: string;
  status: "partial" | "planned" | "complete";
  groups: ProC20FingeringGroup[];
  pendingCharts: ProC20SourceRef[];
}

export interface ProC20ChartData {
  instrument: string;
  manual: string;
  clariiOs: string;
  convention: string;
  modes: Record<ProC20FingeringMode, ProC20ModeChart>;
}

export const PRO_C20_CHARTS = rawCharts as unknown as ProC20ChartData;

export const PRO_C20_FINGERING_ENTRIES: ProC20FingeringEntry[] = Object.values(PRO_C20_CHARTS.modes).flatMap((mode) =>
  mode.groups.flatMap((group) => group.entries),
);

export const PRO_C20_ENTRY_BY_ID = Object.fromEntries(
  PRO_C20_FINGERING_ENTRIES.map((entry) => [entry.id, entry]),
) as Record<string, ProC20FingeringEntry>;

export function proC20EntriesForMode(mode: ProC20FingeringMode): ProC20FingeringEntry[] {
  return PRO_C20_CHARTS.modes[mode]?.groups.flatMap((group) => group.entries) ?? [];
}

export function proC20ModeHasReadyEntries(mode: ProC20FingeringMode): boolean {
  return proC20EntriesForMode(mode).length > 0;
}

export function proC20PendingText(mode: ProC20FingeringMode): string {
  const pending = PRO_C20_CHARTS.modes[mode]?.pendingCharts ?? [];
  if (pending.length === 0) return "운지표 전사 예정입니다.";
  return pending.map((item) => `${item.heading} p.${item.manualPage}`).join(", ");
}
