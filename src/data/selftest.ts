import { resolveNote, resolveFromKeys, ALL_POSITIONS, midiToFreq } from "./notes";
import type { KeyId } from "./keys";

/** 개발용 콘솔 셀프 테스트 — 설계 문서의 확인 항목을 자동 검증한다 */
export function runSelfTest(): void {
  const results: { name: string; pass: boolean; got: string }[] = [];
  const check = (name: string, pass: boolean, got: string) =>
    results.push({ name, pass, got });

  const do0 = resolveNote("do", 0);
  check('resolveNote("do",0) → midi 60 · "C3"', do0.midi === 60 && do0.robkooName === "C3", `${do0.midi} · ${do0.robkooName}`);

  const hido1 = resolveNote("hido", 1);
  check('resolveNote("hido",1) → midi 84 · "C5"', hido1.midi === 84 && hido1.robkooName === "C5", `${hido1.midi} · ${hido1.robkooName}`);

  const faSharp = resolveNote("fa", 0, "sharp");
  check('resolveNote("fa",0,"sharp") → midi 66 · F♯3/G♭3', faSharp.midi === 66 && faSharp.robkooName === "F♯3/G♭3", `${faSharp.midi} · ${faSharp.robkooName}`);

  const r1 = resolveFromKeys(new Set<KeyId>(["K2"]));
  check('resolveFromKeys({K2}) → 높은 도', r1?.resolved.korName === "높은 도", r1?.resolved.korName ?? "null");

  const r2 = resolveFromKeys(new Set<KeyId>([]));
  check("resolveFromKeys({}) → 교차운지 높은 도♯", r2?.matchKind === "cross" && r2.crossSemitone?.id === "hidoSharp", `${r2?.matchKind} ${r2?.crossSemitone?.id}`);

  const r3 = resolveFromKeys(new Set<KeyId>(["K1", "K2", "K3", "K4", "K5", "K6", "K7", "OCT_UP"]));
  check("도+[+1] → midi 72", r3?.midi === 72, String(r3?.midi));

  const r4 = resolveFromKeys(new Set<KeyId>(["K1", "SHARP", "FLAT"]));
  check("시+♯+♭ → 상쇄 midi 71", r4?.midi === 71 && r4.flags.sharpFlatCancel, `${r4?.midi} cancel=${r4?.flags.sharpFlatCancel}`);

  const lowDo = ALL_POSITIONS[0];
  const top = ALL_POSITIONS[ALL_POSITIONS.length - 1];
  check("ALL_POSITIONS 범위 48~96", lowDo.midi === 48 && top.midi === 96, `${lowDo.midi}~${top.midi}`);
  const midis = ALL_POSITIONS.map((p) => p.midi);
  check("ALL_POSITIONS midi 중복 없음", new Set(midis).size === midis.length, `${midis.length}개`);

  check("A3(midi 69) = 440Hz", Math.abs(midiToFreq(69) - 440) < 1e-9, midiToFreq(69).toFixed(2));

  const fails = results.filter((r) => !r.pass);
  if (fails.length === 0) {
    console.info(`[selftest] ${results.length}/${results.length} 통과 ✓`);
  } else {
    console.error(`[selftest] ${fails.length}개 실패:`);
    for (const f of fails) console.error(`  ✗ ${f.name} — got: ${f.got}`);
  }
}
