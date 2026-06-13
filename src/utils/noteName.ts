import type { ResolvedNote } from "../data/notes";
import type { Notation } from "../store/useAppStore";

/** 층 짧은 표기: -1층 / 기준층 / +1층 / +2층 */
export function layerShort(layer: number): string {
  if (layer === 0) return "기준층";
  return layer > 0 ? `+${layer}층` : `${layer}층`;
}

/** 계이름 + (기준층이 아니면) 층 표기 — 예: "레 (+1층)" */
export function korWithLayer(r: ResolvedNote): string {
  return r.layer === 0 ? r.korName : `${r.korName} (${layerShort(r.layer)})`;
}

/** 표기 방식에 따른 보조 표기 — 예: "C3 · 기준층" */
export function subName(r: ResolvedNote, notation: Notation): string {
  const layerKor = r.layerDef.kor;
  if (notation === "device") return `${r.robkooName} · ${layerKor}`;
  if (notation === "intl") return `${r.sciName} · ${layerKor}`;
  return layerKor;
}

/** 선택지 등 한 줄 표기 — 계이름(+층) + 표기 방식 병기 */
export function fullName(r: ResolvedNote, notation: Notation): string {
  const base = korWithLayer(r);
  if (notation === "device") return `${base} · ${r.robkooName}`;
  if (notation === "intl") return `${base} · ${r.sciName}`;
  return base;
}
