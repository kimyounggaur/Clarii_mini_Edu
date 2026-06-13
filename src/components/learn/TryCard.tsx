import { useMemo, useState } from "react";
import type { KeyId } from "../../data/keys";
import type { LessonCard } from "../../data/lessons";
import { resolveNote } from "../../data/notes";
import { gradeAttempt, acceptableSetsFor } from "../../utils/grading";
import { korWithLayer } from "../../utils/noteName";
import { FingeringView } from "../clarii/FingeringView";
import { playCorrect } from "../../audio/synth";
import { useAudio } from "../../audio/useAudio";

/**
 * try 카드 — 목표 운지(옥타브·반음 키 포함)를 직접 만들면 통과.
 * initialPressed: 직전 try의 목표 운지 → "어떤 손가락이 움직였는지" 펄스로 보인다.
 */
export function TryCard({
  card,
  initialPressed,
  onPass,
  passed,
}: {
  card: Extract<LessonCard, { kind: "try" }>;
  initialPressed: Set<KeyId>;
  onPass: () => void;
  passed: boolean;
}) {
  const audio = useAudio();
  const [pressed, setPressed] = useState<Set<KeyId>>(new Set(initialPressed));
  const target = card.target;
  const resolved = resolveNote(target.noteId, target.layer, target.accidental ?? null);

  const targetName = useMemo(() => {
    const base = korWithLayer(resolved);
    return target.useCross ? `${base} (교차운지)` : base;
  }, [resolved, target.useCross]);

  const toggle = (id: KeyId) => {
    if (passed) return;
    const next = new Set(pressed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPressed(next);
    const grade = gradeAttempt(next, target);
    if (grade.correct) {
      playCorrect();
      audio.playMidi(resolved.midi);
      onPass();
    }
  };

  // 통과 후에는 정답 운지를 보여준다 (♯ 방식 기준 첫 정답 집합)
  const shown = passed ? (acceptableSetsFor(target)[0] ?? pressed) : pressed;

  return (
    <div className="fade-up flex h-full flex-col gap-2">
      {card.group && (
        <span className="self-center rounded-full bg-stage px-3 py-0.5 text-[11px] font-bold text-sub">
          {card.group}
        </span>
      )}
      <h3 className="text-center text-base font-extrabold">
        🖐 {card.instruction}
      </h3>
      <p className="text-center text-xs font-semibold text-sub">
        목표: <b className="text-brand">{targetName}</b>
        {resolved.isSemitone ? ` · ${resolved.robkooName}` : ` · ${resolved.robkooName}`}
      </p>
      <FingeringView
        pressedOverride={shown}
        interactive={!passed}
        onToggleKey={toggle}
        displayTextOverride={passed ? resolved.robkooName.split("/")[0] : "?"}
        ringGlow={audio.glowStamp > 0}
        showFingerLabels
        className="min-h-0 flex-1"
      />
      <div
        aria-live="polite"
        className={`rounded-xl px-3 py-2 text-center text-sm font-bold ${
          passed ? "bg-success/10 text-success" : "bg-stage text-sub"
        }`}
      >
        {passed ? "통과! 참 잘했어요 🎉" : "그림의 키를 눌러 목표 운지를 만들어 보세요"}
      </div>
    </div>
  );
}
