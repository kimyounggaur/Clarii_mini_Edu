import { useCallback, useRef, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { resolveNote, type NoteSelection } from "../data/notes";
import {
  playNote,
  holdNote,
  playSequence,
  stopSequence,
  stopAll,
  type SeqItem,
} from "./synth";

/**
 * 설정(음색·비브라토)을 반영해 재생하는 훅.
 * 반환되는 glowStamp를 FingeringView의 ringGlow 연출에 연결한다.
 */
export function useAudio() {
  const tone = useAppStore((s) => s.tone);
  const vibrato = useAppStore((s) => s.vibrato);
  const [isPlaying, setIsPlaying] = useState(false);
  const [glowStamp, setGlowStamp] = useState(0);
  const glowTimer = useRef(0);

  const triggerGlow = useCallback(() => {
    setGlowStamp(Date.now());
    window.clearTimeout(glowTimer.current);
    glowTimer.current = window.setTimeout(() => setGlowStamp(0), 650);
  }, []);

  const playMidi = useCallback(
    (midi: number, velocity = 0.8, durationSec?: number) => {
      playNote(midi, { preset: tone, vibrato, velocity, durationSec });
      triggerGlow();
    },
    [tone, vibrato, triggerGlow],
  );

  const playCurrent = useCallback(
    (note: NoteSelection, velocity = 0.8) => {
      const r = resolveNote(note.noteId, note.layer, note.accidental);
      playMidi(r.midi, velocity);
      return r;
    },
    [playMidi],
  );

  const holdCurrent = useCallback(
    (note: NoteSelection) => {
      const r = resolveNote(note.noteId, note.layer, note.accidental);
      triggerGlow();
      return holdNote(r.midi, { preset: tone, vibrato });
    },
    [tone, vibrato, triggerGlow],
  );

  const playSeq = useCallback(
    async (items: SeqItem[], bpm: number, onStep?: (i: number) => void) => {
      setIsPlaying(true);
      try {
        await playSequence(items, bpm, onStep, { preset: tone, vibrato });
      } finally {
        setIsPlaying(false);
      }
    },
    [tone, vibrato],
  );

  const stop = useCallback(() => {
    stopSequence();
    stopAll();
    setIsPlaying(false);
  }, []);

  return { playCurrent, playMidi, holdCurrent, playSeq, stop, isPlaying, glowStamp };
}
