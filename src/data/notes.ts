import rawFingerings from "./fingerings.json";
import type { KeyId } from "./keys";

/* ---------- 타입 (fingerings.json 구조와 일치) ---------- */

export interface Natural {
  id: string;
  kor: string;
  letter: string;
  pc: number;
  keys: KeyId[];
  tip: string;
}

export interface Semitone {
  id: string;
  kor: string;
  pc: number;
  viaSharp: string;        // ♯ 키 방식의 기반 온음 id
  viaFlat: string | null;  // ♭ 키 방식의 기반 온음 id (없으면 null)
  cross: KeyId[][];        // 교차운지(없으면 빈 배열)
  crossTip?: string;
}

export interface OctaveLayerDef {
  layer: number;           // -1 | 0 | 1 | 2
  kor: string;
  thumb: KeyId[];
  deviceRange: string;
  tip: string;
}

export interface FingeringData {
  instrument: string;
  convention: string;
  baseMidi: number;
  naturals: Natural[];
  semitones: Semitone[];
  octaveLayers: OctaveLayerDef[];
}

export const FINGERINGS = rawFingerings as unknown as FingeringData;

export type Accidental = "sharp" | "flat" | null;
export type LayerNum = -1 | 0 | 1 | 2;

export const NATURAL_BY_ID: Record<string, Natural> = Object.fromEntries(
  FINGERINGS.naturals.map((n) => [n.id, n]),
);
export const SEMITONE_BY_PC: Record<number, Semitone> = Object.fromEntries(
  FINGERINGS.semitones.map((s) => [s.pc, s]),
);
export const SEMITONE_BY_ID: Record<string, Semitone> = Object.fromEntries(
  FINGERINGS.semitones.map((s) => [s.id, s]),
);
export const LAYER_BY_NUM: Record<number, OctaveLayerDef> = Object.fromEntries(
  FINGERINGS.octaveLayers.map((l) => [l.layer, l]),
);

export const MIDI_MIN = 48;
export const MIDI_MAX = 96;

/* ---------- 주파수 ---------- */

export function midiToFreq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/* ---------- 음 해석 ---------- */

export interface ResolvedNote {
  noteId: string;          // 기반 온음 id
  layer: LayerNum;
  accidental: Accidental;
  midi: number;
  pc: number;              // 기준층 도(midi 60) 기준 반음 거리 (accidental 반영)
  korName: string;         // "도", "높은 도", 반음이면 "파♯·솔♭"
  robkooName: string;      // 기기 표시 (예: "C3", "F♯3/G♭3")
  sciName: string;         // 국제 표기 (예: "C4", "F♯4/G♭4")
  letter: string;          // 기보용 글자(반음은 표기 방식에 따른 기본 글자)
  isSemitone: boolean;
  semitone: Semitone | null;
  natural: Natural;
  layerDef: OctaveLayerDef;
}

function octaveNumbers(letterPc: number, layer: number) {
  // 기기 표시: 기준층 도 = C3. pc(글자 기준)가 12 이상이면 다음 옥타브 숫자
  const robkooOct = 3 + layer + (letterPc >= 12 ? 1 : 0);
  return { robkooOct, sciOct: robkooOct + 1 };
}

/**
 * 온음 id + 옥타브 층 + (선택) ♯/♭ 보정으로 음을 확정한다.
 * midi = 60 + 12×layer + pc (+ accidental 보정)
 */
export function resolveNote(
  noteId: string,
  layer: LayerNum,
  accidental: Accidental = null,
): ResolvedNote {
  const natural = NATURAL_BY_ID[noteId];
  if (!natural) throw new Error(`resolveNote: 알 수 없는 noteId "${noteId}"`);
  const layerDef = LAYER_BY_NUM[layer];
  if (!layerDef) throw new Error(`resolveNote: 알 수 없는 layer ${layer}`);

  const accShift = accidental === "sharp" ? 1 : accidental === "flat" ? -1 : 0;
  const pc = natural.pc + accShift;
  const midi = FINGERINGS.baseMidi + 12 * layer + pc;
  const semitone = accidental ? (SEMITONE_BY_PC[pc] ?? null) : null;

  if (!accidental) {
    const { robkooOct, sciOct } = octaveNumbers(natural.pc, layer);
    return {
      noteId, layer, accidental, midi, pc,
      korName: natural.kor,
      robkooName: `${natural.letter}${robkooOct}`,
      sciName: `${natural.letter}${sciOct}`,
      letter: natural.letter,
      isSemitone: false,
      semitone: null,
      natural, layerDef,
    };
  }

  // 반음: 이명동음 병기 (예: "C♯3 / D♭3")
  const sharpBase = semitone ? NATURAL_BY_ID[semitone.viaSharp] : null;
  const flatBase = semitone?.viaFlat ? NATURAL_BY_ID[semitone.viaFlat] : null;
  const sharpName = sharpBase
    ? (() => {
        const { robkooOct, sciOct } = octaveNumbers(sharpBase.pc, layer);
        return { device: `${sharpBase.letter}♯${robkooOct}`, sci: `${sharpBase.letter}♯${sciOct}` };
      })()
    : null;
  const flatName = flatBase
    ? (() => {
        const { robkooOct, sciOct } = octaveNumbers(flatBase.pc, layer);
        return { device: `${flatBase.letter}♭${robkooOct}`, sci: `${flatBase.letter}♭${sciOct}` };
      })()
    : null;

  const device = [sharpName?.device, flatName?.device].filter(Boolean).join("/");
  const sci = [sharpName?.sci, flatName?.sci].filter(Boolean).join("/");
  const baseLetter =
    accidental === "flat" && flatBase ? flatBase.letter : (sharpBase?.letter ?? natural.letter);

  return {
    noteId, layer, accidental, midi, pc,
    korName: semitone?.kor ?? `${natural.kor}${accidental === "sharp" ? "♯" : "♭"}`,
    robkooName: device || `${natural.letter}${accidental === "sharp" ? "♯" : "♭"}?`,
    sciName: sci || device,
    letter: baseLetter,
    isSemitone: true,
    semitone,
    natural, layerDef,
  };
}

