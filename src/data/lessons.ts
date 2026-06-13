import type { Accidental, LayerNum } from "./notes";
import type { KeyId } from "./keys";

/* ---------- 레슨 카드 타입 ---------- */

export interface TryTarget {
  noteId: string;
  layer: LayerNum;
  accidental?: Accidental;
  /** ♯/♭ 키 대신 교차운지로 만들어야 통과 */
  useCross?: boolean;
}

export type LessonCard =
  | { kind: "explain"; title: string; body: string; illust?: { face: "front" | "back"; pressed: KeyId[]; display?: string } | { emoji: string } }
  | { kind: "parts"; title: string }
  | { kind: "try"; instruction: string; target: TryTarget; group?: string }
  | { kind: "quiz"; question: string; choices: string[]; answerIndex: number; explain?: string }
  | { kind: "breath"; title: string; body: string }
  | { kind: "longtone"; noteId: string; seconds: number; reps: number; body: string }
  | { kind: "song"; title: string; body: string };

export interface Lesson {
  id: string;
  emoji: string;
  title: string;
  cards: LessonCard[];
  /** 완료 시 자동으로 켜지는 설정 */
  unlocks?: "showSemitones" | "showAdvanced";
}

/* ---------- 12개 레슨 커리큘럼 (공식 매뉴얼 흐름 그대로) ---------- */

