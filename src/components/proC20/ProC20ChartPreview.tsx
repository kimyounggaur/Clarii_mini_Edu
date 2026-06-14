import { PRO_C20_ENTRY_BY_ID, proC20EntriesForMode, proC20PendingText } from "../../data/proC20/fingeringCharts";
import { PRO_C20_KEY_BY_ID } from "../../data/proC20/keys";
import { PRO_C20_MODE_BY_ID } from "../../data/proC20/modes";
import type { ProC20FingeringMode, ProC20KeyId } from "../../data/proC20/types";
import { ProC20FingeringView } from "./ProC20FingeringView";

function keyName(id: ProC20KeyId): string {
  return PRO_C20_KEY_BY_ID[id]?.label ?? id;
}

export function ProC20EntrySummary({ entryId }: { entryId: string }) {
  const entry = PRO_C20_ENTRY_BY_ID[entryId];
  if (!entry) {
    return (
      <div className="rounded-xl bg-stage px-3 py-2 text-xs font-bold text-sub">
        아직 등록되지 않은 PRO C20 운지 항목입니다.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-bodyline/60 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold">{entry.note.solfegeKor}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-sub">{entry.tipKor}</p>
        </div>
        <span className="rounded-full bg-[#19E6FF]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#087D86]">
          {entry.verification === "panelVerified" ? "패널 검증" : entry.verification}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {entry.pressed.map((id) => (
          <span key={id} className="rounded-full bg-stage px-2 py-0.5 text-[10px] font-bold text-sub">
            {keyName(id)}
          </span>
        ))}
        {entry.octaveRange && (
          <span className="rounded-full bg-[#19E6FF]/10 px-2 py-0.5 text-[10px] font-bold text-[#087D86]">
            Oct {entry.octaveRange}
          </span>
        )}
      </div>
      <p className="mt-2 text-[10px] font-semibold text-sub">
        출처: {entry.source.heading} p.{entry.source.manualPage}
      </p>
    </div>
  );
}

export function ProC20ChartPreview({ mode }: { mode: ProC20FingeringMode }) {
  const modeMeta = PRO_C20_MODE_BY_ID[mode];
  const entries = proC20EntriesForMode(mode);
  const previewEntry = entries[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-stage px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-extrabold">{modeMeta.displayName}</h4>
            <p className="text-[11px] font-bold text-sub">{modeMeta.korName}</p>
          </div>
          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-extrabold text-sub">
            {modeMeta.status === "planned" ? "준비 중" : modeMeta.status === "partial" ? "부분 전사" : "검증됨"}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-sub">{modeMeta.notes}</p>
      </div>

      {previewEntry && (
        <div className="min-h-[240px] rounded-xl bg-[#0C1518] p-3">
          <ProC20FingeringView
            pressed={previewEntry.pressed}
            displayText={previewEntry.note.deviceName ?? "C20"}
            className="h-[220px] text-white"
          />
        </div>
      )}

      {entries.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {entries.map((entry) => (
            <ProC20EntrySummary key={entry.id} entryId={entry.id} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-bodyline bg-white px-4 py-5 text-center">
          <p className="text-sm font-extrabold">아직 통과형 운지 데이터가 없습니다</p>
          <p className="mt-2 text-xs leading-relaxed text-sub">
            {proC20PendingText(mode)} 자료를 수동 전사하고 검증한 뒤 열 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
