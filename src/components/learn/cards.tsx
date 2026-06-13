import { useState } from "react";
import type { LessonCard } from "../../data/lessons";
import { PARTS } from "../clarii/constants";
import { ClariiSvg } from "../clarii/ClariiSvg";
import { playCorrect, playWrong, playNote } from "../../audio/synth";
import { resolveNote, NATURAL_BY_ID } from "../../data/notes";
import { useAppStore } from "../../store/useAppStore";

/* ---------- 설명 카드 ---------- */

export function ExplainCard({ card }: { card: Extract<LessonCard, { kind: "explain" }> }) {
  return (
    <div className="fade-up flex flex-col items-center gap-3 text-center">
      {card.illust && "emoji" in card.illust ? (
        <div className="text-6xl" aria-hidden>
          {card.illust.emoji}
        </div>
      ) : card.illust ? (
        <ClariiSvg
          face={card.illust.face}
          pressed={card.illust.pressed}
          displayText={"display" in card.illust ? card.illust.display : undefined}
          showGuideLabels={false}
          className="h-52"
        />
      ) : null}
      <h3 className="text-lg font-extrabold">{card.title}</h3>
      <p className="max-w-[320px] text-sm leading-relaxed text-sub">{card.body}</p>
    </div>
  );
}

/* ---------- 부위 학습 카드 (L0) ---------- */