/* ---------- 전체 음 목록 (운지표 탭) ---------- */

export interface NotePosition {
  noteId: string;
  layer: LayerNum;
  accidental: Accidental;
  midi: number;
  isSemitone: boolean;
}

/**
 * 4개 층 × (온음 8 + 반음), midi 48~96 클램프, midi 오름차순.
 * 층 경계의 중복(아래층 '높은 도' = 윗층 '도', pc13 반음 = 윗층 pc1 반음)은
 * 한 번만 — 윗층 표현을 남기고, 최고음 96(+2층 높은 도)만 예외로 포함한다.
 */
export const ALL_POSITIONS: NotePosition[] = (() => {
  const list: NotePosition[] = [];
  const layers: LayerNum[] = [-1, 0, 1, 2];
  for (const layer of layers) {
    for (const n of FINGERINGS.naturals) {
      if (n.pc >= 12 && layer < 2) continue; // 경계 중복 도 제거(윗층 도가 대표)
      const midi = FINGERINGS.baseMidi + 12 * layer + n.pc;
      if (midi < MIDI_MIN || midi > MIDI_MAX) continue;
      list.push({ noteId: n.id, layer, accidental: null, midi, isSemitone: false });
    }
    for (const s of FINGERINGS.semitones) {
      if (s.pc >= 12 && layer < 2) continue; // 경계 중복 반음 제거
      const midi = FINGERINGS.baseMidi + 12 * layer + s.pc;
      if (midi < MIDI_MIN || midi > MIDI_MAX) continue;
      list.push({ noteId: s.viaSharp, layer, accidental: "sharp", midi, isSemitone: true });
    }
  }
  list.sort((a, b) => a.midi - b.midi);
  return list;
})();

export function positionIndexOfMidi(midi: number): number {
  return ALL_POSITIONS.findIndex((p) => p.midi === midi);
}

/* ---------- 역검색 (탐구 모드) ---------- */

export interface ReverseResult {
  midi: number;
  resolved: ResolvedNote;
  /** 어떤 방식으로 일치했나 */
  matchKind: "natural" | "cross";
  /** 교차운지로 일치한 반음 (matchKind === "cross") */
  crossSemitone: Semitone | null;
  layer: LayerNum;
  accidental: Accidental;
  flags: {
    multipleOctaveKeys: boolean; // 옥타브 키가 여러 개 눌림
    sharpFlatCancel: boolean;    // ♯+♭ 동시 → 상쇄
  };
}

const NOTE_KEYS: KeyId[] = ["K1", "K2", "K3", "K4", "K5", "K6", "K7"];

function sameKeySet(a: KeyId[], b: KeyId[]): boolean {
  if (a.length !== b.length) return false;
  const sb = new Set(b);
  return a.every((k) => sb.has(k));
}

/**
 * 눌린 키 집합 → 음 역검색.
 * ① 옥타브 키: OCT_UP2 > OCT_UP > OCT_DOWN 우선, 여러 개면 가장 높은 것 + 플래그
 * ② ♯·♭ 동시면 상쇄(±0) + 플래그
 * ③ K1~K7 부분집합을 naturals와 정확 일치 → 없으면 semitones.cross와 비교
 * ④ 일치 없으면 null
 */
