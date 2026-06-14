import { useEffect, useMemo, useState } from "react";
import { playCorrect } from "../../../audio/synth";
import type { ProC20Lesson, ProC20LessonCard } from "../../../data/proC20/lessons";
import type { ProC20KeyId } from "../../../data/proC20/types";
import { useProgressStore } from "../../../store/useProgressStore";
import { acceptableProC20SetsFor } from "../../../utils/proC20Grading";
import { ProC20Svg } from "../ProC20Svg";
import {
  ProC20ChartCard,
  ProC20ChecklistCard,
  ProC20ExplainCard,
  ProC20ImageCard,
  ProC20ModeCard,
  ProC20PartsCard,
  ProC20QuizCard,
  ProC20RuleCard,
} from "./cards";
import { ProC20TryCard } from "./ProC20TryCard";

function autoPass(card: ProC20LessonCard): boolean {
  return card.kind === "explain" || card.kind === "image" || card.kind === "chart" || card.kind === "rule";
}

function initialPressedFor(lesson: ProC20Lesson, cardIdx: number): Set<ProC20KeyId> {
  for (let index = cardIdx - 1; index >= 0; index--) {
    const card = lesson.cards[index];
    if (card.kind === "try") {
      return new Set(acceptableProC20SetsFor(card.target)[0]?.keys ?? []);
    }
  }
  return new Set();
}

export function ProC20LessonPlayer({ lesson, onExit }: { lesson: ProC20Lesson; onExit: () => void }) {
  const {
    proC20LessonCardPos,
    selectedProC20Mode,
    setProC20LessonCardPos,
    setSelectedProC20Mode,
    completeProC20Lesson,
  } = useProgressStore();
  const [idx, setIdx] = useState(Math.min(proC20LessonCardPos[lesson.id] ?? 0, lesson.cards.length - 1));
  const [passedSet, setPassedSet] = useState<Set<number>>(new Set());
  const [celebrate, setCelebrate] = useState(false);

  const card = lesson.cards[idx];
  const passed = autoPass(card) || passedSet.has(idx);
  const last = idx === lesson.cards.length - 1;

  useEffect(() => {
    setProC20LessonCardPos(lesson.id, idx);
  }, [idx, lesson.id, setProC20LessonCardPos]);

  const pass = () => setPassedSet((current) => new Set(current).add(idx));

  const finish = () => {
    completeProC20Lesson(lesson.id);
    playCorrect();
    setCelebrate(true);
  };

  const initialPressed = useMemo(
    () => (card.kind === "try" ? initialPressedFor(lesson, idx) : new Set<ProC20KeyId>()),
    [lesson, idx, card.kind],
  );

  if (celebrate) {
    return (
      <div className="fade-up flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <ProC20Svg face="front" pressed={["N1", "N2", "N3", "BIS", "LP1"]} className="h-56" />
        <div className="text-5xl" aria-hidden>
          {lesson.emoji}
        </div>
        <h2 className="text-xl font-extrabold">PRO C20 레슨 완료!</h2>
        <p className="text-sm font-semibold text-sub">
          {lesson.id} · {lesson.title}
        </p>
        <button
          type="button"
          onClick={onExit}
          className="rounded-full bg-[#171B20] px-8 py-3 font-extrabold text-white shadow"
        >
          목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={onExit}
          aria-label="PRO C20 레슨 나가기"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm"
        >
          ←
        </button>
        <h2 className="min-w-0 flex-1 truncate text-base font-extrabold">
          {lesson.emoji} {lesson.title}
        </h2>
        <span className="num text-xs font-bold text-sub">
          {idx + 1}/{lesson.cards.length}
        </span>
      </header>

      <div className="flex justify-center gap-1" aria-hidden>
        {lesson.cards.map((_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              index === idx
                ? "w-4 bg-[#19E6FF]"
                : index < idx
                  ? "w-1.5 bg-[#19E6FF]/50"
                  : "w-1.5 bg-bodyline"
            }`}
          />
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-card bg-white p-4 shadow-sm">
        {card.kind === "explain" && <ProC20ExplainCard card={card} />}
        {card.kind === "image" && <ProC20ImageCard card={card} />}
        {card.kind === "parts" && <ProC20PartsCard card={card} onPass={pass} passed={passedSet.has(idx)} />}
        {card.kind === "mode" && (
          <ProC20ModeCard
            card={card}
            selectedMode={selectedProC20Mode}
            onModeChange={setSelectedProC20Mode}
            onPass={pass}
          />
        )}
        {card.kind === "chart" && <ProC20ChartCard card={card} selectedMode={selectedProC20Mode} />}
        {card.kind === "rule" && <ProC20RuleCard card={card} />}
        {card.kind === "quiz" && <ProC20QuizCard key={idx} card={card} onPass={pass} passed={passedSet.has(idx)} />}
        {card.kind === "checklist" && (
          <ProC20ChecklistCard key={idx} card={card} onPass={pass} passed={passedSet.has(idx)} />
        )}
        {card.kind === "try" && (
          <ProC20TryCard
            key={idx}
            card={card}
            initialPressed={initialPressed}
            onPass={pass}
            passed={passedSet.has(idx)}
          />
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIdx(Math.max(0, idx - 1))}
          disabled={idx === 0}
          className="flex-1 rounded-full bg-white py-2.5 text-sm font-bold text-sub shadow-sm disabled:opacity-40"
        >
          ← 이전
        </button>
        <button
          type="button"
          onClick={() => (last ? finish() : setIdx(idx + 1))}
          disabled={!passed}
          className={`flex-[2] rounded-full py-2.5 text-sm font-extrabold text-white shadow transition-colors ${
            passed ? "bg-[#171B20]" : "bg-bodyline"
          }`}
        >
          {last ? "PRO C20 레슨 완료!" : passed ? "다음 →" : card.kind === "try" ? "운지를 만들면 열려요" : "통과하면 열려요"}
        </button>
      </div>
    </div>
  );
}
