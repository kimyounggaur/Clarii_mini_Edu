import type { KeyId } from "../data/keys";
import {
  LAYER_BY_NUM,
  NATURAL_BY_ID,
  SEMITONE_BY_PC,
  type Accidental,
  type LayerNum,
} from "../data/notes";

export interface GradeTarget {
  noteId: string;
  layer: LayerNum;
  accidental?: Accidental;
  /** 교차운지로만 통과 (레슨 L10) */
  useCross?: boolean;
}

const FRONT: KeyId[] = ["K1", "K2", "K3", "K4", "K5", "K6", "K7"];
const SIDE: KeyId[] = ["SHARP", "FLAT"];
const BACK: KeyId[] = ["OCT_UP2", "OCT_UP", "OCT_DOWN"];

function eq(a: Set<KeyId>, b: Set<KeyId>): boolean {
  if (a.size !== b.size) return false;
  for (const k of a) if (!b.has(k)) return false;
  return true;
}

/**
 * 목표 음의 정답 키 집합들.
 * 반음은 ♯ 방식·♭ 방식(이명동음) 모두, allowCross면 교차운지도 정답 인정.
 */
export function acceptableSetsFor(
  target: GradeTarget,
  opts?: { allowCross?: boolean },
): Set<KeyId>[] {
  const thumb = LAYER_BY_NUM[target.layer].thumb;
  const acc = target.accidental ?? null;

  if (!acc) {
    return [new Set<KeyId>([...NATURAL_BY_ID[target.noteId].keys, ...thumb])];
  }

  const pc = NATURAL_BY_ID[target.noteId].pc + (acc === "sharp" ? 1 : -1);
  const semi = SEMITONE_BY_PC[pc];
  const sets: Set<KeyId>[] = [];
  if (!semi) return sets;

  const crossSets = semi.cross.map((c) => new Set<KeyId>([...c, ...thumb]));
  if (target.useCross) return crossSets;

  sets.push(new Set<KeyId>([...NATURAL_BY_ID[semi.viaSharp].keys, "SHARP", ...thumb]));
  if (semi.viaFlat) {
    sets.push(new Set<KeyId>([...NATURAL_BY_ID[semi.viaFlat].keys, "FLAT", ...thumb]));
  }
  if (opts?.allowCross) sets.push(...crossSets);
  return sets;
}

export interface GradeResult {
  correct: boolean;
  /** 영역별 일치 여부 (가장 가까운 정답 기준) — 오답 힌트용 */
  regions: { front: boolean; side: boolean; back: boolean };
  /** 비교에 사용된 가장 가까운 정답 집합 */
  closest: Set<KeyId>;
}

/** 만든 운지를 채점한다 — 앞면 + 옥타브 + ♯/♭ 키가 모두 일치해야 정답 */
export function gradeAttempt(
  pressed: Set<KeyId>,
  target: GradeTarget,
  opts?: { allowCross?: boolean },
): GradeResult {
  const sets = acceptableSetsFor(target, opts);
  let best: { set: Set<KeyId>; diff: number } | null = null;
  for (const s of sets) {
    if (eq(pressed, s)) {
      return { correct: true, regions: { front: true, side: true, back: true }, closest: s };
    }
    let diff = 0;
    for (const k of [...FRONT, ...SIDE, ...BACK]) {
      if (pressed.has(k) !== s.has(k)) diff++;
    }
    if (!best || diff < best.diff) best = { set: s, diff };
  }
  const closest = best?.set ?? new Set<KeyId>();
  const regionOk = (keys: KeyId[]) => keys.every((k) => pressed.has(k) === closest.has(k));
  return {
    correct: false,
    regions: { front: regionOk(FRONT), side: regionOk(SIDE), back: regionOk(BACK) },
    closest,
  };
}

/** 오답 영역 힌트 문구 — "맞은 곳은 칭찬, 틀린 곳은 안내" */
export function regionHintText(r: GradeResult["regions"]): string {
  const wrong: string[] = [];
  if (!r.front) wrong.push("앞면 손가락");
  if (!r.back) wrong.push("뒷면 옥타브 키");
  if (!r.side) wrong.push("측면 ♯/♭ 키");
  const right: string[] = [];
  if (r.front) right.push("앞면 손가락");
  if (r.back && !r.front) right.push("뒷면");
  if (wrong.length === 0) return "아주 가까워요!";
  const praise = r.front ? "앞면 손가락은 맞았어요! " : r.back ? "뒷면은 맞았어요! " : "";
  return `${praise}${wrong.join("과 ")}을 확인하세요`;
}