export function resolveFromKeys(pressed: Set<KeyId>): ReverseResult | null {
  const octPressed = (["OCT_UP2", "OCT_UP", "OCT_DOWN"] as KeyId[]).filter((k) =>
    pressed.has(k),
  );
  const layer: LayerNum = pressed.has("OCT_UP2")
    ? 2
    : pressed.has("OCT_UP")
      ? 1
      : pressed.has("OCT_DOWN")
        ? -1
        : 0;
  const multipleOctaveKeys = octPressed.length > 1;

  const hasSharp = pressed.has("SHARP");
  const hasFlat = pressed.has("FLAT");
  const sharpFlatCancel = hasSharp && hasFlat;
  const accidental: Accidental =
    sharpFlatCancel ? null : hasSharp ? "sharp" : hasFlat ? "flat" : null;

  const noteKeys = NOTE_KEYS.filter((k) => pressed.has(k));
  const flags = { multipleOctaveKeys, sharpFlatCancel };

  // ③-1 온음 정확 일치
  for (const n of FINGERINGS.naturals) {
    if (sameKeySet(noteKeys, n.keys)) {
      const resolved = resolveNote(n.id, layer, accidental);
      if (resolved.midi < MIDI_MIN - 1 || resolved.midi > MIDI_MAX + 1) {
        // 범위를 살짝 벗어나도 재생은 가능하니 결과는 반환 (클램프는 호출부 판단)
      }
      return {
        midi: resolved.midi,
        resolved,
        matchKind: "natural",
        crossSemitone: null,
        layer,
        accidental,
        flags,
      };
    }
  }

  // ③-2 교차운지 일치 (이때도 ①②의 보정을 함께 적용)
  for (const s of FINGERINGS.semitones) {
    for (const cross of s.cross) {
      if (sameKeySet(noteKeys, cross)) {
        const accShift = accidental === "sharp" ? 1 : accidental === "flat" ? -1 : 0;
        const midi = FINGERINGS.baseMidi + 12 * layer + s.pc + accShift;
        // 표시는 교차운지의 반음 기준 — viaSharp 온음 + sharp 로 표현
        const resolved = resolveNote(s.viaSharp, layer, "sharp");
        return {
          midi,
          resolved: { ...resolved, midi, pc: s.pc + accShift },
          matchKind: "cross",
          crossSemitone: s,
          layer,
          accidental,
          flags,
        };
      }
    }
  }

  return null;
}

/* ---------- 가장 가까운 음 제안 ---------- */

export interface NearestResult {
  natural: Natural;
  /** 현재 조합과 그 음 운지의 차이 키 목록 (대칭차집합) */
  diffKeys: KeyId[];
}

export function nearestNote(pressedNoteKeys: KeyId[]): NearestResult {
  let best: NearestResult | null = null;
  for (const n of FINGERINGS.naturals) {
    const sa = new Set(pressedNoteKeys);
    const sb = new Set(n.keys);
    const diff: KeyId[] = [];
    for (const k of NOTE_KEYS) {
      if (sa.has(k) !== sb.has(k)) diff.push(k);
    }
    if (!best || diff.length < best.diffKeys.length) {
      best = { natural: n, diffKeys: diff };
    }
  }
  return best!;
}

/* ---------- 운지 → 눌린 키 집합 합성 ---------- */

export type FingeringMethod = "accidental" | "cross";

export interface NoteSelection {
  noteId: string;
  layer: LayerNum;
  accidental: Accidental;
  /** 반음 표시 방식 (cross가 존재할 때만 의미) */
  method?: FingeringMethod;
  crossIndex?: number;
}

/** MIDI 번호(48~96) → 음 선택. 운지 표시·실기 판정 화면용 */
export function selectionFromMidi(midi: number): NoteSelection | null {
  if (midi < MIDI_MIN || midi > MIDI_MAX) return null;
  let layer = Math.floor((midi - FINGERINGS.baseMidi) / 12);
  if (layer > 2) layer = 2; // midi 96 → +2층 높은 도
  if (layer < -1) layer = -1;
  const pc = midi - FINGERINGS.baseMidi - 12 * layer;
  const natural = FINGERINGS.naturals.find((n) => n.pc === pc);
  if (natural) {
    return { noteId: natural.id, layer: layer as LayerNum, accidental: null };
  }
  const semi = SEMITONE_BY_PC[pc];
  if (semi) {
    return { noteId: semi.viaSharp, layer: layer as LayerNum, accidental: "sharp" };
  }
  return null;
}

/** 선택된 음의 눌림 키 집합 = 운지 keys ∪ 층 thumb ∪ (♯/♭) */
export function pressedKeysFor(sel: NoteSelection): Set<KeyId> {
  const out = new Set<KeyId>();
  const layerDef = LAYER_BY_NUM[sel.layer];
  for (const t of layerDef.thumb) out.add(t);

  if (sel.accidental && sel.method === "cross") {
    const pc = NATURAL_BY_ID[sel.noteId].pc + (sel.accidental === "sharp" ? 1 : -1);
    const semi = SEMITONE_BY_PC[pc];
    const cross = semi?.cross?.[sel.crossIndex ?? 0];
    if (cross) {
      for (const k of cross) out.add(k);
      return out;
    }
  }

  const natural = NATURAL_BY_ID[sel.noteId];
  for (const k of natural.keys) out.add(k);
  if (sel.accidental === "sharp") out.add("SHARP");
  if (sel.accidental === "flat") out.add("FLAT");
  return out;
}
