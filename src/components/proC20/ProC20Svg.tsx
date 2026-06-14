import type { ProC20KeyId } from "../../data/proC20/types";
import { PRO_C20_PARTS } from "../../data/proC20/parts";
import { PRO_C20_BACK_KEYS, PRO_C20_FRONT_KEYS, PRO_C20_OCTAVE_RANGES, PRO_C20_VIEWBOX } from "./constants";
import { ProC20BodyShell, ProC20KeyShape, ProC20Mouthpiece } from "./shapes";

export interface ProC20SvgProps {
  face: "front" | "back" | "side";
  pressed?: ProC20KeyId[];
  highlighted?: ProC20KeyId[];
  changed?: ProC20KeyId[];
  interactive?: boolean;
  onToggleKey?: (id: ProC20KeyId) => void;
  partsMode?: boolean;
  selectedPart?: string | null;
  onPartTap?: (id: string) => void;
  displayText?: string;
  className?: string;
}

export function ProC20Svg({
  face,
  pressed = [],
  highlighted = [],
  changed = [],
  interactive = false,
  onToggleKey,
  partsMode = false,
  selectedPart = null,
  onPartTap,
  displayText = "PRO",
  className,
}: ProC20SvgProps) {
  const pressedSet = new Set<ProC20KeyId>([...pressed, ...highlighted]);
  const changedSet = new Set(changed);
  const keys = face === "front" ? PRO_C20_FRONT_KEYS : face === "back" ? [...PRO_C20_BACK_KEYS, ...PRO_C20_OCTAVE_RANGES] : [];

  return (
    <svg viewBox={PRO_C20_VIEWBOX} className={className} role="img" aria-label={`Clarii PRO C20 ${face}`}>
      <ProC20BodyShell face={face} />
      <ProC20Mouthpiece />

      {face === "front" && (
        <g aria-hidden>
          <rect x={103} y={142} width={34} height={26} rx={3} fill="#F6C229" />
          <ellipse cx={114} cy={154} rx={5} ry={9} fill="#222" transform="rotate(20 114 154)" />
          <ellipse cx={126} cy={154} rx={4} ry={7} fill="#222" transform="rotate(20 126 154)" />
          <text x={120} y={178} textAnchor="middle" fontSize={6} fontWeight={800} fill="#F6C229">
            ROBKOO
          </text>
          <rect x={116} y={188} width={8} height={24} rx={4} fill="#1DE6E0" opacity={0.85} />
          <g opacity={0.9}>
            {Array.from({ length: 2 }).map((_, block) =>
              Array.from({ length: 7 }).flatMap((__, r) =>
                Array.from({ length: 9 }).map((___, c) => (
                  <circle key={`${block}-${r}-${c}`} cx={89 + c * 3.4} cy={612 + block * 50 + r * 3.4} r={0.9} fill="#DDE2E6" />
                )),
              ),
            )}
          </g>
        </g>
      )}

      {face === "back" && (
        <g aria-hidden>
          <rect x={78} y={130} width={84} height={58} rx={8} fill="#050505" stroke="#3B3D42" strokeWidth={1.3} />
          <rect x={83} y={136} width={74} height={46} rx={5} fill="#121314" />
          <rect x={90} y={145} width={60} height={24} rx={3} fill="#F6C229" opacity={0.95} />
          <text x={120} y={163} textAnchor="middle" fontSize={12} fontWeight={900} fill="#171717">
            {displayText}
          </text>
          <circle cx={100} cy={96} r={3} fill="#111" />
          <circle cx={120} cy={96} r={3} fill="#111" />
          <circle cx={140} cy={96} r={3} fill="#111" />
        </g>
      )}

      {keys.map((pos) => (
        <ProC20KeyShape
          key={pos.id}
          pos={pos}
          pressed={pressedSet.has(pos.id)}
          changed={changedSet.has(pos.id)}
          interactive={interactive && !partsMode}
          onToggle={onToggleKey}
        />
      ))}

      {partsMode &&
        PRO_C20_PARTS.filter((part) => part.face === face).map((part) => (
          <g
            key={part.id}
            role="button"
            tabIndex={0}
            aria-label={part.kor}
            onClick={() => onPartTap?.(part.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onPartTap?.(part.id);
              }
            }}
            className="cursor-pointer"
          >
            <ellipse
              cx={part.cx}
              cy={part.cy}
              rx={part.rx + 5}
              ry={part.ry + 5}
              fill={selectedPart === part.id ? "#19E6FF" : "transparent"}
              opacity={selectedPart === part.id ? 0.18 : 1}
              stroke={selectedPart === part.id ? "#19E6FF" : "#19E6FF"}
              strokeWidth={selectedPart === part.id ? 2.5 : 1.2}
              strokeDasharray={selectedPart === part.id ? "6 4" : "3 5"}
              strokeOpacity={selectedPart === part.id ? 0.9 : 0.16}
            />
          </g>
        ))}
    </svg>
  );
}
