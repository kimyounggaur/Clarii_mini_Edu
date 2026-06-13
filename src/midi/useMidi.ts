import { create } from "zustand";
import { useEffect, useState } from "react";
import { useProgressStore } from "../store/useProgressStore";

/**
 * Web MIDI 직접 사용 (외부 MIDI 라이브러리 금지).
 * 클라리 계열은 숨 세기를 CC2(브레스 컨트롤)로 보낸다 — 안 들어오면 note on velocity로 대체.
 */

interface MidiState {
  supported: boolean;
  connected: boolean;
  devices: string[];
  /** 들어온 노트 번호 (보정 전) */
  activeRaw: number | null;
  /** 0~1 숨 세기 */
  breath: number;
  lastEventAt: number;
  error: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  /** 개발자 데모용 가상 입력 */
  simulate: (note: number | null, breath?: number) => void;
}

let access: MIDIAccess | null = null;

function attachInputs(set: (p: Partial<MidiState>) => void) {
  if (!access) return;
  const names: string[] = [];
  access.inputs.forEach((input) => {
    names.push(input.name ?? "이름 없는 기기");
    input.onmidimessage = (e: MIDIMessageEvent) => {
      const data = e.data;
      if (!data || data.length < 2) return;
      const status = data[0] & 0xf0;
      const d1 = data[1];
      const d2 = data.length > 2 ? data[2] : 0;
      if (status === 0x90 && d2 > 0) {
        // note on
        set({ activeRaw: d1, breath: d2 / 127, lastEventAt: Date.now() });
      } else if (status === 0x80 || (status === 0x90 && d2 === 0)) {
        // note off — 같은 노트일 때만 해제
        useMidiStore.setState((s) =>
          s.activeRaw === d1 ? { activeRaw: null, lastEventAt: Date.now() } : { lastEventAt: Date.now() },
        );
      } else if (status === 0xb0 && d1 === 2) {
        // CC2 브레스 컨트롤
        set({ breath: d2 / 127, lastEventAt: Date.now() });
      }
    };
  });
  set({ devices: names, connected: names.length > 0 });
}

export const useMidiStore = create<MidiState>((set) => ({
  supported: typeof navigator !== "undefined" && "requestMIDIAccess" in navigator,
  connected: false,
  devices: [],
  activeRaw: null,
  breath: 0,
  lastEventAt: 0,
  error: null,
  connecting: false,

  connect: async () => {
    if (!("requestMIDIAccess" in navigator)) return;
    set({ connecting: true, error: null });
    try {
      access = await navigator.requestMIDIAccess({ sysex: false });
      attachInputs((p) => set(p));
      access.onstatechange = () => attachInputs((p) => set(p)); // 연결/해제 실시간 반영
      if (access.inputs.size === 0) {
        set({
          error:
            "MIDI 기기가 보이지 않아요. 케이블·전원을 확인하고, 다른 MIDI 앱(Clarii 앱 등)이 연결을 점유 중이지 않은지 확인하세요.",
        });
      }
    } catch (e) {
      set({
        connected: false,
        error:
          "MIDI 권한이 거부되었어요. 주소창 왼쪽 자물쇠(사이트 설정) → MIDI 기기를 '허용'으로 바꾼 뒤 다시 시도하세요.",
      });
      console.warn("[midi]", e);
    } finally {
      set({ connecting: false });
    }
  },

  simulate: (note, breath) =>
    set((s) => ({
      activeRaw: note,
      breath: breath ?? s.breath,
      lastEventAt: Date.now(),
      connected: true,
      devices: s.devices.length > 0 ? s.devices : ["가상 클라리 미니 (시뮬레이터)"],
    })),
}));

/** 옥타브 보정이 적용된 현재 노트 (기준층 도 = 60) */
export function useCorrectedNote(): number | null {
  const raw = useMidiStore((s) => s.activeRaw);
  const offset = useProgressStore((s) => s.midiOffset) ?? 0;
  return raw === null ? null : raw - offset;
}

/** ms 이상 유지된(스치듯 지나가지 않은) 노트 */
export function useStableNote(ms = 300): number | null {
  const note = useCorrectedNote();
  const [stable, setStable] = useState<number | null>(null);
  useEffect(() => {
    if (note === null) {
      setStable(null);
      return;
    }
    const t = window.setTimeout(() => setStable(note), ms);
    return () => {
      window.clearTimeout(t);
      setStable(null);
    };
  }, [note, ms]);
  return stable;
}

/** 목표 음을 ms 이상 유지하면 onHeld 1회 호출 */
export function useHoldTarget(
  targetMidi: number | null,
  onHeld: () => void,
  opts?: { enabled?: boolean; ms?: number; octaveIgnore?: boolean },
) {
  const enabled = opts?.enabled ?? true;
  const stable = useStableNote(opts?.ms ?? 300);
  useEffect(() => {
    if (!enabled || stable === null || targetMidi === null) return;
    const match = opts?.octaveIgnore ? stable % 12 === targetMidi % 12 : stable === targetMidi;
    if (match) onHeld();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stable, targetMidi, enabled]);
}
