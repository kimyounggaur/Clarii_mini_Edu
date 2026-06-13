import { LAYER_BY_NUM, type LayerNum } from "../data/notes";

const LAYERS_TOP_DOWN: LayerNum[] = [2, 1, 0, -1];

/** 화면 오른쪽 세로 4단 옥타브 엘리베이터 (위에서부터 +2/+1/0/−1) */
export function OctaveElevator({
  layer,
  visibleLayers,
  onChange,
}: {
  layer: LayerNum;
  visibleLayers: LayerNum[];
  onChange: (layer: LayerNum) => void;
}) {
  return (
    <div
      role="group"
      aria-label="옥타브 층 선택"
      className="flex flex-col gap-1 rounded-card bg-white p-1 shadow-sm"
    >
      {LAYERS_TOP_DOWN.filter((l) => visibleLayers.includes(l)).map((l) => {
        const def = LAYER_BY_NUM[l];
        const active = l === layer;
        return (
          <button
            key={l}
            type="button"
            aria-label={`${def.kor} (${def.deviceRange})`}
            aria-pressed={active}
            onClick={() => onChange(l)}
            className={`flex min-h-[46px] w-[52px] flex-col items-center justify-center rounded-xl text-center transition-colors ${
              active ? "bg-octave text-white shadow" : "bg-stage text-sub hover:bg-octave/10"
            }`}
          >
            <span className="num text-sm font-extrabold leading-none">
              {l === 0 ? "0" : l > 0 ? `+${l}` : `${l}`}
            </span>
            <span className={`mt-0.5 text-[9px] font-semibold leading-tight ${active ? "text-white/90" : ""}`}>
              {def.kor}
            </span>
          </button>
        );
      })}
      <div className="pb-0.5 pt-1 text-center text-[10px] font-bold text-sub" aria-hidden>
        🛗
      </div>
    </div>
  );
}
