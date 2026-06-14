import { PRO_C20_ASSETS } from "./assets";
import type { ProC20FingeringMode, ProC20KeyId, ProC20TryTarget } from "./types";

export type ProC20Illust =
  | { kind: "svg"; face: "front" | "back"; pressed: ProC20KeyId[]; display?: string }
  | { kind: "image"; src: string; alt: string };

export type ProC20LessonCard =
  | { kind: "explain"; title: string; body: string; illust?: ProC20Illust }
  | { kind: "image"; title: string; body: string; src: string; alt: string }
  | { kind: "parts"; title: string; body: string; requiredCount?: number }
  | { kind: "mode"; title: string; body: string }
  | { kind: "chart"; title: string; body: string; mode?: ProC20FingeringMode }
  | { kind: "try"; instruction: string; target: ProC20TryTarget; group?: string }
  | { kind: "quiz"; question: string; choices: string[]; answerIndex: number; explain?: string }
  | { kind: "rule"; ruleId: string }
  | { kind: "checklist"; title: string; body: string; items: string[] };

export interface ProC20Lesson {
  id: string;
  emoji: string;
  title: string;
  summary: string;
  cards: ProC20LessonCard[];
}

export const PRO_C20_LESSONS: ProC20Lesson[] = [
  {
    id: "P20-L0",
    emoji: "👋",
    title: "PRO C20와 인사하기",
    summary: "Mini와 다른 14-key Boehm 구조와 전용 컨트롤을 먼저 훑어봅니다.",
    cards: [
      {
        kind: "explain",
        title: "Clarii mini와 PRO C20는 다른 악기예요",
        body: "PRO C20는 14-key Boehm layout, 8개 옥타브 롤러, 포르타멘토/피치 벤드 컨트롤을 가진 상위 악기입니다. 이 레슨은 기존 Mini 운지법과 섞지 않고 PRO C20 전용으로 진행합니다.",
        illust: { kind: "svg", face: "front", pressed: [] },
      },
      {
        kind: "image",
        title: "실제 전면 사진 기준으로 보기",
        body: "자료 폴더의 C20 전면 이미지를 앱 안의 SVG와 함께 비교하며 키 위치를 익힙니다.",
        src: PRO_C20_ASSETS.front,
        alt: "Clarii PRO C20 전면 제품 이미지",
      },
      {
        kind: "parts",
        title: "PRO C20 부위 탐색",
        body: "앞면과 뒷면에서 최소 5개 부위를 눌러 이름과 역할을 확인해 보세요.",
        requiredCount: 5,
      },
      {
        kind: "quiz",
        question: "PRO C20 매뉴얼의 기본 구조 설명과 가장 가까운 것은?",
        choices: ["7-key Mini 구조", "14-key Boehm layout", "피아노 건반식 구조", "현악기 프렛 구조"],
        answerIndex: 1,
        explain: "PRO C20는 14-key Boehm layout을 기준으로 설명됩니다.",
      },
    ],
  },
  {
    id: "P20-L1",
    emoji: "✋",
    title: "앞면 노트 키와 보조 키",
    summary: "N1~N7, Bis, LP1/LP2, RP1/RP2/RP3, 아티큘레이션 키 위치를 익힙니다.",
    cards: [
      {
        kind: "explain",
        title: "노트 키는 앞면 중심축에 있어요",
        body: "N1~N7은 기본 음높이를 만드는 주 키입니다. Bis, LP1/LP2, RP1/RP2/RP3, ⿵/⿶는 반음·표현·설정에 따라 역할이 달라지는 보조 키입니다.",
        illust: { kind: "svg", face: "front", pressed: ["N1", "N2", "N3", "N4", "N5", "N6", "N7"] },
      },
      {
        kind: "try",
        instruction: "Bis 키 위치를 찾아 눌러 보세요",
        target: { mode: "robkooSax", entryId: "robkooSax-bis-key" },
        group: "앞면 보조 키 1/3",
      },
      {
        kind: "try",
        instruction: "LP1 키 위치를 찾아 눌러 보세요",
        target: { mode: "robkooSax", entryId: "robkooSax-lp1-key" },
        group: "앞면 보조 키 2/3",
      },
      {
        kind: "try",
        instruction: "LP2 키 위치를 찾아 눌러 보세요",
        target: { mode: "robkooSax", entryId: "robkooSax-lp2-key" },
        group: "앞면 보조 키 3/3",
      },
      {
        kind: "quiz",
        question: "Bis, LP1, LP2는 어떤 영역에 있는 키인가요?",
        choices: ["왼손 보조 키 영역", "뒷면 디스플레이 영역", "오른손 엄지 후크", "스피커 그릴"],
        answerIndex: 0,
      },
    ],
  },
  {
    id: "P20-L2",
    emoji: "🧭",
    title: "운지 모드 고르기",
    summary: "ROBKOO Sax, EWI, Saxophone 등 10개 운지 모드를 구분합니다.",
    cards: [
      {
        kind: "mode",
        title: "학습할 PRO C20 운지 모드를 선택하세요",
        body: "현재 앱은 검증된 패널 기반 드릴과 부분 전사 데이터만 통과 카드로 제공합니다. 전체 Appendix 운지표는 전사 대기 상태로 표시됩니다.",
      },
      {
        kind: "chart",
        title: "선택한 모드의 전사 상태 보기",
        body: "ROBKOO Sax, EWI, Saxophone은 일부 패널 검증 드릴이 들어 있고, 나머지 모드는 자료 위치와 전사 대기 상태를 보여줍니다.",
      },
      {
        kind: "quiz",
        question: "자료 전사가 끝나지 않은 운지 모드를 앱이 처리하는 방식은?",
        choices: ["임의로 채워 넣는다", "준비 중으로 표시하고 출처를 남긴다", "기존 Mini 운지로 대체한다", "화면에서 숨긴다"],
        answerIndex: 1,
        explain: "정확하지 않은 운지표를 추측하지 않고 준비 중 상태와 출처를 함께 보여줍니다.",
      },
    ],
  },
  {
    id: "P20-L3",
    emoji: "🛗",
    title: "8개 롤러와 7개 옥타브",
    summary: "뒷면 롤러가 M3~P3 옥타브 범위를 담당하는 구조를 익힙니다.",
    cards: [
      {
        kind: "explain",
        title: "엄지로 굴리는 옥타브 롤러",
        body: "PRO C20는 뒷면 8개 터치 롤러로 7개 옥타브 범위에 접근합니다. 이 앱에서는 연습용 범위를 M3, M2, M1, 0, P1, P2, P3로 표시합니다.",
        illust: { kind: "svg", face: "back", pressed: ["OCT_RANGE_M1", "OCT_RANGE_0", "OCT_RANGE_P1"], display: "OCT" },
      },
      {
        kind: "try",
        instruction: "EWI 표준 기준 옥타브 범위 0을 만들어 보세요",
        target: { mode: "ewi", entryId: "ewi-standard-octave-range", requireOctaveRange: true },
      },
      {
        kind: "quiz",
        question: "PRO C20의 옥타브 롤러 설명으로 맞는 것은?",
        choices: ["3개 버튼으로만 이동", "8개 롤러로 7개 범위 접근", "스피커 구멍으로 조절", "FN 버튼만 누르면 자동 변경"],
        answerIndex: 1,
      },
    ],
  },
  {
    id: "P20-L4",
    emoji: "🎛",
    title: "ROBKOO Sax 기본 컨트롤",
    summary: "ROBKOO Sax 모드에서 검증된 Bis, LP1, LP2, 아티큘레이션 드릴을 연습합니다.",
    cards: [
      {
        kind: "chart",
        title: "ROBKOO Sax 부분 운지표",
        body: "현재는 패널 설명으로 확인 가능한 컨트롤 드릴만 제공합니다. Appendix의 실제 음표별 표는 전사 체크리스트에 남겨 두었습니다.",
        mode: "robkooSax",
      },
      {
        kind: "try",
        instruction: "Bis 키만 정확히 눌러 보세요",
        target: { mode: "robkooSax", entryId: "robkooSax-bis-key" },
        group: "ROBKOO Sax 1/4",
      },
      {
        kind: "try",
        instruction: "LP1 키만 정확히 눌러 보세요",
        target: { mode: "robkooSax", entryId: "robkooSax-lp1-key" },
        group: "ROBKOO Sax 2/4",
      },
      {
        kind: "try",
        instruction: "LP2 키만 정확히 눌러 보세요",
        target: { mode: "robkooSax", entryId: "robkooSax-lp2-key" },
        group: "ROBKOO Sax 3/4",
      },
      {
        kind: "try",
        instruction: "⿵ 아티큘레이션 1 키를 찾아 눌러 보세요",
        target: { mode: "robkooSax", entryId: "robkooSax-articulation-1" },
        group: "ROBKOO Sax 4/4",
      },
    ],
  },
  {
    id: "P20-L5",
    emoji: "🌊",
    title: "포르타멘토와 표현 컨트롤",
    summary: "뒷면 포르타멘토 플레이트, 피치 벤드, 엄지 후크 위치를 익힙니다.",
    cards: [
      {
        kind: "image",
        title: "뒷면 엄지 영역",
        body: "자료 이미지의 엄지 후크와 뒷면 플레이트를 확인합니다. 피치 벤드 상단 플레이트는 엄지 후크 장착 시 비활성화될 수 있습니다.",
        src: PRO_C20_ASSETS.backThumbHook,
        alt: "Clarii PRO C20 뒷면 엄지 후크 이미지",
      },
      {
        kind: "try",
        instruction: "포르타멘토 플레이트를 찾아 눌러 보세요",
        target: { mode: "ewi", entryId: "ewi-portamento-plate" },
      },
      {
        kind: "explain",
        title: "표현 컨트롤은 운지와 별도로 움직입니다",
        body: "포르타멘토는 음 사이를 부드럽게 미끄러지게 하고, 피치 벤드는 음정을 위아래로 휘게 합니다. 운지 모드별 실제 동작은 Controllers 설정에 따라 달라질 수 있습니다.",
        illust: { kind: "svg", face: "back", pressed: ["PORTAMENTO_PLATE", "PITCH_BEND_UP", "PITCH_BEND_DOWN"], display: "EXP" },
      },
    ],
  },
  {
    id: "P20-L6",
    emoji: "🎚",
    title: "디스플레이와 즐겨찾기 버튼",
    summary: "디스플레이, Favorite 1/2/3, D-pad, OK, FN, Voice, Bluetooth 위치를 익힙니다.",
    cards: [
      {
        kind: "image",
        title: "디스플레이와 조작부",
        body: "자료 이미지의 노란 디스플레이, 방향 버튼, 즐겨찾기 버튼을 기준으로 앱 SVG의 뒷면 조작부를 확인합니다.",
        src: PRO_C20_ASSETS.displayControls,
        alt: "Clarii PRO C20 디스플레이와 조작부 이미지",
      },
      {
        kind: "explain",
        title: "즐겨찾기와 메뉴 조작",
        body: "Favorite 1/2/3은 사운드 저장·호출, D-pad와 OK는 메뉴 탐색, FN은 단축 조합, Voice와 Bluetooth는 별도 시스템 기능을 담당합니다.",
        illust: { kind: "svg", face: "back", pressed: ["FAVORITE_1", "FAVORITE_2", "FAVORITE_3", "OK"], display: "C20" },
      },
      {
        kind: "quiz",
        question: "OK 버튼의 기본 역할은?",
        choices: ["스피커 구멍 열기", "메뉴에서 확인/진입", "마우스피스 교체", "LP2와 같은 반음 키"],
        answerIndex: 1,
      },
    ],
  },
  {
    id: "P20-L7",
    emoji: "🎷",
    title: "Saxophone 모드 핵심 규칙",
    summary: "LP1, RP1/RP2, Bis, 아티큘레이션 키의 색소폰식 예외 규칙을 배웁니다.",
    cards: [
      { kind: "rule", ruleId: "lp1-c-g" },
      { kind: "rule", ruleId: "asterisk-defaults" },
      { kind: "rule", ruleId: "rp2-c-lp2" },
      { kind: "rule", ruleId: "rp1-d" },
      { kind: "rule", ruleId: "bis-b" },
      {
        kind: "try",
        instruction: "Saxophone 모드 Bis의 B flat 규칙 키를 눌러 보세요",
        target: { mode: "saxophone", entryId: "saxophone-bis-b-flat" },
        group: "Saxophone 규칙 1/3",
      },
      {
        kind: "try",
        instruction: "Saxophone 모드 LP1의 C/G +1 semi 규칙 키를 눌러 보세요",
        target: { mode: "saxophone", entryId: "saxophone-lp1-c-g" },
        group: "Saxophone 규칙 2/3",
      },
      {
        kind: "try",
        instruction: "⿶ 기본 +1 semi 키를 찾아 눌러 보세요",
        target: { mode: "saxophone", entryId: "saxophone-asterisk-2" },
        group: "Saxophone 규칙 3/3",
      },
    ],
  },
  {
    id: "P20-L8",
    emoji: "🧩",
    title: "Pro Mode와 설정 안전장치",
    summary: "Saxophone 모드 기본값을 되돌리는 Pro Mode 개념을 익힙니다.",
    cards: [
      { kind: "rule", ruleId: "pro-mode-reset" },
      {
        kind: "explain",
        title: "운지 모드와 컨트롤러 설정은 분리해서 생각해요",
        body: "Saxophone fingering mode를 선택해도 pinky/side key 설정이 바뀌어 있으면 매뉴얼과 다르게 동작할 수 있습니다. 학습 전 Pro Mode 또는 초기 튜토리얼로 기본값을 맞추는 흐름을 넣었습니다.",
        illust: { kind: "svg", face: "back", pressed: ["FN", "VOICE", "OK"], display: "PRO" },
      },
      {
        kind: "quiz",
        question: "Saxophone 기본 side/pinky 설정을 빠르게 복원하는 매뉴얼 흐름은?",
        choices: ["Pro Mode", "Bluetooth pairing", "Speaker mode", "Factory color theme"],
        answerIndex: 0,
      },
    ],
  },
  {
    id: "P20-L9",
    emoji: "📋",
    title: "전사 대기 운지표 읽는 법",
    summary: "준비 중 모드가 왜 잠겨 있는지, 어떤 자료를 기준으로 전사해야 하는지 확인합니다.",
    cards: [
      {
        kind: "chart",
        title: "Whistle 모드 상태 확인",
        body: "Whistle은 Basic, Acoustic, Express 1/2/3 행이 있어 실제 표 전사가 끝나기 전까지 통과형 운지 드릴로 쓰지 않습니다.",
        mode: "whistle",
      },
      {
        kind: "checklist",
        title: "운지표 전사 검수 체크",
        body: "다음 항목을 모두 만족해야 이 앱에서 새 운지 드릴을 '검증됨'으로 열 수 있습니다.",
        items: [
          "Appendix 표의 행/열 라벨과 페이지를 함께 기록했다.",
          "누른 키와 떼는 키를 이미지 확대 상태에서 2회 이상 대조했다.",
          "동일 음의 alternate fingering은 variant로 분리했다.",
          "mode, group, source, verification 필드를 모두 채웠다.",
        ],
      },
    ],
  },
  {
    id: "P20-L10",
    emoji: "🏁",
    title: "PRO C20 첫 점검",
    summary: "앞면, 뒷면, 모드, 규칙을 모두 훑으며 학습 흐름을 마무리합니다.",
    cards: [
      {
        kind: "explain",
        title: "이제 Mini와 PRO C20를 구분해서 볼 수 있어요",
        body: "Mini 레슨은 기존 7키 학습용, PRO C20 레슨은 14-key Boehm layout과 매뉴얼 출처 기반 컨트롤 학습용입니다.",
        illust: { kind: "svg", face: "front", pressed: ["N1", "N2", "N3", "BIS", "LP1", "LP2"] },
      },
      {
        kind: "try",
        instruction: "마지막 확인: 포르타멘토 플레이트를 눌러 보세요",
        target: { mode: "ewi", entryId: "ewi-portamento-plate" },
        group: "최종 점검 1/2",
      },
      {
        kind: "try",
        instruction: "마지막 확인: Saxophone 모드 Bis 키를 눌러 보세요",
        target: { mode: "saxophone", entryId: "saxophone-bis-b-flat" },
        group: "최종 점검 2/2",
      },
      {
        kind: "quiz",
        question: "앱이 실제 Appendix 운지표를 아직 전사하지 않은 경우 가장 올바른 표기는?",
        choices: ["검증됨", "준비 중", "Mini 운지", "랜덤 운지"],
        answerIndex: 1,
      },
    ],
  },
];

export const PRO_C20_LESSON_BY_ID = Object.fromEntries(
  PRO_C20_LESSONS.map((lesson) => [lesson.id, lesson]),
) as Record<string, ProC20Lesson>;
