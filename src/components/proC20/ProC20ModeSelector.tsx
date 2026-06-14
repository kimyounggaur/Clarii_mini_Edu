import { PRO_C20_FINGERING_MODES } from "../../data/proC20/modes";
import type { ProC20FingeringMode } from "../../data/proC20/types";

const STATUS_TEXT = {
  ready: "검증됨",
  partial: "부분 전사",
  planned: "준비 중",
} as const;

export function ProC20ModeSelector({
  value,
  onChange,
}: {
  value: ProC20FingeringMode;
  onChange: (mode: ProC20FingeringMode) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {PRO_C20_FINGERING_MODES.map((mode) => {
        const active = value === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(mode.id)}
            className={`min-h-[92px] rounded-xl border-2 px-3 py-2 text-left transition-colors ${
              active
                ? "border-[#19E6FF] bg-[#19E6FF]/10"
                : "border-bodyline/70 bg-white hover:border-[#19E6FF]/50"
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-extrabold">{mode.displayName}</span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  mode.status === "planned"
                    ? "bg-stage text-sub"
                    : mode.status === "partial"
                      ? "bg-[#F6C229]/20 text-[#8A6500]"
                      : "bg-success/10 text-success"
                }`}
              >
                {STATUS_TEXT[mode.status]}
              </span>
            </span>
            <span className="mt-1 block text-xs font-bold text-sub">{mode.korName}</span>
            <span className="mt-2 line-clamp-2 block text-[11px] leading-relaxed text-sub">
              {mode.recommendedFor}
            </span>
          </button>
        );
      })}
    </div>
  );
}
