import { type ReactNode, useId } from "react";
import { KEY_BY_ID, keyColor, type KeyId } from "../../data/keys";
import {
  BODY,
  BODY_GRADIENT,
  MOUTHPIECE,
  RELEASED_STROKE,
  MIN_HIT_R,
  FRONT_KEYS,
  type KeyPos,
} from "./constants";

/* ---------- 본체 셸 (앞·뒷면 공통 실루엣) ---------- */

export function BodyShell({ gradientId }: { gradientId: string }) {
  const { left, right, top, bottom, topNarrow: n, cornerR: cr } = BODY;
  const bodyWidth = right - left;
  const bottomCapTop = bottom - 26;
  const d = [
    `M ${left + n + 7} ${top}`,
    `L ${right - n - 7} ${top}`,
    `C ${right - 5} ${top + 2} ${right} ${top + 24} ${right} ${top + 52}`,
    `L ${right - 1} ${bottom - cr}`,
    `Q ${right - 1} ${bottom} ${right - cr} ${bottom}`,
    `L ${left + cr} ${bottom}`,
    `Q ${left + 1} ${bottom} ${left + 1} ${bottom - cr}`,
    `L ${left} ${top + 52}`,
    `C ${left} ${top + 24} ${left + 5} ${top + 2} ${left + n + 7} ${top}`,
    "Z",
  ].join(" ");
  return (
    <g aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6D739B" />
          <stop offset="13%" stopColor="#A5A9D4" />
          <stop offset="36%" stopColor={BODY_GRADIENT.from} />
          <stop offset="58%" stopColor="#C8CBF2" />
          <stop offset="79%" stopColor={BODY_GRADIENT.to} />
          <stop offset="100%" stopColor="#686F99" />
        </linearGradient>
        <linearGradient id={`${gradientId}-edge`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#39405F" stopOpacity={0.55} />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity={0} />
          <stop offset="100%" stopColor="#333A59" stopOpacity={0.5} />
        </linearGradient>
        <linearGradient id={`${gradientId}-cap`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5154B9" />
          <stop offset="20%" stopColor="#6E72EB" />
          <stop offset="55%" stopColor="#AAA7FF" />
          <stop offset="84%" stopColor="#7470E7" />
          <stop offset="100%" stopColor="#3F4298" />
        </linearGradient>
        <filter id={`${gradientId}-shadow`} x="-25%" y="-4%" width="150%" height="112%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="#10121C" floodOpacity="0.18" />
        </filter>
        <clipPath id={`${gradientId}-clip`}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={`url(#${gradientId})`} stroke={BODY.outline} strokeWidth={BODY.outlineWidth} filter={`url(#${gradientId}-shadow)`} />
      <g clipPath={`url(#${gradientId}-clip)`}>
        <rect x={left} y={top} width={bodyWidth} height={bottom - top} fill={`url(#${gradientId}-edge)`} />
        <rect x={left + 7} y={top + 24} width={8} height={bottom - top - 58} rx={4} fill="#FFFFFF" opacity={0.36} />
        <rect x={left + 23} y={top + 11} width={5} height={bottom - top - 48} rx={2.5} fill="#FFFFFF" opacity={0.18} />
        <rect x={right - 13} y={top + 30} width={5} height={bottom - top - 72} rx={2.5} fill="#303654" opacity={0.2} />
        <rect x={left + 2} y={bottomCapTop} width={bodyWidth - 4} height={28} fill={`url(#${gradientId}-cap)`} />
        <rect x={left + 1} y={bottomCapTop - 3} width={bodyWidth - 2} height={7} rx={3.5} fill="#4964FF" opacity={0.9} />
        <rect x={left + 5} y={top + 4} width={bodyWidth - 10} height={2.5} rx={1.25} fill="#F7F7FF" opacity={0.45} />
      </g>
      <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={0.8} opacity={0.26} />
      <path d={d} fill="none" stroke="#373D62" strokeWidth={0.7} opacity={0.28} />
    </g>
  );
}

/* ---------- 마우스피스 (끝이 둥근 납작한 부리) ---------- */

export function Mouthpiece({ label }: { label?: boolean }) {
  const { cx, top, bottom, width, lipWidth } = MOUTHPIECE;
  const uid = useId().replace(/[:]/g, "");
  const half = width / 2;
  const lipHalf = lipWidth / 2;
  const capBottom = bottom - 24;
  const d = [
    `M ${cx - lipHalf} ${capBottom}`,
    `L ${cx - lipHalf + 2} ${top + 31}`,
    `C ${cx - lipHalf + 2} ${top + 11} ${cx - 20} ${top} ${cx} ${top}`,
    `C ${cx + 20} ${top} ${cx + lipHalf - 2} ${top + 11} ${cx + lipHalf - 2} ${top + 31}`,
    `L ${cx + lipHalf} ${capBottom}`,
    `Q ${cx + lipHalf} ${capBottom + 4} ${cx + lipHalf - 4} ${capBottom + 4}`,
    `L ${cx - lipHalf + 4} ${capBottom + 4}`,
    `Q ${cx - lipHalf} ${capBottom + 4} ${cx - lipHalf} ${capBottom}`,
    "Z",
  ].join(" ");
  return (
    <g aria-hidden>
      <defs>
        <linearGradient id={`mouth-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3E455C" />
          <stop offset="23%" stopColor="#798096" />
          <stop offset="52%" stopColor="#6F768B" />
          <stop offset="82%" stopColor="#4F566E" />
          <stop offset="100%" stopColor="#30364C" />
        </linearGradient>
        <linearGradient id={`neck-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5150AF" />
          <stop offset="35%" stopColor="#8682FF" />
          <stop offset="65%" stopColor="#B2AEFF" />
          <stop offset="100%" stopColor="#5652B8" />
        </linearGradient>
        <linearGradient id={`collar-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#131721" />
          <stop offset="18%" stopColor="#F4F5FA" />
          <stop offset="38%" stopColor="#9CA2B3" />
          <stop offset="58%" stopColor="#262B39" />
          <stop offset="82%" stopColor="#F7F8FE" />
          <stop offset="100%" stopColor="#11151E" />
        </linearGradient>
      </defs>
      <rect x={cx - half + 11} y={capBottom - 2} width={width - 22} height={bottom - capBottom + 16} rx={7} fill={`url(#neck-${uid})`} />
      <rect x={cx - half + 1} y={capBottom + 7} width={width - 2} height={13} rx={6.5} fill={`url(#collar-${uid})`} />
      <path d={d} fill={`url(#mouth-${uid})`} stroke="#2E3346" strokeWidth={1.5} strokeLinejoin="round" />
      <path d={`M ${cx - lipHalf + 10} ${top + 11} C ${cx - 22} ${top + 3} ${cx + 22} ${top + 3} ${cx + lipHalf - 10} ${top + 11}`} fill="none" stroke="#A9AFC0" strokeWidth={1.1} opacity={0.22} />
      <rect x={cx - lipHalf + 7} y={top + 26} width={8} height={capBottom - top - 34} rx={4} fill="#FFFFFF" opacity={0.18} />
      <rect x={cx + lipHalf - 13} y={top + 34} width={5} height={capBottom - top - 48} rx={2.5} fill="#111521" opacity={0.16} />
      {label && (
        <text x={cx + half + 8} y={MOUTHPIECE.top + 52} fontSize={11} fontWeight={700} fill="#6B7280">
          마우스피스(무는 곳)
        </text>
      )}
    </g>
  );
}

/* ---------- 키 한 개 (●/○ + 펄스 + 히트영역) ---------- */

export interface KeyShapeProps {
  pos: KeyPos;
  pressed: boolean;
  changed: boolean;
  changeStamp: number;
  interactive: boolean;
  onToggle?: (id: KeyId) => void;
  showLabel: boolean;
}

export function KeyShape({ pos, pressed, changed, changeStamp, interactive, onToggle, showLabel }: KeyShapeProps) {
  const uid = useId().replace(/[:]/g, "");
  const meta = KEY_BY_ID[pos.id];
  const color = keyColor(pos.id);
  const title = `${meta.korName} (${meta.korLabel})`;
  const isSide = meta.face === "side";

  const glowR = pos.kind === "circle" ? pos.r + 8 : Math.max(pos.w, pos.h) / 2 + 8;
  const hitR = Math.max(MIN_HIT_R, pos.kind === "circle" ? pos.r + 8 : pos.w / 2 + 9);
  const metalId = `key-metal-${uid}`;
  const innerId = `key-inner-${uid}`;
  const pressedId = `key-pressed-${uid}`;

  const body =
    pos.kind === "circle" ? (
      <g>
        <ellipse cx={pos.cx + 3} cy={pos.cy + pos.r + 5} rx={pos.r * 0.96} ry={4.2} fill="#171A2C" opacity={0.2} />
        <circle cx={pos.cx} cy={pos.cy} r={pos.r + 7} fill="#1C2032" opacity={0.42} />
        <circle cx={pos.cx} cy={pos.cy - 1} r={pos.r + 5} fill={`url(#${metalId})`} stroke="#2E3452" strokeWidth={1.2} />
        <circle cx={pos.cx} cy={pos.cy - 1} r={pos.r + 1.5} fill={pressed ? `url(#${pressedId})` : `url(#${innerId})`} stroke={pressed ? color : RELEASED_STROKE} strokeWidth={1.3} />
        <path
          d={`M ${pos.cx - pos.r - 1} ${pos.cy - 9} A ${pos.r + 2} ${pos.r + 2} 0 0 1 ${pos.cx + pos.r - 2} ${pos.cy - 7}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2}
          opacity={pressed ? 0.34 : 0.58}
          strokeLinecap="round"
        />
        <path
          d={`M ${pos.cx + pos.r - 1} ${pos.cy + 8} A ${pos.r + 2} ${pos.r + 2} 0 0 1 ${pos.cx - pos.r + 5} ${pos.cy + 14}`}
          fill="none"
          stroke="#20243A"
          strokeWidth={2.2}
          opacity={0.34}
          strokeLinecap="round"
        />
      </g>
    ) : (
      <g>
        {isSide && (
          <path
            d={`M ${pos.cx - pos.w / 2 - 8} ${pos.cy - pos.h / 2 - 4}
                C ${pos.cx + pos.w / 2 + 5} ${pos.cy - pos.h / 2 - 5} ${pos.cx + pos.w / 2 + 7} ${pos.cy + pos.h / 2 + 5} ${pos.cx - pos.w / 2 - 5} ${pos.cy + pos.h / 2 + 5}
                Q ${pos.cx - pos.w / 2 - 11} ${pos.cy} ${pos.cx - pos.w / 2 - 8} ${pos.cy - pos.h / 2 - 4} Z`}
            fill="#555B82"
            stroke="#2D324F"
            strokeWidth={1}
            opacity={0.92}
          />
        )}
        <ellipse cx={pos.cx + 1} cy={pos.cy + pos.h / 2 + 4} rx={pos.w * 0.55} ry={3} fill="#171A2C" opacity={0.22} />
        <rect
          x={pos.cx - pos.w / 2}
          y={pos.cy - pos.h / 2}
          width={pos.w}
          height={pos.h}
          rx={pos.h / 2}
          fill={pressed ? `url(#${pressedId})` : `url(#${metalId})`}
          stroke={pressed ? color : "#303550"}
          strokeWidth={1.2}
        />
        <rect
          x={pos.cx - pos.w / 2 + 4}
          y={pos.cy - pos.h / 2 + 2.5}
          width={pos.w - 8}
          height={Math.max(4, pos.h - 5)}
          rx={(pos.h - 5) / 2}
          fill={pressed ? color : "#C9CDF1"}
          opacity={pressed ? 0.72 : 0.55}
        />
      </g>
    );

  const labelX = isSide ? pos.cx + (pos.kind === "pill" ? pos.w / 2 : 0) + 10 : pos.cx - (pos.kind === "circle" ? pos.r : pos.w / 2) - 9;

  return (
    <g
      key={changed ? `pulse-${changeStamp}` : "static"}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={title}
      aria-pressed={interactive ? pressed : undefined}
      onClick={interactive && onToggle ? () => onToggle(pos.id) : undefined}
      onKeyDown={
        interactive && onToggle
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(pos.id);
              }
            }
          : undefined
      }
      className={interactive ? "cursor-pointer" : undefined}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={metalId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2D314A" />
          <stop offset="15%" stopColor="#F7F8FF" />
          <stop offset="32%" stopColor="#A4A8D5" />
          <stop offset="58%" stopColor="#686F9A" />
          <stop offset="77%" stopColor="#EBECFF" />
          <stop offset="100%" stopColor="#272C43" />
        </linearGradient>
        <radialGradient id={innerId} cx="42%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#DADCF7" />
          <stop offset="58%" stopColor="#B8BCE4" />
          <stop offset="100%" stopColor="#868CB8" />
        </radialGradient>
        <radialGradient id={pressedId} cx="42%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.42} />
          <stop offset="48%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity={0.84} />
        </radialGradient>
      </defs>
      {/* 누른 키 글로우 링 */}
      {pressed && (
        <circle cx={pos.cx} cy={pos.cy} r={glowR} fill="none" stroke={color} strokeWidth={5} opacity={0.3} />
      )}
      {/* 펄스: 직전 음과 상태가 달라진 키만 */}
      {changed && (
        <circle className="key-pulse-ring" cx={pos.cx} cy={pos.cy} r={glowR} fill="none" stroke={color} strokeWidth={4} />
      )}
      <g className={changed ? "key-pulse" : undefined} transform={pressed ? "translate(0 1)" : undefined}>
        {body}
      </g>
      {/* 히트영역 (실제 키보다 크게) */}
      {interactive && <circle cx={pos.cx} cy={pos.cy} r={hitR} fill="transparent" />}
      {showLabel && (
        <text
          x={labelX}
          y={pos.cy + 4}
          fontSize={12}
          fontWeight={700}
          fill="#6B7280"
          textAnchor={isSide ? "start" : "end"}
          aria-hidden
        >
          {meta.korLabel}
        </text>
      )}
    </g>
  );
}

/* ---------- 손 가이드 오버레이 (반투명 실루엣) ---------- */

const SKIN = "#E8A36C";

export function HandsOverlay() {
  // 왼손: 위 3키를 오른쪽에서, 오른손: 아래 4키를 왼쪽에서 덮는 방향 (실제 그립과 동일)
  const leftTargets = FRONT_KEYS.filter((k) => ["K1", "K2", "K3"].includes(k.id));
  const rightTargets = FRONT_KEYS.filter((k) => ["K4", "K5", "K6", "K7"].includes(k.id));
  return (
    <g opacity={0.25} pointerEvents="none" aria-hidden>
      {/* 왼손 손바닥 + 손가락 */}
      <ellipse cx={192} cy={244} rx={34} ry={52} fill={SKIN} />
      {leftTargets.map((k) => (
        <ellipse key={k.id} cx={(k.cx + 186) / 2} cy={"cy" in k ? k.cy : 0} rx={(186 - k.cx) / 2 + 16} ry={11} fill={SKIN} />
      ))}
      {/* 오른손 손바닥 + 손가락 */}
      <ellipse cx={46} cy={506} rx={36} ry={62} fill={SKIN} />
      {rightTargets.map((k) => (
        <ellipse key={k.id} cx={(k.cx + 54) / 2} cy={"cy" in k ? k.cy : 0} rx={(k.cx - 54) / 2 + 16} ry={11} fill={SKIN} />
      ))}
    </g>
  );
}

export function ThumbOverlay({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g opacity={0.25} pointerEvents="none" aria-hidden>
      <ellipse cx={cx + 26} cy={cy + 18} rx={40} ry={20} fill={SKIN} transform={`rotate(-35 ${cx + 26} ${cy + 18})`} />
    </g>
  );
}

/* ---------- 공용 작은 라벨 ---------- */

export function TinyLabel({ x, y, children, anchor = "start" }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} fontSize={11} fill="#6B7280" textAnchor={anchor} aria-hidden>
      {children}
    </text>
  );
}
