import { useState } from "react";
import { useAppStore, type Notation, type TonePreset, type OctaveRange } from "../store/useAppStore";
import { useProgressStore } from "../store/useProgressStore";
import { useToastStore } from "../store/useToastStore";
import { MidiCard } from "../components/midi/MidiCard";
import { DevDemoView } from "./DevDemoView";

const APP_VERSION = "v1.0.0";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm font-bold">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex h-7 w-12 items-center rounded-full p-0.5 transition-colors ${checked ? "bg-brand" : "bg-bodyline/70"}`}
    >
      <span className={`h-6 w-6 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { v: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex rounded-full bg-stage p-0.5 text-[11px] font-bold">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          aria-pressed={value === o.v}
          onClick={() => onChange(o.v)}
          className={`rounded-full px-2.5 py-1.5 transition-colors ${value === o.v ? "bg-white text-ink shadow-sm" : "text-sub"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SettingsView() {
  const s = useAppStore();
  const progress = useProgressStore();
  const toast = useToastStore((t) => t.show);
  const [resetStep, setResetStep] = useState(0);
  const [verTaps, setVerTaps] = useState(0);
  const [devOpen, setDevOpen] = useState(false);

  if (devOpen) return <DevDemoView onClose={() => setDevOpen(false)} />;

  const tapVersion = () => {
    const n = verTaps + 1;
    setVerTaps(n);
    if (n >= 7) {
      setDevOpen(true);
      setVerTaps(0);
    } else if (n >= 4) {
      toast(`개발자 메뉴까지 ${7 - n}번 남았어요`);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3 pb-8">
      <h1 className="text-xl font-extrabold">⚙️ 설정</h1>

      {/* 음이름 표기 */}
      <section className="rounded-card bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-sm font-extrabold">🏷 음이름 표기</h2>
        <p className="mb-2 text-[11px] text-sub">바꾸면 모든 화면에 즉시 반영돼요</p>
        <div role="radiogroup" aria-label="음이름 표기" className="flex flex-col gap-1.5">
          {(
            [
              { v: "solfege", label: "계이름만 (도·레·미)" },
              { v: "device", label: "계이름 + 기기 표시 (도 · C3) — 기본" },
              { v: "intl", label: "계이름 + 국제 표기 (도 · C4)" },
            ] as { v: Notation; label: string }[]
          ).map((o) => (
            <label key={o.v} className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-bold ${s.notation === o.v ? "border-brand" : "border-transparent bg-stage/60"}`}>
              <input type="radio" name="notation" checked={s.notation === o.v} onChange={() => s.set("notation", o.v)} className="accent-brand" />
              {o.label}
            </label>
          ))}
        </div>
      </section>

      {/* 소리 */}
      <section className="rounded-card bg-white p-4 shadow-sm">
        <h2 className="text-sm font-extrabold">🔊 소리</h2>
        <Row label="음색">
          <Segmented<TonePreset>
            label="음색"
            value={s.tone}
            options={[
              { v: "flute", label: "🪈 플루트" },
              { v: "sax", label: "🎷 색소폰" },
              { v: "synth", label: "🎹 신스" },
            ]}
            onChange={(v) => s.set("tone", v)}
          />
        </Row>
        <Row label="비브라토">
          <Toggle checked={s.vibrato} onChange={(v) => s.set("vibrato", v)} label="비브라토" />
        </Row>
        <Row label="음 선택 시 자동 재생">
          <Toggle checked={s.autoPlay} onChange={(v) => s.set("autoPlay", v)} label="자동 재생" />
        </Row>
      </section>

      {/* 운지 */}
      <section className="rounded-card bg-white p-4 shadow-sm">
        <h2 className="text-sm font-extrabold">🖐 운지</h2>
        <Row label="반음 표시 (♯/♭)">
          <Toggle checked={s.showSemitones} onChange={(v) => s.set("showSemitones", v)} label="반음 표시" />
        </Row>
        <Row label="고급(교차) 운지 표시">
          <Toggle checked={s.showAdvanced} onChange={(v) => s.set("showAdvanced", v)} label="고급 운지 표시" />
        </Row>
        <Row label="옥타브 범위">
          <Segmented<OctaveRange>
            label="옥타브 범위"
            value={s.octaveRange}
            options={[
              { v: "core", label: "기본 (0·+1층)" },
              { v: "full", label: "전체 (4층)" },
            ]}
            onChange={(v) => s.set("octaveRange", v)}
          />
        </Row>
        <p className="mt-1 text-[11px] text-sub">
          💡 반음은 L9, 교차운지는 L10 레슨을 마치면 자동으로 켜져요.
        </p>
      </section>

      {/* 실기 연결 */}
      <MidiCard />

      {/* 기타 */}
      <section className="rounded-card bg-white p-4 shadow-sm">
        <h2 className="text-sm font-extrabold">🧰 기타</h2>
        <Row label="온보딩 다시 보기">
          <button
            type="button"
            onClick={() => {
              s.set("onboardingSeen", false);
              s.setTab("explorer");
            }}
            className="rounded-full bg-stage px-4 py-2 text-xs font-bold text-sub"
          >
            보기
          </button>
        </Row>
        <Row label="진행도·기록 초기화">
          {resetStep === 0 ? (
            <button type="button" onClick={() => setResetStep(1)} className="rounded-full bg-stage px-4 py-2 text-xs font-bold text-danger">
              초기화…
            </button>
          ) : (
            <span className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  progress.resetAll();
                  setResetStep(0);
                  toast("진행도와 기록을 모두 초기화했어요");
                }}
                className="rounded-full bg-danger px-3 py-2 text-xs font-bold text-white"
              >
                정말 초기화
              </button>
              <button type="button" onClick={() => setResetStep(0)} className="rounded-full bg-stage px-3 py-2 text-xs font-bold text-sub">
                취소
              </button>
            </span>
          )}
        </Row>
      </section>

      <footer className="mt-2 flex flex-col items-center gap-1 pb-2 text-center">
        <button type="button" onClick={tapVersion} className="num text-[11px] font-bold text-sub" aria-label={`버전 ${APP_VERSION}`}>
          클라리 운지 마스터 {APP_VERSION}
        </button>
        <p className="max-w-[320px] text-[10px] leading-relaxed text-sub/80">
          운지 데이터: Clarii mini 공식 매뉴얼 V2.2 · 색소폰(출고 기본) 모드 기준 · 본 앱은 비공식
          학습 도구입니다
        </p>
      </footer>
    </div>
  );
}
