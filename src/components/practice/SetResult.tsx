import { useState } from "react";
import type { GameStats } from "./GameHud";
import type { GradeTarget } from "../../utils/grading";
import { targetKey } from "./gameEngine";
import { resolveNote } from "../../data/notes";
import { korWithLayer } from "../../utils/noteName";
import { WrongDemo } from "./WrongDemo";
import { ClariiSvg } from "../clarii/ClariiSvg";

/** 세트 종료 화면 — 점수 + 최고 콤보 + 오답 복습 + 한 번 더/범위 바꾸기 */
export function SetResult({
  stats,
  newBest,
  onAgain,
  onChangeScope,
  onHome,
}: {
  stats: GameStats;
  newBest: boolean;
  onAgain: () => void;
  onChangeScope: () => void;
  onHome: () => void;
}) {
  const [review, setReview] = useState<GradeTarget | null>(null);
  const uniqueWrongs = stats.wrongs.filter(
    (w, i) => stats.wrongs.findIndex((x) => targetKey(x) === targetKey(w)) === i,
  );

  if (review) {
    return (
      <div className="flex h-full flex-col p-3">
        <div className="min-h-0 flex-1 rounded-card bg-white p-3 shadow-sm">
          <WrongDemo target={review} onDone={() => setReview(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center gap-3 overflow-y-auto p-4">
      {newBest && (
        <div className="fade-up flex flex-col items-center">
          <ClariiSvg face="front" pressed={[]} ringGlow showGuideLabels={false} className="h-32" />
          <p className="text-sm font-extrabold text-brand">🏆 최고 기록 갱신!</p>
        </div>
      )}
      <h2 className="text-xl font-extrabold">세트 완료!</h2>
      <div className="flex gap-3">
        <div className="rounded-card bg-white px-5 py-3 text-center shadow-sm">
          <p className="text-[11px] font-bold text-sub">점수</p>
          <p className="num text-3xl font-extrabold text-brand">{stats.score}</p>
        </div>
        <div className="rounded-card bg-white px-5 py-3 text-center shadow-sm">
          <p className="text-[11px] font-bold text-sub">최고 콤보</p>
          <p className="num text-3xl font-extrabold text-danger">🔥{stats.maxCombo}</p>
        </div>
        <div className="rounded-card bg-white px-5 py-3 text-center shadow-sm">
          <p className="text-[11px] font-bold text-sub">정답</p>
          <p className="num text-3xl font-extrabold text-success">
            {stats.correctCount}
            <span className="text-base text-sub">/{stats.total}</span>
          </p>
        </div>
      </div>

      {uniqueWrongs.length > 0 && (
        <section className="w-full max-w-[380px]">
          <h3 className="mb-1.5 text-sm font-extrabold">📖 오답 복습 — 운지 다시 보기</h3>
          <div className="flex flex-wrap gap-1.5">
            {uniqueWrongs.map((w) => {
              const r = resolveNote(w.noteId, w.layer, w.accidental ?? null);
              return (
                <button
                  key={targetKey(w)}
                  type="button"
                  onClick={() => setReview(w)}
                  className="num rounded-full border-2 border-danger/30 bg-white px-3 py-1.5 text-xs font-bold text-danger"
                >
                  {korWithLayer(r)} 보기
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-auto flex w-full max-w-[380px] flex-col gap-2 pb-2">
        <button type="button" onClick={onAgain} className="rounded-full bg-brand py-3 text-base font-extrabold text-white shadow">
          한 번 더!
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={onChangeScope} className="flex-1 rounded-full bg-white py-2.5 text-sm font-bold text-sub shadow-sm">
            범위 바꾸기
          </button>
          <button type="button" onClick={onHome} className="flex-1 rounded-full bg-white py-2.5 text-sm font-bold text-sub shadow-sm">
            게임 목록
          </button>
        </div>
      </div>
    </div>
  );
}
