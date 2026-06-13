import type { ResolvedNote } from "../data/notes";

/**
 * 직접 그린 SVG 오선보 (외부 라이브러리 금지).
 * 다이어토닉 스텝: 국제 표기 C4(=기기 C3, midi 60) = step 0,
 * 맨 아래 줄(E4) = step 2, y(step) = E4줄 y − (step − 2) × 7.
 */

const LETTER_INDEX: Record<string, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
const BOTTOM_LINE_Y = 123; // E4 줄
const LINE_GAP = 14;
const NOTE_X = 205;

function yOf(step: number): number {
  return BOTTOM_LINE_Y - (step - 2) * (LINE_GAP / 2);
}

export function StaffNotation({ note, className }: { note: ResolvedNote; className?: string }) {
  const letterIdx = LETTER_INDEX[note.natural.letter] ?? 0;
  const intlOct = 4 + note.layer + (note.natural.pc >= 12 ? 1 : 0);
  const realStep = (intlOct - 4) * 7 + letterIdx;

  // +2층(midi 84~96)은 한 옥타브 낮춰 그리고 8va 표시 → 덧줄 과다 방지
  const useOttava = note.layer >= 2;
  const step = useOttava ? realStep - 7 : realStep;
  const noteY = yOf(step);

  // 덧줄: step ≤ 0은 아래, step ≥ 12는 위, 짝수 step 위치마다
  const ledgers: number[] = [];
  for (let s = 0; s >= step; s -= 2) ledgers.push(s);
  for (let s = 12; s <= step; s += 2) ledgers.push(s);

  const stemUp = step < 6;
  const accidentalGlyph =
    note.accidental === "sharp" ? "♯" : note.accidental === "flat" ? "♭" : null;

  return (
    <svg
      viewBox="0 0 320 190"
      className={className}
      role="img"
      aria-label={`악보: ${note.korName} (${note.robkooName})`}
    >
      {/* 오선 5줄 */}
      {Array.from({ length: 5 }).map((_, i) => (
        <line
          key={i}
          x1={10}
          x2={310}
          y1={BOTTOM_LINE_Y - i * LINE_GAP}
          y2={BOTTOM_LINE_Y - i * LINE_GAP}
          stroke="#9AA1AA"
          strokeWidth={1.4}
        />
      ))}
      {/* 높은음자리표 */}
      <text x={16} y={BOTTOM_LINE_Y + 9} fontSize={76} fill="#1A1D21" aria-hidden>
        {"\u{1D11E}"}
      </text>

      {/* 덧줄 */}
      {ledgers.map((s) => (
        <line
          key={s}
          x1={NOTE_X - 16}
          x2={NOTE_X + 16}
          y1={yOf(s)}
          y2={yOf(s)}
          stroke="#9AA1AA"
          strokeWidth={1.4}
        />
      ))}

      {/* 8va 점선 브래킷 */}
      {useOttava && (
        <g aria-hidden>
          <text x={NOTE_X - 38} y={noteY - 26} fontSize={16} fontStyle="italic" fontWeight={700} fill="#1A1D21">
            8va
          </text>
          <path
            d={`M ${NOTE_X - 8} ${noteY - 32} H ${NOTE_X + 44} V ${noteY - 24}`}
            fill="none"
            stroke="#1A1D21"
            strokeWidth={1.4}
            strokeDasharray="5 4"
          />
        </g>
      )}

      {/* 임시표 */}
      {accidentalGlyph && (
        <text x={NOTE_X - 31} y={noteY + 8} fontSize={28} fill="#1A1D21" aria-hidden>
          {accidentalGlyph}
        </text>
      )}

      {/* 음표: 살짝 기울어진 타원 머리 + 기둥 */}
      <g aria-hidden>
        <ellipse
          cx={NOTE_X}
          cy={noteY}
          rx={9.2}
          ry={6.6}
          fill="#1A1D21"
          transform={`rotate(-15 ${NOTE_X} ${noteY})`}
        />
        {stemUp ? (
          <line x1={NOTE_X + 8.4} x2={NOTE_X + 8.4} y1={noteY - 2} y2={noteY - 44} stroke="#1A1D21" strokeWidth={2.2} />
        ) : (
          <line x1={NOTE_X - 8.4} x2={NOTE_X - 8.4} y1={noteY + 2} y2={noteY + 44} stroke="#1A1D21" strokeWidth={2.2} />
        )}
      </g>
    </svg>
  );
}
