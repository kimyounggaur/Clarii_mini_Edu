import { FINGERINGS } from "../../data/notes";
import { ClariiSvg } from "../clarii/ClariiSvg";

/**
 * 🧠 패턴 보기 — 기준층 8음 미니 운지 그림 + "계단" 인포그래픽.
 * 멘탈 모델: 아래 키부터 하나씩 떼면 음이 올라간다.
 */
export function PatternStrip() {
  return (
    <div className="fade-up rounded-card bg-white p-3 shadow-sm">
      <div className="flex items-end gap-1 overflow-x-auto pb-1">
        {FINGERINGS.naturals.map((n, i) => (
          <div key={n.id} className="flex shrink-0 flex-col items-center">
            <ClariiSvg
              face="front"
              pressed={n.keys}
              showGuideLabels={false}
              className="h-24 w-auto"
            />
            <span className="mt-0.5 text-[11px] font-bold">{n.kor}</span>
            {i < FINGERINGS.naturals.length - 1 && <span className="sr-only">→</span>}
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-center text-xs font-semibold text-sub">
        아래 키부터 하나씩 떼면 음이 올라가요 (도→파) ➜ 그다음은 왼손 차례 (솔→시) ➜ 높은 도는{" "}
        <b className="text-brand">K2 하나!</b>
      </p>
    </div>
  );
}
