import { useCallback, useRef, useState } from "react";
import { FINGERINGS, resolveNote, type LayerNum } from "../../data/notes";
import type { GradeTarget } from "../../utils/grading";

export type Scope = "learned" | "base" | "allLayers" | "withSemitones";

export const SCOPE_LABEL: Record<Scope, string> = {
  learned: "① 배운 데까지",
  base: "② 기준층 온음만",
  allLayers: "③ 모든 층 온음",
  withSemitones: "④ 반음 포함",
};

const ALL_LAYERS: LayerNum[] = [-1, 0, 1, 2];

function naturalsPool(noteIds: string[], layers: LayerNum[]): GradeTarget[] {
  const out: GradeTarget[] = [];
  for (const layer of layers) {
    for (const id of noteIds) {
      const midi = resolveNote(id, layer).midi;
      if (midi >= 48 && midi <= 96) out.push({ noteId: id, layer });
    }
  }
  return out;
}

function semitonesPool(layers: LayerNum[]): GradeTarget[] {
  const out: GradeTarget[] = [];
  for (const layer of layers) {
    for (const s of FINGERINGS.semitones) {
      const midi = FINGERINGS.baseMidi + 12 * layer + s.pc;
      if (midi >= 48 && midi <= 96) {
        out.push({ noteId: s.viaSharp, layer, accidental: "sharp" });
      }
    }
  }
  return out;
}

const ALL_NATURAL_IDS = FINGERINGS.naturals.map((n) => n.id);

/** 출제 범위 → 후보 풀. learned는 배우기 탭 진행도와 연동 */
export function buildPool(scope: Scope, completedLessons: string[]): GradeTarget[] {
  if (scope === "base") return naturalsPool(ALL_NATURAL_IDS, [0]);
  if (scope === "allLayers") return naturalsPool(ALL_NATURAL_IDS, ALL_LAYERS);
  if (scope === "withSemitones") {
    return [...naturalsPool(ALL_NATURAL_IDS, ALL_LAYERS), ...semitonesPool(ALL_LAYERS)];
  }
  // learned
  const done = (id: string) => completedLessons.includes(id);
  const notes: string[] = [];
  if (done("L3")) notes.push("si");
  if (done("L4")) notes.push("la", "sol");
  if (done("L5")) notes.push("fa", "mi", "re", "do");
  if (done("L6")) notes.push("hido");
  const layers: LayerNum[] = [0];
  if (done("L7")) layers.push(1, 2);
  if (done("L8")) layers.push(-1);
  let pool = naturalsPool(notes, layers);
  if (done("L9")) pool = [...pool, ...semitonesPool(layers)];
  if (pool.length < 3) pool = naturalsPool(["si", "la", "sol"], [0]);
  return pool;
}

export function targetMidi(t: GradeTarget): number {
  return resolveNote(t.noteId, t.layer, t.accidental ?? null).midi;
}

export function targetKey(t: GradeTarget): string {
  return `${t.noteId}:${t.layer}:${t.accidental ?? ""}`;
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** n문제 세트 생성 — 풀에서 고르되 연속 중복 방지 */
export function makeQuestionSet(pool: GradeTarget[], n = 10): GradeTarget[] {
  const out: GradeTarget[] = [];
  let bag: GradeTarget[] = [];
  while (out.length < n) {
    if (bag.length === 0) bag = shuffled(pool);
    const next = bag.pop()!;
    if (out.length > 0 && targetKey(out[out.length - 1]) === targetKey(next) && pool.length > 1) {
      bag.unshift(next);
      continue;
    }
    out.push(next);
  }
  return out;
}

/** 정답의 ±1~2 이웃 음 위주 4지선다 보기 생성 */
export function makeChoices(target: GradeTarget, pool: GradeTarget[]): GradeTarget[] {
  const tm = targetMidi(target);
  const tKey = targetKey(target);
  const others = pool.filter((p) => targetKey(p) !== tKey && targetMidi(p) !== tm);
  const sorted = [...others].sort(
    (a, b) => Math.abs(targetMidi(a) - tm) - Math.abs(targetMidi(b) - tm),
  );
  // 가까운 이웃 6개 중 3개 무작위 (이웃끼리 비교하며 학습)
  const near = sorted.slice(0, 6);
  const picked: GradeTarget[] = [];
  const seen = new Set<number>([tm]);
  for (const c of shuffled(near)) {
    const m = targetMidi(c);
    if (seen.has(m)) continue;
    seen.add(m);
    picked.push(c);
    if (picked.length === 3) break;
  }
  let i = 0;
  while (picked.length < 3 && i < sorted.length) {
    const c = sorted[i++];
    const m = targetMidi(c);
    if (!seen.has(m)) {
      seen.add(m);
      picked.push(c);
    }
  }
  return shuffled([target, ...picked]);
}

/* ---------- 세트 진행 훅 ---------- */

export interface SetState {
  questions: GradeTarget[];
  qIndex: number;
  score: number;
  combo: number;
  maxCombo: number;
  correctCount: number;
  wrongs: GradeTarget[];
  finished: boolean;
}

export function useGameSet(pool: GradeTarget[], size = 10) {
  const [state, setState] = useState<SetState>(() => ({
    questions: makeQuestionSet(pool, size),
    qIndex: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    correctCount: 0,
    wrongs: [],
    finished: false,
  }));
  const requeuedRef = useRef<Set<string>>(new Set());

  const current = state.finished ? null : state.questions[state.qIndex];

  /** 채점 반영. 오답은 같은 세트 후반에 1회 재출제(간격 반복) */
  const answer = useCallback((correct: boolean, points: number) => {
    setState((s) => {
      const q = s.questions[s.qIndex];
      if (correct) {
        const combo = s.combo + 1;
        return {
          ...s,
          score: s.score + points,
          combo,
          maxCombo: Math.max(s.maxCombo, combo),
          correctCount: s.correctCount + 1,
        };
      }
      const key = targetKey(q);
      let questions = s.questions;
      if (!requeuedRef.current.has(key)) {
        requeuedRef.current.add(key);
        const insertAt =
          Math.min(s.questions.length, Math.max(s.qIndex + 2, s.questions.length - 2)) +
          Math.floor(Math.random() * 2);
        questions = [...s.questions];
        questions.splice(Math.min(insertAt, questions.length), 0, { ...q });
      }
      return { ...s, questions, combo: 0, wrongs: [...s.wrongs, q] };
    });
  }, []);

  const advance = useCallback(() => {
    setState((s) =>
      s.qIndex + 1 >= s.questions.length
        ? { ...s, finished: true }
        : { ...s, qIndex: s.qIndex + 1 },
    );
  }, []);

  const restart = useCallback(() => {
    requeuedRef.current = new Set();
    setState({
      questions: makeQuestionSet(pool, size),
      qIndex: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      correctCount: 0,
      wrongs: [],
      finished: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, size]);

  return { ...state, current, answer, advance, restart };
}
