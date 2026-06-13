import { useCallback, useEffect, useRef, useState } from "react";
import type { Song } from "../data/songs";
import { resolveNote, NATURAL_BY_ID } from "../data/notes";
import { FingeringView } from "./clarii/FingeringView";
import { useAudio } from "../audio/useAudio";
import { playCorrect } from "../audio/synth";
import { useMidiStore, useHoldTarget, useStableNote } from "../midi/useMidi";

export type SongMode = "listen" | "perform";
const SPEEDS = [50, 75, 100] as const;

/**
 * 동요 따라 연주 — 운지 자동 전환 + 다음 음 미리보기 + 진행 바.
 * 듣기 모드: 앱이 소리 냄 / 연주 모드: 무음, 운지만 슬라이드(사용자가 직접 붊).
 * 실기 따라가기(MIDI): 목표 음을 0.3초 유지하면 자기 속도로 진행 (박자 강제 없음).
 */
export function SongPlayer({ song, onComplete }: { song: Song; onComplete?: () => void }) {
  const audio = useAudio();
  const midiConnected = useMidiStore((s) => s.connected);
  const [idx, setIdx] = useState(-1); // -1 = 시작 전
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState<SongMode>("listen");
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(100);
  const [follow, setFollow] = useState(false); // 실기 따라가기
  const [doneStamp, setDoneStamp] = useState(0);
  const timerRef = useRef(0);
  const completedRef = useRef(false);
  const followStats = useRef({ first: 0, captured: false });
  const [firstTryRate, setFirstTryRate] = useState<number | null>(null);

  const notes = song.notes;
  const followActive = follow && midiConnected && mode === "perform";
  const noteAt = (i: number) =>
    i >= 0 && i < notes.length ? { noteId: notes[i][0], beats: notes[i][1] } : null;
  const cur = noteAt(idx);
  const next = noteAt(idx + 1);
  const curMidi = cur ? resolveNote(NATURAL_BY_ID[cur.noteId].id, 0).midi : null;

  const durMs = useCallback(
    (beats: number) => beats * (60000 / song.tempo) * (100 / speed),
    [song.tempo, speed],
  );

  const stop = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setPlaying(false);
    audio.stop();
  }, [audio]);

  /* 곡 완주 처리 */
  const finishIfDone = useCallback(() => {
    setPlaying(false);
    if (!completedRef.current) {
      completedRef.current = true;
      playCorrect();
      setDoneStamp(Date.now());
      if (followActive) setFirstTryRate(Math.round((followStats.current.first / notes.length) * 100));
      onComplete?.();
    }
  }, [followActive, notes.length, onComplete]);

  /* 스텝 진행 — 실기 따라가기가 아니면 타이머로 */
  useEffect(() => {
    if (!playing || idx < 0) return;
    if (idx >= notes.length) {
      finishIfDone();
      return;
    }
    const item = notes[idx];
    followStats.current.captured = false;
    if (mode === "listen") {
      const midi = resolveNote(NATURAL_BY_ID[item[0]].id, 0).midi;
      audio.playMidi(midi, 0.85, (durMs(item[1]) / 1000) * 0.92);
    }
    if (followActive) return; // MIDI 판정이 진행을 맡는다
    timerRef.current = window.setTimeout(() => setIdx((i) => i + 1), durMs(item[1]));
    return () => window.clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, idx]);

  /* 실기 따라가기: 첫 시도 추적 + 목표 0.3초 유지 시 진행 */
  const stable = useStableNote(300);
  useEffect(() => {
    if (!followActive || !playing || stable === null || curMidi === null) return;
    if (!followStats.current.captured) {
      followStats.current.captured = true;
      if (stable === curMidi) followStats.current.first += 1; // 첫 시도 성공
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stable]);
  useHoldTarget(curMidi, () => setIdx((i) => i + 1), {
    enabled: followActive && playing && idx >= 0 && idx < notes.length,
    ms: 300,
  });

  const togglePlay = () => {
    if (playing) {
      stop();
      return;
    }
    if (idx < 0 || idx >= notes.length) {
      completedRef.current = false;
      followStats.current = { first: 0, captured: false };
      setFirstTryRate(null);
      setIdx(0);
    }
    setPlaying(true);
  };

  const restart = () => {
    stop();
    completedRef.current = false;
    followStats.current = { first: 0, captured: false };
    setFirstTryRate(null);
    setIdx(-1);
  };

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const finished = idx >= notes.length;
  const progress = Math.min(Math.max(idx, 0) / notes.length, 1);
  const curResolved = cur ? resolveNote(cur.noteId, 0) : null;

  return (
    <div className="flex h-full flex-col gap-2">
      {/* 헤더: 곡명 + 모드/속도 + 실기 따라가기 */}
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="flex-1 text-base font-extrabold">🎶 {song.title}</h3>
        <div role="group" aria-label="모드" className="flex rounded-full bg-stage p-0.5 text-[11px] font-bold">
          <button
            type="button"
            aria-pressed={mode === "listen"}
            onClick={() => setMode("listen")}
            className={`rounded-full px-2.5 py-1 ${mode === "listen" ? "bg-brand text-white" : "text-sub"}`}
          >
            👂 듣기
          </button>
          <button
            type="button"
            aria-pressed={mode === "perform"}
            onClick={() => setMode("perform")}
            className={`rounded-full px-2.5 py-1 ${mode === "perform" ? "bg-brand text-white" : "text-sub"}`}
          >
            🎷 연주
          </button>
        </div>
        <div role="group" aria-label="속도" className="flex rounded-full bg-stage p-0.5 text-[11px] font-bold">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={speed === s}
              onClick={() => setSpeed(s)}
              className={`num rounded-full px-2 py-1 ${speed === s ? "bg-ink text-white" : "text-sub"}`}
            >
              {s}%
            </button>
          ))}
        </div>
        {midiConnected && mode === "perform" && (
          <button
            type="button"
            aria-pressed={follow}
            onClick={() => setFollow(!follow)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
              follow ? "bg-octave text-white" : "bg-stage text-sub"
            }`}
          >
            🎹 실기 따라가기
          </button>
        )}
      </div>

      {followActive && (
        <p className="rounded-xl bg-octave/10 px-3 py-1.5 text-center text-[11px] font-bold text-octave">
          박자 걱정 없이 자기 속도로! 목표 음을 0.3초 불면 다음으로 넘어가요
        </p>
      )}

      {/* 진행 바 */}
      <div className="h-2 overflow-hidden rounded-full bg-stage" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-brand transition-[width] duration-200" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* 본문: 현재 음 + 운지 + 다음 음 */}
      <div className="flex min-h-0 flex-1 items-stretch gap-2">
        <div className="flex w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-card bg-stage/70">
          <span className="text-[10px] font-bold text-sub">지금</span>
          <span className="num text-2xl font-extrabold text-brand">{curResolved?.korName ?? "—"}</span>
          {curResolved && <span className="num text-[10px] font-bold text-sub">{curResolved.robkooName}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <FingeringView
            note={cur ? { noteId: cur.noteId, layer: 0, accidental: null } : { noteId: "do", layer: 0, accidental: null }}
            ringGlow={audio.glowStamp > 0}
            className="h-full"
          />
        </div>
        <div className="flex w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-card bg-stage/40">
          <span className="text-[10px] font-bold text-sub">다음</span>
          <span className="num text-lg font-extrabold text-sub">
            {next ? NATURAL_BY_ID[next.noteId].kor : finished ? "끝!" : "—"}
          </span>
        </div>
      </div>

      {/* 컨트롤 */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={restart}
          aria-label="처음부터"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-stage text-lg"
        >
          ⏮
        </button>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "일시정지" : "재생"}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl text-white shadow-md"
        >
          {playing ? "⏸" : "▶"}
        </button>
        <span className="num w-14 text-center text-xs font-bold text-sub">
          {Math.min(idx + 1, notes.length)}/{notes.length}
        </span>
      </div>

      {doneStamp > 0 && finished && (
        <p className="fade-up rounded-xl bg-success/10 px-3 py-2 text-center text-sm font-extrabold text-success">
          🎉 완주! 정말 멋져요!
          {firstTryRate !== null && (
            <span className="num mt-0.5 block text-xs font-bold text-sub">
              첫 시도 성공률 {firstTryRate}%
            </span>
          )}
        </p>
      )}
    </div>
  );
}
