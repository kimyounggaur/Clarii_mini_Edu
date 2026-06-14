export interface ProC20SaxophoneRule {
  id: string;
  title: string;
  body: string;
  source: { manualPage: number; pdfPage: number; heading: string };
}

export const PRO_C20_SAXOPHONE_RULES: ProC20SaxophoneRule[] = [
  {
    id: "lp1-c-g",
    title: "LP1은 C와 G에서만 +1 semi",
    body: "Saxophone fingering mode에서 LP1은 C 또는 G를 연주할 때만 반음을 올리는 키로 동작합니다.",
    source: { manualPage: 63, pdfPage: 35, heading: "Saxophone Fingering" },
  },
  {
    id: "asterisk-defaults",
    title: "⿵는 기본 inactive, ⿶는 +1 semi",
    body: "⿵ 키는 기본적으로 비활성이고, ⿶ 키는 다른 기능으로 재지정하지 않았다면 모든 음에서 +1 semi로 동작합니다.",
    source: { manualPage: 63, pdfPage: 35, heading: "Saxophone Fingering" },
  },
  {
    id: "rp2-c-lp2",
    title: "RP2는 C + LP2 상황에서만 -1 semi",
    body: "RP2는 LP2 키가 눌린 상태에서 C를 연주할 때만 -1 semi 역할을 합니다. Controllers에서 RP2를 -1 semi로 설정해야 합니다.",
    source: { manualPage: 63, pdfPage: 35, heading: "Saxophone Fingering" },
  },
  {
    id: "rp1-d",
    title: "RP1은 D에서만 +1 semi",
    body: "RP1은 D를 연주할 때만 +1 semi 역할을 합니다. 다른 기능으로 지정하면 해당 기능이 전역으로 동작할 수 있습니다.",
    source: { manualPage: 64, pdfPage: 35, heading: "Saxophone Fingering" },
  },
  {
    id: "bis-b",
    title: "Bis는 B에서만 -1 semi",
    body: "Bis 키는 B를 연주할 때만 -1 semi 역할을 하며, C key 기준으로 B flat을 만듭니다.",
    source: { manualPage: 64, pdfPage: 35, heading: "Saxophone Fingering" },
  },
  {
    id: "pro-mode-reset",
    title: "Pro Mode로 기본 설정 복원",
    body: "side key와 pinky key를 Saxophone fingering 기본 설정으로 빠르게 되돌리려면 음성 명령 Pro Mode를 사용하거나 초기 튜토리얼에서 Pro Mode와 Saxophone fingering mode를 선택합니다.",
    source: { manualPage: 64, pdfPage: 35, heading: "Saxophone Fingering" },
  },
];

export const PRO_C20_SAXOPHONE_RULE_BY_ID = Object.fromEntries(
  PRO_C20_SAXOPHONE_RULES.map((rule) => [rule.id, rule]),
) as Record<string, ProC20SaxophoneRule>;
