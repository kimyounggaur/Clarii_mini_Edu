/**
 * Web Audio API 직접 구현 관악기 음색 합성 (외부 라이브러리·샘플 금지).
 * AudioContext는 싱글턴 1개. 첫 사용자 제스처에서 resume() — iOS 사파리 무음 방지.
 */

export type TonePreset = "flute" | "sax" | "synth";

export interface PlayOpts {
  durationSec?: number;
  velocity?: number;
  preset?: TonePreset;
  vibrato?: boolean;
}

let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    installResumeOnGesture(ctx);
  }
  return ctx;
}

function installResumeOnGesture(c: AudioContext) {
  const resume = () => {
    if (c.state === "suspended") void c.resume();
  };
  for (const ev of ["touchstart", "pointerdown", "click", "keydown"] as const) {
    window.addEventListener(ev, resume, { passive: true });
  }
}

/** 재생 직전 suspended 가드 — 제스처 핸들러 안에서 호출되면 즉시 재개된다 */
async function ensureRunning(): Promise<AudioContext> {
  const c = getCtx();
  if (c.state === "suspended") {
    try {
      await c.resume();
    } catch {
      /* 다음 제스처에서 재개 */
    }
  }
  return c;
}

function getNoiseBuffer(c: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    const len = c.sampleRate; // 1초
    noiseBuffer = c.createBuffer(1, len, c.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

export function midiToFreq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

interface Voice {
  midi: number;
  master: GainNode;
  stoppables: { stop: (t: number) => void }[];
  releaseSec: number;
  endTimer: number;
}

const activeVoices = new Set<Voice>();

function releaseVoice(v: Voice, when: number, fast = false) {
  if (!activeVoices.has(v)) return;
  activeVoices.delete(v);
  window.clearTimeout(v.endTimer);
  const rel = fast ? Math.min(0.06, v.releaseSec) : v.releaseSec;
  const g = v.master.gain;
  g.cancelScheduledValues(when);
  g.setValueAtTime(Math.max(g.value, 0.0001), when);
  g.exponentialRampToValueAtTime(0.0001, when + rel); // 클릭 노이즈 금지: 지수 release
  for (const s of v.stoppables) {
    try {
      s.stop(when + rel + 0.03);
    } catch {
      /* 이미 정지됨 */
    }
  }
  window.setTimeout(() => v.master.disconnect(), (rel + 0.1) * 1000);
}

interface BuildResult {
  stoppables: { stop: (t: number) => void; start: (t: number) => void }[];
  /** 비브라토 LFO를 걸 detune 대상들 */
  vibratoTargets: AudioParam[];
}

function buildPreset(
  c: AudioContext,
  preset: TonePreset,
  f: number,
  velocity: number,
  out: GainNode,
): BuildResult {
  const nodes: BuildResult = { stoppables: [], vibratoTargets: [] };
  const mk = (type: OscillatorType, freq: number, gain: number, detuneCents = 0, through?: AudioNode) => {
    const o = c.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detuneCents;
    const g = c.createGain();
    g.gain.value = gain;
    o.connect(g);
    g.connect(through ?? out);
    nodes.stoppables.push(o);
    return o;
  };
  const mkNoise = (gain: number, filter: BiquadFilterNode | null) => {
    const src = c.createBufferSource();
    src.buffer = getNoiseBuffer(c);
    src.loop = true;
    const g = c.createGain();
    g.gain.value = gain;
    if (filter) {
      src.connect(filter);
      filter.connect(g);
    } else {
      src.connect(g);
    }
    g.connect(out);
    nodes.stoppables.push(src);
  };

  if (preset === "flute") {
    const o1 = mk("sine", f, 1.0);
    mk("sine", 2 * f, 0.07);
    const o3 = mk("triangle", f, 0.12);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2 * f;
    bp.Q.value = 1;
    mkNoise(0.015, bp);
    nodes.vibratoTargets.push(o1.detune, o3.detune);
  } else if (preset === "sax") {
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    // velocity 반영: 숨이 세면 밝게 (컷오프 상향)
    const bright = 0.7 + 0.6 * velocity;
    lp.frequency.setValueAtTime(2.4 * f * bright, c.currentTime);
    lp.frequency.exponentialRampToValueAtTime(1.6 * f * bright, c.currentTime + 0.15);
    lp.Q.value = 1.2;
    const sawGain = c.createGain();
    sawGain.gain.value = 0.5;
    lp.connect(sawGain);
    sawGain.connect(out);
    const saw = mk("sawtooth", f, 1.0, 0, lp);
    const o2 = mk("sine", f, 0.35);
    mkNoise(0.01, null);
    nodes.vibratoTargets.push(saw.detune, o2.detune);
  } else {
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 3 * f;
    lp.connect(out);
    const o1 = mk("square", f, 0.22, 0, lp);
    const o2 = mk("sawtooth", f, 0.22, 7, lp);
    const o3 = mk("sawtooth", f, 0.22, -7, lp);
    nodes.vibratoTargets.push(o1.detune, o2.detune, o3.detune);
  }
  return nodes;
}

const ADSR: Record<TonePreset, [number, number, number, number]> = {
  flute: [0.03, 0.08, 0.85, 0.22],
  sax: [0.045, 0.12, 0.8, 0.18],
  synth: [0.01, 0.05, 0.9, 0.3],
};

function startVoice(
  c: AudioContext,
  midi: number,
  preset: TonePreset,
  velocity: number,
  vibrato: boolean,
  durationSec: number | null, // null = 지속음 (수동 정지)
): Voice {
  const f = midiToFreq(midi);
  const t0 = c.currentTime;
  const [atk, dec, sus, rel] = ADSR[preset];

  // 같은 음 연타: 이전 노트를 자연스럽게 정리
  for (const v of [...activeVoices]) {
    if (v.midi === midi) releaseVoice(v, t0, true);
  }

  const master = c.createGain();
  master.connect(c.destination);
  const peak = 0.32 * velocity; // 마스터 게인에 velocity 반영
  master.gain.setValueAtTime(0.0001, t0);
  master.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0001), t0 + atk);
  master.gain.exponentialRampToValueAtTime(Math.max(peak * sus, 0.0001), t0 + atk + dec);

  const built = buildPreset(c, preset, f, velocity, master);

  // 공통 비브라토: LFO sine 5.2Hz, ±6cent, 0.3초 후부터 서서히
  if (vibrato) {
    const lfo = c.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 5.2;
    const depth = c.createGain();
    depth.gain.setValueAtTime(0, t0);
    depth.gain.setValueAtTime(0, t0 + 0.3);
    depth.gain.linearRampToValueAtTime(6, t0 + 1.0);
    lfo.connect(depth);
    for (const target of built.vibratoTargets) depth.connect(target);
    built.stoppables.push(lfo);
  }

  for (const s of built.stoppables) s.start(t0);

  const voice: Voice = {
    midi,
    master,
    stoppables: built.stoppables,
    releaseSec: rel,
    endTimer: 0,
  };
  activeVoices.add(voice);

  if (durationSec !== null) {
    const holdEnd = Math.max(durationSec - rel, atk + dec);
    voice.endTimer = window.setTimeout(() => {
      releaseVoice(voice, c.currentTime);
    }, holdEnd * 1000);
  }
  return voice;
}

