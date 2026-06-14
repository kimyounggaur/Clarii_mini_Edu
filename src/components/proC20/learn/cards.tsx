import { useState } from "react";
import { playCorrect, playWrong } from "../../../audio/synth";
import type { ProC20FingeringMode } from "../../../data/proC20/types";
import type { ProC20LessonCard } from "../../../data/proC20/lessons";
import { PRO_C20_SAXOPHONE_RULE_BY_ID } from "../../../data/proC20/saxophoneRules";
import { ProC20ChartPreview } from "../ProC20ChartPreview";
import { ProC20ModeSelector } from "../ProC20ModeSelector";
import { ProC20PartsExplorer } from "../ProC20PartsExplorer";
import { ProC20Svg } from "../ProC20Svg";

export function ProC20ExplainCard({ card }: { card: Extract<ProC20LessonCard, { kind: "explain" }> }) {
  return (
    <div className="fade-up flex flex-col items-center gap-3 text-center">
      {card.illust?.kind === "svg" && (
        <ProC20Svg
          face={card.illust.face}
          pressed={card.illust.pressed}
          displayText={card.illust.display}
          className="h-64 max-h-[52vh]"
        />
      )}
      {card.illust?.kind === "image" && (
        <img
          src={card.illust.src}
          alt={card.illust.alt}
          className="max-h-72 rounded-xl object-contain"
        />
      )}
      <h3 className="text-lg font-extrabold">{card.title}</h3>
      <p className="max-w-[420px] text-sm leading-relaxed text-sub">{card.body}</p>
    </div>
  );
}

export function ProC20ImageCard({ card }: { card: Extract<ProC20LessonCard, { kind: "image" }> }) {
  return (
    <div className="fade-up flex flex-col items-center gap-3 text-center">
      <div className="flex min-h-[320px] w-full items-center justify-center rounded-xl bg-[#10151A] p-3">
        <img src={card.src} alt={card.alt} className="max-h-[58vh] max-w-full object-contain" />
      </div>
      <h3 className="text-lg font-extrabold">{card.title}</h3>
      <p className="max-w-[420px] text-sm leading-relaxed text-sub">{card.body}</p>
    </div>
  );
}

export function ProC20PartsCard({
  card,
  onPass,
  passed,
}: {
  card: Extract<ProC20LessonCard, { kind: "parts" }>;
  onPass: () => void;
  passed: boolean;
}) {
  return (
    <div className="fade-up flex flex-col gap-3">
      <div className="text-center">
        <h3 className="text-lg font-extrabold">{card.title}</h3>
        <p className="mt-1 text-xs font-semibold text-sub">{card.body}</p>
      </div>
      <ProC20PartsExplorer onPass={onPass} passed={passed} requiredCount={card.requiredCount ?? 5} />
    </div>
  );
}

export function ProC20ModeCard({
  card,
  selectedMode,
  onModeChange,
  onPass,
}: {
  card: Extract<ProC20LessonCard, { kind: "mode" }>;
  selectedMode: ProC20FingeringMode;
  onModeChange: (mode: ProC20FingeringMode) => void;
  onPass: () => void;
}) {
  const choose = (mode: ProC20FingeringMode) => {
    onModeChange(mode);
    onPass();
  };

  return (
    <div className="fade-up flex flex-col gap-3">
      <div className="text-center">
        <h3 className="text-lg font-extrabold">{card.title}</h3>
        <p className="mx-auto mt-1 max-w-[460px] text-xs leading-relaxed text-sub">{card.body}</p>
      </div>
      <ProC20ModeSelector value={selectedMode} onChange={choose} />
    </div>
  );
}

export function ProC20ChartCard({
  card,
  selectedMode,
}: {
  card: Extract<ProC20LessonCard, { kind: "chart" }>;
  selectedMode: ProC20FingeringMode;
}) {
  return (
    <div className="fade-up flex flex-col gap-3">
      <div className="text-center">
        <h3 className="text-lg font-extrabold">{card.title}</h3>
        <p className="mx-auto mt-1 max-w-[460px] text-xs leading-relaxed text-sub">{card.body}</p>
      </div>
      <ProC20ChartPreview mode={card.mode ?? selectedMode} />
    </div>
  );
}

