import {
  PRO_C20_LEFT_SIDE_KEYS,
  PRO_C20_MAIN_KEYS,
  PRO_C20_OCTAVE_RANGE_KEYS,
  PRO_C20_RIGHT_SIDE_KEYS,
} from "../data/proC20/keys";
import { PRO_C20_ENTRY_BY_ID } from "../data/proC20/fingeringCharts";
import type { ProC20FingeringEntry, ProC20KeyId, ProC20TryTarget } from "../data/proC20/types";

const PERFORMANCE_KEYS: ProC20KeyId[] = [
  "ASTERISK_1",
  "ASTERISK_2",
  "PORTAMENTO_PLATE",
  "PITCH_BEND_UP",
  "PITCH_BEND_DOWN",
  "FN",
];

function eq(a: Set<ProC20KeyId>, b: Set<ProC20KeyId>): boolean {
  if (a.size !== b.size) return false;
  for (const key of a) if (!b.has(key)) return false;
  return true;
}

function diffCount(a: Set<ProC20KeyId>, b: Set<ProC20KeyId>): number {
  const all = new Set<ProC20KeyId>([...a, ...b]);
  let count = 0;
  for (const key of all) if (a.has(key) !== b.has(key)) count += 1;
  return count;
}

function withOctaveRequirement(keys: ProC20KeyId[], entry: ProC20FingeringEntry, requireOctaveRange?: boolean): ProC20KeyId[] {
  if (!requireOctaveRange || !entry.octaveRange) return keys;
  return [...keys, `OCT_RANGE_${entry.octaveRange}` as ProC20KeyId];
}

export interface ProC20AcceptableSet {
  id: string;
  keys: Set<ProC20KeyId>;
}

export function acceptableProC20SetsFor(target: ProC20TryTarget): ProC20AcceptableSet[] {
  const entry = PRO_C20_ENTRY_BY_ID[target.entryId];
  if (!entry) return [];
  const sets: ProC20AcceptableSet[] = [
    {
      id: entry.id,
      keys: new Set(withOctaveRequirement(entry.pressed, entry, target.requireOctaveRange)),
    },
  ];
  for (const variant of entry.variants ?? []) {
    if (target.variantId && variant.id !== target.variantId) continue;
    sets.push({
      id: variant.id,
      keys: new Set(withOctaveRequirement(variant.pressed, entry, target.requireOctaveRange)),
    });
  }
  return sets;
}

export interface ProC20GradeResult {
  correct: boolean;
  entry: ProC20FingeringEntry | null;
  closest: Set<ProC20KeyId>;
  regions: {
    mainKeys: boolean;
    leftSide: boolean;
    rightSide: boolean;
    octave: boolean;
    performance: boolean;
  };
}

function regionOk(keys: ProC20KeyId[], pressed: Set<ProC20KeyId>, closest: Set<ProC20KeyId>): boolean {
  return keys.every((key) => pressed.has(key) === closest.has(key));
}

export function gradeProC20Attempt(pressed: Set<ProC20KeyId>, target: ProC20TryTarget): ProC20GradeResult {
  const entry = PRO_C20_ENTRY_BY_ID[target.entryId] ?? null;
  const sets = acceptableProC20SetsFor(target);
  let best: ProC20AcceptableSet | null = null;
  let bestDiff = Number.POSITIVE_INFINITY;

  for (const candidate of sets) {
    if (eq(pressed, candidate.keys)) {
      return {
        correct: true,
        entry,
        closest: candidate.keys,
        regions: { mainKeys: true, leftSide: true, rightSide: true, octave: true, performance: true },
      };
    }
    const diff = diffCount(pressed, candidate.keys);
    if (diff < bestDiff) {
      best = candidate;
      bestDiff = diff;
    }
  }

  const closest = best?.keys ?? new Set<ProC20KeyId>();
  return {
    correct: false,
    entry,
    closest,
    regions: {
      mainKeys: regionOk(PRO_C20_MAIN_KEYS, pressed, closest),
      leftSide: regionOk(PRO_C20_LEFT_SIDE_KEYS, pressed, closest),
      rightSide: regionOk(PRO_C20_RIGHT_SIDE_KEYS, pressed, closest),
      octave: regionOk(PRO_C20_OCTAVE_RANGE_KEYS, pressed, closest),
      performance: regionOk(PERFORMANCE_KEYS, pressed, closest),
    },
  };
}

export function proC20RegionHintText(regions: ProC20GradeResult["regions"]): string {
  const wrong: string[] = [];
  if (!regions.mainKeys) wrong.push("메인 노트 키");
  if (!regions.leftSide) wrong.push("왼손 보조 키");
  if (!regions.rightSide) wrong.push("오른손 보조 키");
  if (!regions.octave) wrong.push("옥타브 롤러");
  if (!regions.performance) wrong.push("표현 컨트롤");
  if (wrong.length === 0) return "아주 가까워요. 한 번 더 확인해 볼까요?";
  return `${wrong.join(", ")} 영역을 확인하세요.`;
}
