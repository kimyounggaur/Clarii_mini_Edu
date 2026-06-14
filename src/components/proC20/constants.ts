import type { ProC20KeyId } from "../../data/proC20/types";

export const PRO_C20_VIEWBOX = "0 0 240 760";
export const PRO_C20_BODY = {
  cx: 120,
  left: 68,
  right: 172,
  top: 112,
  bottom: 736,
  r: 30,
};

export type ProC20KeyPos =
  | { id: ProC20KeyId; kind: "circle"; cx: number; cy: number; r: number; label?: string }
  | { id: ProC20KeyId; kind: "pill"; cx: number; cy: number; w: number; h: number; label?: string }
  | { id: ProC20KeyId; kind: "rect"; cx: number; cy: number; w: number; h: number; label?: string };

export const PRO_C20_FRONT_KEYS: ProC20KeyPos[] = [
  { id: "ASTERISK_1", kind: "circle", cx: 154, cy: 197, r: 9, label: "⿵" },
  { id: "BIS", kind: "circle", cx: 94, cy: 218, r: 8, label: "Bis" },
  { id: "LP1", kind: "pill", cx: 160, cy: 247, w: 42, h: 12, label: "LP1" },
  { id: "N1", kind: "circle", cx: 120, cy: 265, r: 19, label: "N1" },
  { id: "LP2", kind: "pill", cx: 158, cy: 304, w: 35, h: 12, label: "LP2" },
  { id: "N2", kind: "circle", cx: 120, cy: 322, r: 19, label: "N2" },
  { id: "N3", kind: "circle", cx: 120, cy: 381, r: 19, label: "N3" },
  { id: "ASTERISK_2", kind: "circle", cx: 87, cy: 414, r: 8, label: "⿶" },
  { id: "RP1", kind: "pill", cx: 82, cy: 442, w: 38, h: 12, label: "RP1" },
  { id: "RP2", kind: "pill", cx: 84, cy: 476, w: 40, h: 12, label: "RP2" },
  { id: "N4", kind: "circle", cx: 120, cy: 506, r: 19, label: "N4" },
  { id: "RP3", kind: "circle", cx: 88, cy: 542, r: 10, label: "RP3" },
  { id: "N5", kind: "circle", cx: 120, cy: 562, r: 19, label: "N5" },
  { id: "N6", kind: "circle", cx: 120, cy: 617, r: 19, label: "N6" },
  { id: "N7", kind: "circle", cx: 120, cy: 672, r: 18, label: "N7" },
  { id: "PLUS", kind: "circle", cx: 76, cy: 586, r: 9, label: "+" },
  { id: "MINUS", kind: "circle", cx: 76, cy: 615, r: 9, label: "-" },
];

export const PRO_C20_BACK_KEYS: ProC20KeyPos[] = [
  { id: "FAVORITE_1", kind: "circle", cx: 82, cy: 220, r: 15, label: "1" },
  { id: "FAVORITE_2", kind: "circle", cx: 120, cy: 220, r: 15, label: "2" },
  { id: "FAVORITE_3", kind: "circle", cx: 158, cy: 220, r: 15, label: "3" },
  { id: "DPAD_UP", kind: "pill", cx: 120, cy: 265, w: 42, h: 22, label: "▲" },
  { id: "DPAD_LEFT", kind: "pill", cx: 84, cy: 303, w: 40, h: 24, label: "◀" },
  { id: "OK", kind: "circle", cx: 120, cy: 303, r: 24, label: "OK" },
  { id: "DPAD_RIGHT", kind: "pill", cx: 156, cy: 303, w: 40, h: 24, label: "▶" },
  { id: "DPAD_DOWN", kind: "pill", cx: 120, cy: 342, w: 42, h: 22, label: "▼" },
  { id: "OCT_ROLLER_1", kind: "rect", cx: 91, cy: 393, w: 28, h: 15, label: "" },
  { id: "OCT_ROLLER_2", kind: "rect", cx: 91, cy: 417, w: 28, h: 15, label: "" },
  { id: "OCT_ROLLER_3", kind: "rect", cx: 91, cy: 441, w: 28, h: 15, label: "" },
  { id: "OCT_ROLLER_4", kind: "rect", cx: 91, cy: 465, w: 28, h: 15, label: "" },
  { id: "OCT_ROLLER_5", kind: "rect", cx: 91, cy: 489, w: 28, h: 15, label: "" },
  { id: "OCT_ROLLER_6", kind: "rect", cx: 91, cy: 513, w: 28, h: 15, label: "" },
  { id: "OCT_ROLLER_7", kind: "rect", cx: 91, cy: 537, w: 28, h: 15, label: "" },
  { id: "OCT_ROLLER_8", kind: "rect", cx: 91, cy: 561, w: 28, h: 15, label: "" },
  { id: "PORTAMENTO_PLATE", kind: "rect", cx: 128, cy: 477, w: 18, h: 178, label: "" },
  { id: "PITCH_BEND_UP", kind: "rect", cx: 130, cy: 618, w: 52, h: 34, label: "B+" },
  { id: "THUMB_HOOK", kind: "rect", cx: 162, cy: 606, w: 30, h: 50, label: "" },
  { id: "PITCH_BEND_DOWN", kind: "rect", cx: 130, cy: 674, w: 52, h: 34, label: "B-" },
  { id: "FN", kind: "circle", cx: 94, cy: 715, r: 12, label: "FN" },
  { id: "VOICE", kind: "circle", cx: 146, cy: 715, r: 12, label: "Mic" },
];

export const PRO_C20_OCTAVE_RANGES: ProC20KeyPos[] = [
  { id: "OCT_RANGE_M3", kind: "pill", cx: 62, cy: 393, w: 24, h: 12, label: "-3" },
  { id: "OCT_RANGE_M2", kind: "pill", cx: 62, cy: 417, w: 24, h: 12, label: "-2" },
  { id: "OCT_RANGE_M1", kind: "pill", cx: 62, cy: 441, w: 24, h: 12, label: "-1" },
  { id: "OCT_RANGE_0", kind: "pill", cx: 62, cy: 465, w: 24, h: 12, label: "0" },
  { id: "OCT_RANGE_P1", kind: "pill", cx: 62, cy: 489, w: 24, h: 12, label: "+1" },
  { id: "OCT_RANGE_P2", kind: "pill", cx: 62, cy: 513, w: 24, h: 12, label: "+2" },
  { id: "OCT_RANGE_P3", kind: "pill", cx: 62, cy: 537, w: 24, h: 12, label: "+3" },
];
