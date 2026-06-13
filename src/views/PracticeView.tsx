import { useMemo, useState } from "react";
import { useProgressStore, type GameId } from "../store/useProgressStore";
import { useAppStore } from "../store/useAppStore";
import { buildPool, SCOPE_LABEL, type Scope } from "../components/practice/gameEngine";
import { GameMake } from "../components/practice/GameMake";
import { GameRead } from "../components/practice/GameRead";
import { GameEar, EAR_LEVELS } from "../components/practice/GameEar";
import type { GameStats } from "../components/practice/GameHud";
import { SetResult } from "../components/practice/SetResult";
import { ClariiSvg } from "../components/clarii/ClariiSvg";

const GAMES: { id: GameId; emoji: string; name: string; desc: string }[] = [
  { id: "make", emoji: "🖐", name: "운지 만들기", desc: "음 이름을 보고 직접 키를 눌러요" },
  { id: "read", emoji: "👀", name: "운지 보고 음 맞히기", desc: "운지 그림을 보고 4지선다" },
  { id: "ear", emoji: "👂", name: "귀 트기", desc: "소리만 듣고 음을 맞혀요" },
  { id: "rush", emoji: "⚡", name: "타임어택 60초", desc: "60초 동안 최대한 많이!" },
];

type Phase =
  | { kind: "home" }
  | { kind: "config"; game: GameId }
  | { kind: "playing"; game: GameId; scope: Scope; octaveIgnore: boolean }
  | { kind: "result"; game: GameId; scope: Scope; octaveIgnore: boolean; stats: GameStats; newBest: boolean };