export function PartsCard({
  card,
  onPass,
  passed,
}: {
  card: Extract<LessonCard, { kind: "parts" }>;
  onPass: () => void;
  passed: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [explored, setExplored] = useState<Set<string>>(new Set());
  const part = PARTS.find((p) => p.id === selected);

  const tap = (id: string) => {
    setSelected(id);
    const next = new Set(explored);
    next.add(id);
    setExplored(next);
    if (next.size >= 3 && !passed) onPass();
  };

  return (
    <div className="fade-up flex flex-col items-center gap-2">
      <h3 className="text-lg font-extrabold">{card.title}</h3>
      <p className="text-xs font-semibold text-sub">
        부위 3곳 이상 탭하면 통과! ({Math.min(explored.size, 3)}/3)
      </p>
      <div className="flex w-full justify-center gap-2">
        <ClariiSvg face="front" pressed={[]} partsMode selectedPart={selected} onPartTap={tap} showGuideLabels={false} className="h-60 flex-1" />
        <ClariiSvg face="back" pressed={[]} displayText="C3" partsMode selectedPart={selected} onPartTap={tap} showGuideLabels={false} className="h-60 flex-1" />
      </div>
      <div
        aria-live="polite"
        className={`min-h-[58px] w-full rounded-xl px-3 py-2 text-center text-sm ${part ? "bg-brand/10" : "bg-stage"}`}
      >
        {part ? (
          <>
            <b className="text-brand">{part.kor}</b>
            <p className="mt-0.5 text-xs text-sub">{part.desc}</p>
          </>
        ) : (
          <span className="text-xs text-sub">그림에서 궁금한 부위를 눌러 보세요 👆</span>
        )}
      </div>
    </div>
  );
}

/* ---------- 퀴즈 카드 ---------- */

export function QuizCard({
  card,
  onPass,
  passed,
}: {
  card: Extract<LessonCard, { kind: "quiz" }>;
  onPass: () => void;
  passed: boolean;
}) {
  const [wrongs, setWrongs] = useState<Set<number>>(new Set());
  const [correct, setCorrect] = useState<number | null>(passed ? card.answerIndex : null);
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);

  const choose = (i: number) => {
    if (correct !== null) return;
    if (i === card.answerIndex) {
      setCorrect(i);
      playCorrect();
      onPass();
    } else {
      playWrong();
      setShakeIdx(i);
      setWrongs(new Set(wrongs).add(i));
      window.setTimeout(() => setShakeIdx(null), 450);
    }
  };

  return (
    <div className="fade-up flex flex-col gap-3">
      <h3 className="text-center text-lg font-extrabold">Q. {card.question}</h3>
      <div className={`grid gap-2 ${card.choices.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
        {card.choices.map((c, i) => {
          const isCorrect = correct === i;
          const isWrong = wrongs.has(i);
          return (
            <button
              key={i}
              type="button"
              disabled={isWrong || correct !== null}
              onClick={() => choose(i)}
              className={`min-h-[52px] rounded-xl border-2 px-3 py-2 text-sm font-bold transition-colors ${
                isCorrect
                  ? "border-success bg-success/10 text-success"
                  : isWrong
                    ? "border-bodyline bg-stage text-sub/50"
                    : "border-bodyline/70 bg-white"
              } ${shakeIdx === i ? "shake-x" : ""}`}
            >
              {c} {isCorrect && "✓"}
            </button>
          );
        })}
      </div>
      {correct !== null && card.explain && (
        <p className="fade-up rounded-xl bg-success/10 px-3 py-2 text-center text-xs font-semibold text-success">
          💡 {card.explain}
        </p>
      )}
    </div>
  );
}

/* ---------- 숨·음량 체험 카드 (L3) ---------- */

export function BreathCard({
  card,
  onPass,
}: {
  card: Extract<LessonCard, { kind: "breath" }>;
  onPass: () => void;
}) {
  const tone = useAppStore((s) => s.tone);
  const vibrato = useAppStore((s) => s.vibrato);
  const [vel, setVel] = useState(0.8);

  const blow = () => {
    playNote(71, { preset: tone, vibrato, velocity: vel, durationSec: 1.2 }); // 시(B3) = midi 71
    onPass();
  };

  return (
    <div className="fade-up flex flex-col items-center gap-3 text-center">
      <div className="text-5xl" aria-hidden>
        💨
      </div>
      <h3 className="text-lg font-extrabold">{card.title}</h3>
      <p className="max-w-[320px] text-sm text-sub">{card.body}</p>
      <label className="w-full max-w-[280px] text-xs font-bold text-sub">
        여리게 🍃
        <input
          type="range"
          min={0.2}
          max={1}
          step={0.05}
          value={vel}
          onChange={(e) => setVel(Number(e.target.value))}
          className="mx-2 w-40 accent-brand align-middle"
          aria-label="숨 세기"
        />
        🌬 세게
      </label>
      <button
        type="button"
        onClick={blow}
        className="rounded-full bg-brand px-6 py-2.5 text-sm font-extrabold text-white shadow"
      >
        ▶ 이 세기로 "시" 불어보기
      </button>
    </div>
  );
}

/* ---------- 길게 불기 카드 (L3) ---------- */

export function LongtoneCard({
  card,
  onPass,
  passed,
}: {
  card: Extract<LessonCard, { kind: "longtone" }>;
  onPass: () => void;
  passed: boolean;
}) {
  const tone = useAppStore((s) => s.tone);
  const vibrato = useAppStore((s) => s.vibrato);
  const [reps, setReps] = useState(passed ? card.reps : 0);
  const [playing, setPlaying] = useState(false);
  const midi = resolveNote(NATURAL_BY_ID[card.noteId].id, 0).midi;

  const go = () => {
    if (playing || reps >= card.reps) return;
    setPlaying(true);
    playNote(midi, { preset: tone, vibrato, durationSec: card.seconds, velocity: 0.85 });
    window.setTimeout(() => {
      setPlaying(false);
      const next = reps + 1;
      setReps(next);
      if (next >= card.reps) {
        playCorrect();
        onPass();
      }
    }, card.seconds * 1000);
  };

  return (
    <div className="fade-up flex flex-col items-center gap-3 text-center">
      <div className="flex gap-2 text-2xl" aria-label={`${reps}/${card.reps}회 완료`}>
        {Array.from({ length: card.reps }).map((_, i) => (
          <span key={i} className={i < reps ? "" : "opacity-25"} aria-hidden>
            🌬
          </span>
        ))}
      </div>
      <p className="max-w-[320px] text-sm text-sub">{card.body}</p>
      <button
        type="button"
        onClick={go}
        disabled={playing || reps >= card.reps}
        className={`rounded-full px-6 py-3 text-sm font-extrabold text-white shadow transition-transform ${
          playing ? "scale-95 bg-octave" : reps >= card.reps ? "bg-success" : "bg-brand"
        }`}
      >
        {reps >= card.reps ? "참 잘했어요! ✓" : playing ? `후~ 불는 중 (${card.seconds}초)` : `▶ ${reps + 1}회차 — 함께 불기`}
      </button>
      {playing && (
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-stage" aria-hidden>
          <div
            className="h-full rounded-full bg-octave"
            style={{ animation: `longtone-fill ${card.seconds}s linear both` }}
          />
        </div>
      )}
      <style>{`@keyframes longtone-fill { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}
