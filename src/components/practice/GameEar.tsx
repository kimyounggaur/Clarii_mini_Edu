import { useEffect, useMemo, useState } from "react";
import { resolveNote, type LayerNum } from "../../data/notes";
import type { GradeTarget } from "../../utils/grading";
import { fullName } from "../../utils/noteName";
import { useAppStore } from "../../store/useAppStore";
import { WrongDemo } from "./WrongDemo";
import { GameHud, type GameStats } from "./GameHud";
import { useGameSet, makeChoices, targetKey, targetMidi } from "./gameEngine";
import { playCorrect, playWrong } from "../../audio/synth";
import { useAudio } from "../../audio/useAudio";

/** 적응형 음역: 도·미·솔 3음 → 점차 확장 */
export const EAR_LEVELS: { label: string; notes: string[]; layers: LayerNum[] }[] = [
  { label: "도·미·솔", notes: ["do", "mi", "sol"], layers: [0] },
  { label: "도·레·미·솔·라", notes: ["do", "re", "mi", "sol", "la"], layers: [0] },
  { label: "기준층 온음 전체", notes: ["do", "re", "mi", "fa", "sol", "la", "si", "hido"], layers: [0] },
  { label: "기준층 + 한 층 위", notes: ["do", "re", "mi", "fa", "sol", "la", "si", "hido"], layers: [0, 1] },
];

export function earPool(level: number): GradeTarget[] {
  const lv = EAR_LEVELS[Math.min(level, EAR_LEVELS.length - 1)];
  const out: GradeTarget[] = [];
  for (const layer of lv.layers) for (const id of lv.notes) out.push({ noteId: id, layer });
  return out;
}

/** 게임 C — 👂 귀 트기. 보기 비교 청취 허용, "이거다!"로 확정 */
export function GameEar({
  level,
  octaveIgnore,
  onFinish,
  onQuit,
}: {
  level: number;
  octaveIgnore: boolean;
  onFinish: (stats: GameStats) => void;
  onQuit: () => void;
}) {
  const notation = useAppStore((s) => s.notation);
  const audio = useAudio();
  const pool = useMemo(() => earPool(level), [level]);
  const set = useGameSet(pool, 10);
  const target = set.current;
  const [picked, setPicked] = useState<string | null>(null);
  const [graded, setGraded] = useState<"correct" | "wrong" | null>(null);
  const [wrongDemo, setWrongDemo] = useState<GradeTarget | null>(null);

  const choices = useMemo(
    () => (target ? makeChoices(target, pool) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [target ? targetKey(target) : "", set.qIndex],
  );

  const playTarget = () => {
    if (target) audio.playMidi(targetMidi(target), 0.85);
  };

  // 문제가 바뀌면 자동 1회 재생
  useEffect(() => {
    if (target) {
      const t = window.setTimeout(playTarget, 350);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set.qIndex]);

  useEffect(() => {
    if (set.finished) {
      onFinish({
        score: set.score,
        maxCombo: set.maxCombo,
        correctCount: set.correctCount,
        total: set.questions.length,
        wrongs: set.wrongs,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set.finished]);

  if (!target) return null;

  const isMatch = (c: GradeTarget) =>
    octaveIgnore
      ? targetMidi(c) % 12 === targetMidi(target) % 12
      : targetKey(c) === targetKey(target);

  const confirm = () => {
    if (!picked || graded) return;
    const c = choices.find((x) => targetKey(x) === picked)!;
    const correct = isMatch(c);
    setGraded(correct ? "correct" : "wrong");
    if (correct) {
      playCorrect();
      set.answer(true, 10);
      window.setTimeout(() => {
        setPicked(null);
        setGraded(null);
        set.advance();
      }, 700);
    } else {
      playWrong();
      set.answer(false, 0);
      window.setTimeout(() => setWrongDemo(target), 450);
    }
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <GameHud
        title={`👂 귀 트기 · Lv.${level + 1}`}
        progressLabel={`${set.qIndex + 1}/${set.questions.length}`}
        score={set.score}
        combo={set.combo}
        onQuit={onQuit}
      />
      {wrongDemo ? (
        <div className="min-h-0 flex-1 rounded-card bg-white p-3 shadow-sm">
          <WrongDemo
            target={wrongDemo}
            onDone={() => {
              setWrongDemo(null);
              setPicked(null);
              setGraded(null);
              set.advance();
            }}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-card bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-sub">무슨 음일까요? 들어 보세요</p>
            <button
              type="button"
              onClick={playTarget}
              aria-label="문제 음 다시 듣기"
              className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-3xl text-white shadow-md active:scale-95"
            >
              🔊
            </button>
            <p className="text-[11px] font-semibold text-sub">다시 듣기 무제한 · 보기를 누르면 그 음도 들려드려요</p>
            {octaveIgnore && (
              <span className="rounded-full bg-stage px-2.5 py-1 text-[10px] font-bold text-sub">옥타브 무시 ON</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {choices.map((c) => {
              const key = targetKey(c);
              const r = resolveNote(c.noteId, c.layer, c.accidental ?? null);
              const sel = picked === key;
              const showState = graded && sel;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setPicked(key);
                    audio.playMidi(targetMidi(c), 0.75); // 비교 청취
                  }}
                  className={`num min-h-[50px] rounded-xl border-2 px-2 py-2 text-sm font-extrabold transition-colors ${
                    showState === null || !showState
                      ? sel
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-bodyline/70 bg-white"
                      : graded === "correct"
                        ? "border-success bg-success/10 text-success"
                        : "shake-x border-danger bg-danger/10 text-danger"
                  }`}
                >
                  ♪ {fullName(r, notation)}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={confirm}
            disabled={!picked || graded !== null}
            className="rounded-full bg-brand py-2.5 text-sm font-extrabold text-white shadow disabled:opacity-40"
          >
            이거다!
          </button>
        </>
      )}
    </div>
  );
}