export const LESSONS: Lesson[] = [
  {
    id: "L0",
    emoji: "👋",
    title: "클라리 미니와 인사하기",
    cards: [
      {
        kind: "explain",
        title: "부위 이름 익히기",
        body: "위에서부터 — 마우스피스(무는 곳), 앞면 음표 키 7개, 측면 ♯/♭ 키, 스피커, RGB 라이트 링. 뒷면에는 디스플레이, 옥타브 키 3개(OK·+1·−1), 엄지 쉼 원, 엄지 후크, 스트랩 링이 있어요.",
        illust: { face: "front", pressed: [] },
      },
      { kind: "parts", title: "부위를 직접 탭해 보세요" },
      {
        kind: "quiz",
        question: "음의 높낮이를 결정하는 것은?",
        choices: ["키(손가락)", "입김의 세기", "무는 힘", "악기의 기울기"],
        answerIndex: 0,
        explain: "입김은 음량을 담당해요 — 음정은 손가락, 음량은 숨!",
      },
    ],
  },
  {
    id: "L1",
    emoji: "✋",
    title: "바르게 잡기",
    cards: [
      {
        kind: "explain",
        title: "왼손이 위, 오른손이 아래",
        body: "왼손 검지·중지·약지를 위 3개 키에, 오른손 검지~새끼를 아래 4개 키에 올려요.",
        illust: { face: "front", pressed: ["K1", "K2", "K3", "K4", "K5", "K6", "K7"] },
      },
      {
        kind: "explain",
        title: "두 엄지가 악기를 지탱해요",
        body: "왼손 엄지는 뒷면 옥타브 키 사이의 '쉼 원' 위에, 오른손 엄지는 엄지 후크 아래에 받쳐요 — 이 두 엄지가 악기를 지탱합니다.",
        illust: { face: "back", pressed: [], display: "C3" },
      },
      {
        kind: "explain",
        title: "목줄(스트랩) 걸기",
        body: "목줄(스트랩)을 걸면 떨어뜨릴 걱정 없이 손가락이 자유로워져요.",
        illust: { emoji: "🪢" },
      },
      {
        kind: "quiz",
        question: "평소 왼손 엄지가 있어야 할 곳은?",
        choices: ["옥타브 키 사이의 쉼 원", "OK 키 위", "[−1] 키 위", "엄지 후크 아래"],
        answerIndex: 0,
      },
    ],
  },
  {
    id: "L2",
    emoji: "🔌",
    title: "켜기와 키 초기화",
    cards: [
      {
        kind: "explain",
        title: "전원 켜고 끄기",
        body: "전원 버튼(뒷면 아래)을 2초 누르면 켜져요. 끌 땐 3초.",
        illust: { face: "back", pressed: [], display: "ON" },
      },
      {
        kind: "explain",
        title: "키 초기화 습관",
        body: "터치 키라서 켤 때 키에 손가락이 닿아 있으면 오작동할 수 있어요 → 켠 직후 \"모든 키에서 손을 뗐다가, 다시 일곱 키를 한 번 모두 눌렀다 떼기\" = 키 초기화 습관!",
        illust: { face: "front", pressed: ["K1", "K2", "K3", "K4", "K5", "K6", "K7"] },
      },
      {
        kind: "explain",
        title: "마우스피스 무는 법",
        body: "마우스피스는 빨대처럼 입술로 가볍게 감싸요. 절대 세게 깨물지 않기!",
        illust: { emoji: "😙" },
      },
      {
        kind: "quiz",
        question: "OX 퀴즈 — \"전원을 켤 때는 일곱 키를 모두 누른 채 켜는 것이 좋다\"",
        choices: ["O", "X"],
        answerIndex: 1,
        explain: "켤 때는 모든 키에서 손을 떼고, 켠 다음 일곱 키를 모두 눌렀다 떼는 게 좋아요.",
      },
    ],
  },
  {
    id: "L3",
    emoji: "🎵",
    title: "첫 소리 내기 — \"시\"",
    cards: [
      {
        kind: "explain",
        title: "가장 쉬운 음, 시",
        body: "운지는 가장 쉬운 \"시\" — K1(왼손 검지) 하나만 누릅니다.",
        illust: { face: "front", pressed: ["K1"] },
      },
      {
        kind: "explain",
        title: "텅잉 — \"투-\"",
        body: "혀로 \"투-\" 하고 시작해요(텅잉). 입김은 끝까지 일정하게.",
        illust: { emoji: "💨" },
      },
      {
        kind: "breath",
        title: "숨과 음량 체험",
        body: "숨을 세게 불면 크게, 여리게 불면 작게 — 음정은 변하지 않아요! 슬라이더로 직접 들어 보세요.",
      },
      { kind: "try", instruction: "시 운지를 만들어 보세요", target: { noteId: "si", layer: 0 } },
      {
        kind: "longtone",
        noteId: "si",
        seconds: 3,
        reps: 3,
        body: "재생 버튼과 함께 3초 길게 불기 × 3회 — 앱이 시 음을 3초 재생하면 따라 불어 보세요.",
      },
    ],
  },
  {
    id: "L4",
    emoji: "🤚",
    title: "왼손 익히기 — 시·라·솔",
    cards: [
      {
        kind: "explain",
        title: "하나씩 추가하며 내려가기",
        body: "시(K1) → 라(K1+K2) → 솔(K1+K2+K3) 순서로 하나씩 추가하며 내려가요.",
        illust: { face: "front", pressed: ["K1", "K2", "K3"] },
      },
      { kind: "try", instruction: "시 운지를 만들어 보세요", target: { noteId: "si", layer: 0 }, group: "시→라→솔 1/3" },
      { kind: "try", instruction: "라 운지를 만들어 보세요 (K2를 추가!)", target: { noteId: "la", layer: 0 }, group: "시→라→솔 2/3" },
      { kind: "try", instruction: "솔 운지를 만들어 보세요 (K3를 추가!)", target: { noteId: "sol", layer: 0 }, group: "시→라→솔 3/3" },
      {
        kind: "quiz",
        question: "라에서 솔로 갈 때 더 누르는 손가락은?",
        choices: ["왼손 약지(K3)", "왼손 중지(K2)", "오른손 검지(K4)", "오른손 새끼(K7)"],
        answerIndex: 0,
      },
    ],
  },
  {
    id: "L5",
    emoji: "🙌",
    title: "오른손 합류 — 파·미·레·도",
    cards: [
      {
        kind: "explain",
        title: "오른손을 위에서부터 하나씩",
        body: "왼손 셋을 누른 채, 오른손을 위에서부터 하나씩 추가해요: 파(+K4) → 미(+K5) → 레(+K6) → 도(+K7, 전부!)",
        illust: { face: "front", pressed: ["K1", "K2", "K3", "K4", "K5", "K6", "K7"] },
      },
      { kind: "try", instruction: "파 운지를 만들어 보세요 (솔에서 K4 추가)", target: { noteId: "fa", layer: 0 }, group: "파→도 1/4" },
      { kind: "try", instruction: "미 운지를 만들어 보세요 (K5 추가)", target: { noteId: "mi", layer: 0 }, group: "파→도 2/4" },
      { kind: "try", instruction: "레 운지를 만들어 보세요 (K6 추가)", target: { noteId: "re", layer: 0 }, group: "파→도 3/4" },
      { kind: "try", instruction: "도 운지를 만들어 보세요 (K7까지 전부!)", target: { noteId: "do", layer: 0 }, group: "파→도 4/4" },
      {
        kind: "quiz",
        question: "도 운지에서 누르는 키는 모두 몇 개?",
        choices: ["5개", "6개", "7개(전부)", "8개"],
        answerIndex: 2,
      },
    ],
  },
  {
    id: "L6",
    emoji: "🪜",
    title: "한 옥타브 완성 — 높은 도",
    cards: [
      {
        kind: "explain",
        title: "위로 갈 땐 아래 키부터 떼기",
        body: "도에서 위로 올라갈 땐 반대로 \"아래 키부터 하나씩 떼기\". 시 다음의 높은 도는 특별해요: K1을 떼고 K2 하나만!",
        illust: { face: "front", pressed: ["K2"] },
      },
      { kind: "try", instruction: "시에서 높은 도로! (K1을 떼고 K2만)", target: { noteId: "hido", layer: 0 } },
      { kind: "try", instruction: "계단 오르기 — 도부터!", target: { noteId: "do", layer: 0 }, group: "계단 1/8" },
      { kind: "try", instruction: "레 (K7 떼기)", target: { noteId: "re", layer: 0 }, group: "계단 2/8" },
      { kind: "try", instruction: "미 (K6 떼기)", target: { noteId: "mi", layer: 0 }, group: "계단 3/8" },
      { kind: "try", instruction: "파 (K5 떼기)", target: { noteId: "fa", layer: 0 }, group: "계단 4/8" },
      { kind: "try", instruction: "솔 (K4 떼기)", target: { noteId: "sol", layer: 0 }, group: "계단 5/8" },
      { kind: "try", instruction: "라 (K3 떼기)", target: { noteId: "la", layer: 0 }, group: "계단 6/8" },
      { kind: "try", instruction: "시 (K2 떼기)", target: { noteId: "si", layer: 0 }, group: "계단 7/8" },
      { kind: "try", instruction: "높은 도! (K1 떼고 K2만)", target: { noteId: "hido", layer: 0 }, group: "계단 8/8" },
      {
        kind: "quiz",
        question: "높은 도에서 누르는 단 하나의 키는?",
        choices: ["K1(왼손 검지)", "K2(왼손 중지)", "K3(왼손 약지)", "K7(오른손 새끼)"],
        answerIndex: 1,
      },
    ],
  },
  {
    id: "L7",
    emoji: "🛗",
    title: "옥타브 엘리베이터 ① 위로",
    cards: [
      {
        kind: "explain",
        title: "뒷면 옥타브 키 = 엘리베이터",
        body: "같은 운지 그대로, [+1] 키를 누르면 한 층 위, OK 키를 누르면 두 층 위! 엄지는 쉼 원 ↔ 키 사이를 미끄러지듯 이동해요.",
        illust: { face: "back", pressed: ["OCT_UP"], display: "C4" },
      },
      { kind: "try", instruction: "+1층의 도를 만들어 보세요 (앞면 도 + 뒷면 [+1])", target: { noteId: "do", layer: 1 } },
      { kind: "try", instruction: "+2층의 솔을 만들어 보세요 (앞면 솔 + 뒷면 OK 키)", target: { noteId: "sol", layer: 2 } },
      {
        kind: "quiz",
        question: "두 층 위로 가려면 누르는 키는?",
        choices: ["맨 위 OK 키", "[+1] 키", "[−1] 키", "♯ 키"],
        answerIndex: 0,
      },
    ],
  },
  {
    id: "L8",
    emoji: "⬇️",
    title: "옥타브 엘리베이터 ② 아래로",
    cards: [
      {
        kind: "explain",
        title: "한 층 아래로",
        body: "[−1] 키를 누르면 한 층 아래. 낮은 음은 따뜻하고 부드러워요.",
        illust: { face: "back", pressed: ["OCT_DOWN"], display: "C2" },
      },
      { kind: "try", instruction: "−1층의 도를 만들어 보세요", target: { noteId: "do", layer: -1 } },
      { kind: "try", instruction: "−1층의 솔을 만들어 보세요", target: { noteId: "sol", layer: -1 } },
      { kind: "try", instruction: "미니 챌린지! 같은 \"도\"를 층층이 — 먼저 −1층", target: { noteId: "do", layer: -1 }, group: "엄지 이동 1/4" },
      { kind: "try", instruction: "기준층 도 (옥타브 키에서 엄지 떼기)", target: { noteId: "do", layer: 0 }, group: "엄지 이동 2/4" },
      { kind: "try", instruction: "+1층 도 ([+1] 누르기)", target: { noteId: "do", layer: 1 }, group: "엄지 이동 3/4" },
      { kind: "try", instruction: "+2층 도 (OK 키로!)", target: { noteId: "do", layer: 2 }, group: "엄지 이동 4/4" },
    ],
  },
  {
    id: "L9",
    emoji: "✨",
    title: "반음 키 — ♯과 ♭",
    unlocks: "showSemitones",
    cards: [
      {
        kind: "explain",
        title: "마법의 규칙 단 하나",
        body: "어떤 운지든 ♯ 키를 함께 누르면 반음 위, ♭ 키는 반음 아래!",
        illust: { face: "front", pressed: ["K1", "SHARP"] },
      },
      {
        kind: "explain",
        title: "같은 음의 두 이름",
        body: "파♯ = 솔♭ (파+♯ 또는 솔+♭, 소리는 같아요).",
        illust: { emoji: "♯♭" },
      },
      { kind: "try", instruction: "파♯을 만들어 보세요 (파 운지 + ♯ 키)", target: { noteId: "fa", layer: 0, accidental: "sharp" } },
      { kind: "try", instruction: "시♭을 만들어 보세요 (시 운지 + ♭ 키)", target: { noteId: "si", layer: 0, accidental: "flat" } },
    ],
  },
  {
    id: "L10",
    emoji: "🧩",
    title: "고급: 교차운지",
    unlocks: "showAdvanced",
    cards: [
      {
        kind: "explain",
        title: "키 조합만으로 반음 내기",
        body: "♯/♭ 키 없이 키 조합만으로 반음을 내는 방법도 있어요 — 빠른 악절에서 유리! 파♯ = K1+K2+K3+K5 / 솔♯ = K1+K2+K4 / 시♭ = K1+K3 (또는 K1+K4) / 높은 도♯ = 모든 키 떼기.",
        illust: { face: "front", pressed: ["K1", "K2", "K3", "K5"] },
      },
      { kind: "try", instruction: "교차운지로 파♯을 만들어 보세요 (K1+K2+K3+K5)", target: { noteId: "fa", layer: 0, accidental: "sharp", useCross: true } },
      { kind: "try", instruction: "모든 키를 떼서 높은 도♯을 만들어 보세요!", target: { noteId: "hido", layer: 0, accidental: "sharp", useCross: true } },
    ],
  },
  {
    id: "L11",
    emoji: "🎶",
    title: "첫 곡 도전!",
    cards: [
      {
        kind: "explain",
        title: "처음부터 끝까지",
        body: "SongPlayer로 \"비행기\" 또는 \"학교종\"을 처음부터 끝까지 연주해요. 곡을 한 번 완주하면 레슨 완료!",
        illust: { emoji: "🎶" },
      },
      { kind: "song", title: "첫 곡을 골라 완주해 보세요", body: "듣기 모드로 익힌 뒤, 연주 모드로 직접 불어 보세요." },
    ],
  },
];

export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l]),
);
