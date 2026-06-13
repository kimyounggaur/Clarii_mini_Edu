import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "../utils/safeStorage";

export type GameId = "make" | "read" | "ear" | "rush";

export interface GameRecord {
  best: number;
  plays: number;
}

interface ProgressState {
  /** 완료한 레슨 id 목록 (L0~L11) */
  completedLessons: string[];
  /** 레슨별 현재 카드 위치 (이어하기) */
  lessonCardPos: Record<string, number>;
  /** 전체 레슨 잠금 해제 */
  unlockAll: boolean;
  /** 게임 기록 */
  gameRecords: Record<GameId, GameRecord>;
  /** 일일 스트릭 */
  streakDays: number;
  lastPlayDay: string | null; // "2026-06-13"
  /** 귀 트기 적응 레벨 (0부터) */
  earLevel: number;
  /** MIDI 옥타브 보정 오프셋 (rawNote - 60) */
  midiOffset: number | null;

  completeLesson: (id: string) => void;
  setLessonCardPos: (id: string, pos: number) => void;
  setUnlockAll: (v: boolean) => void;
  recordGame: (game: GameId, score: number) => { newBest: boolean };
  setEarLevel: (lv: number) => void;
  setMidiOffset: (off: number | null) => void;
  resetAll: () => void;
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const EMPTY_RECORDS: Record<GameId, GameRecord> = {
  make: { best: 0, plays: 0 },
  read: { best: 0, plays: 0 },
  ear: { best: 0, plays: 0 },
  rush: { best: 0, plays: 0 },
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessons: [],
      lessonCardPos: {},
      unlockAll: false,
      gameRecords: { ...EMPTY_RECORDS },
      streakDays: 0,
      lastPlayDay: null,
      earLevel: 0,
      midiOffset: null,

      completeLesson: (id) =>
        set((s) =>
          s.completedLessons.includes(id)
            ? s
            : { completedLessons: [...s.completedLessons, id] },
        ),
      setLessonCardPos: (id, pos) =>
        set((s) => ({ lessonCardPos: { ...s.lessonCardPos, [id]: pos } })),
      setUnlockAll: (v) => set({ unlockAll: v }),
      recordGame: (game, score) => {
        const s = get();
        const rec = s.gameRecords[game] ?? { best: 0, plays: 0 };
        const newBest = score > rec.best;
        const t = today();
        let streakDays = s.streakDays;
        if (s.lastPlayDay !== t) {
          const yesterday = (() => {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          })();
          streakDays = s.lastPlayDay === yesterday ? s.streakDays + 1 : 1;
        }
        set({
          gameRecords: {
            ...s.gameRecords,
            [game]: { best: Math.max(rec.best, score), plays: rec.plays + 1 },
          },
          streakDays,
          lastPlayDay: t,
        });
        return { newBest };
      },
      setEarLevel: (lv) => set({ earLevel: lv }),
      setMidiOffset: (off) => set({ midiOffset: off }),
      resetAll: () =>
        set({
          completedLessons: [],
          lessonCardPos: {},
          gameRecords: { ...EMPTY_RECORDS },
          streakDays: 0,
          lastPlayDay: null,
          earLevel: 0,
        }),
    }),
    {
      name: "clarii-progress",
      storage: createJSONStorage(() => safeStorage),
    },
  ),
);
