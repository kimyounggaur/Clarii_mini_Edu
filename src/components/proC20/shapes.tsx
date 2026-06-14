import { useId } from "react";
import { PRO_C20_KEY_BY_ID, proC20KeyColor } from "../../data/proC20/keys";
import type { ProC20KeyId } from "../../data/proC20/types";
import type { ProC20KeyPos } from "./constants";

export function ProC20BodyShell({ face }: { face: "front" | "back" | "side" }) {
  const uid = useId().replace(/[:]/g, "");
  const left = face === "side" ? 82 : 72;
  const right = face === "side" ? 158 : 168;
  const top = 112;
  const bottom = 736;
  const d = [
    `M ${left + 18} ${top}`,
    `L ${right - 18} ${top}`,
    `C ${right - 4} ${top + 4} ${right} ${top + 22} ${right} ${top + 48}`,
    `L ${right - 2} ${bottom - 34}`,
    `Q ${right - 2} ${bottom} ${right - 30} ${bottom}`,
    `L ${left + 30} ${bottom}`,
    `Q ${left + 2} ${bottom} ${left + 2} ${bottom - 34}`,
    `L ${left} ${top + 48}`,
    `C ${left} ${top + 22} ${left + 4} ${top + 4} ${left + 18} ${top}`,
    "Z",
  ].join(" ");
  return (
    <g aria-hidden>
      <defs>
        <linearGradient id={`pro-body-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#070809" />
          <stop offset="17%" stopColor="#2A2A2C" />
          <stop offset="42%" stopColor="#101112" />
          <stop offset="66%" stopColor="#303236" />
          <stop offset="100%" stopColor="#050506" />
        </linearGradient>
        <linearGradient id={`pro-gold-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9B6B20" />
          <stop offset="24%" stopColor="#F9D77A" />
          <stop offset="56%" stopColor="#FFE9A9" />
          <stop offset="100%" stopColor="#A77826" />
        </linearGradient>
        <filter id={`pro-shadow-${uid}`} x="-30%" y="-5%" width="160%" height="112%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.28" />
        </filter>
        <clipPath id={`pro-body-clip-${uid}`}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={`url(#pro-body-${uid})`} stroke="#050505" strokeWidth={1.2} filter={`url(#pro-shadow-${uid})`} />
      <g clipPath={`url(#pro-body-clip-${uid})`}>
        <rect x={left + 14} y={top + 18} width={6} height={bottom - top - 70} rx={3} fill="#FFFFFF" opacity={0.12} />
        <rect x={right - 20} y={top + 36} width={5} height={bottom - top - 92} rx={2.5} fill="#FFFFFF" opacity={0.08} />
        <rect x={left + 3} y={bottom - 26} width={right - left - 6} height={28} fill={`url(#pro-gold-${uid})`} />
      </g>
      <path d={d} fill="none" stroke="#4A4C50" strokeWidth={0.8} opacity={0.45} />
    </g>
  );
}

export function ProC20Mouthpiece() {
  const uid = useId().replace(/[:]/g, "");
  return (
    <g aria-hidden>
      <defs>
        <linearGradient id={`pro-mouth-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#050505" />
          <stop offset="36%" stopColor="#343436" />
          <stop offset="70%" stopColor="#151516" />
          <stop offset="100%" stopColor="#020202" />
        </linearGradient>
        <linearGradient id={`pro-collar-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8E611B" />
          <stop offset="38%" stopColor="#FFE28A" />
          <stop offset="72%" stopColor="#D2A248" />
          <stop offset="100%" stopColor="#6F4913" />
        </linearGradient>
      </defs>
      <path
        d="M 88 113 L 91 42 C 92 18 107 7 120 7 C 133 7 148 18 149 42 L 152 113 Z"
        fill={`url(#pro-mouth-${uid})`}
        stroke="#040404"
        strokeWidth={1.4}
      />
      <rect x={84} y={106} width={72} height={18} rx={8} fill={`url(#pro-collar-${uid})`} />
      <path d="M101 38 C110 29 130 29 139 38" fill="none" stroke="#FFFFFF" strokeOpacity={0.12} strokeWidth={2} />
    </g>
  );
}

export function ProC20KeyShape({
  pos,
  pressed,
  changed,
  interactive,
  onToggle,
}: {
  pos: ProC20KeyPos;
  pressed: boolean;
  changed: boolean;
  interactive: boolean;
  onToggle?: (id: ProC20KeyId) => void;
}) {
  const uid = useId().replace(/[:]/g, "");
  const meta = PRO_C20_KEY_BY_ID[pos.id];
  const color = proC20KeyColor(pos.id);
  const hitR = pos.kind === "circle" ? Math.max(22, pos.r + 8) : Math.max(22, Math.max(pos.w, pos.h) / 2 + 8);
  const glow = pressed || changed;

  const content =
    pos.kind === "circle" ? (
      <g>
        <circle cx={pos.cx} cy={pos.cy + 2} r={pos.r + 5} fill="#020202" opacity={0.45} />
        {glow && <circle cx={pos.cx} cy={pos.cy} r={pos.r + 9} fill="none" stroke={color} strokeWidth={4} opacity={pressed ? 0.72 : 0.45} />}
        <circle cx={pos.cx} cy={pos.cy} r={pos.r + 4} fill={`url(#gold-${uid})`} stroke="#2C2111" strokeWidth={1.1} />
        <circle cx={pos.cx} cy={pos.cy} r={Math.max(3, pos.r - 7)} fill={pressed ? color : "#F8E4B0"} opacity={pressed ? 0.95 : 1} />
      </g>
    ) : (
      <g>
        <rect x={pos.cx - pos.w / 2 + 2} y={pos.cy - pos.h / 2 + 3} width={pos.w} height={pos.h} rx={pos.h / 2} fill="#000000" opacity={0.38} />
        {glow && <rect x={pos.cx - pos.w / 2 - 4} y={pos.cy - pos.h / 2 - 4} width={pos.w + 8} height={pos.h + 8} rx={(pos.h + 8) / 2} fill="none" stroke={color} strokeWidth={3} opacity={pressed ? 0.74 : 0.45} />}
        <rect x={pos.cx - pos.w / 2} y={pos.cy - pos.h / 2} width={pos.w} height={pos.h} rx={pos.kind === "rect" ? 4 : pos.h / 2} fill={pressed ? color : `url(#gold-${uid})`} stroke="#2C2111" strokeWidth={1} />
      </g>
    );

  return (
    <g
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={meta?.korName ?? pos.id}
      aria-pressed={interactive ? pressed : undefined}
      onClick={interactive ? () => onToggle?.(pos.id) : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onToggle?.(pos.id);
              }
            }
          : undefined
      }
      className={interactive ? "cursor-pointer" : undefined}
    >
      <defs>
        <linearGradient id={`gold-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8F631D" />
          <stop offset="24%" stopColor="#FFE494" />
          <stop offset="57%" stopColor="#F2C96A" />
          <stop offset="100%" stopColor="#765014" />
        </linearGradient>
      </defs>
      <title>{meta?.korName ?? pos.id}</title>
      <g className={changed ? "key-pulse" : undefined}>{content}</g>
      {pos.label && (
        <text x={pos.cx} y={pos.cy + 4} textAnchor="middle" fontSize={pos.label.length > 2 ? 6.5 : 9} fontWeight={800} fill={pressed ? "#021617" : "#34302B"} pointerEvents="none">
          {pos.label}
        </text>
      )}
      {interactive && <circle cx={pos.cx} cy={pos.cy} r={hitR} fill="transparent" />}
    </g>
  );
}
