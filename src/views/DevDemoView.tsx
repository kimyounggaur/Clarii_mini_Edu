import { useState } from "react";
import { FINGERINGS, resolveNote, pressedKeysFor, midiToFreq, type LayerNum, type NoteSelection } from "../data/notes";
import type { KeyId } from "../data/keys";
import { useAppStore } from "../store/useAppStore";
import { useMidiStore } from "../midi/useMidi";
import { ClariiSvg } from "../components/clarii/ClariiSvg";
import { playNote, playSequence } from "../audio/synth";

/**
 * 🔬 개발자 데모 (숨은 메뉴: 설정의 버전 글자 7번 탭).
 * 운지 그림 검증 그리드 + 사운드 검증 + 가상 MIDI 입력.
 */
export function DevDemoView({ onClose }: { onClose: () => void }) {
  const tone = useAppStore((s) => s.tone);
  const set = useAppStore((s) => s.set);
  const vibrato = useAppStore((s) => s.vibrato);
  const simulate = useMidiStore((s) => s.simulate);
  const [vel, setVel] = useState(0.8);
  const [breath, setBreath] = useState(0.8);

  const demoCells: { label: string; sel: NoteSelection; cross?: KeyId[] }[] = [
    ...FINGERINGS.naturals.map((n) => ({
      label: `${n.kor}`,
      sel: { noteId: n.id, layer: 0 as LayerNum, accidental: null },
    })),
    ...FINGERINGS.semitones
      .filter((s) => s.cross.length > 0)
      .flatMap((s) =>
        s.cross.map((c, i) => ({
          label: `${s.kor}${s.cross.length > 1 ? ` (${i + 1})` : ""} 교차`,
          sel: { noteId: s.viaSharp, layer: 0 as LayerNum, accidental: "sharp" as const, method: "cross" as const, crossIndex: i },
          cross: c,
        })),
      ),
    ...([-1, 0, 1, 2] as LayerNum[]).map((layer) => ({
      label: `도 (${layer === 0 ? "기준층" : layer > 0 ? `+${layer}층` : `${layer}층`})`,
      sel: { noteId: "do", layer, accidental: null },
    })),
  ];

  const playLayeredDo = () => {
    void playSequence(
      ([-1, 0, 1, 2] as LayerNum[]).map((layer) => ({ midi: resolveNote("do", layer).midi, beats: 1 })),
      80,
      undefined,
      { preset: tone, vibrato },
    );
  };

  return (
    <div className="flex flex-col gap-3 p-3 pb-8">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-extrabold">🔬 개발자 데모</h1>
        <button type="button" onClick={onClose} className="rounded-full bg-stage px-4 py-2 text-xs font-bold text-sub">
          닫기
        </button>
      </header>

      {/* (a) 사운드 검증 */}
      <section className="rounded-card bg-white p-3 shadow-sm">
        <h2 className="text-sm font-extrabold">사운드 — 기준층 8음 / 음색 / velocity</h2>
        <div className="mt-2 flex rounded-full bg-stage p-0.5 text-[11px] font-bold">
          {(["flute", "sax", "synth"] as const).map((t) => (
            <button key={t} type="button" onClick={() => set("tone", t)} className={`flex-1 rounded-full px-2 py-1.5 ${tone === t ? "bg-white shadow-sm" : "text-sub"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {FINGERINGS.naturals.map((n) => {
            const midi = resolveNote(n.id, 0).midi;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => playNote(midi, { preset: tone, vibrato, velocity: vel })}
                className="num rounded-xl bg-stage py-2.5 text-xs font-extrabold active:bg-brand active:text-white"
              >
                {n.kor}
                <span className="block text-[9px] font-semibold text-sub">{midiToFreq(midi).toFixed(0)}Hz</span>
              </button>
            );
          })}
        </div>
        <label className="num mt-2 block text-xs font-bold text-sub">
          velocity {vel.toFixed(2)}
          <input type="range" min={0.2} max={1} step={0.05} value={vel} onChange={(e) => setVel(Number(e.target.value))} className="w-full accent-brand" />
        </label>
        <button type="button" onClick={playLayeredDo} className="mt-1 w-full rounded-full bg-brand py-2 text-xs font-extrabold text-white">
          4개 층의 도 연속 재생 (130→261→523→1046Hz)
        </button>
      </section>

      {/* (b) 가상 MIDI */}
      <section className="rounded-card bg-white p-3 shadow-sm">
        <h2 className="text-sm font-extrabold">가상 MIDI 입력 (실기 모드 시뮬레이션)</h2>
        <p className="mt-1 text-[10px] text-sub">
          버튼을 누르는 동안 note on, 떼면 note off. 게임 A 실기 모드·실기 따라가기를 실물 없이 검증.
        </p>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {Array.from({ length: 49 }, (_, i) => 48 + i).map((midi) => (
            <button
              key={midi}
              type="button"
              onPointerDown={() => simulate(midi, breath)}
              onPointerUp={() => simulate(null)}
              onPointerLeave={() => simulate(null)}
              className="num rounded-md bg-stage py-1.5 text-[9px] font-bold active:bg-octave active:text-white"
            >
              {midi}
            </button>
          ))}
        </div>
        <label className="num mt-2 block text-xs font-bold text-sub">
          브레스 {Math.round(breath * 100)}%
          <input type="range" min={0} max={1} step={0.05} value={breath} onChange={(e) => setBreath(Number(e.target.value))} className="w-full accent-octave" />
        </label>
      </section>

      {/* (c) 운지 그림 전체 보기 */}
      <section className="rounded-card bg-white p-3 shadow-sm">
        <h2 className="text-sm font-extrabold">운지 그림 전체 보기 — 기준층 8음 + 교차 5종 + 4개 층의 도</h2>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {demoCells.map((cell) => {
            const pressed = cell.cross
              ? [...cell.cross, ...resolveNote(cell.sel.noteId, cell.sel.layer, cell.sel.accidental).layerDef.thumb]
              : [...pressedKeysFor(cell.sel)];
            const resolved = resolveNote(cell.sel.noteId, cell.sel.layer, cell.sel.accidental);
            return (
              <figure key={cell.label} className="rounded-xl bg-stage/50 p-2">
                <figcaption className="num text-center text-[11px] font-extrabold">
                  {cell.label}
                  <span className="block text-[9px] font-semibold text-sub">
                    {resolved.robkooName} · midi {resolved.midi}
                  </span>
                </figcaption>
                <div className="mt-1 flex justify-center gap-1">
                  <ClariiSvg face="front" pressed={pressed} showGuideLabels={false} className="h-32" />
                  <ClariiSvg face="back" pressed={pressed} displayText={resolved.robkooName.split("/")[0]} showGuideLabels={false} className="h-32" />
                </div>
              </figure>
            );
          })}
        </div>
      </section>
    </div>
  );
}