/** 단음 재생 (기본 1.1초, velocity 0.8) */
export function playNote(midi: number, opts?: PlayOpts): void {
  void ensureRunning().then((c) => {
    startVoice(
      c,
      midi,
      opts?.preset ?? "flute",
      opts?.velocity ?? 0.8,
      opts?.vibrato ?? true,
      opts?.durationSec ?? 1.1,
    );
  });
}

/** 길게 누르는 동안 지속음 — 반환된 stop()으로 종료 */
export function holdNote(midi: number, opts?: Omit<PlayOpts, "durationSec">): { stop: () => void } {
  let voice: Voice | null = null;
  let stopped = false;
  void ensureRunning().then((c) => {
    if (stopped) return;
    voice = startVoice(c, midi, opts?.preset ?? "flute", opts?.velocity ?? 0.8, opts?.vibrato ?? true, null);
  });
  return {
    stop: () => {
      stopped = true;
      if (voice && ctx) releaseVoice(voice, ctx.currentTime);
    },
  };
}

/** 모든 발음 즉시 정리 */
export function stopAll(): void {
  if (!ctx) return;
  const t = ctx.currentTime;
  for (const v of [...activeVoices]) releaseVoice(v, t, true);
}

/* ---------- 시퀀스 ---------- */

let seqGeneration = 0;

export interface SeqItem {
  midi: number;
  beats: number;
}

export async function playSequence(
  items: SeqItem[],
  bpm: number,
  onStep?: (i: number) => void,
  opts?: PlayOpts,
): Promise<void> {
  const myGen = ++seqGeneration;
  const beatSec = 60 / bpm;
  await ensureRunning();
  for (let i = 0; i < items.length; i++) {
    if (myGen !== seqGeneration) return; // 중단됨
    const it = items[i];
    onStep?.(i);
    playNote(it.midi, { ...opts, durationSec: Math.max(it.beats * beatSec * 0.92, 0.18) });
    await new Promise((r) => setTimeout(r, it.beats * beatSec * 1000));
  }
}

export function stopSequence(): void {
  seqGeneration++;
  stopAll();
}

/* ---------- 효과음 ---------- */

/** 정답: 밝은 2음 상행 */
export function playCorrect(): void {
  void ensureRunning().then((c) => {
    const mk = (f: number, t: number, dur: number) => {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, c.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.22, c.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start(c.currentTime + t);
      o.stop(c.currentTime + t + dur + 0.05);
      o.onended = () => g.disconnect();
    };
    mk(784, 0, 0.16); // G5
    mk(1175, 0.11, 0.26); // D6
  });
}

/** 오답: 짧은 저음 1개 */
export function playWrong(): void {
  void ensureRunning().then((c) => {
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.value = 140;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, c.currentTime + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.28);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.32);
    o.onended = () => g.disconnect();
  });
}
