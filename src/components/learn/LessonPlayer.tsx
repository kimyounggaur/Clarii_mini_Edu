import { useEffect, useMemo, useState } from "react";
import type { KeyId } from "../../data/keys";
import { LESSONS, type Lesson, type LessonCard } from "../../data/lessons";
import { acceptableSetsFor } from "../../utils/grading";
import { useProgressStore } from "../../store/useProgressStore";
import { useAppStore } from "../../store/useAppStore";
import { useToastStore } from "../../store/useToastStore";
import { ExplainCard, PartsCard, QuizCard, BreathCard, LongtoneCard } from "./cards";
import { TryCard } from "./TryCard";
import { SongPlayer } from "../SongPlayer";
import { SONGS } from "../../data/songs";
import { ClariiSvg } from "../clarii/ClariiSvg";
import { playCorrect } from "../../audio/synth";

function autoPass(card: LessonCard): boolean {
  return card.kind === "explain";
}

/** 직전 try 카드의 목표 운지 → 다음 try의 시작 상태 (전환 펄스 학습) */
function initialPressedFor(lesson: Lesson, cardIdx: number): Set<KeyId> {
  for (let i = cardIdx - 1; i >= 0; i--) {
    const c = lesson.cards[i];
    if (c.kind === "try") {
      return new Set(acceptableSetsFor(c.target)[0] ?? []);
    }
  }
  return new Set();
}

export function LessonPlayer({ lesson, onExit }: { lesson: Lesson; onExit: () => void }) {
  const { lessonCardPos, setLessonCardPos, completeLesson } = useProgressStore();
  const set = useAppStore((s) => s.set);
  const toast = useToastStore((s) => s.show);

  const [idx, setIdx] = useState(Math.min(lessonCardPos[lesson.id] ?? 0, lesson.cards.length - 1));
  const [passedSet, setPassedSet] = useState<Set<number>>(new Set());
  const [songChoice, setSongChoice] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const card = lesson.cards[idx];
  const passed = autoPass(card) || passedSet.has(idx);
  const last = idx === lesson.cards.length - 1;

  useEffect(() => {
    setLessonCardPos(lesson.id, idx);
  }, [idx, lesson.id, setLessonCardPos]);

  const pass = () => setPassedSet((s) => new Set(s).add(idx));

  const finish = () => {
    completeLesson(lesson.id);
    if (lesson.unlocks === "showSemitones") {
      set("showSemitones", true);
      toast("운지표에 반음이 나타났어요! ✨");
    }
    if (lesson.unlocks === "showAdvanced") {
      set("showAdvanced", true);
      toast("교차운지 보기가 열렸어요! 🧩");
    }
    playCorrect();
    setCelebrate(true);
  };

  const initialPressed = useMemo(
    () => (card.kind === "try" ? initialPressedFor(lesson, idx) : new Set<KeyId>()),
    [lesson, idx, card.kind],
  );

  if (celebrate) {
    return (
      <div className="fade-up flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <ClariiSvg face="front" pressed={[]} ringGlow showGuideLabels={false} className="h-48" />
        <div className="text-5xl" aria-hidden>
          {lesson.emoji}
        </div>
        <h2 className="text-xl font-extrabold">레슨 완료!</h2>
        <p className="text-sm font-semibold text-sub">
          {lesson.id} · {lesson.title}
        </p>
        <button
          type="button"
          onClick={onExit}
          className="rounded-full bg-brand px-8 py-3 font-extrabold text-white shadow"
        >
          목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2 p-3">
      {/* 헤더 */}
      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={onExit}
          aria-label="레슨 나가기"
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

      {/* 진행 점 */}
      <div className="flex justify-center gap-1" aria-hidden>
        {lesson.cards.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === idx ? "w-4 bg-brand" : i < idx ? "w-1.5 bg-brand/50" : "w-1.5 bg-bodyline"
            }`}
          />
        ))}
      </div>

      {/* 카드 본문 */}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-card bg-white p-4 shadow-sm">
        {card.kind === "explain" && <ExplainCard card={card} />}
        {card.kind === "parts" && <PartsCard card={card} onPass={pass} passed={passed} />}
        {card.kind === "quiz" && <QuizCard key={idx} card={card} onPass={pass} passed={passedSet.has(idx)} />}
        {card.kind === "breath" && <BreathCard card={card} onPass={pass} />}
        {card.kind === "longtone" && (
          <LongtoneCard key={idx} card={card} onPass={pass} passed={passedSet.has(idx)} />
        )}
        {card.kind === "try" && (
          <TryCard
            key={idx}
            card={card}
            initialPressed={initialPressed}
            onPass={pass}
            passed={passedSet.has(idx)}
          />
        )}
        {card.kind === "song" && (
          <div className="flex h-full flex-col gap-3">
            <h3 className="text-center text-base font-extrabold">{card.title}</h3>
            <p className="text-center text-xs text-sub">{card.body}</p>
            {!songChoice ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3">
                {SONGS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSongChoice(s.id)}
                    className="w-56 rounded-card border-2 border-bodyline/60 bg-white px-4 py-3 text-sm font-extrabold shadow-sm hover:border-brand"
                  >
                    🎶 {s.title}
                  </button>
                ))}
              </div>
            ) : (
              <div className="min-h-0 flex-1">
                <SongPlayer
                  song={SONGS.find((s) => s.id === songChoice)!}
                  onComplete={pass}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 하단 내비게이션 */}
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
            passed ? "bg-brand" : "bg-bodyline"
          }`}
        >
          {last ? "레슨 완료! 🎉" : passed ? "다음 →" : card.kind === "try" ? "운지를 만들면 열려요" : "통과하면 열려요"}
        </button>
      </div>
    </div>
  );
}

export { LESSONS };
