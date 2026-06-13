import { useState } from "react";
import { useMidiStore, useCorrectedNote } from "../../midi/useMidi";
import { useProgressStore } from "../../store/useProgressStore";
import { selectionFromMidi, pressedKeysFor, resolveNote } from "../../data/notes";
import { korWithLayer } from "../../utils/noteName";
import { ClariiSvg } from "../clarii/ClariiSvg";
import { CalibrationWizard } from "./CalibrationWizard";

/** 설정 탭 "🎹 실기 연결" 카드 — 연결·보정·테스트. MIDI 없이도 모든 학습 기능은 동작한다 */
export function MidiCard() {
  const midi = useMidiStore();
  const offset = useProgressStore((s) => s.midiOffset);
  const [wizard, setWizard] = useState(false);
  const [test, setTest] = useState(false);
  const [help, setHelp] = useState(false);

  if (!midi.supported) {
    return (
      <section className="rounded-card bg-white p-4 shadow-sm">
        <h2 className="text-sm font-extrabold">🎹 실기 연결 (Web MIDI)</h2>
        <p className="mt-2 text-xs leading-relaxed text-sub">
          이 브라우저는 Web MIDI를 지원하지 않아요. 진짜 클라리 미니를 연결해 연주 판정을 받으려면{" "}
          <b className="text-ink">크롬 또는 엣지 브라우저</b>에서 열어주세요. (연결 없이도 모든 학습
          기능을 쓸 수 있어요!)
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-card bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold">🎹 실기 연결 (Web MIDI)</h2>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            midi.connected ? "bg-success/10 text-success" : "bg-stage text-sub"
          }`}
        >
          {midi.connected ? "연결됨" : "미연결"}
        </span>
      </div>

      {midi.connected ? (
        <p className="num mt-1.5 text-xs font-semibold text-sub">
          기기: {midi.devices.join(", ")} · 보정 오프셋 {offset === null ? "미설정" : `${offset > 0 ? "+" : ""}${offset}`}
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-sub">
          USB로 클라리 미니를 연결하면 진짜 연주를 앱이 판정해요 (마이크 음정 인식보다 훨씬 정확!).
        </p>
      )}
      {midi.error && <p className="mt-1.5 rounded-lg bg-danger/10 px-2.5 py-1.5 text-[11px] font-semibold text-danger">{midi.error}</p>}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => void midi.connect().then(() => setWizard(useProgressStore.getState().midiOffset === null))}
          disabled={midi.connecting}
          className="rounded-full bg-brand px-4 py-2 text-xs font-extrabold text-white disabled:opacity-50"
        >
          {midi.connecting ? "연결 중…" : midi.connected ? "다시 연결" : "연결하기"}
        </button>
        <button
          type="button"
          onClick={() => setWizard(true)}
          disabled={!midi.connected}
          className="rounded-full bg-stage px-3 py-2 text-xs font-bold text-sub disabled:opacity-50"
        >
          🧭 보정 마법사
        </button>
        <button
          type="button"
          onClick={() => setTest(!test)}
          disabled={!midi.connected}
          className="rounded-full bg-stage px-3 py-2 text-xs font-bold text-sub disabled:opacity-50"
        >
          🔬 연결 테스트
        </button>
        <button type="button" onClick={() => setHelp(true)} className="rounded-full bg-stage px-3 py-2 text-xs font-bold text-sub">
          연결이 안 되나요?
        </button>
      </div>

      {test && midi.connected && <MidiTest />}
      {wizard && <CalibrationWizard onClose={() => setWizard(false)} />}
      {help && <MidiHelp onClose={() => setHelp(false)} />}
    </section>
  );
}

/** 연결 테스트 — 악기를 불면 SVG 키·음이름·브레스 게이지가 실시간 반응 */
function MidiTest() {
  const note = useCorrectedNote();
  const breath = useMidiStore((s) => s.breath);
  const sel = note === null ? null : selectionFromMidi(note);
  const resolved = sel ? resolveNote(sel.noteId, sel.layer, sel.accidental) : null;
  const pressed = sel ? [...pressedKeysFor(sel)] : [];

  return (
    <div className="fade-up mt-3 rounded-xl bg-stage/60 p-3">
      <p className="num text-center text-xl font-extrabold text-brand">
        {resolved ? `${korWithLayer(resolved)} · ${resolved.robkooName}` : "불어 보세요…"}
      </p>
      <div className="mx-auto mt-1 flex max-w-[260px] justify-center gap-2">
        <ClariiSvg face="front" pressed={pressed} showGuideLabels={false} className="h-44" />
        <ClariiSvg
          face="back"
          pressed={pressed}
          displayText={resolved?.robkooName.split("/")[0] ?? ""}
          showGuideLabels={false}
          className="h-44"
        />
      </div>
      <div className="mt-2">
        <div className="flex justify-between text-[10px] font-bold text-sub">
          <span>브레스(숨)</span>
          <span className="num">{Math.round(breath * 100)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-octave transition-[width] duration-75" style={{ width: `${breath * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

/** 연결 안내 모달 */
function MidiHelp({ onClose }: { onClose: () => void }) {
  const midi = useMidiStore();
  const checks: { label: string; ok: boolean | null; tip: string }[] = [
    { label: "크롬/엣지 브라우저인가요?", ok: midi.supported, tip: "사파리는 Web MIDI를 지원하지 않아요." },
    { label: "https 또는 localhost인가요?", ok: typeof window !== "undefined" ? window.isSecureContext : null, tip: "보안 연결에서만 MIDI 권한을 받을 수 있어요." },
    { label: "MIDI 기기가 잡혔나요?", ok: midi.connected, tip: "케이블·전원 확인, Clarii 앱 등 다른 MIDI 앱이 점유 중이면 종료하세요." },
    { label: "최근 입력 이벤트", ok: midi.lastEventAt > 0, tip: "악기를 불거나 키를 누르면 이벤트가 들어와요." },
  ];
  return (
    <div role="dialog" aria-modal="true" aria-label="MIDI 연결 도움말" className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-5" onClick={onClose}>
      <div className="fade-up max-h-[80vh] w-full max-w-[360px] overflow-y-auto rounded-card bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-extrabold">🔌 연결 체크리스트</h3>
        <ul className="mt-3 flex flex-col gap-2.5">
          {checks.map((c) => (
            <li key={c.label} className="text-xs">
              <p className="font-bold">
                {c.ok === null ? "❓" : c.ok ? "✅" : "❌"} {c.label}
              </p>
              <p className="mt-0.5 text-sub">{c.tip}</p>
            </li>
          ))}
        </ul>
        <div className="mt-3 rounded-xl bg-stage p-3 text-[11px] leading-relaxed text-sub">
          <b className="text-ink">USB-C 케이블 연결을 권장</b>해요 (가장 간단, 지연 없음). 블루투스
          MIDI는 OS에서 먼저 페어링해야 하며, 브라우저에 따라 목록에 보이지 않을 수 있어요. 기기
          전원이 켜져 있는지, 다른 MIDI 앱(Clarii 앱 등)이 연결을 점유 중이지 않은지도 확인하세요.
          MIDI 없이도 모든 학습 기능은 그대로 동작합니다!
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full rounded-full bg-brand py-2.5 text-sm font-extrabold text-white">
          닫기
        </button>
      </div>
    </div>
  );
}
