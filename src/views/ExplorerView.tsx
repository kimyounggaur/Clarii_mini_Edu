import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { useToastStore } from "../store/useToastStore";
import { useAudio } from "../audio/useAudio";
import type { KeyId } from "../data/keys";
import { KEY_BY_ID } from "../data/keys";
import {
  ALL_POSITIONS,
  SEMITONE_BY_PC,
  nearestNote,
  pressedKeysFor,
  resolveFromKeys,
  resolveNote,
  type LayerNum,
  type NoteSelection,
} from "../data/notes";
import { korWithLayer, subName } from "../utils/noteName";
import { FingeringView } from "../components/clarii/FingeringView";
import { StaffNotation } from "../components/StaffNotation";
import { OctaveElevator } from "../components/OctaveElevator";
import { NoteRibbon } from "../components/NoteRibbon";
import { PatternStrip } from "../components/explorer/PatternStrip";
import { Onboarding } from "../components/explorer/Onboarding";
import { PlayButton } from "../components/explorer/PlayButton";

const TONE_EMOJI = { flute: "🪈", sax: "🎷", synth: "🎹" } as const;

export function ExplorerView() {
  const { current, setCurrent, notation, tone, autoPlay, showSemitones, showAdvanced, octaveRange, set } =
    useAppStore();
  const toast = useToastStore((s) => s.show);
  const audio = useAudio();

  const [method, setMethod] = useState<"accidental" | "cross">("accidental");
  const [crossIndex, setCrossIndex] = useState(0);
  const [patternOn, setPatternOn] = useState(false);
  const [handsOn, setHandsOn] = useState(false);
  const [explore, setExplore] = useState(false);
  const [exploreSet, setExploreSet] = useState<Set<KeyId>>(new Set());
  const preExploreRef = useRef(current);

  const resolved = resolveNote(current.noteId, current.layer, current.accidental);
  const semitone = current.accidental ? SEMITONE_BY_PC[resolved.pc] : null;
  const hasCross = !!semitone && semitone.cross.length > 0;
  const effMethod: "accidental" | "cross" = hasCross && showAdvanced ? method : "accidental";

  const selection: NoteSelection = useMemo(
    () => ({ ...current, method: effMethod, crossIndex }),
    [current, effMethod, crossIndex],
  );

  const visibleLayers: LayerNum[] = octaveRange === "core" ? [0, 1] : [-1, 0, 1, 2];
  const positions = useMemo(
    () =>
      ALL_POSITIONS.filter(
        (p) => (showSemitones || !p.isSemitone) && visibleLayers.includes(p.layer),
      ),
    [showSemitones, octaveRange], // eslint-disable-line react-hooks/exhaustive-deps
  );

  /* ---------- 음 이동 ---------- */

  const select = useCallback(
    (next: { noteId: string; layer: LayerNum; accidental: typeof current.accidental }) => {
      setMethod("accidental");
      setCrossIndex(0);
      setCurrent(next);
    },
    [setCurrent],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      const cur = resolved.midi;
      const target =
        dir === 1
          ? positions.find((p) => p.midi > cur)
          : [...positions].reverse().find((p) => p.midi < cur);
      if (!target) {
        toast(dir === 1 ? "여기가 가장 높은 음이에요" : "여기가 가장 낮은 음이에요");
        return;
      }
      if (target.layer !== current.layer) {
        toast(dir === 1 ? "한 층 위로 올라갑니다 🛗" : "한 층 아래로 내려갑니다 🛗");
      }
      select({ noteId: target.noteId, layer: target.layer, accidental: target.accidental });
    },
    [positions, resolved.midi, current.layer, select, toast],
  );

  const shiftLayer = useCallback(
    (dir: 1 | -1) => {
      const targetLayer = (current.layer + dir) as LayerNum;
      if (!visibleLayers.includes(targetLayer)) {
        toast(octaveRange === "core" ? "설정의 옥타브 범위를 '전체'로 바꾸면 더 갈 수 있어요" : "여기가 끝 층이에요");
        return;
      }
      const midi = resolveNote(current.noteId, targetLayer, current.accidental).midi;
      if (midi < 48 || midi > 96) {
        toast("이 음은 그 층에 없어요");
        return;
      }
      toast(dir === 1 ? "한 층 위로 올라갑니다 🛗" : "한 층 아래로 내려갑니다 🛗");
      setCurrent({ ...current, layer: targetLayer });
    },
    [current, visibleLayers, octaveRange, setCurrent, toast],
  );

  /* ---------- 자동 재생 (음이 바뀌면) ---------- */
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!explore && autoPlay) audio.playMidi(resolved.midi);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved.midi]);

  /* ---------- 키보드 ---------- */
  useEffect(() => {
    if (explore) return;
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight") (e.preventDefault(), step(1));
      else if (e.key === "ArrowLeft") (e.preventDefault(), step(-1));
      else if (e.key === "ArrowUp") (e.preventDefault(), shiftLayer(1));
      else if (e.key === "ArrowDown") (e.preventDefault(), shiftLayer(-1));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [step, shiftLayer, explore]);

  /* ---------- 스와이프 ---------- */
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
  };

  /* ---------- 탐구 모드 ---------- */

  const reverse = useMemo(() => (explore ? resolveFromKeys(exploreSet) : null), [explore, exploreSet]);
  const lastReverseMidi = useRef<number | null>(null);
  useEffect(() => {
    if (!explore) return;
    if (reverse && reverse.midi !== lastReverseMidi.current) audio.playMidi(reverse.midi);
    lastReverseMidi.current = reverse?.midi ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reverse?.midi, explore]);

  const toggleExplore = (on: boolean) => {
    if (on) {
      preExploreRef.current = current;
      setExploreSet(pressedKeysFor(selection));
    } else {
      setCurrent(preExploreRef.current); // 원래 선택돼 있던 음으로 복귀
    }
    setExplore(on);
  };

  const toggleKey = (id: KeyId) => {
    setExploreSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exploreNoteKeys = (["K1", "K2", "K3", "K4", "K5", "K6", "K7"] as KeyId[]).filter((k) =>
    exploreSet.has(k),
  );
  const nearest = explore && !reverse ? nearestNote(exploreNoteKeys) : null;

  /* ---------- 표시 ---------- */

  const tipText = !current.accidental
    ? resolved.natural.tip
    : effMethod === "cross"
      ? (semitone?.crossTip ?? "")
      : current.accidental === "sharp"
        ? "어떤 운지든 ♯ 키를 함께 누르면 = 반음↑"
        : "어떤 운지든 ♭ 키를 함께 누르면 = 반음↓";

  const cycleTone = () => {
    const order = ["flute", "sax", "synth"] as const;
    set("tone", order[(order.indexOf(tone) + 1) % order.length]);
  };

  return (
    <div className="flex h-full flex-col gap-2 p-2.5 md:p-4">
      <Onboarding />

      {/* 상단 바 */}
      <header className="flex items-center gap-2.5 rounded-card bg-white px-3.5 py-2 shadow-sm">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <h1 className="num truncate text-[26px] font-extrabold leading-tight">
              {explore ? "탐구 모드" : resolved.korName}
            </h1>
            {!explore && current.accidental && (
              <span className="num shrink-0 text-sm font-bold text-semitone">{resolved.robkooName}</span>
            )}
          </div>
          <p className="num truncate text-xs font-semibold text-sub">
            {explore ? "키를 직접 눌러 보세요!" : subName(resolved, notation)}
          </p>
        </div>
        <button
          type="button"
          onClick={cycleTone}
          aria-label={`음색 바꾸기 (현재 ${tone})`}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-stage text-xl"
        >
          {TONE_EMOJI[tone]}
        </button>
        {!explore && (
          <PlayButton
            onPlay={() => audio.playCurrent(selection)}
            onHoldStart={() => audio.holdCurrent(selection)}
          />
        )}
        <label className="flex shrink-0 cursor-pointer flex-col items-center gap-0.5 text-[10px] font-bold text-sub">
          <input
            type="checkbox"
            role="switch"
            className="peer sr-only"
            checked={explore}
            onChange={(e) => toggleExplore(e.target.checked)}
            aria-label="탐구 모드"
          />
          <span className="flex h-7 w-12 items-center rounded-full bg-bodyline/70 p-0.5 transition-colors peer-checked:bg-brand">
            <span className={`h-6 w-6 rounded-full bg-white shadow transition-transform ${explore ? "translate-x-5" : ""}`} />
          </span>
          🔍 탐구
        </label>
      </header>

      {/* 보기 토글 행 */}
      {!explore && (
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setPatternOn(!patternOn)}
            aria-pressed={patternOn}
            className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-sm transition-colors ${patternOn ? "bg-ink text-white" : "bg-white text-sub"}`}
          >
            🧠 패턴 보기
          </button>
          <button
            type="button"
            onClick={() => setHandsOn(!handsOn)}
            aria-pressed={handsOn}
            className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-sm transition-colors ${handsOn ? "bg-ink text-white" : "bg-white text-sub"}`}
          >
            ✋ 손 위치 보기
          </button>
        </div>
      )}
      {!explore && patternOn && <PatternStrip />}

      {/* 본문: 운지 + (악보|배너) + 엘리베이터 */}
      <div className="flex min-h-0 flex-1 gap-2">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 md:flex-row">
          <section
            className="flex min-h-0 flex-1 flex-col rounded-card bg-white p-2 shadow-sm"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <FingeringView
              note={explore ? undefined : selection}
              pressedOverride={explore ? exploreSet : undefined}
              interactive={explore}
              onToggleKey={toggleKey}
              ringGlow={audio.glowStamp > 0}
              showHands={handsOn}
              showFingerLabels={explore}
              displayTextOverride={
                explore ? (reverse ? reverse.resolved.robkooName.split("/")[0] : "?") : undefined
              }
              className="min-h-0 flex-1"
            />
            {/* 팁 / 방식 전환 */}
            {!explore && (
              <div className="mt-1 flex items-center gap-2">
                {hasCross && showAdvanced && (
                  <div role="group" aria-label="반음 운지 방식" className="flex shrink-0 rounded-full bg-stage p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      aria-pressed={effMethod === "accidental"}
                      onClick={() => setMethod("accidental")}
                      className={`rounded-full px-2.5 py-1 ${effMethod === "accidental" ? "bg-semitone text-white" : "text-sub"}`}
                    >
                      ♯/♭ 키
                    </button>
                    <button
                      type="button"
                      aria-pressed={effMethod === "cross"}
                      onClick={() => {
                        setMethod("cross");
                        if (semitone && crossIndex >= semitone.cross.length) setCrossIndex(0);
                      }}
                      className={`rounded-full px-2.5 py-1 ${effMethod === "cross" ? "bg-semitone text-white" : "text-sub"}`}
                    >
                      교차운지
                    </button>
                  </div>
                )}
                {effMethod === "cross" && semitone && semitone.cross.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setCrossIndex((crossIndex + 1) % semitone.cross.length)}
                    className="shrink-0 rounded-full bg-stage px-2 py-1 text-[11px] font-bold text-sub"
                    aria-label="다른 교차운지 보기"
                  >
                    {crossIndex + 1}/{semitone.cross.length}
                  </button>
                )}
                <p className="min-w-0 flex-1 truncate text-xs font-semibold text-sub" title={tipText}>
                  💡 {tipText}
                </p>
              </div>
            )}
            {/* 탐구 모드 배너 + 버튼 */}
            {explore && (
              <div className="mt-1 flex flex-col gap-1.5">
                <div
                  aria-live="polite"
                  className={`rounded-xl px-3 py-2 text-center text-sm font-bold ${
                    reverse
                      ? reverse.matchKind === "cross"
                        ? "bg-semitone/10 text-semitone"
                        : "bg-success/10 text-success"
                      : "bg-stage text-sub"
                  }`}
                >
                  {reverse ? (
                    reverse.matchKind === "cross" ? (
                      <>교차운지로 ★{korWithLayer(reverse.resolved)}★을 만들었어요! 🎉</>
                    ) : (
                      <>지금 운지는 ★{korWithLayer(reverse.resolved)}★!</>
                    )
                  ) : nearest ? (
                    <>
                      차트에 없는 운지예요. 가장 가까운 음:{" "}
                      <b className="text-ink">{nearest.natural.kor}</b>{" "}
                      ({nearest.diffKeys.map((k) => KEY_BY_ID[k].korLabel).join("·")}
                      {nearest.diffKeys.length > 0 ? "이(가) 달라요" : ""})
                    </>
                  ) : (
                    "키를 눌러 보세요"
                  )}
                </div>
                {(reverse?.flags.multipleOctaveKeys || reverse?.flags.sharpFlatCancel) && (
                  <p className="text-center text-[11px] font-semibold text-sub">
                    {reverse.flags.multipleOctaveKeys && "옥타브 키가 여러 개! 가장 높은 키만 적용돼요 🛗 "}
                    {reverse.flags.sharpFlatCancel && "♯과 ♭을 같이 누르면 서로 상쇄돼요 ⚖️"}
                  </p>
                )}
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExploreSet(new Set())}
                    className="rounded-full bg-stage px-4 py-1.5 text-xs font-bold text-sub"
                  >
                    초기화 (전부 떼기)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExploreSet(new Set(["K1", "K2", "K3", "K4", "K5", "K6", "K7"]))}
                    className="rounded-full bg-stage px-4 py-1.5 text-xs font-bold text-sub"
                  >
                    도 운지로 (전부 누르기)
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* 악보 카드 */}
          {!explore && (
            <section className="relative rounded-card bg-white px-2 py-1 shadow-sm md:flex md:w-[40%] md:items-center">
              <div className="absolute right-2.5 top-1.5 flex gap-1">
                {effMethod === "cross" && (
                  <span className="rounded-full bg-semitone/10 px-2 py-0.5 text-[10px] font-bold text-semitone">교차운지</span>
                )}
                {current.layer >= 2 && (
                  <span className="rounded-full bg-star/20 px-2 py-0.5 text-[10px] font-bold text-ink">8va</span>
                )}
              </div>
              <StaffNotation note={resolved} className="mx-auto h-[108px] w-auto md:h-auto md:max-h-[180px]" />
            </section>
          )}
        </div>

        {!explore && (
          <aside className="flex shrink-0 items-start">
            <OctaveElevator layer={current.layer} visibleLayers={visibleLayers} onChange={(l) => {
              if (l === current.layer) return;
              const midi = resolveNote(current.noteId, l, current.accidental).midi;
              if (midi < 48 || midi > 96) {
                toast("이 음은 그 층에 없어요");
                return;
              }
              setCurrent({ ...current, layer: l });
            }} />
          </aside>
        )}
      </div>

      {/* 하단 음 리본 */}
      {!explore && (
        <NoteRibbon
          layer={current.layer}
          selection={{ noteId: current.noteId, accidental: current.accidental }}
          showSemitones={showSemitones}
          notation={notation}
          canGoUp={visibleLayers.includes((current.layer + 1) as LayerNum)}
          canGoDown={visibleLayers.includes((current.layer - 1) as LayerNum)}
          onSelect={(sel) => select({ ...sel, layer: current.layer })}
          onLayerShift={shiftLayer}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
        />
      )}
    </div>
  );
}
