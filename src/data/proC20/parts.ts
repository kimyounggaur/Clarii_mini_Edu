import type { ProC20KeyId, ProC20SourceRef } from "./types";

export interface ProC20Part {
  id: string;
  face: "front" | "back" | "side";
  kor: string;
  desc: string;
  keyIds?: ProC20KeyId[];
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  source: ProC20SourceRef;
}

const src = (manualPage: number, heading: string, note: string): ProC20SourceRef => ({
  manualPage,
  pdfPage: manualPage - 27,
  heading,
  note,
});

export const PRO_C20_PARTS: ProC20Part[] = [
  { id: "mouthpiece", face: "front", kor: "마우스피스", desc: "Flat 타입과 Saxophone 타입을 교체할 수 있어요. 기능과 경도는 같고 취향에 따라 고릅니다.", cx: 120, cy: 52, rx: 45, ry: 44, source: src(5, "Panel Descriptions", "Flat and saxophone mouthpieces.") },
  { id: "breathLight", face: "front", kor: "브레스 라이트", desc: "숨 세기에 따라 밝기가 달라지고, 오버블로우가 걸리면 분명한 빛 신호가 나옵니다.", keyIds: [], cx: 120, cy: 160, rx: 20, ry: 16, source: src(5, "Panel Descriptions", "Breath light responds to breath velocity.") },
  { id: "noteKeys", face: "front", kor: "노트 키", desc: "키 조합과 숨으로 음을 냅니다. PRO C20은 14-key Boehm layout을 바탕으로 합니다.", keyIds: ["N1", "N2", "N3", "N4", "N5", "N6", "N7"], cx: 120, cy: 340, rx: 42, ry: 156, source: src(5, "Panel Descriptions", "Note keys play notes by holding combinations.") },
  { id: "leftSide", face: "front", kor: "Bis·LP·아티큘레이션 키", desc: "Bis, LP1, LP2, ⿵, ⿶는 반음과 아티큘레이션을 담당합니다. 모드에 따라 역할이 달라집니다.", keyIds: ["BIS", "LP1", "LP2", "ASTERISK_1", "ASTERISK_2"], cx: 165, cy: 300, rx: 25, ry: 78, source: src(5, "Panel Descriptions", "Bis, LP keys and asterisk keys.") },
  { id: "rightSide", face: "front", kor: "RP 키", desc: "RP1, RP2, RP3는 오른손 쪽 보조 키입니다. 설정과 운지 모드에 따라 반음 또는 추가 음 역할을 합니다.", keyIds: ["RP1", "RP2", "RP3"], cx: 75, cy: 485, rx: 24, ry: 64, source: src(7, "Panel Descriptions", "RP keys.") },
  { id: "speaker", face: "front", kor: "듀얼 스피커", desc: "98 dB peak 듀얼 스피커와 inverted tube 구조로 내장 사운드와 반주를 출력합니다.", cx: 120, cy: 635, rx: 42, ry: 42, source: src(7, "Panel Descriptions", "Built-in dual speakers.") },
  { id: "display", face: "back", kor: "하이레스 디스플레이", desc: "현재 사운드, 키, 옥타브, 운지 모드, 상태와 메뉴를 보여줍니다.", cx: 120, cy: 160, rx: 42, ry: 42, source: src(8, "Panel Descriptions", "High-Res display.") },
  { id: "favorites", face: "back", kor: "즐겨찾기 1·2·3", desc: "누르고 있으면 사운드를 저장하고, 짧게 누르면 저장한 사운드를 불러옵니다.", keyIds: ["FAVORITE_1", "FAVORITE_2", "FAVORITE_3"], cx: 120, cy: 236, rx: 52, ry: 20, source: src(8, "Panel Descriptions", "Favorite buttons.") },
  { id: "dpad", face: "back", kor: "방향키와 OK", desc: "메뉴를 이동하고 설정을 확인합니다. OK는 들어가기와 확정 역할입니다.", keyIds: ["DPAD_UP", "DPAD_DOWN", "DPAD_LEFT", "DPAD_RIGHT", "OK"], cx: 120, cy: 304, rx: 58, ry: 58, source: src(8, "Panel Descriptions", "Directional buttons and OK.") },
  { id: "octaveRollers", face: "back", kor: "옥타브 롤러", desc: "8개의 터치 롤러 사이를 엄지로 미끄러지며 7개의 옥타브 범위를 오갑니다.", keyIds: ["OCT_ROLLER_1", "OCT_ROLLER_2", "OCT_ROLLER_3", "OCT_ROLLER_4", "OCT_ROLLER_5", "OCT_ROLLER_6", "OCT_ROLLER_7", "OCT_ROLLER_8"], cx: 90, cy: 430, rx: 28, ry: 106, source: src(8, "Panel Descriptions", "Octave rollers.") },
  { id: "portamento", face: "back", kor: "포르타멘토 플레이트", desc: "엄지 접촉 면적에 따라 음 사이를 부드럽게 이어주는 글라이드 효과를 냅니다.", keyIds: ["PORTAMENTO_PLATE"], cx: 129, cy: 430, rx: 13, ry: 110, source: src(8, "Panel Descriptions", "Portamento plate.") },
  { id: "pitchBend", face: "back", kor: "피치 벤드 플레이트", desc: "위/아래 플레이트로 음을 휘게 만듭니다. 엄지 받침을 달면 상단 플레이트는 비활성화됩니다.", keyIds: ["PITCH_BEND_UP", "PITCH_BEND_DOWN"], cx: 120, cy: 568, rx: 44, ry: 80, source: src(9, "Panel Descriptions", "Pitch bend plates and thumb hook.") },
  { id: "thumbHook", face: "back", kor: "탈착식 엄지 받침", desc: "연주 자세를 안정적으로 받쳐 줍니다. 분리하면 상단 피치 벤드 플레이트를 사용할 수 있어요.", keyIds: ["THUMB_HOOK"], cx: 155, cy: 548, rx: 22, ry: 38, source: src(9, "Panel Descriptions", "Detachable thumb hook.") },
  { id: "fnVoice", face: "back", kor: "FN·Voice 버튼", desc: "FN은 단축 조합, Voice는 음성 명령을 담당합니다.", keyIds: ["FN", "VOICE"], cx: 120, cy: 700, rx: 40, ry: 22, source: src(10, "Panel Descriptions", "FN and voice button.") },
];

export const PRO_C20_PART_BY_ID = Object.fromEntries(PRO_C20_PARTS.map((part) => [part.id, part])) as Record<string, ProC20Part>;
