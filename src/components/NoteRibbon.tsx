import { useEffect, useRef } from "react";
import {
  FINGERINGS,
  NATURAL_BY_ID,
  resolveNote,
  type Accidental,
  type LayerNum,
} from "../data/notes";
import type { Notation } from "../store/useAppStore";

export interface RibbonSelection {
  noteId: string;
  accidental: Accidental;
}

interface RibbonItem {
  noteId: string;
  accidental: Accidental;
  isSemitone: boolean;
  kor: string;
  device: string;
}

function buildItems(layer: LayerNum, showSemitones: boolean): RibbonItem[] {
  const items: RibbonItem[] = [];
  for (const n of FINGERINGS.naturals) {
    items.push({
      noteId: n.id,
      accidental: null,
      isSemitone: false,
      kor: n.kor,
      device: resolveNote(n.id, layer).robkooName,
    });
    if (!showSemitones) continue;
    const semi = FINGERINGS.semitones.find((s) => s.viaSharp === n.id);
    if (!semi) continue;
    const midi = FINGERINGS.baseMidi + 12 * layer + semi.pc;
    if (midi > 96) continue;
    items.push({
      noteId: semi.viaSharp,
      accidental: "sharp",
      isSemitone: true,
      kor: semi.kor.split("·")[0],
      device: resolveNote(semi.viaSharp, layer, "sharp").robkooName.split("/")[0],
    });
  }
  return items;
}

/**
 * 하단 가로 스크롤 음 선택 리본.
 * 온음 8개 = 흰건반 느낌 큰 버튼, 반음 = 사이 위쪽 검은건반 느낌 작은 버튼.
 */
export function NoteRibbon({
  layer,
  selection,
  showSemitones,
  notation,
  canGoUp,
  canGoDown,
  onSelect,
  onLayerShift,
  onPrev,
  onNext,
}: {
  layer: LayerNum;
  selection: RibbonSelection;
  showSemitones: boolean;
  notation: Notation;
  canGoUp: boolean;
  canGoDown: boolean;
  onSelect: (sel: RibbonSelection) => void;
  onLayerShift: (dir: 1 | -1) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const items = buildItems(layer, showSemitones);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selKey = `${selection.noteId}:${selection.accidental ?? ""}`;

  useEffect(() => {
    // 선택 직후 레이아웃 변동 대비 — rAF 뒤로 미뤄 가운데 스냅
    const raf = requestAnimationFrame(() => {
      const el = scrollRef.current?.querySelector<HTMLElement>(`[data-key="${selKey}"]`);
      el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(raf);
  }, [selKey, layer, showSemitones]);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="이전 음"
        onClick={onPrev}
        className="flex h-12 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-bold text-sub shadow-sm active:bg-stage"
      >
        ‹
      </button>
      <div ref={scrollRef} className="ribbon-scroll flex flex-1 items-end gap-1.5 overflow-x-auto px-2 py-1.5">
        {canGoDown && (
          <button
            type="button"
            onClick={() => onLayerShift(-1)}
            aria-label="한 층 아래로"
            className="ribbon-item flex h-12 shrink-0 flex-col items-center justify-center rounded-xl border border-octave/40 bg-octave/10 px-2 text-[10px] font-bold text-octave"
          >
            🛗<span>−1층</span>
          </button>
        )}
        {items.map((it) => {
          const key = `${it.noteId}:${it.accidental ?? ""}`;
          const active = key === selKey;
          return it.isSemitone ? (
            <button
              key={key}
              data-key={key}
              type="button"
              aria-label={`${it.kor} 선택`}
              aria-pressed={active}
              onClick={() => onSelect({ noteId: it.noteId, accidental: it.accidental })}
              className={`ribbon-item -mx-3.5 z-10 flex h-11 w-11 shrink-0 -translate-y-5 flex-col items-center justify-center rounded-lg text-[11px] font-bold shadow ${
                active
                  ? "bg-brand text-white ring-2 ring-brand"
                  : "bg-ink text-white"
              }`}
            >
              {it.kor}
              <span className="num text-[9px] opacity-80">{notation === "intl" ? "" : it.device}</span>
            </button>
          ) : (
            <button
              key={key}
              data-key={key}
              type="button"
              aria-label={`${it.kor} 선택`}
              aria-pressed={active}
              onClick={() => onSelect({ noteId: it.noteId, accidental: it.accidental })}
              className={`ribbon-item flex h-14 w-[52px] shrink-0 flex-col items-center justify-center rounded-xl border-2 text-sm font-extrabold transition-colors ${
                active
                  ? "border-brand bg-brand text-white shadow"
                  : "border-bodyline/60 bg-white text-ink shadow-sm"
              }`}
            >
              {it.kor}
              {notation !== "solfege" && (
                <span className={`num text-[10px] font-bold ${active ? "text-white/85" : "text-sub"}`}>
                  {notation === "intl" ? resolveNote(NATURAL_BY_ID[it.noteId].id, layer).sciName : it.device}
                </span>
              )}
            </button>
          );
        })}
        {canGoUp && (
          <button
            type="button"
            onClick={() => onLayerShift(1)}
            aria-label="한 층 위로"
            className="ribbon-item flex h-12 shrink-0 flex-col items-center justify-center rounded-xl border border-octave/40 bg-octave/10 px-2 text-[10px] font-bold text-octave"
          >
            🛗<span>+1층</span>
          </button>
        )}
      </div>
      <button
        type="button"
        aria-label="다음 음"
        onClick={onNext}
        className="flex h-12 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-bold text-sub shadow-sm active:bg-stage"
      >
        ›
      </button>
    </div>
  );
}