export function ProC20RuleCard({ card }: { card: Extract<ProC20LessonCard, { kind: "rule" }> }) {
  const rule = PRO_C20_SAXOPHONE_RULE_BY_ID[card.ruleId];
  if (!rule) {
    return (
      <div className="rounded-xl bg-stage px-4 py-5 text-center text-sm font-bold text-sub">
        준비 중인 Saxophone 규칙입니다.
      </div>
    );
  }

  return (
    <div className="fade-up flex flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-[#F6C229]/20 px-4 py-1 text-xs font-extrabold text-[#8A6500]">
        Saxophone mode
      </div>
      <h3 className="max-w-[420px] text-lg font-extrabold">{rule.title}</h3>
      <p className="max-w-[460px] text-sm leading-relaxed text-sub">{rule.body}</p>
      <p className="rounded-xl bg-stage px-3 py-2 text-[10px] font-semibold text-sub">
        출처: {rule.source.heading} p.{rule.source.manualPage}
      </p>
    </div>
  );
}

export function ProC20QuizCard({
  card,
  onPass,
  passed,
}: {
  card: Extract<ProC20LessonCard, { kind: "quiz" }>;
  onPass: () => void;
  passed: boolean;
}) {
  const [wrongs, setWrongs] = useState<Set<number>>(new Set());
  const [correct, setCorrect] = useState<number | null>(passed ? card.answerIndex : null);

  const choose = (index: number) => {
    if (correct !== null) return;
    if (index === card.answerIndex) {
      setCorrect(index);
      playCorrect();
      onPass();
      return;
    }
    playWrong();
    setWrongs(new Set(wrongs).add(index));
  };

  return (
    <div className="fade-up flex flex-col gap-3">
      <h3 className="text-center text-lg font-extrabold">Q. {card.question}</h3>
      <div className={`grid gap-2 ${card.choices.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
        {card.choices.map((choice, index) => {
          const isCorrect = correct === index;
          const isWrong = wrongs.has(index);
          return (
            <button
              key={choice}
              type="button"
              disabled={isWrong || correct !== null}
              onClick={() => choose(index)}
              className={`min-h-[52px] rounded-xl border-2 px-3 py-2 text-sm font-bold transition-colors ${
                isCorrect
                  ? "border-success bg-success/10 text-success"
                  : isWrong
                    ? "border-bodyline bg-stage text-sub/50"
                    : "border-bodyline/70 bg-white"
              }`}
            >
              {choice} {isCorrect && "✓"}
            </button>
          );
        })}
      </div>
      {correct !== null && card.explain && (
        <p className="fade-up rounded-xl bg-success/10 px-3 py-2 text-center text-xs font-semibold text-success">
          {card.explain}
        </p>
      )}
    </div>
  );
}

export function ProC20ChecklistCard({
  card,
  onPass,
  passed,
}: {
  card: Extract<ProC20LessonCard, { kind: "checklist" }>;
  onPass: () => void;
  passed: boolean;
}) {
  const [checked, setChecked] = useState<Set<number>>(
    passed ? new Set(card.items.map((_, index) => index)) : new Set(),
  );

  const toggle = (index: number) => {
    const next = new Set(checked);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setChecked(next);
    if (!passed && next.size === card.items.length) {
      playCorrect();
      onPass();
    }
  };

  return (
    <div className="fade-up flex flex-col gap-3">
      <div className="text-center">
        <h3 className="text-lg font-extrabold">{card.title}</h3>
        <p className="mx-auto mt-1 max-w-[460px] text-xs leading-relaxed text-sub">{card.body}</p>
      </div>
      <div className="flex flex-col gap-2">
        {card.items.map((item, index) => (
          <label
            key={item}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 px-3 py-3 text-sm font-bold ${
              checked.has(index) ? "border-success bg-success/10 text-success" : "border-bodyline/70 bg-white text-ink"
            }`}
          >
            <input
              type="checkbox"
              checked={checked.has(index)}
              onChange={() => toggle(index)}
              className="mt-1 accent-brand"
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
