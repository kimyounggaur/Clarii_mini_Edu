import { useEffect, useState } from "react";
import { useMidiStore } from "../../midi/useMidi";
import { useProgressStore } from "../../store/useProgressStore";
import { ClariiSvg } from "../clarii/ClariiSvg";
import { playCorrect } from "../../audio/synth";

type Step = "blow" | "choice" | "done";

/**
 * 옥타브 보정 마법사 — 기기의 Transpose·옥타브 설정 차이를 offset으로 흡수한다.
 * 기준층 '도'를 불면: offset = 들어온 노트 − 60.
 */
export function CalibrationWizard({ onClose }: { onClose: () => void }) {
  const activeRaw = useMidiStore((s) => s.activeRaw);
  const setMidiOffset = useProgressStore((s) => s.setMidiOffset);
  const [step, setStep] = useState<Step>("blow");
  const [captured, setCaptured] = useState<number | null>(null);

  // 0.3초 이상 유지된 노트를 캡처 (raw)
  useEffect(() => {
    if (step !== "blow" || activeRaw === null) return;
    const t = window.setTimeout(() => {
      setCaptured(activeRaw);
      const diff = activeRaw - 60;
      if (diff % 12 === 0) {
        setMidiOffset(diff);
        playCorrect();
        setStep("done");
      } else {
        setStep("choice");
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [activeRaw, step, setMidiOffset]);

  const diff = captured === null ? 0 : captured - 60;

  return (
    <div role="dialog" aria-modal="true" aria-label="옥타브 보정 마법사" className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-5">
      <div className="fade-up w-full max-w-[360px] rounded-card bg-white p-5 text-center shadow-xl">
        <h3 className="text-lg font-extrabold">🧭 옥타브 보정 마법사</h3>

        {step === "blow" && (
          <>
            <ClariiSvg
              face="front"
              pressed={["K1", "K2", "K3", "K4", "K5", "K6", "K7"]}
              showGuideLabels={false}
              className="mx-auto mt-2 h-44"
            />
            <p className="mt-2 text-sm font-bold">
              기준층 <b className="text-brand">"도"</b>(K1~K7 전부)를 불어보세요
            </p>
            <p className="mt-1 text-xs text-sub">
              옥타브 키는 누르지 않은 상태로, 0.3초 이상 길게.
              {activeRaw !== null && <b className="num text-octave"> · 감지 중 (노트 {activeRaw})</b>}
            </p>
          </>
        )}

        {step === "choice" && (
          <>
            <p className="mt-3 text-sm font-bold">
              기기 Transpose가 C가 아닌 것 같아요
              <br />
              <span className="num text-danger">(현재 {diff > 0 ? "+" : ""}{diff} 반음)</span>
            </p>
            <p className="mt-1 text-xs text-sub">그대로 보정할까요, 기기에서 C로 바꾸시겠어요?</p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMidiOffset(diff);
                  playCorrect();
                  setStep("done");
                }}
                className="rounded-full bg-brand py-2.5 text-sm font-extrabold text-white"
              >
                그대로 보정하기 (앱이 {diff > 0 ? "+" : ""}{diff} 적용)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCaptured(null);
                  setStep("blow");
                }}
                className="rounded-full bg-stage py-2.5 text-sm font-bold text-sub"
              >
                기기에서 C로 바꾸고 다시 불기
              </button>
            </div>
          </>
        )}

        {step === "done" && (
          <>
            <div className="mt-3 text-5xl" aria-hidden>✅</div>
            <p className="mt-2 text-sm font-extrabold text-success">보정 완료!</p>
            <p className="num mt-1 text-xs text-sub">
              저장된 오프셋: {diff > 0 ? "+" : ""}{diff} (들어온 노트 {captured} → 도(60))
            </p>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-full bg-stage py-2.5 text-sm font-bold text-sub"
        >
          {step === "done" ? "닫기" : "나중에 하기"}
        </button>
      </div>
    </div>
  );
}
