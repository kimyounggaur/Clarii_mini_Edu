import type { ProC20KeyId, ProC20SourceRef } from "./types";

export interface ProC20KeyMeta {
  id: ProC20KeyId;
  label: string;
  korName: string;
  manualName: string;
  group: "note" | "semitone" | "articulation" | "octave" | "navigation" | "performance" | "connector" | "support";
  face: "front" | "back" | "side" | "bottom";
  hand: "left" | "right" | "thumb" | "system";
  defaultRole: string;
  source: ProC20SourceRef;
}

const panel = (manualPage: number, heading: string, note: string): ProC20SourceRef => ({
  manualPage,
  pdfPage: manualPage - 27,
  heading,
  note,
});

export const PRO_C20_KEYS: ProC20KeyMeta[] = [
  { id: "N1", label: "N1", korName: "왼손 첫 번째 노트 키", manualName: "Note key 1", group: "note", face: "front", hand: "left", defaultRole: "note key", source: panel(5, "Panel Descriptions", "Note keys play notes by holding combinations.") },
  { id: "N2", label: "N2", korName: "왼손 두 번째 노트 키", manualName: "Note key 2", group: "note", face: "front", hand: "left", defaultRole: "note key", source: panel(5, "Panel Descriptions", "Note keys play notes by holding combinations.") },
  { id: "N3", label: "N3", korName: "왼손 세 번째 노트 키", manualName: "Note key 3", group: "note", face: "front", hand: "left", defaultRole: "note key", source: panel(5, "Panel Descriptions", "Note keys play notes by holding combinations.") },
  { id: "N4", label: "N4", korName: "오른손 첫 번째 노트 키", manualName: "Note key 4", group: "note", face: "front", hand: "right", defaultRole: "note key", source: panel(5, "Panel Descriptions", "Note keys play notes by holding combinations.") },
  { id: "N5", label: "N5", korName: "오른손 두 번째 노트 키", manualName: "Note key 5", group: "note", face: "front", hand: "right", defaultRole: "note key", source: panel(5, "Panel Descriptions", "Note keys play notes by holding combinations.") },
  { id: "N6", label: "N6", korName: "오른손 세 번째 노트 키", manualName: "Note key 6", group: "note", face: "front", hand: "right", defaultRole: "note key", source: panel(5, "Panel Descriptions", "Note keys play notes by holding combinations.") },
  { id: "N7", label: "N7", korName: "오른손 네 번째 노트 키", manualName: "Note key 7", group: "note", face: "front", hand: "right", defaultRole: "note key", source: panel(5, "Panel Descriptions", "Note keys play notes by holding combinations.") },
  { id: "BIS", label: "Bis", korName: "비스 키", manualName: "Bis Key", group: "semitone", face: "front", hand: "left", defaultRole: "B에서 플랫 7도", source: panel(5, "Panel Descriptions", "Plays the flat 7th note of current scale when playing B.") },
  { id: "LP1", label: "LP1", korName: "왼손 새끼 LP1 키", manualName: "LP1 Key", group: "semitone", face: "front", hand: "left", defaultRole: "+1 semitone", source: panel(6, "Panel Descriptions", "Raises notes by one semitone while pressed.") },
  { id: "LP2", label: "LP2", korName: "왼손 새끼 LP2 키", manualName: "LP2 Key", group: "semitone", face: "front", hand: "left", defaultRole: "-1 semitone", source: panel(6, "Panel Descriptions", "Lowers notes by one semitone while pressed.") },
  { id: "ASTERISK_1", label: "⿵", korName: "아티큘레이션 1 키", manualName: "Asterisk Key", group: "articulation", face: "front", hand: "left", defaultRole: "Articulation 1 or favorite sounds", source: panel(5, "Panel Descriptions", "Hold to trigger Articulation 1 or switch through favorites.") },
  { id: "ASTERISK_2", label: "⿶", korName: "아티큘레이션 2 키", manualName: "Asterisk Key 2", group: "articulation", face: "front", hand: "left", defaultRole: "Off by default; configurable", source: panel(6, "Panel Descriptions", "Off by default; configurable in Controllers.") },
  { id: "PLUS", label: "+", korName: "다음 사운드 키", manualName: "[+] Key", group: "navigation", face: "side", hand: "left", defaultRole: "Next favorite or sound", source: panel(6, "Panel Descriptions", "Switch through favorites or next user sound.") },
  { id: "MINUS", label: "-", korName: "이전 사운드 키", manualName: "[-] Key", group: "navigation", face: "side", hand: "left", defaultRole: "Previous favorite or sound", source: panel(6, "Panel Descriptions", "Switch backward through favorites or previous user sound.") },
  { id: "RP1", label: "RP1", korName: "오른손 새끼 RP1 키", manualName: "RP1 Key", group: "semitone", face: "front", hand: "right", defaultRole: "Off by default; configurable", source: panel(6, "Panel Descriptions", "Can be set to raise the note by one semitone.") },
  { id: "RP2", label: "RP2", korName: "오른손 새끼 RP2 키", manualName: "RP2 Key", group: "semitone", face: "front", hand: "right", defaultRole: "Off by default; configurable", source: panel(7, "Panel Descriptions", "Can be set to lower the note by one semitone.") },
  { id: "RP3", label: "RP3", korName: "오른손 새끼 RP3 키", manualName: "RP3 Key", group: "note", face: "front", hand: "right", defaultRole: "Extra note key", source: panel(7, "Panel Descriptions", "Play notes by holding the key.") },
  { id: "FAVORITE_1", label: "1", korName: "즐겨찾기 1", manualName: "Favorite button 1", group: "navigation", face: "back", hand: "system", defaultRole: "Save or recall favorite sound", source: panel(7, "Panel Descriptions", "Favorite buttons save and switch to favorite sounds.") },
  { id: "FAVORITE_2", label: "2", korName: "즐겨찾기 2", manualName: "Favorite button 2", group: "navigation", face: "back", hand: "system", defaultRole: "Save or recall favorite sound", source: panel(7, "Panel Descriptions", "Favorite buttons save and switch to favorite sounds.") },
  { id: "FAVORITE_3", label: "3", korName: "즐겨찾기 3", manualName: "Favorite button 3", group: "navigation", face: "back", hand: "system", defaultRole: "Save or recall favorite sound", source: panel(7, "Panel Descriptions", "Favorite buttons save and switch to favorite sounds.") },
  { id: "DPAD_UP", label: "▲", korName: "위 방향 버튼", manualName: "Up button", group: "navigation", face: "back", hand: "system", defaultRole: "Scroll or adjust up", source: panel(7, "Panel Descriptions", "Directional buttons navigate menus.") },
  { id: "DPAD_DOWN", label: "▼", korName: "아래 방향 버튼", manualName: "Down button", group: "navigation", face: "back", hand: "system", defaultRole: "Scroll or adjust down", source: panel(7, "Panel Descriptions", "Directional buttons navigate menus.") },
  { id: "DPAD_LEFT", label: "◀", korName: "왼쪽 방향 버튼", manualName: "Left button", group: "navigation", face: "back", hand: "system", defaultRole: "Previous menu", source: panel(7, "Panel Descriptions", "Directional buttons navigate menus.") },
  { id: "DPAD_RIGHT", label: "▶", korName: "오른쪽 방향 버튼", manualName: "Right button", group: "navigation", face: "back", hand: "system", defaultRole: "Switch menu", source: panel(7, "Panel Descriptions", "Directional buttons navigate menus.") },
  { id: "OK", label: "OK", korName: "확인 버튼", manualName: "OK button", group: "navigation", face: "back", hand: "system", defaultRole: "Enter or confirm", source: panel(7, "Panel Descriptions", "OK enters or confirms a setting.") },
  { id: "PORTAMENTO_PLATE", label: "Port.", korName: "포르타멘토 플레이트", manualName: "Portamento plate", group: "performance", face: "back", hand: "thumb", defaultRole: "Smooth glide between notes", source: panel(7, "Panel Descriptions", "Touch-sensitive linear portamento plate.") },
  { id: "PITCH_BEND_UP", label: "Bend+", korName: "상단 피치 벤드 플레이트", manualName: "Upper pitch bend plate", group: "performance", face: "back", hand: "thumb", defaultRole: "Bend pitch upward", source: panel(9, "Panel Descriptions", "Disabled when thumb hook is installed.") },
  { id: "PITCH_BEND_DOWN", label: "Bend-", korName: "하단 피치 벤드 플레이트", manualName: "Lower pitch bend plate", group: "performance", face: "back", hand: "thumb", defaultRole: "Bend pitch downward", source: panel(9, "Panel Descriptions", "Lower pitch bend plate.") },
  { id: "THUMB_HOOK", label: "Hook", korName: "탈착식 엄지 받침", manualName: "Detachable thumb hook", group: "support", face: "back", hand: "thumb", defaultRole: "Support grip", source: panel(9, "Panel Descriptions", "Pre-installed on the upper pitch bend plate.") },
  { id: "FN", label: "FN", korName: "FN 버튼", manualName: "FN button", group: "navigation", face: "back", hand: "system", defaultRole: "Shortcut modifier", source: panel(10, "Panel Descriptions", "Forms shortcut combinations.") },
  { id: "VOICE", label: "Voice", korName: "음성 버튼", manualName: "Voice button", group: "navigation", face: "side", hand: "system", defaultRole: "Voice commands", source: panel(11, "Panel Descriptions", "Press and hold for voice commands.") },
  { id: "BLUETOOTH", label: "BT", korName: "블루투스 버튼", manualName: "Bluetooth button", group: "connector", face: "side", hand: "system", defaultRole: "Bluetooth audio/BLE MIDI", source: panel(7, "Panel Descriptions", "Turns Bluetooth audio and BLE MIDI on or off.") },
  ...(["1", "2", "3", "4", "5", "6", "7", "8"] as const).map((n) => ({
    id: `OCT_ROLLER_${n}` as ProC20KeyId,
    label: `R${n}`,
    korName: `옥타브 롤러 ${n}`,
    manualName: `Octave roller ${n}`,
    group: "octave" as const,
    face: "back" as const,
    hand: "thumb" as const,
    defaultRole: "Octave roller touch point",
    source: panel(7, "Panel Descriptions", "Eight touch-sensitive rollers access seven octave ranges."),
  })),
  ...(["M3", "M2", "M1", "0", "P1", "P2", "P3"] as const).map((range) => ({
    id: `OCT_RANGE_${range}` as ProC20KeyId,
    label: range.replace("M", "-").replace("P", "+"),
    korName: `옥타브 범위 ${range}`,
    manualName: `Octave range ${range}`,
    group: "octave" as const,
    face: "back" as const,
    hand: "thumb" as const,
    defaultRole: "Learning octave range position",
    source: panel(7, "Panel Descriptions", "Seven octave ranges are accessible by sliding the thumb."),
  })),
];

