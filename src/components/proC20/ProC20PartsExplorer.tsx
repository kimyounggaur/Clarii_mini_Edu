import { useState } from "react";
import { PRO_C20_PARTS } from "../../data/proC20/parts";
import { ProC20Svg } from "./ProC20Svg";

export function ProC20PartsExplorer({ onPass, passed, requiredCount = 5 }: { onPass: () => void; passed: boolean; requiredCount?: number }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [explored, setExplored] = useState<Set<string>>(new Set());
  const part = PRO_C20_PARTS.find((item) => item.id === selected);

  const tap = (id: string) => {
    setSelected(id);
    const next = new Set(explored);
    next.add(id);
    setExplored(next);
    if (!passed && next.size >= requiredCount) onPass();
  };

  return (
    <div className="fade-up flex flex-col items-center gap-2">
      <p className="text-xs font-semibold text-sub">
        부위 {requiredCount}곳 이상 탭하면 통과 ({Math.min(explored.size, requiredCount)}/{requiredCount})
      </p>
      <div className="flex w-full min-w-0 justify-center gap-2">
        <ProC20Svg face="front" pressed={[]} partsMode selectedPart={selected} onPartTap={tap} className="h-64 min-w-0 flex-1" />
        <ProC20Svg face="back" pressed={[]} partsMode selectedPart={selected} onPartTap={tap} className="h-64 min-w-0 flex-1" />
      </div>
      <div className={`min-h-[72px] w-full rounded-xl px-3 py-2 text-center text-sm ${part ? "bg-[#19E6FF]/10" : "bg-stage"}`}>
        {part ? (
          <>
            <b className="text-[#087D86]">{part.kor}</b>
            <p className="mt-1 text-xs leading-relaxed text-sub">{part.desc}</p>
          </>
        ) : (
          <span className="text-xs text-sub">PRO C20 그림에서 궁금한 부위를 눌러 보세요</span>
        )}
      </div>
    </div>
  );
}
