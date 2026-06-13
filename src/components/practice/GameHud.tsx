import { useEffect, useRef, useState } from "react";
import type { GradeTarget } from "../../utils/grading";
import { useToastStore } from "../../store/useToastStore";

export interface GameStats {
  score: number;
  maxCombo: number;
  correctCount: number;
  total: number;
  wrongs: GradeTarget[];
}

/** 게임 공통 상단 바 — 진행·점수·콤보 (+타임어택 시간 바), 그만하기 */
export function GameHud({
  title,
  progressLabel,
  score,
  combo,
  timeLeft,
  timeTotal,
  onQuit,
  extra,
}: {
  title: string;
  progressLabel: string;
  score: number;
  combo: number;
  timeLeft?: number;
  timeTotal?: number;
  onQuit: () => void;
  extra?: React.ReactNode;
}) {
  const toast = useToastStore((s) => s.show);
  const [confirming, setConfirming] = useState(false);
  const prevCombo = useRef(0);

  // 3콤보마다 짧은 격려
  useEffect(() => {
    if (combo > 0 && combo % 3 === 0 && combo !== prevCombo.current) {
      toast(`🔥 ${combo}연속!`);
    }
    prevCombo.current = combo;
  }, [combo, toast]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 rounded-card bg-white px-3 py-2 shadow-sm">
        <span className="min-w-0 flex-1 truncate text-sm font-extrabold">{title}</span>
        {extra}
        <span className="num rounded-full bg-stage px-2 py-0.5 text-xs font-bold text-sub">{progressLabel}</span>
        <span className="num text-sm font-extrabold text-brand">{score}점</span>
        <span className={`num text-xs font-bold ${combo >= 3 ? "text-danger" : "text-sub"}`} aria-label={`콤보 ${combo}`}>
          {combo > 0 ? `🔥${combo}` : "콤보 0"}
        </span>
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-full bg-stage px-2.5 py-1 text-xs font-bold text-sub"
          >
            그만하기
          </button>
        ) : (
          <span className="flex gap-1">
            <button type="button" onClick={onQuit} className="rounded-full bg-danger px-2.5 py-1 text-xs font-bold text-white">
              정말 그만
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="rounded-full bg-stage px-2.5 py-1 text-xs font-bold text-sub">
              계속
            </button>
          </span>
        )}
      </div>
      {timeLeft !== undefined && timeTotal !== undefined && (
        <div className="h-2.5 overflow-hidden rounded-full bg-stage" role="timer" aria-label={`남은 시간 ${timeLeft}초`}>
          <div
            className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${
              timeLeft <= 10 ? "bg-danger" : "bg-octave"
            }`}
            style={{ width: `${(timeLeft / timeTotal) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
