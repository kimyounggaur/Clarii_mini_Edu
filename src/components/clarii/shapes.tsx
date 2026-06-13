import type { ReactNode } from "react";
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
  const d = [
    `M ${left + n + 8} ${top}`,
    `L ${right - n - 8} ${top}`,
    `C ${right - n} ${top} ${right} ${top + 18} ${right} ${top + 44}`,
    `L ${right} ${bottom - cr}`,
    `Q ${right} ${bottom} ${right - cr} ${bottom}`,
    `L ${left + cr} ${bottom}`,
    `Q ${left} ${bottom} ${left} ${bottom - cr}`,
    `L ${left} ${top + 44}`,
    `C ${left} ${top + 18} ${left + n} ${top} ${left + n + 8} ${top}`,
    "Z",
  ].join(" ");
  return (
    <g aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BODY_GRADIENT.from} />
          <stop offset="100%" stopColor={BODY_GRADIENT.to} />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#${gradientId})`} stroke={BODY.outline} strokeWidth={BODY.outlineWidth} />
      {/* 좌측 화이트 하이라이트 세로 띠 (무광 질감) */}
      <rect
        x={left + 7}
        y={top + 28}
        width={9}
        height={bottom - top - 90}
        rx={4.5}
        fill="#FFFFFF"
        opacity={0.55}
      />
    </g>
  );
}

/* ---------- 마우스피스 (끝이 둥근 납작한 부리) ---------- */

export function Mouthpiece({ label }: { label?: boolean }) {
  const { cx, top, bottom, width, lipWidth } = MOUTHPIECE;
  const half = width / 2;
  const lipHalf = lipWidth / 2;
  const d = [
    `M ${cx - lipHalf} ${top + 10}`,
    `Q ${cx - lipHalf} ${top} ${cx - lipHalf + 8} ${top}`,
    `L ${cx + lipHalf - 8} ${top}`,
    `Q ${cx + lipHalf} ${top} ${cx + lipHalf} ${top + 10}`,
    `L ${cx + half} ${bottom - 6}`,
    `L ${cx - half} ${bottom - 6}`,
    "Z",
  ].join(" ");
  return (
    <g aria-hidden>
      <path d={d} fill="#FBFCFD" stroke={BODY.outline} strokeWidth={1.6} strokeLinejoin="round" />
      <rect x={cx - half} y={bottom - 12} width={width} height={7} rx={3.5} fill="#C9CDD4" />
      {label && (
        <text x={cx + half + 6} y={MOUTHPIECE.top + 38} fontSize={11} fill="#6B7280">
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
  const meta = KEY_BY_ID[pos.id];
  const color = keyColor(pos.id);
  const title = `${meta.korName} (${meta.korLabel})`;
  const isSide = meta.face === "side";

  const glowR = pos.kind === "circle" ? pos.r + 6 : Math.max(pos.w, pos.h) / 2 + 5;
  const hitR = Math.max(MIN_HIT_R, pos.kind === "circle" ? pos.r + 4 : pos.w / 2 + 6);

  const body =
    pos.kind === "circle" ? (
      <circle
        cx={pos.cx}
        cy={pos.cy}
        r={pos.r}
        fill={pressed ? color : "#FFFFFF"}
        stroke={pressed ? color : RELEASED_STROKE}
        strokeWidth={2}
      />
    ) : (
      <rect
        x={pos.cx - pos.w / 2}
        y={pos.cy - pos.h / 2}
        width={pos.w}
        height={pos.h}
        rx={pos.h / 2}
        fill={pressed ? color : "#FFFFFF"}
        stroke={pressed ? color : RELEASED_STROKE}
        strokeWidth={2}
      />
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
      {/* 누른 키 글로우 링 */}
      {pressed && (
        <circle cx={pos.cx} cy={pos.cy} r={glowR} fill="none" stroke={color} strokeWidth={5} opacity={0.3} />
      )}
      {/* 펄스: 직전 음과 상태가 달라진 키만 */}
      {changed && (
        <circle className="key-pulse-ring" cx={pos.cx} cy={pos.cy} r={glowR} fill="none" stroke={color} strokeWidth={4} />
      )}
      <g className={changed ? "key-pulse" : undefined} transform={pressed ? "translate(0 1)" : undefined}>
        {!pressed && (
          <ellipse cx={pos.cx} cy={pos.cy + (pos.kind === "circle" ? pos.r : pos.h / 2) + 2} rx={pos.kind === "circle" ? pos.r * 0.7 : pos.w * 0.35} ry={2} fill="#1A1D21" opacity={0.07} aria-hidden />
        )}
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
