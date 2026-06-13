import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyId } from "../../data/keys";
import { resolveNote, selectionFromMidi, pressedKeysFor } from "../../data/notes";
import type { GradeTarget } from "../../utils/grading";
import { gradeAttempt, acceptableSetsFor, regionHintText } from "../../utils/grading";
import { korWithLayer } from "../../utils/noteName";
import { useAppStore } from "../../store/useAppStore";
import { useMidiStore, useCorrectedNote, useHoldTarget } from "../../midi/useMidi";
import { FingeringView } from "../clarii/FingeringView";
import { WrongDemo } from "./WrongDemo";
import { GameHud, type GameStats } from "./GameHud";
import { useGameSet, makeQuestionSet } from "./gameEngine";
import { playCorrect, playWrong } from "../../audio/synth";
import { useAudio } from "../../audio/useAudio";

/**
 * 게임 A — 🖐 운지 만들기 (rush=true면 게임 D — ⚡ 타임어택 60초).
 * 채점: 앞면 + 옥타브 + ♯/♭ 키 모두 일치 (이명동음·교차운지 인정).
 * 실기 모드(MIDI 연결 시): 진짜 악기로 목표 음을 0.3초 유지하면 정답.
 */
export function GameMake({
  pool,
  rush = false,
  onFinish,
  onQuit,
}: {
  pool: GradeTarget[];
  rush?: boolean;
  onFinish: (stats: GameStats) => void;
  onQuit: () => void;
}) {
  const showAdvanced = useAppStore((s) => s.showAdvanced);
  const audio = useAudio();
  const set = useGameSet(pool, 10);

  // 실기(MIDI) 모드
  const midiConnected = useMidiStore((s) => s.connected);
  const [midiMode, setMidiMode] = useState(false);
  const [octaveIgnore, setOctaveIgnore] = useState(false); // 공통 판정 옵션 (기본 off)
  const liveNote = useCorrectedNote();

  // 타임어택 상태
  const [timeLeft, setTimeLeft] = useState(60);
  const rushQuestions = useRef<GradeTarget[]>(rush ? makeQuestionSet(pool, 80) : []);
  const [rushIdx, setRushIdx] = useState(0);
  const [rushScore, setRushScore] = useState(0);
  const [rushCombo, setRushCombo] = useState(0);
  const rushStats = useRef({ maxCombo: 0, correct: 0, total: 0, wrongs: [] as GradeTarget[] });

  const target = rush ? rushQuestions.current[rushIdx] : set.current;
  const [pressed, setPressed] = useState<Set<KeyId>>(new Set());
  const [wrongDemo, setWrongDemo] = useState<{ target: GradeTarget; hint: string } | null>(null);
  const [hinted, setHinted] = useState(false);
  const [hintBlink, setHintBlink] = useState(false);
  const [shake, setShake] = useState(0);
  const idleTimer = useRef(0);

  const resolved = target ? resolveNote(target.noteId, target.layer, target.accidental ?? null) : null;

  /* 10초 무입력 → 힌트 버튼 깜빡임 */
  const resetIdle = useCallback(() => {
    window.clearTimeout(idleTimer.current);
    setHintBlink(false);
    idleTimer.current = window.setTimeout(() => setHintBlink(true), 10000);
  }, []);
  useEffect(() => {
    if (!rush) resetIdle();
    return () => window.clearTimeout(idleTimer.current);
  }, [target, rush, resetIdle]);

  /* 타임어택 타이머 */
  useEffect(() => {
    if (!rush) return;
    if (timeLeft <= 0) {
      onFinish({
        score: rushScore,
        maxCombo: rushStats.current.maxCombo,
        correctCount: rushStats.current.correct,
        total: rushStats.current.total,
        wrongs: rushStats.current.wrongs,
      });
      return;
    }
    const t = window.setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rush, timeLeft]);

  /* 일반 세트 종료 */
  useEffect(() => {
    if (!rush && set.finished) {
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

  const nextQuestion = useCallback(() => {
    setPressed(new Set());
    setHinted(false);
    setWrongDemo(null);
    if (rush) setRushIdx((i) => i + 1);
    else set.advance();
  }, [rush, set]);

  const handleCorrect = useCallback(() => {
    if (!resolved) return;
    playCorrect();
    audio.playMidi(resolved.midi);
    if (rush) {
      const combo = rushCombo + 1;
      setRushCombo(combo);
      rushStats.current.maxCombo = Math.max(rushStats.current.maxCombo, combo);
      rushStats.current.correct += 1;
      rushStats.current.total += 1;
      setRushScore((s) => s + 10 + 2 * (combo - 1));
    } else {
      set.answer(true, hinted ? 5 : 10);
    }
    nextQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved?.midi, rush, rushCombo, hinted, nextQuestion]);

  /* 실기 모드: 목표 음 0.3초 유지 → 정답 */
  useHoldTarget(resolved?.midi ?? null, handleCorrect, {
    enabled: midiMode && midiConnected && !wrongDemo && !!target,
    ms: 300,
    octaveIgnore,
  });

  const toggle = (id: KeyId) => {
    resetIdle();
    setPressed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = () => {
    if (!target || !resolved) return;
    const grade = gradeAttempt(pressed, target, { allowCross: showAdvanced });
    if (grade.correct) {
      handleCorrect();
    } else {
      playWrong();
      setShake(Date.now());
      if (rush) {
        setRushCombo(0);
        rushStats.current.total += 1;
        rushStats.current.wrongs.push(target);
        nextQuestion(); // 타임어택은 시연 없이 다음으로 (감점 없음)
      } else {
        set.answer(false, 0);
        setWrongDemo({ target, hint: regionHintText(grade.regions) });
      }
    }
  };

  const useHint = () => {
    if (!target || hinted) return;
    const closest = acceptableSetsFor(target, { allowCross: showAdvanced })[0];
    if (!closest) return;
    // 키 1개 공개: 빠진 키를 눌러 주거나, 잘못 누른 키를 떼 준다
    const allKeys: KeyId[] = ["K1","K2","K3","K4","K5","K6","K7","SHARP","FLAT","OCT_UP2","OCT_UP","OCT_DOWN"];
    const next = new Set(pressed);
    let fixed = false;
    for (const k of allKeys) {
      if (closest.has(k) && !next.has(k)) {
        next.add(k);
        fixed = true;
        break;
      }
      if (!closest.has(k) && next.has(k)) {
        next.delete(k);
        fixed = true;
        break;
      }
    }
    if (fixed) {
      setPressed(next);
      setHinted(true); // 그 문제 점수 절반
      setHintBlink(false);
    }
  };

  if (!target || !resolved) return null;

  const combo = rush ? rushCombo : set.combo;
  const qLabel = rush
    ? `${rushStats.current.total + 1}번째`
    : `${set.qIndex + 1}/${set.questions.length}`;

  // 실기 모드 라이브 표시
  const liveSel = midiMode && liveNote !== null ? selectionFromMidi(liveNote) : null;
  const liveResolved = liveSel ? resolveNote(liveSel.noteId, liveSel.layer, liveSel.accidental) : null;
  const livePressed = liveSel ? pressedKeysFor(liveSel) : new Set<KeyId>();

  const midiToggle = midiConnected ? (
    <span className="flex items-center gap-1.5">
      <button
        type="button"
        aria-pressed={midiMode}
        onClick={() => setMidiMode(!midiMode)}
        className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
          midiMode ? "bg-octave text-white" : "bg-stage text-sub"
        }`}
      >
        🎹 실기
      </button>
      {midiMode && (
        <label className="flex cursor-pointer items-center gap-0.5 text-[9px] font-bold text-sub">
          <input type="checkbox" checked={octaveIgnore} onChange={(e) => setOctaveIgnore(e.target.checked)} className="accent-octave" />
          옥타브 무시
        </label>
      )}
    </span>
  ) : undefined;

  return (
    <div className="flex h-full flex-col gap-2">
      <GameHud
        title={rush ? "⚡ 타임어택 60초" : "🖐 운지 만들기"}
        progressLabel={qLabel}
        score={rush ? rushScore : set.score}
        combo={combo}
        timeLeft={rush ? timeLeft : undefined}
        timeTotal={rush ? 60 : undefined}
        onQuit={onQuit}
        extra={midiToggle}
      />

      {wrongDemo ? (
        <div className="min-h-0 flex-1 rounded-card bg-white p-3 shadow-sm">
          <WrongDemo target={wrongDemo.target} hint={wrongDemo.hint} onDone={nextQuestion} />
        </div>
      ) : (
        <div key={shake || undefined} className={`flex min-h-0 flex-1 flex-col gap-2 ${shake ? "shake-x" : ""}`}>
          <div className="rounded-card bg-white px-4 py-2.5 text-center shadow-sm">
            <span className="text-xs font-bold text-sub">
              {midiMode ? "악기로 이 음을 0.3초 이상 불어 보세요" : "이 음의 운지를 만들어 보세요"}
            </span>
            <p className="num text-2xl font-extrabold text-brand">
              {korWithLayer(resolved)}
              <span className="num ml-1.5 text-sm font-bold text-sub">{resolved.robkooName}</span>
            </p>
            {midiMode && (
              <p aria-live="polite" className="text-xs font-bold text-octave">
                {liveResolved
                  ? `지금은 ★${korWithLayer(liveResolved)}★가 나오고 있어요`
                  : "불어 보세요… 🎶"}
              </p>
            )}
          </div>
          <div className="min-h-0 flex-1 rounded-card bg-white p-2 shadow-sm">
            <FingeringView
              pressedOverride={midiMode ? livePressed : pressed}
              interactive={!midiMode}
              onToggleKey={toggle}
              displayTextOverride={midiMode ? (liveResolved?.robkooName.split("/")[0] ?? "?") : "?"}
              showFingerLabels={!midiMode}
              className="h-full"
            />
          </div>
          {!midiMode && (
            <div className="flex gap-2">
              {!rush && (
                <button
                  type="button"
                  onClick={useHint}
                  disabled={hinted}
                  className={`rounded-full bg-star/20 px-4 py-2.5 text-sm font-bold text-ink disabled:opacity-40 ${
                    hintBlink ? "animate-pulse ring-2 ring-star" : ""
                  }`}
                >
                  💡 힌트 (점수 ½)
                </button>
              )}
              <button
                type="button"
                onClick={submit}
                className="flex-1 rounded-full bg-brand py-2.5 text-sm font-extrabold text-white shadow"
              >
                확인!
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
