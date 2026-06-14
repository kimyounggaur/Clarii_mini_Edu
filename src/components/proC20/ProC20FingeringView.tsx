import type { ProC20KeyId } from "../../data/proC20/types";
import { ProC20Svg } from "./ProC20Svg";

export function ProC20FingeringView({
  pressed,
  changed = [],
  interactive = false,
  onToggleKey,
  displayText,
  className,
}: {
  pressed: ProC20KeyId[];
  changed?: ProC20KeyId[];
  interactive?: boolean;
  onToggleKey?: (id: ProC20KeyId) => void;
  displayText?: string;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 items-stretch justify-center gap-2 ${className ?? ""}`}>
      <figure className="flex min-w-0 flex-1 flex-col items-center">
        <ProC20Svg face="front" pressed={pressed} changed={changed} interactive={interactive} onToggleKey={onToggleKey} className="h-full max-h-full w-auto" />
        <figcaption className="mt-1 text-[11px] font-semibold text-sub">앞면 · 노트/보조 키</figcaption>
      </figure>
      <figure className="flex min-w-0 flex-1 flex-col items-center">
        <ProC20Svg face="back" pressed={pressed} changed={changed} interactive={interactive} onToggleKey={onToggleKey} displayText={displayText} className="h-full max-h-full w-auto" />
        <figcaption className="mt-1 text-[11px] font-semibold text-sub">뒷면 · 롤러/컨트롤</figcaption>
      </figure>
    </div>
  );
}
