export type KeyId =
  | "K1" | "K2" | "K3" | "K4" | "K5" | "K6" | "K7"   // 앞면 음표 키
  | "SHARP" | "FLAT"                                  // 측면 반음 키
  | "OCT_DOWN" | "OCT_UP" | "OCT_UP2";                // 뒷면 옥타브 키 (OCT_UP2 = OK 키)

export interface KeyMeta {
  id: KeyId;
  group: "note" | "semitone" | "octave";
  face: "front" | "side" | "back";
  hand: "left" | "right";
  korName: string;     // 예: "왼손 검지"
  korLabel: string;    // 예: "K1", "♯", "+1"
}

export const KEYS: KeyMeta[] = [
  { id: "K1", group: "note", face: "front", hand: "left",  korName: "왼손 검지",    korLabel: "K1" },
  { id: "K2", group: "note", face: "front", hand: "left",  korName: "왼손 중지",    korLabel: "K2" },
  { id: "K3", group: "note", face: "front", hand: "left",  korName: "왼손 약지",    korLabel: "K3" },
  { id: "K4", group: "note", face: "front", hand: "right", korName: "오른손 검지",  korLabel: "K4" },
  { id: "K5", group: "note", face: "front", hand: "right", korName: "오른손 중지",  korLabel: "K5" },
  { id: "K6", group: "note", face: "front", hand: "right", korName: "오른손 약지",  korLabel: "K6" },
  { id: "K7", group: "note", face: "front", hand: "right", korName: "오른손 새끼",  korLabel: "K7" },
  { id: "SHARP",    group: "semitone", face: "side", hand: "left", korName: "샵 키(반음 올림)",   korLabel: "♯" },
  { id: "FLAT",     group: "semitone", face: "side", hand: "left", korName: "플랫 키(반음 내림)", korLabel: "♭" },
  { id: "OCT_UP2",  group: "octave", face: "back", hand: "left", korName: "OK 키(+2 옥타브)", korLabel: "+2" },
  { id: "OCT_UP",   group: "octave", face: "back", hand: "left", korName: "+1 옥타브 키",     korLabel: "+1" },
  { id: "OCT_DOWN", group: "octave", face: "back", hand: "left", korName: "−1 옥타브 키",     korLabel: "−1" },
];

export const KEY_BY_ID: Record<KeyId, KeyMeta> = Object.fromEntries(
  KEYS.map((k) => [k.id, k]),
) as Record<KeyId, KeyMeta>;

export const NOTE_KEY_IDS: KeyId[] = ["K1", "K2", "K3", "K4", "K5", "K6", "K7"];

/** 키 그룹별 색 — 표기 약속(마스터 컨텍스트)과 동일. 다른 색 사용 금지 */
export const KEY_COLORS: Record<"left" | "right" | "semitone" | "octave", string> = {
  left: "#FF8A00",
  right: "#2E5AAC",
  semitone: "#7C5CFF",
  octave: "#19B47D",
};

export function keyColor(id: KeyId): string {
  const meta = KEY_BY_ID[id];
  if (meta.group === "semitone") return KEY_COLORS.semitone;
  if (meta.group === "octave") return KEY_COLORS.octave;
  return meta.hand === "left" ? KEY_COLORS.left : KEY_COLORS.right;
}
