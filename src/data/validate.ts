import { FINGERINGS } from "./notes";
import { KEYS } from "./keys";

/**
 * 앱 시작 시 1회 실행되는 데이터 무결성 검사.
 * 실패 항목은 console.error로 어떤 항목의 어떤 ID가 문제인지 출력한다.
 * @returns 발견된 오류 메시지 배열 (비어 있으면 통과)
 */
export function validateFingerings(): string[] {
  const errors: string[] = [];
  const keyIds = new Set(KEYS.map((k) => k.id as string));

  // 1) 모든 keys/cross/thumb ID가 KEYS에 존재하는가
  for (const n of FINGERINGS.naturals) {
    for (const k of n.keys) {
      if (!keyIds.has(k)) errors.push(`naturals["${n.id}"].keys: 존재하지 않는 키 "${k}"`);
    }
  }
  for (const s of FINGERINGS.semitones) {
    for (const combo of s.cross) {
      for (const k of combo) {
        if (!keyIds.has(k)) errors.push(`semitones["${s.id}"].cross: 존재하지 않는 키 "${k}"`);
      }
    }
  }
  for (const l of FINGERINGS.octaveLayers) {
    for (const k of l.thumb) {
      if (!keyIds.has(k)) errors.push(`octaveLayers[${l.layer}].thumb: 존재하지 않는 키 "${k}"`);
    }
  }

  // 2) naturals 8개, pc 0~12 중복 없이 오름차순
  if (FINGERINGS.naturals.length !== 8) {
    errors.push(`naturals는 8개여야 합니다 (현재 ${FINGERINGS.naturals.length}개)`);
  }
  let prevPc = -1;
  for (const n of FINGERINGS.naturals) {
    if (n.pc < 0 || n.pc > 12) errors.push(`naturals["${n.id}"].pc=${n.pc}: 0~12 범위 밖`);
    if (n.pc <= prevPc) errors.push(`naturals["${n.id}"].pc=${n.pc}: 오름차순/중복 위반`);
    prevPc = n.pc;
  }

  // 2-1) semitones의 pc가 naturals 사이 값인가 (온음 pc와 겹치지 않아야 함)
  const naturalPcs = new Set(FINGERINGS.naturals.map((n) => n.pc));
  for (const s of FINGERINGS.semitones) {
    if (naturalPcs.has(s.pc)) errors.push(`semitones["${s.id}"].pc=${s.pc}: 온음 pc와 겹침`);
    if (s.pc < 0 || s.pc > 13) errors.push(`semitones["${s.id}"].pc=${s.pc}: 범위 밖`);
    const naturalIds = new Set(FINGERINGS.naturals.map((n) => n.id));
    if (!naturalIds.has(s.viaSharp)) {
      errors.push(`semitones["${s.id}"].viaSharp="${s.viaSharp}": 존재하지 않는 온음`);
    }
    if (s.viaFlat !== null && !naturalIds.has(s.viaFlat)) {
      errors.push(`semitones["${s.id}"].viaFlat="${s.viaFlat}": 존재하지 않는 온음`);
    }
  }

  // 3) octaveLayers가 -1~2를 정확히 1회씩
  const layerNums = FINGERINGS.octaveLayers.map((l) => l.layer).sort((a, b) => a - b);
  if (JSON.stringify(layerNums) !== JSON.stringify([-1, 0, 1, 2])) {
    errors.push(`octaveLayers는 -1,0,1,2를 정확히 1회씩 가져야 합니다 (현재 ${layerNums.join(",")})`);
  }

  if (errors.length > 0) {
    console.error(`[validateFingerings] ${errors.length}개 오류 발견:`);
    for (const e of errors) console.error("  ·", e);
  } else {
    console.info("[validateFingerings] 운지 데이터 검증 통과 ✓ (에러 0)");
  }
  return errors;
}