export function PracticeView() {
  const progress = useProgressStore();
  const showSemitones = useAppStore((s) => s.showSemitones);
  const [phase, setPhase] = useState<Phase>({ kind: "home" });
  const [scope, setScope] = useState<Scope>("base");
  const [octaveIgnore, setOctaveIgnore] = useState(true);

  const pool = useMemo(
    () =>
      phase.kind === "playing" || phase.kind === "result"
        ? buildPool(phase.scope, progress.completedLessons)
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase.kind === "playing" ? `${phase.game}:${phase.scope}` : phase.kind],
  );

  const finish = (game: GameId, sc: Scope, oi: boolean) => (stats: GameStats) => {
    const { newBest } = progress.recordGame(game, stats.score);
    if (game === "ear" && stats.total > 0 && stats.correctCount / stats.total >= 0.8) {
      progress.setEarLevel(Math.min(progress.earLevel + 1, EAR_LEVELS.length - 1)); // 적응형 확장
    }
    setPhase({ kind: "result", game, scope: sc, octaveIgnore: oi, stats, newBest });
  };

  /* ---------- 진행 중 ---------- */
  if (phase.kind === "playing") {
    const quit = () => setPhase({ kind: "home" });
    const onFinish = finish(phase.game, phase.scope, phase.octaveIgnore);
    return (
      <div className="h-full p-2.5">
        {phase.game === "make" && <GameMake pool={pool} onFinish={onFinish} onQuit={quit} />}
        {phase.game === "rush" && <GameMake pool={pool} rush onFinish={onFinish} onQuit={quit} />}
        {phase.game === "read" && <GameRead pool={pool} onFinish={onFinish} onQuit={quit} />}
        {phase.game === "ear" && (
          <GameEar level={progress.earLevel} octaveIgnore={phase.octaveIgnore} onFinish={onFinish} onQuit={quit} />
        )}
      </div>
    );
  }

  /* ---------- 결과 ---------- */
  if (phase.kind === "result") {
    return (
      <SetResult
        stats={phase.stats}
        newBest={phase.newBest}
        onAgain={() =>
          setPhase({ kind: "playing", game: phase.game, scope: phase.scope, octaveIgnore: phase.octaveIgnore })
        }
        onChangeScope={() => setPhase({ kind: "config", game: phase.game })}
        onHome={() => setPhase({ kind: "home" })}
      />
    );
  }

  /* ---------- 범위 선택 ---------- */
  if (phase.kind === "config") {
    const game = GAMES.find((g) => g.id === phase.game)!;
    const isEar = phase.game === "ear";
    return (
      <div className="flex h-full flex-col gap-3 p-3">
        <header className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPhase({ kind: "home" })}
            aria-label="뒤로"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm"
          >
            ←
          </button>
          <h1 className="text-lg font-extrabold">
            {game.emoji} {game.name}
          </h1>
        </header>

        {isEar ? (
          <div className="flex flex-col gap-2 rounded-card bg-white p-4 shadow-sm">
            <p className="text-sm font-bold">
              적응형 음역 — 현재 Lv.{progress.earLevel + 1}{" "}
              <span className="text-xs font-semibold text-sub">({EAR_LEVELS[Math.min(progress.earLevel, EAR_LEVELS.length - 1)].label})</span>
            </p>
            <p className="text-xs text-sub">한 세트 정답률 80% 이상이면 다음 세트에서 음역이 자동으로 넓어져요.</p>
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm font-bold">
              <input
                type="checkbox"
                checked={octaveIgnore}
                onChange={(e) => setOctaveIgnore(e.target.checked)}
                className="accent-brand"
              />
              옥타브 무시 (층만 다른 같은 계이름은 정답)
            </label>
          </div>
        ) : (
          <div role="radiogroup" aria-label="출제 범위" className="flex flex-col gap-2">
            {(Object.keys(SCOPE_LABEL) as Scope[]).map((sc) => {
              const disabled = sc === "withSemitones" && !showSemitones && progress.completedLessons.length === 0;
              return (
                <label
                  key={sc}
                  className={`flex cursor-pointer items-center gap-3 rounded-card border-2 bg-white px-4 py-3 text-sm font-bold shadow-sm ${
                    scope === sc ? "border-brand" : "border-transparent"
                  } ${disabled ? "opacity-50" : ""}`}
                >
                  <input
                    type="radio"
                    name="scope"
                    checked={scope === sc}
                    onChange={() => setScope(sc)}
                    className="accent-brand"
                  />
                  {SCOPE_LABEL[sc]}
                  {sc === "learned" && (
                    <span className="text-[10px] font-semibold text-sub">
                      (배우기 진행도 연동 · {progress.completedLessons.length}개 완료)
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => setPhase({ kind: "playing", game: phase.game, scope, octaveIgnore })}
          className="mt-2 rounded-full bg-brand py-3 text-base font-extrabold text-white shadow"
        >
          시작!
        </button>
      </div>
    );
  }

  /* ---------- 홈 ---------- */
  return (
    <div className="flex flex-col gap-3 p-3 pb-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">🎮 연습</h1>
        <div className="num flex gap-3 text-xs font-bold text-sub">
          <span aria-label={`연속 ${progress.streakDays}일`}>🔥 {progress.streakDays}일 연속</span>
          <span>
            누적{" "}
            {Object.values(progress.gameRecords).reduce((a, r) => a + r.plays, 0)}판
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {GAMES.map((g) => {
          const rec = progress.gameRecords[g.id];
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setPhase({ kind: "config", game: g.id })}
              className="flex items-center gap-3 rounded-card bg-white px-4 py-4 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-3xl" aria-hidden>
                {g.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold">{g.name}</span>
                <span className="block truncate text-[11px] font-semibold text-sub">{g.desc}</span>
              </span>
              <span className="num shrink-0 text-right text-[11px] font-bold text-sub">
                최고
                <br />
                <b className="text-base text-brand">{rec?.best ?? 0}</b>점
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-1 flex items-center justify-center opacity-60" aria-hidden>
        <ClariiSvg face="front" pressed={["K1", "K2"]} showGuideLabels={false} className="h-36" />
      </div>
      <p className="text-center text-[11px] font-semibold text-sub">
        오답은 벌이 아니라 배우는 기회! 틀리면 정답 운지를 차근차근 보여 드려요.
      </p>
    </div>
  );
}
