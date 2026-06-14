import type { KeyId } from "../../data/keys";

/**
 * 클라리 미니 SVG 키 좌표 상수 — 설계 문서 STEP 2 값.
 * 좌표·크기는 여기서만 관리한다 (컴포넌트 하드코딩 금지).
 *
 * 불변 규칙:
 * (a) 음표 키 7개는 한 세로축(cx 120) 위 — 상단 3 = 왼손 / 하단 4 = 오른손, 사이가 살짝 벌어짐
 * (b) ♯/♭ 키는 그 사이 오른쪽 옆에 작게
 * (c) 뒷면은 위에서부터 디스플레이 → OK → +1 → 쉼 원 → −1 → 후크 순서
 */

export const VIEWBOX = "0 0 240 760";
export const VIEW_W = 240;
export const VIEW_H = 760;

/** 본체 실루엣 (앞·뒷면 공통) */
export const BODY = {
  left: 73,
  right: 167,
  top: 148,
  bottom: 742,
  topNarrow: 5, // 위가 살짝 좁음
  cornerR: 24,
  outline: "#777FA9",
  outlineWidth: 1.5,
};

/** 마우스피스: 실제 Clarii Mini처럼 길고 둥근 실리콘 캡 + 보라색 넥 */
export const MOUTHPIECE = { cx: 120, top: 3, bottom: 148, width: 78, lipWidth: 66 };

/** 앞면 로고 점 */
export const LOGO_DOT = { cx: 120, cy: 216, r: 5 };

/** 스피커 그릴: 실제 이미지와 같은 작은 타공 6×6 격자 */
export const SPEAKER = { cx: 120, top: 672, rows: 6, cols: 6, gapX: 8, gapY: 7, dotR: 1.85 };

/** RGB 라이트 링: 하단 보라색 캡 위의 얇은 청색 라이트 밴드 */
export const RGB_RING = { cx: 120, cy: 720, width: 90, height: 14, r: 7 };

export interface CircleKeyPos {
  kind: "circle";
  id: KeyId;
  cx: number;
  cy: number;
  r: number;
}
export interface PillKeyPos {
  kind: "pill";
  id: KeyId;
  cx: number;
  cy: number;
  w: number;
  h: number;
}
export type KeyPos = CircleKeyPos | PillKeyPos;

/** 앞면 키 좌표 */
export const FRONT_KEYS: KeyPos[] = [
  { kind: "circle", id: "K1", cx: 120, cy: 287, r: 20 },
  { kind: "circle", id: "K2", cx: 120, cy: 351, r: 20 },
  { kind: "circle", id: "K3", cx: 120, cy: 426, r: 20 },
  { kind: "pill", id: "SHARP", cx: 165, cy: 466, w: 24, h: 15 },
  { kind: "pill", id: "FLAT", cx: 165, cy: 491, w: 24, h: 15 },
  { kind: "circle", id: "K4", cx: 120, cy: 550, r: 20 },
  { kind: "circle", id: "K5", cx: 120, cy: 603, r: 20 },
  { kind: "circle", id: "K6", cx: 120, cy: 653, r: 20 },
  { kind: "circle", id: "K7", cx: 85, cy: 611, r: 16 },
];

/** 뒷면 키 좌표 */
export const BACK_KEYS: KeyPos[] = [
  { kind: "pill", id: "OCT_UP2", cx: 120, cy: 245, w: 38, h: 18 },
  { kind: "circle", id: "OCT_UP", cx: 120, cy: 292, r: 18 },
  { kind: "circle", id: "OCT_DOWN", cx: 120, cy: 380, r: 16 },
];

/** 뒷면 비키(非키) 요소 */
export const BACK_DISPLAY = { cx: 120, cy: 205, w: 54, h: 40, r: 7 };
export const THUMB_REST = { cx: 120, cy: 335, r: 9 }; // 점선 원, 키 아님
export const THUMB_HOOK = { cx: 120, cy: 505, w: 42, h: 28 }; // ㄱ자 돌기
export const STRAP_RING = { cx: 120, cy: 675, r: 7 };

/** 탭 히트영역 최소 반경 (실제 키보다 크게) */
export const MIN_HIT_R = 22;

/** 본체 그라데이션 색 (화이트 무광 질감) */
export const BODY_GRADIENT = { from: "#FFFFFF", to: "#E9EBEF" };

/** 뗀 키(○) 테두리 */
export const RELEASED_STROKE = "#4E5374";

/** L0 부위 학습용 부위 정의 */
export interface PartDef {
  id: string;
  face: "front" | "back";
  kor: string;
  desc: string;
  /** 히트/말풍선 기준 좌표 */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export const PARTS: PartDef[] = [
  { id: "mouthpiece", face: "front", kor: "마우스피스", desc: "무는 곳이에요. 빨대처럼 입술로 가볍게 감싸요.", cx: 120, cy: 72, rx: 42, ry: 70 },
  { id: "noteKeys", face: "front", kor: "음표 키 7개", desc: "위 3개는 왼손, 아래 4개는 오른손. 터치 키라 힘이 필요 없어요.", cx: 120, cy: 476, rx: 48, ry: 210 },
  { id: "semitoneKeys", face: "front", kor: "♯/♭ 반음 키", desc: "왼손 새끼손가락 자리. 누르는 동안 반음을 올리고 내려요.", cx: 165, cy: 479, rx: 19, ry: 30 },
  { id: "speaker", face: "front", kor: "스피커", desc: "소리가 나오는 곳이에요.", cx: 120, cy: 690, rx: 32, ry: 26 },
  { id: "ring", face: "front", kor: "RGB 라이트 링", desc: "연주할 때 무지개빛으로 빛나는 라이트예요.", cx: 120, cy: 720, rx: 48, ry: 14 },
  { id: "display", face: "back", kor: "디스플레이", desc: "지금 나는 음이름이 표시돼요.", cx: 120, cy: 205, rx: 32, ry: 25 },
  { id: "octaveKeys", face: "back", kor: "옥타브 키 3개", desc: "OK(+2) · +1 · −1. 같은 운지를 위아래 층으로 옮기는 엘리베이터!", cx: 120, cy: 310, rx: 32, ry: 96 },
  { id: "thumbRest", face: "back", kor: "엄지 쉼 원", desc: "평소 왼손 엄지가 쉬는 자리예요. 키가 아니에요.", cx: 120, cy: 335, rx: 18, ry: 14 },
  { id: "thumbHook", face: "back", kor: "엄지 후크", desc: "오른손 엄지를 아래에 받쳐 악기를 지탱해요.", cx: 120, cy: 505, rx: 30, ry: 22 },
  { id: "strapRing", face: "back", kor: "스트랩 링", desc: "목줄을 거는 고리. 걸면 떨어뜨릴 걱정이 없어요.", cx: 120, cy: 675, rx: 16, ry: 14 },
];
