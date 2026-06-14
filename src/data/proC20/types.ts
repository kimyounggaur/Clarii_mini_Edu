export type ProC20FingeringMode =
  | "robkooSax"
  | "ewi"
  | "saxophone"
  | "robkooDizi"
  | "robkooHulusi"
  | "dizi"
  | "hulusi"
  | "ewiF"
  | "evi"
  | "whistle";

export type ProC20KeyId =
  | "N1" | "N2" | "N3" | "N4" | "N5" | "N6" | "N7"
  | "BIS"
  | "LP1" | "LP2"
  | "RP1" | "RP2" | "RP3"
  | "ASTERISK_1" | "ASTERISK_2"
  | "OCT_ROLLER_1" | "OCT_ROLLER_2" | "OCT_ROLLER_3" | "OCT_ROLLER_4"
  | "OCT_ROLLER_5" | "OCT_ROLLER_6" | "OCT_ROLLER_7" | "OCT_ROLLER_8"
  | "OCT_RANGE_M3" | "OCT_RANGE_M2" | "OCT_RANGE_M1" | "OCT_RANGE_0"
  | "OCT_RANGE_P1" | "OCT_RANGE_P2" | "OCT_RANGE_P3"
  | "PLUS" | "MINUS"
  | "FAVORITE_1" | "FAVORITE_2" | "FAVORITE_3"
  | "DPAD_UP" | "DPAD_DOWN" | "DPAD_LEFT" | "DPAD_RIGHT" | "OK"
  | "FN" | "VOICE" | "BLUETOOTH"
  | "PORTAMENTO_PLATE"
  | "PITCH_BEND_UP" | "PITCH_BEND_DOWN"
  | "THUMB_HOOK";

export type ProC20OctaveRange = "M3" | "M2" | "M1" | "0" | "P1" | "P2" | "P3";

export interface ProC20SourceRef {
  manualPage: number;
  pdfPage?: number;
  heading: string;
  rowLabel?: string;
  columnLabel?: string;
  note?: string;
}

export type ProC20VerificationStatus =
  | "verified"
  | "panelVerified"
  | "needsChartTranscription";

export interface ProC20NoteInfo {
  solfegeKor: string;
  deviceName?: string;
  letter?: string;
  pc?: number;
  octaveOffset?: number;
}

export interface ProC20FingeringVariant {
  id: string;
  pressed: ProC20KeyId[];
  note?: string;
}

export interface ProC20FingeringEntry {
  id: string;
  mode: ProC20FingeringMode;
  group:
    | "basic"
    | "natural"
    | "semitone"
    | "expressHighOctave"
    | "expressLowOctave"
    | "acoustic"
    | "express1"
    | "express2"
    | "express3"
    | "controller";
  note: ProC20NoteInfo;
  pressed: ProC20KeyId[];
  released?: ProC20KeyId[];
  octaveRange?: ProC20OctaveRange;
  variants?: ProC20FingeringVariant[];
  tipKor: string;
  source: ProC20SourceRef;
  verification: ProC20VerificationStatus;
}

export interface ProC20TryTarget {
  mode: ProC20FingeringMode;
  entryId: string;
  variantId?: string;
  requireOctaveRange?: boolean;
}
