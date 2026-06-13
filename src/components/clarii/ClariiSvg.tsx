import { useId } from "react";
import type { KeyId } from "../../data/keys";
import {
  VIEWBOX,
  FRONT_KEYS,
  BACK_KEYS,
  BACK_DISPLAY,
  THUMB_REST,
  THUMB_HOOK,
  STRAP_RING,
  LOGO_DOT,
  SPEAKER,
  RGB_RING,
  PARTS,
} from "./constants";
import { BodyShell, Mouthpiece, KeyShape, HandsOverlay, ThumbOverlay, TinyLabel } from "./shapes";

export interface ClariiSvgProps {
  face: "front" | "back";
  pressed: KeyId[];            // 누른 키
  changed?: KeyId[];           // 직전 음과 상태가 달라진 키 → 펄스 강조
  changeStamp?: number;        // 펄스 재시작용 스탬프
  interactive?: boolean;       // true면 키 탭으로 ●/○ 토글
  onToggleKey?: (id: KeyId) => void;
  showFingerLabels?: boolean;  // 키 옆 손가락 라벨 뱃지
  showGuideLabels?: boolean;   // 쉼 원·마우스피스 안내 라벨 (기본 true)
  displayText?: string;        // 뒷면 디스플레이에 띄울 음이름 (예: "C3")
  ringGlow?: boolean;          // true면 RGB 링이 무지개 글로우 1회
  showHands?: boolean;         // 반투명 손 가이드
  partsMode?: boolean;         // 부위 학습 모드 (L0)
  selectedPart?: string | null;
  onPartTap?: (id: string) => void;
  className?: string;
}

