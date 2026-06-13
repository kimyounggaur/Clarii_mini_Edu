import { useState } from "react";
import { LESSONS } from "../data/lessons";
import { SONGS } from "../data/songs";
import { useProgressStore } from "../store/useProgressStore";
import { LessonPlayer } from "../components/learn/LessonPlayer";
import { SongPlayer } from "../components/SongPlayer";

export function LearnView() {
  const { completedLessons, unlockAll, setUnlockAll } = useProgressStore();
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [openSong, setOpenSong] = useState<string | null>(null);

  if (openLesson) {
    const lesson = LESSONS.find((l) => l.id === openLesson)!;
    return <LessonPlayer lesson={lesson} onExit={() => setOpenLesson(null)} />;
  }
  if (openSong) {
    const song = SONGS.find((s) => s.id === openSong)!;
    return (
      <div className="flex h-full flex-col gap-2 p-3">
        <button
          type="button"
          onClick={() => setOpenSong(null)}
          aria-label="목록으로"
          className="self-start rounded-full bg-white px-3 py-1.5 text-sm font-bold text-sub shadow-sm"
        >
          ← 목록
        </button>
        <div className="min-h-0 flex-1 rounded-card bg-white p-3 shadow-sm">
          <SongPlayer song={song} />
        </div>
      </div>
    );
  }

  const isDone = (id: string) => completedLessons.includes(id);
  const isLocked = (i: number) =>
    !unlockAll && i > 0 && !isDone(LESSONS[i - 1].id);

  return (
    <div className="flex flex-col gap-3 p-3 pb-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">📚 배우기</h1>
        <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-bold text-sub">
          <input
            type="checkbox"
            checked={unlockAll}
            onChange={(e) => setUnlockAll(e.target.checked)}
            className="accent-brand"
          />
          잠금 해제
        </label>
      </header>

      <p className="text-xs font-semibold text-sub">
        잡는 법부터 교차운지까지 — 12개 레슨 ({completedLessons.length}/12 완료)
      </p>

      <ul className="flex flex-col gap-2">
        {LESSONS.map((l, i) => {
          const done = isDone(l.id);
          const locked = isLocked(i);
          return (
            <li key={l.id}>
              <button
                type="button"
                disabled={locked}
                onClick={() => setOpenLesson(l.id)}
                aria-label={`${l.id} ${l.title}${done ? " (완료)" : locked ? " (잠김)" : ""}`}
                className={`flex w-full items-center gap-3 rounded-card border-2 bg-white px-4 py-3 text-left shadow-sm transition-colors ${
                  done
                    ? "border-success/40"
                    : locked
                      ? "border-transparent opacity-50"
                      : "border-transparent hover:border-brand/50"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {locked ? "🔒" : l.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold text-sub">{l.id}</span>
                  <span className="block truncate text-sm font-extrabold">{l.title}</span>
                </span>
                {done && (
                  <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-extrabold text-success">
                    ✓ 완료
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-2 text-base font-extrabold">🎶 동요 따라 연주</h2>
      <div className="flex gap-2">
        {SONGS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setOpenSong(s.id)}
            className="flex-1 rounded-card bg-white px-4 py-4 text-sm font-extrabold shadow-sm hover:ring-2 hover:ring-brand/40"
          >
            🎵 {s.title}
            <span className="num mt-0.5 block text-[10px] font-semibold text-sub">♩= {s.tempo}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
