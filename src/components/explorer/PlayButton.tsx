import { useRef, useState } from "react";

/**
 * 큰 원형 재생 버튼 — 탭: 1회 재생, 길게 누름: 누르는 동안 지속음.
 */
export function PlayButton({
  onPlay,
  onHoldStart,
}: {
  onPlay: () => void;
  /** 지속음 시작 — 반환된 함수로 정지 */
  onHoldStart: () => { stop: () => void };
}) {
  const [popStamp, setPopStamp] = useState(0);
  const holdRef = useRef<{ stop: () => void } | null>(null);
  const timerRef = useRef(0);
  const heldRef = useRef(false);

  const begin = () => {
    heldRef.current = false;
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      heldRef.current = true;
      holdRef.current = onHoldStart();
    }, 350);
  };

  const end = () => {
    window.clearTimeout(timerRef.current);
    if (heldRef.current) {
      holdRef.current?.stop();
      holdRef.current = null;
    } else {
      setPopStamp(Date.now());
      onPlay();
    }
  };

  const cancel = () => {
    window.clearTimeout(timerRef.current);
    holdRef.current?.stop();
    holdRef.current = null;
  };

  return (
    <button
      key={popStamp || undefined}
      type="button"
      aria-label="현재 음 재생 (길게 누르면 지속음)"
      onPointerDown={begin}
      onPointerUp={end}
      onPointerLeave={cancel}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setPopStamp(Date.now());
          onPlay();
        }
      }}
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-2xl text-white shadow-md transition-transform active:scale-95 ${
        popStamp ? "pop" : ""
      }`}
    >
      <span aria-hidden className="translate-x-0.5">▶</span>
    </button>
  );
}
