import { useMemo, useState } from "react";
import { playCorrect, playWrong } from "../../../audio/synth";
import { PRO_C20_ENTRY_BY_ID } from "../../../data/proC20/fingeringCharts";
import { PRO_C20_KEY_BY_ID } from "../../../data/proC20/keys";
import { PRO_C20_MODE_BY_ID } from "../../../data/proC20/modes";
import type { ProC20KeyId } from "../../../data/proC20/types";
import { acceptableProC20SetsFor, gradeProC20Attempt, proC20RegionHintText } from "../../../utils/proC20Grading";
import { ProC20FingeringView } from "../ProC20FingeringView";
import type { ProC20LessonCard } from "../../../data/proC20/lessons";

export function ProC20TryCard({
  card,
  initialPressed,
  onPass,
  passed,
}: {
  card: Extract<ProC20LessonCard, { kind: "try" }>;
  initialPressed: Set<ProC20KeyId>;
  onPass: () => void;
  passed: boolean;
}) {
  const [pressed, setPressed] = useState<Set<ProC20KeyId>>(new Set(initialPressed));
  const [hint, setHint] = useState<string | null>(null);
  const entry = PRO_C20_ENTRY_BY_ID[card.target.entryId];
  const targetSets = useMemo(() => acceptableProC20SetsFor(card.target), [card.target]);
  const correctSet = targetSets[0]?.keys ?? new Set<ProC20KeyId>();
  const shown = passed ? correctSet : pressed;
  const changed = Array.from(new Set<ProC20KeyId>([...pressed, ...correctSet])).filter(
    (id) => initialPressed.has(id) !== shown.has(id),
  );

  const toggle = (id: ProC20KeyId) => {
    if (passed) return;
    setHint(null);
    const next = new Set(pressed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPressed(next);
    const grade = gradeProC20Attempt(next, card.target);
    if (grade.correct) {
      playCorrect();
      onPass();
    }
  };

  const check = () => {
    const grade = gradeProC20Attempt(pressed, card.target);
    if (grade.correct) {
      playCorrect();
      onPass();
      return;
    }
    playWrong();
    setHint(proC20RegionHintText(grade.regions));
  };

  if (!entry) {
    return (
      <div className="fade-up flex h-full flex-col items-center justify-center gap-3 text-center">
        <h3 className="text-lg font-extrabold">준비 중인 운지입니다</h3>
        <p className="max-w-[320px] text-sm text-sub">
          이 카드는 PRO C20 Appendix 운지표 전사가 끝난 뒤 활성화됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="fade-up flex h-full flex-col gap-2">
      {card.group && (
        <span className="self-center rounded-full bg-stage px-3 py-0.5 text-[11px] font-bold text-sub">
          {card.group}
        </span>
      )}
      <h3 className="text-center text-base font-extrabold">🖐 {card.instruction}</h3>
      <p className="text-center text-xs font-semibold text-sub">
        {PRO_C20_MODE_BY_ID[card.target.mode].displayName} ·{" "}
        <b className="text-[#087D86]">{entry.note.solfegeKor}</b>
      </p>

      <ProC20FingeringView
        pressed={Array.from(shown)}
        changed={changed}
        interactive={!passed}
        onToggleKey={toggle}
        displayText={passed ? entry.note.deviceName ?? "OK" : "?"}
        className="min-h-[320px] flex-1"
      />

      <div className="flex flex-wrap justify-center gap-1" aria-label="목표 키">
        {entry.pressed.map((id) => (
          <span key={id} className="rounded-full bg-stage px-2 py-0.5 text-[10px] font-bold text-sub">
            {PRO_C20_KEY_BY_ID[id]?.korName ?? id}
          </span>
        ))}
        {card.target.requireOctaveRange && entry.octaveRange && (
          <span className="rounded-full bg-[#19E6FF]/10 px-2 py-0.5 text-[10px] font-bold text-[#087D86]">
            옥타브 {entry.octaveRange}
          </span>
        )}
      </div>

      <div
        aria-live="polite"
        className={`rounded-xl px-3 py-2 text-center text-sm font-bold ${
          passed ? "bg-success/10 text-success" : "bg-stage text-sub"
        }`}
      >
        {passed ? "통과! PRO C20 키 위치를 정확히 찾았어요." : hint ?? "그림의 키를 눌러 목표 운지를 만들어 보세요."}
      </div>

      {!passed && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={check}
            className="flex-1 rounded-full bg-[#171B20] px-4 py-2.5 text-sm font-extrabold text-white shadow"
          >
            정답 확인
          </button>
          <button
            type="button"
            onClick={() => {
              setPressed(new Set(correctSet));
              setHint("정답 키를 표시했어요. 같은 위치를 다시 눌러 익혀 보세요.");
            }}
            className="flex-1 rounded-full bg-stage px-4 py-2.5 text-sm font-extrabold text-sub"
          >
            정답 보기
          </button>
        </div>
      )}

      <p className="text-center text-[10px] font-semibold text-sub">
        출처: {entry.source.heading} p.{entry.source.manualPage} · {entry.verification}
      </p>
    </div>
  );
}
