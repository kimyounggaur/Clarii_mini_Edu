import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { ClariiSvg } from "../clarii/ClariiSvg";

const SLIDES: { title: string; body: string; visual: JSX.Element }[] = [
  {
    title: "운지표 보는 법",
    body: "● 누르기 / ○ 떼기. 왼손은 오렌지, 오른손은 블루예요.",
    visual: (
      <ClariiSvg face="front" pressed={["K1", "K2", "K3", "K4"]} showGuideLabels={false} className="h-44" />
    ),
  },
  {
    title: "뒷면 초록 키 = 옥타브 엘리베이터 🛗",
    body: "같은 운지 그대로, 엄지로 층만 바꾸면 음이 위아래로!",
    visual: (
      <ClariiSvg face="back" pressed={["OCT_UP"]} displayText="C4" showGuideLabels={false} className="h-44" />
    ),
  },
  {
    title: "♯/♭ 키는 마법 키",
    body: "어떤 운지든 함께 누르면 반음을 올리고 내려요.",
    visual: (
      <ClariiSvg face="front" pressed={["K1", "SHARP"]} showGuideLabels={false} className="h-44" />
    ),
  },
  {
    title: "탐구 모드 🔍",
    body: "키를 직접 눌러 보며 \"이 조합은 무슨 음?\"을 실험해 보세요!",
    visual: (
      <ClariiSvg face="front" pressed={["K2"]} showGuideLabels={false} className="h-44" />
    ),
  },
];

/** 첫 방문 시 1회 보이는 4장짜리 온보딩 오버레이 */
export function Onboarding() {
  const seen = useAppStore((s) => s.onboardingSeen);
  const set = useAppStore((s) => s.set);
  const [idx, setIdx] = useState(0);
  if (seen) return null;

  const close = () => set("onboardingSeen", true);
  const last = idx === SLIDES.length - 1;
  const slide = SLIDES[idx];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="처음 오신 분을 위한 안내"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-6"
    >
      <div className="fade-up w-full max-w-[340px] rounded-card bg-white p-6 text-center shadow-xl">
        <div className="flex justify-center">{slide.visual}</div>
        <h2 className="mt-3 text-lg font-extrabold">{slide.title}</h2>
        <p className="mt-1.5 text-sm text-sub">{slide.body}</p>
        <div className="mt-4 flex justify-center gap-1.5" aria-hidden>
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-brand" : "w-1.5 bg-bodyline"}`}
            />
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={close}
            className="flex-1 rounded-full px-4 py-2.5 text-sm font-bold text-sub"
          >
            건너뛰기
          </button>
          <button
            type="button"
            onClick={() => (last ? close() : setIdx(idx + 1))}
            className="flex-[2] rounded-full bg-brand px-4 py-2.5 text-sm font-extrabold text-white shadow"
          >
            {last ? "시작하기!" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}
