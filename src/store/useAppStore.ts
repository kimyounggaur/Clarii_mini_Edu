import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "../utils/safeStorage";
import type { Accidental, LayerNum } from "../data/notes";

export type TabId = "explorer" | "learn" | "practice" | "settings";
export type Notation = "solfege" | "device" | "intl";
export type TonePreset = "flute" | "sax" | "synth";
export type OctaveRange = "core" | "full";

export interface CurrentNote {
  noteId: string;
  layer: LayerNum;
  accidental: Accidental;
}

interface AppState {
  tab: TabId;
  current: CurrentNote;
  /** 설정값 */
  notation: Notation;        // 기본: 계이름+기기표시 병기
  tone: TonePreset;
  autoPlay: boolean;
  vibrato: boolean;
  showSemitones: boolean;    // 반음 표시
  showAdvanced: boolean;     // 고급(교차) 운지 표시
  octaveRange: OctaveRange;  // core = 0·+1층만
  onboardingSeen: boolean;

  setTab: (tab: TabId) => void;
  setCurrent: (note: CurrentNote) => void;
  set: <K extends keyof AppState>(key: K, value: AppState[K]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      tab: "explorer",
      current: { noteId: "do", layer: 0, accidental: null },
      notation: "device",
      tone: "flute",
      autoPlay: true,
      vibrato: true,
      showSemitones: false,
      showAdvanced: false,
      octaveRange: "core",
      onboardingSeen: false,

      setTab: (tab) => set({ tab }),
      setCurrent: (current) => set({ current }),
      set: (key, value) => set({ [key]: value } as Partial<AppState>),
    }),
    {
      name: "clarii-settings",
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        notation: s.notation,
        tone: s.tone,
        autoPlay: s.autoPlay,
        vibrato: s.vibrato,
        showSemitones: s.showSemitones,
        showAdvanced: s.showAdvanced,
        octaveRange: s.octaveRange,
        onboardingSeen: s.onboardingSeen,
      }),
    },
  ),
);
