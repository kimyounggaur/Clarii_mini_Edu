import { useEffect, useMemo, useState } from "react";
import type { KeyId } from "../../data/keys";
import type { GradeTarget } from "../../utils/grading";
import { acceptableSetsFor } from "../../utils/grading";
import { resolveNote } from "../../data/notes";
import { korWithLayer } from "../../utils/noteName";
import { FingeringView } from "../clarii/FingeringView";

const KEY_ORDER: KeyId[] = [
  "K1", "K2", "K3", "K4", "K5", "K6", "K7", "SHARP", "FLAT", "OCT_UP2", "OCT_UP", "OCT_DOWN",
];

/**
 * 오답 시 정답 운지 2초 시연 — 올바른 키가 위에서부터 순서대로 차오르는 연출.
 * 오답을 벌주지 않고 "가르치는 기회"로 쓴다.
 */
export function WrongDemo({
  target,
  hint,
  onDone,
}: {
  target: GradeTarget;
  hint?: string;
  onDone: () => void;
}) {
  const resolved = resolveNote(target.noteId, target.layer, target.accidental ?? null);
  const fullSet = useMemo(() => {
    const s = acceptableSetsFor(target)[0] ?? new Set<KeyId>();
    return KEY_ORDER.filter((k) => s.has(k));
  }, [target]);
  const [count, setCount] = useState(0);
  const [replayStamp, setReplayStamp] = useState(0);

  useEffect(() => {
    setCount(0);
    if (fullSet.length === 0) {
      return; // 전부 떼기 운지 (높은 도♯ 교차)
    }
    const stepMs = Math.min(2000 / fullSet.length, 350);
    const timer = window.setInterval(() => {
      setCount((c) => {
        if (c >= fullSet.length) {
          window.clearInterval(timer);
          return c;
        }
        return c + 1;
      });
    }, stepMs);
    return () => window.clearInterval(timer);
  }, [fullSet, replayStamp]);

  const pressed = new Set<KeyId>(fullSet.slice(0, count));

  return (
    <div className="fade-up flex h-full flex-col gap-2">
      <p className="text-center text-sm font-extrabold text-danger">
        아쉬워요! 정답 운지를 보여 드릴게요
      </p>
      <p className="text-center text-xs font-bold">
        정답: <b className="text-brand">{korWithLayer(resolved)}</b>
        <span className="num text-sub"> · {resolved.robkooName}</span>
        {fullSet.length === 0 && <span className="text-sub"> — 모든 키를 떼는 운지예요!</span>}
      </p>
      {hint && (
        <p className="rounded-xl bg-star/15 px-3 py-1.5 text-center text-xs font-bold text-ink">
          💡 {hint}
        </p>
      )}
      <FingeringView
        pressedOverride={pressed}
        displayTextOverride={resolved.robkooName.split("/")[0]}
        className="min-h-0 flex-1"
      />
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setReplayStamp(Date.now())}
          className="rounded-full bg-stage px-4 py-2 text-xs font-bold text-sub"
        >
          한 번 더 보기
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full bg-brand px-6 py-2 text-xs font-extrabold text-white shadow"
        >
          다음 문제 →
        </button>
      </div>
    </div>
  );
}
