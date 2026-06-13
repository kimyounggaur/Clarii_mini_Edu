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
  left: 78,
  right: 162,
  top: 96,
  bottom: 746,
  topNarrow: 6, // 위가 살짝 좁음
  cornerR: 38,
  outline: "#C9CDD4",
  outlineWidth: 2,
};

/** 마우스피스: 끝이 둥근 납작한 부리, 본체보다 살짝 좁게 (y 14~92) */
export const MOUTHPIECE = { cx: 120, top: 14, bottom: 96, width: 56, lipWidth: 40 };

/** 앞면 로고 점 */
export const LOGO_DOT = { cx: 120, cy: 116, r: 5 };

/** 스피커 그릴: 점 4×6 격자 (y 638~668) */
export const SPEAKER = { cx: 120, top: 636, rows: 4, cols: 6, gapX: 11, gapY: 10, dotR: 2.2 };

/** RGB 라이트 링: 가로 밴드 (y 700 부근), 평소엔 연회색 */
export const RGB_RING = { cx: 120, cy: 702, width: 76, height: 10, r: 5 };

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
  { kind: "circle", id: "K1", cx: 120, cy: 178, r: 21 },
  { kind: "circle", id: "K2", cx: 120, cy: 238, r: 21 },
  { kind: "circle", id: "K3", cx: 120, cy: 298, r: 21 },
  { kind: "pill", id: "SHARP", cx: 163, cy: 342, w: 26, h: 13 },
  { kind: "pill", id: "FLAT", cx: 163, cy: 364, w: 26, h: 13 },
  { kind: "circle", id: "K4", cx: 120, cy: 414, r: 21 },
  { kind: "circle", id: "K5", cx: 120, cy: 471, r: 21 },
  { kind: "circle", id: "K6", cx: 120, cy: 528, r: 21 },
  { kind: "circle", id: "K7", cx: 120, cy: 585, r: 21 },
];

/** 뒷면 키 좌표 */
export const BACK_KEYS: KeyPos[] = [
  { kind: "pill", id: "OCT_UP2", cx: 120, cy: 210, w: 34, h: 16 },
  { kind: "circle", id: "OCT_UP", cx: 120, cy: 252, r: 17 },
  { kind: "circle", id: "OCT_DOWN", cx: 120, cy: 330, r: 15 },
];

/** 뒷면 비키(非키) 요소 */
export const BACK_DISPLAY = { cx: 120, cy: 150, w: 56, h: 44, r: 8 };
export const THUMB_REST = { cx: 120, cy: 292, r: 9 }; // 점선 원, 키 아님
export const THUMB_HOOK = { cx: 120, cy: 470, w: 40, h: 26 }; // ㄱ자 돌기
export const STRAP_RING = { cx: 120, cy: 660, r: 7 };

/** 탭 히트영역 최소 반경 (실제 키보다 크게) */
export const MIN_HIT_R = 22;

/** 본체 그라데이션 색 (화이트 무광 질감) */
export const BODY_GRADIENT = { from: "#FFFFFF", to: "#E9EBEF" };

/** 뗀 키(○) 테두리 */
export const RELEASED_STROKE = "#B8BDC6";

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
  { id: "mouthpiece", face: "front", kor: "마우스피스", desc: "무는 곳이에요. 빨대처럼 입술로 가볍게 감싸요.", cx: 120, cy: 52, rx: 34, ry: 42 },
  { id: "noteKeys", face: "front", kor: "음표 키 7개", desc: "위 3개는 왼손, 아래 4개는 오른손. 터치 키라 힘이 필요 없어요.", cx: 120, cy: 380, rx: 30, ry: 230 },
  { id: "semitoneKeys", face: "front", kor: "♯/♭ 반음 키", desc: "왼손 새끼손가락 자리. 누르는 동안 반음을 올리고 내려요.", cx: 163, cy: 353, rx: 20, ry: 26 },
  { id: "speaker", face: "front", kor: "스피커", desc: "소리가 나오는 곳이에요.", cx: 120, cy: 652, rx: 34, ry: 22 },
  { id: "ring", face: "front", kor: "RGB 라이트 링", desc: "연주할 때 무지개빛으로 빛나는 라이트예요.", cx: 120, cy: 702, rx: 42, ry: 10 },
  { id: "display", face: "back", kor: "디스플레이", desc: "지금 나는 음이름이 표시돼요.", cx: 120, cy: 150, rx: 32, ry: 26 },
  { id: "octaveKeys", face: "back", kor: "옥타브 키 3개", desc: "OK(+2) · +1 · −1. 같은 운지를 위아래 층으로 옮기는 엘리베이터!", cx: 120, cy: 268, rx: 30, ry: 80 },
  { id: "thumbRest", face: "back", kor: "엄지 쉼 원", desc: "평소 왼손 엄지가 쉬는 자리예요. 키가 아니에요.", cx: 120, cy: 292, rx: 18, ry: 14 },
  { id: "thumbHook", face: "back", kor: "엄지 후크", desc: "오른손 엄지를 아래에 받쳐 악기를 지탱해요.", cx: 120, cy: 470, rx: 28, ry: 20 },
  { id: "strapRing", face: "back", kor: "스트랩 링", desc: "목줄을 거는 고리. 걸면 떨어뜨릴 걱정이 없어요.", cx: 120, cy: 660, rx: 16, ry: 14 },
];
