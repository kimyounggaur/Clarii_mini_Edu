import { useEffect, useState } from "react";
import { useToastStore } from "../store/useToastStore";

/** 하단 탭 위에 잠깐 떠오르는 안내 토스트 */
export function Toast() {
  const { message, stamp } = useToastStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(t);
  }, [message, stamp]);

  if (!message || !visible) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fade-up pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-6"
    >
      <div className="max-w-[340px] rounded-full bg-ink/90 px-5 py-2.5 text-sm font-semibold text-white shadow-lg">
        {message}
      </div>
    </div>
  );
}
