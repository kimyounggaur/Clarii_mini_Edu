import type { ProC20FingeringMode, ProC20SourceRef } from "./types";

export interface ProC20ModeMeta {
  id: ProC20FingeringMode;
  displayName: string;
  korName: string;
  family: "ewiCompatible" | "traditional" | "robkoo";
  recommendedFor: string;
  supportsExpressHighOctave: boolean;
  supportsExpressLowOctave: boolean;
  status: "ready" | "partial" | "planned";
  notes: string;
  source: ProC20SourceRef;
}

const basicSource: ProC20SourceRef = {
  manualPage: 17,
  pdfPage: 12,
  heading: "Basic Fingering Chart",
  note: "Multiple fingering modes are available in Controllers - Fingering.",
};

const appendixSource = (manualPage: number, heading: string): ProC20SourceRef => ({
  manualPage,
  pdfPage: manualPage - 27,
  heading,
});

export const PRO_C20_FINGERING_MODES: ProC20ModeMeta[] = [
  {
    id: "robkooSax",
    displayName: "ROBKOO Sax",
    korName: "로브쿠 색소폰식",
    family: "robkoo",
    recommendedFor: "PRO C20 전용 표현 운지를 배우는 입문자",
    supportsExpressHighOctave: true,
    supportsExpressLowOctave: true,
    status: "partial",
    notes: "Sharps, flats, high/low octave express fingerings are supported. Chart transcription still needs human verification.",
    source: appendixSource(61, "ROBKOO Sax Fingering / EWI Fingering"),
  },
  {
    id: "ewi",
    displayName: "EWI",
    korName: "EWI 호환",
    family: "ewiCompatible",
    recommendedFor: "전자 관악기식 고정 간격 운지에 익숙한 사용자",
    supportsExpressHighOctave: false,
    supportsExpressLowOctave: false,
    status: "partial",
    notes: "EWI-compatible modes use fixed intervals. RP3 has fixed interval behavior in EWI(F).",
    source: appendixSource(61, "ROBKOO Sax Fingering / EWI Fingering"),
  },
  {
    id: "saxophone",
    displayName: "Saxophone",
    korName: "색소폰식",
    family: "traditional",
    recommendedFor: "색소폰 경험자. 매뉴얼은 Saxophone fingering mode + Pro Mode를 권장합니다.",
    supportsExpressHighOctave: false,
    supportsExpressLowOctave: false,
    status: "partial",
    notes: "LP1, RP1, RP2, Bis and asterisk keys have note-specific rules.",
    source: appendixSource(63, "Saxophone Fingering"),
  },
  {
    id: "robkooDizi",
    displayName: "ROBKOO Dizi",
    korName: "로브쿠 디지식",
    family: "robkoo",
    recommendedFor: "중국 관악기 계열 표현 운지",
    supportsExpressHighOctave: true,
    supportsExpressLowOctave: true,
    status: "planned",
    notes: "Scaffold only. Requires manual chart transcription.",
    source: appendixSource(65, "ROBKOO Hulusi / ROBKOO Dizi Fingering"),
  },
  {
    id: "robkooHulusi",
    displayName: "ROBKOO Hulusi",
    korName: "로브쿠 후루스식",
    family: "robkoo",
    recommendedFor: "후루스 계열 표현 운지",
    supportsExpressHighOctave: true,
    supportsExpressLowOctave: true,
    status: "planned",
    notes: "Scaffold only. Requires manual chart transcription.",
    source: appendixSource(65, "ROBKOO Hulusi / ROBKOO Dizi Fingering"),
  },
  {
    id: "dizi",
    displayName: "Dizi",
    korName: "디지식",
    family: "ewiCompatible",
    recommendedFor: "디지식 고정 운지",
    supportsExpressHighOctave: false,
    supportsExpressLowOctave: false,
    status: "planned",
    notes: "Scaffold only. Requires manual chart transcription.",
    source: appendixSource(66, "Hulusi / Dizi Fingering"),
  },
  {
    id: "hulusi",
    displayName: "Hulusi",
    korName: "후루스식",
    family: "ewiCompatible",
    recommendedFor: "후루스식 고정 운지",
    supportsExpressHighOctave: false,
    supportsExpressLowOctave: false,
    status: "planned",
    notes: "Scaffold only. Requires manual chart transcription.",
    source: appendixSource(66, "Hulusi / Dizi Fingering"),
  },
  {
    id: "ewiF",
    displayName: "EWI (F)",
    korName: "EWI F조",
    family: "ewiCompatible",
    recommendedFor: "EWI(F) 운지 사용자",
    supportsExpressHighOctave: false,
    supportsExpressLowOctave: false,
    status: "planned",
    notes: "RP3 lowers any fingering by a whole step; express low octave is not supported.",
    source: appendixSource(67, "EWI(F) Fingering"),
  },
  {
    id: "evi",
    displayName: "EVI",
    korName: "EVI식",
    family: "ewiCompatible",
    recommendedFor: "EVI 운지 사용자",
    supportsExpressHighOctave: false,
    supportsExpressLowOctave: false,
    status: "planned",
    notes: "Scaffold only. Requires manual chart transcription.",
    source: appendixSource(67, "EVI Fingering"),
  },
  {
    id: "whistle",
    displayName: "Whistle",
    korName: "휘슬식",
    family: "traditional",
    recommendedFor: "아이리시 틴 휘슬식 C 운지",
    supportsExpressHighOctave: true,
    supportsExpressLowOctave: false,
    status: "planned",
    notes: "Includes Basic, Acoustic, Express 1/2/3 rows. Scaffold only.",
    source: appendixSource(67, "Whistle Fingering"),
  },
];

export const PRO_C20_MODE_BY_ID = Object.fromEntries(
  PRO_C20_FINGERING_MODES.map((mode) => [mode.id, mode]),
) as Record<ProC20FingeringMode, ProC20ModeMeta>;

export const PRO_C20_DEFAULT_MODE: ProC20FingeringMode = "robkooSax";
export const PRO_C20_BASIC_SOURCE = basicSource;