export const PRO_C20_KEY_BY_ID: Record<ProC20KeyId, ProC20KeyMeta> = Object.fromEntries(
  PRO_C20_KEYS.map((key) => [key.id, key]),
) as Record<ProC20KeyId, ProC20KeyMeta>;

export const PRO_C20_MAIN_KEYS: ProC20KeyId[] = ["N1", "N2", "N3", "N4", "N5", "N6", "N7"];
export const PRO_C20_LEFT_SIDE_KEYS: ProC20KeyId[] = ["BIS", "LP1", "LP2", "ASTERISK_1", "ASTERISK_2"];
export const PRO_C20_RIGHT_SIDE_KEYS: ProC20KeyId[] = ["RP1", "RP2", "RP3"];
export const PRO_C20_OCTAVE_RANGE_KEYS: ProC20KeyId[] = [
  "OCT_RANGE_M3",
  "OCT_RANGE_M2",
  "OCT_RANGE_M1",
  "OCT_RANGE_0",
  "OCT_RANGE_P1",
  "OCT_RANGE_P2",
  "OCT_RANGE_P3",
];

export function proC20KeyColor(id: ProC20KeyId): string {
  const meta = PRO_C20_KEY_BY_ID[id];
  if (meta.group === "note") return meta.hand === "left" ? "#1DE6E0" : "#4EA2FF";
  if (meta.group === "semitone") return "#FFD166";
  if (meta.group === "octave") return "#19E6FF";
  if (meta.group === "articulation") return "#C084FC";
  return "#F4C86A";
}
