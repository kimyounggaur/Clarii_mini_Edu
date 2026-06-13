import { useEffect, useMemo, useState } from "react";
import { resolveNote } from "../../data/notes";
import type { GradeTarget } from "../../utils/grading";
import { acceptableSetsFor } from "../../utils/grading";
import { fullName } from "../../utils/noteName";
import { useAppStore } from "../../store/useAppStore";
import { FingeringView } from "../clarii/FingeringView";
import { WrongDemo } from "./WrongDemo";
import { GameHud, type GameStats } from "./GameHud";
import { useGameSet, makeChoices, targetKey } from "./gameEngine";
import { playCorrect, playWrong } from "../../audio/synth";
import { useAudio } from "../../audio/useAudio";

/** 게임 B — 👀 운지 보고 음 맞히기. 오답 보기는 정답의 이웃 음 위주 */
export function GameRead({
  pool,
  onFinish,
  onQuit,
}: {
  pool: GradeTarget[];
  onFinish: (stats: GameStats) => void;
  onQuit: () => void;
}) {
  const notation = useAppStore((s) => s.notation);
  const audio = useAudio();
  const set = useGameSet(pool, 10);
  const target = set.current;
  const [chosen, setChosen] = useState<string | null>(null);
  const [wrongDemo, setWrongDemo] = useState<GradeTarget | null>(null);

  const choices = useMemo(
    () => (target ? makeChoices(target, pool) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [target ? targetKey(target) : "", set.qIndex],
  );

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
  const pressedSet = acceptableSetsFor(target)[0] ?? new Set();

  const choose = (c: GradeTarget) => {
    if (chosen) return;
    const key = targetKey(c);
    setChosen(key);
    const correct = key === targetKey(target);
    const resolved = resolveNote(target.noteId, target.layer, target.accidental ?? null);
    if (correct) {
      playCorrect();
      audio.playMidi(resolved.midi);
      set.answer(true, 10);
      window.setTimeout(() => {
        setChosen(null);
        set.advance();
      }, 650);
    } else {
      playWrong();
      set.answer(false, 0);
      window.setTimeout(() => setWrongDemo(target), 450);
    }
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <GameHud
        title="👀 운지 보고 음 맞히기"
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
              setChosen(null);
              set.advance();
            }}
          />
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 rounded-card bg-white p-2 shadow-sm">
            <FingeringView
              pressedOverride={pressedSet}
              displayTextOverride="?"
              noPulse
              className="h-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {choices.map((c) => {
              const key = targetKey(c);
              const r = resolveNote(c.noteId, c.layer, c.accidental ?? null);
              const isAnswer = key === targetKey(target);
              const state =
                chosen === null ? "idle" : isAnswer && chosen === key ? "correct" : chosen === key ? "wrong" : "idle";
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => choose(c)}
                  className={`num min-h-[52px] rounded-xl border-2 px-2 py-2 text-sm font-extrabold transition-colors ${
                    state === "correct"
                      ? "border-success bg-success/10 text-success"
                      : state === "wrong"
                        ? "shake-x border-danger bg-danger/10 text-danger"
                        : "border-bodyline/70 bg-white"
                  }`}
                >
                  {fullName(r, notation)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