export function ClariiSvg({
  face,
  pressed,
  changed = [],
  changeStamp = 0,
  interactive = false,
  onToggleKey,
  showFingerLabels = false,
  showGuideLabels = true,
  displayText,
  ringGlow = false,
  showHands = false,
  partsMode = false,
  selectedPart = null,
  onPartTap,
  className,
}: ClariiSvgProps) {
  const uid = useId().replace(/[:]/g, "");
  const pressedSet = new Set(pressed);
  const changedSet = new Set(changed);
  const keys = face === "front" ? FRONT_KEYS : BACK_KEYS;
  const keysInteractive = interactive && !partsMode;

  return (
    <svg
      viewBox={VIEWBOX}
      className={className}
      role="img"
      aria-label={face === "front" ? "클라리 미니 앞면" : "클라리 미니 뒷면"}
    >
      <BodyShell gradientId={`body-${uid}`} />
      <Mouthpiece label={face === "front" && showGuideLabels} />

      {face === "front" && (
        <g aria-hidden>
          {/* 로고 점 */}
          <circle cx={LOGO_DOT.cx} cy={LOGO_DOT.cy} r={LOGO_DOT.r} fill="#D7DBE0" />
          {/* 스피커 그릴 (점 4×6) */}
          {Array.from({ length: SPEAKER.rows }).flatMap((_, r) =>
            Array.from({ length: SPEAKER.cols }).map((_, c) => (
              <circle
                key={`sp-${r}-${c}`}
                cx={SPEAKER.cx + (c - (SPEAKER.cols - 1) / 2) * SPEAKER.gapX}
                cy={636 + 6 + r * SPEAKER.gapY}
                r={SPEAKER.dotR}
                fill="#B8BDC6"
              />
            )),
          )}
          {/* RGB 라이트 링 */}
          <defs>
            <linearGradient id={`rainbow-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF5E5E" />
              <stop offset="20%" stopColor="#FFC53D" />
              <stop offset="40%" stopColor="#19B47D" />
              <stop offset="60%" stopColor="#3D9BFF" />
              <stop offset="80%" stopColor="#7C5CFF" />
              <stop offset="100%" stopColor="#FF5E9C" />
            </linearGradient>
            <clipPath id={`ringclip-${uid}`}>
              <rect
                x={RGB_RING.cx - RGB_RING.width / 2}
                y={RGB_RING.cy - RGB_RING.height / 2}
                width={RGB_RING.width}
                height={RGB_RING.height}
                rx={RGB_RING.r}
              />
            </clipPath>
          </defs>
          <rect
            x={RGB_RING.cx - RGB_RING.width / 2}
            y={RGB_RING.cy - RGB_RING.height / 2}
            width={RGB_RING.width}
            height={RGB_RING.height}
            rx={RGB_RING.r}
            fill="#DDE1E6"
          />
          {ringGlow && (
            <g clipPath={`url(#ringclip-${uid})`}>
              <rect
                className="ring-sweep"
                x={RGB_RING.cx - RGB_RING.width / 2}
                y={RGB_RING.cy - RGB_RING.height / 2}
                width={RGB_RING.width * 2}
                height={RGB_RING.height}
                fill={`url(#rainbow-${uid})`}
              />
            </g>
          )}
        </g>
      )}

      {face === "back" && (
        <g>
          {/* 디스플레이 */}
          <rect
            x={BACK_DISPLAY.cx - BACK_DISPLAY.w / 2}
            y={BACK_DISPLAY.cy - BACK_DISPLAY.h / 2}
            width={BACK_DISPLAY.w}
            height={BACK_DISPLAY.h}
            rx={BACK_DISPLAY.r}
            fill="#2B2F36"
            stroke="#1A1D21"
            strokeWidth={1.5}
          />
          <text
            x={BACK_DISPLAY.cx}
            y={BACK_DISPLAY.cy + 6}
            textAnchor="middle"
            fontSize={17}
            fontWeight={800}
            fill="#FFFFFF"
            className="num"
          >
            {displayText ?? ""}
          </text>
          {/* 엄지 쉼 원 (점선, 키 아님) */}
          <circle
            cx={THUMB_REST.cx}
            cy={THUMB_REST.cy}
            r={THUMB_REST.r}
            fill="none"
            stroke="#9AA1AA"
            strokeWidth={1.8}
            strokeDasharray="3.5 3"
            aria-hidden
          />
          {showGuideLabels && (
            <>
              <TinyLabel x={THUMB_REST.cx - 18} y={THUMB_REST.cy + 4} anchor="end">
                엄지 쉼터
              </TinyLabel>
              <TinyLabel x={THUMB_REST.cx + 16} y={THUMB_REST.cy + 4}>
                평소 엄지는 여기!
              </TinyLabel>
            </>
          )}
          {/* 엄지 후크 (ㄱ자 돌기) */}
          <g aria-hidden>
            <path
              d={`M ${THUMB_HOOK.cx - THUMB_HOOK.w / 2} ${THUMB_HOOK.cy - THUMB_HOOK.h / 2}
                  h ${THUMB_HOOK.w} a 5 5 0 0 1 5 5 v ${THUMB_HOOK.h - 10} a 5 5 0 0 1 -5 5
                  h -10 v -8 a 4 4 0 0 0 -4 -4 h -${THUMB_HOOK.w - 14} z`}
              fill="#F1F3F5"
              stroke="#C9CDD4"
              strokeWidth={1.8}
              strokeLinejoin="round"
            />
            {showGuideLabels && (
              <TinyLabel x={THUMB_HOOK.cx} y={THUMB_HOOK.cy + THUMB_HOOK.h / 2 + 16} anchor="middle">
                오른손 엄지 받침
              </TinyLabel>
            )}
          </g>
          {/* 전원 버튼 · 스트랩 링 (장식) */}
          <circle cx={120} cy={620} r={8} fill="#F1F3F5" stroke="#C9CDD4" strokeWidth={1.5} aria-hidden />
          <text x={120} y={624} textAnchor="middle" fontSize={9} fill="#9AA1AA" aria-hidden>
            ⏻
          </text>
          <circle
            cx={STRAP_RING.cx}
            cy={STRAP_RING.cy}
            r={STRAP_RING.r}
            fill="none"
            stroke="#C9CDD4"
            strokeWidth={3}
            aria-hidden
          />
        </g>
      )}

      {/* 키들 */}
      {keys.map((pos) => (
        <KeyShape
          key={pos.id}
          pos={pos}
          pressed={pressedSet.has(pos.id)}
          changed={changedSet.has(pos.id)}
          changeStamp={changeStamp}
          interactive={keysInteractive}
          onToggle={onToggleKey}
          showLabel={showFingerLabels}
        />
      ))}

      {/* 손 가이드 */}
      {showHands && face === "front" && <HandsOverlay />}
      {showHands && face === "back" && <ThumbOverlay cx={THUMB_REST.cx} cy={THUMB_REST.cy} />}

      {/* 부위 학습 모드 (L0) */}
      {partsMode &&
        PARTS.filter((p) => p.face === face).map((p) => (
          <g
            key={p.id}
            role="button"
            tabIndex={0}
            aria-label={p.kor}
            onClick={() => onPartTap?.(p.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPartTap?.(p.id);
              }
            }}
            className="cursor-pointer"
          >
            <ellipse
              cx={p.cx}
              cy={p.cy}
              rx={p.rx + 6}
              ry={p.ry + 6}
              fill={selectedPart === p.id ? "#FF8A00" : "transparent"}
              opacity={selectedPart === p.id ? 0.18 : 1}
              stroke={selectedPart === p.id ? "#FF8A00" : "transparent"}
              strokeWidth={2.5}
              strokeDasharray="6 4"
            />
          </g>
        ))}
    </svg>
  );
}
