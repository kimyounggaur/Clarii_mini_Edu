import { useMemo, useRef } from "react";
import type { KeyId } from "../../data/keys";
import {
  pressedKeysFor,
  resolveNote,
  type NoteSelection,
} from "../../data/notes";
import { ClariiSvg } from "./ClariiSvg";

export interface FingeringViewProps {
  /** 현재 음 (탐구·게임에서는 pressedOverride 사용) */
  note?: NoteSelection;
  /** 직접 키 집합 제어 (탐구 모드·게임) — note보다 우선 */
  pressedOverride?: Set<KeyId>;
  interactive?: boolean;
  onToggleKey?: (id: KeyId) => void;
  /** 뒷면 디스플레이 텍스트 덮어쓰기 (게임 출제 시 "?") */
  displayTextOverride?: string;
  ringGlow?: boolean;
  showHands?: boolean;
  showFingerLabels?: boolean;
  /** 미니 카드용 (라벨·안내문 숨김, 한 면만 크게) */
  compact?: boolean;
  /** 펄스 비활성화 (출제 화면 등) */
  noPulse?: boolean;
  className?: string;
}

function setKey(s: Set<KeyId>): string {
  return [...s].sort().join(",");
}

/**
 * 앞면(크게) + 뒷면(작게)을 항상 한 쌍으로 보여주는 조합 컴포넌트.
 * pressed = 운지 keys ∪ 층 thumb ∪ (♯/♭), changed = 직전 상태와의 대칭차집합.
 */
export function FingeringView({
  note,
  pressedOverride,
  interactive = false,
  onToggleKey,
  displayTextOverride,
  ringGlow = false,
  showHands = false,
  showFingerLabels = false,
  compact = false,
  noPulse = false,
  className,
}: FingeringViewProps) {
  const pressed = useMemo(
    () => pressedOverride ?? (note ? pressedKeysFor(note) : new Set<KeyId>()),
    [pressedOverride, note],
  );

  // 직전 pressed와의 대칭차집합 → 상태가 변한 키만 펄스
  const prevRef = useRef<Set<KeyId> | null>(null);
  const stampRef = useRef(0);
  const changedRef = useRef<KeyId[]>([]);
  const currentKey = setKey(pressed);
  const prevKey = prevRef.current ? setKey(prevRef.current) : null;
  if (prevKey !== null && prevKey !== currentKey) {
    const prev = prevRef.current!;
    const diff: KeyId[] = [];
    for (const k of pressed) if (!prev.has(k)) diff.push(k);
    for (const k of prev) if (!pressed.has(k)) diff.push(k);
    changedRef.current = diff;
    stampRef.current += 1;
  }
  prevRef.current = pressed;
  const changed = noPulse ? [] : changedRef.current;

  const resolved = note ? resolveNote(note.noteId, note.layer, note.accidental) : null;
  const displayText =
    displayTextOverride ??
    (resolved ? resolved.robkooName.split("/")[0] : "");

  const octaveActive =
    pressed.has("OCT_UP2") || pressed.has("OCT_UP") || pressed.has("OCT_DOWN");

  const pressedArr = [...pressed];

  if (compact) {
    return (
      <div className={`flex items-stretch gap-1 ${className ?? ""}`}>
        <ClariiSvg
          face="front"
          pressed={pressedArr}
          changed={changed}
          changeStamp={stampRef.current}
          showGuideLabels={false}
          className="h-full w-auto flex-[1.5]"
        />
        <ClariiSvg
          face="back"
          pressed={pressedArr}
          displayText={displayText}
          showGuideLabels={false}
          className="h-full w-auto flex-1 opacity-95"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-stretch justify-center gap-2 ${className ?? ""}`}>
      <figure className="flex min-w-0 flex-[1.45] flex-col items-center">
        <ClariiSvg
          face="front"
          pressed={pressedArr}
          changed={changed}
          changeStamp={stampRef.current}
          interactive={interactive}
          onToggleKey={onToggleKey}
          showFingerLabels={showFingerLabels}
          ringGlow={ringGlow}
          showHands={showHands}
          className="h-full max-h-full w-auto"
        />
        <figcaption className="mt-1 text-[11px] font-semibold text-sub">
          앞면 · 손가락
        </figcaption>
      </figure>
      <figure
        className={`flex min-w-0 flex-1 flex-col items-center rounded-card border-2 transition-colors ${
          octaveActive ? "border-octave/50 bg-octave/5" : "border-transparent"
        }`}
      >
        <ClariiSvg
          face="back"
          pressed={pressedArr}
          changed={changed}
          changeStamp={stampRef.current}
          interactive={interactive}
          onToggleKey={onToggleKey}
          showFingerLabels={showFingerLabels}
          displayText={displayText}
          showHands={showHands}
          className="h-full max-h-full w-auto"
        />
        <figcaption className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-sub">
          뒷면 · 왼손 엄지
          {octaveActive && (
            <span className="font-bold text-octave">· 엄지가 일하는 중</span>
          )}
        </figcaption>
      </figure>
    </div>
  );
}
