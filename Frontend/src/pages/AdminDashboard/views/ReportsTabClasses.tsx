import { DataState } from '../components/DataState';
import { useApiResource } from '../../../hooks/useApiResource';
import { type ClassOccupancyResponse, type PopularClassResponse } from '../../../hooks/flow3Api';

export default function ReportsTabClasses() {
  const occupancy = useApiResource<ClassOccupancyResponse[]>("/api/reports/classes/occupancy");
  const popular = useApiResource<PopularClassResponse[]>("/api/reports/classes/popular?top=5");

  const classes = (occupancy.data ?? []).slice(0, 8);
  const ranking = popular.data ?? [];

  const fillPercent = (value: string) => Number.parseInt(value.replace('%', ''), 10) || 0;

  return (
    <div className="flex gap-5">
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-5 min-w-0 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-[#0f172a] text-base">Tỷ lệ lấp đầy theo lớp (tháng này)</p>
          <div className="flex gap-4">
            {[{ c: "#94a3b8", l: "Sức chứa" }, { c: "#14b8a6", l: "Lấp đầy ≥85%" }, { c: "#f97316", l: "Lấp đầy <85%" }].map(i => (
              <div key={i.l} className="flex gap-1.5 items-center">
                <div className="rounded-full size-2 shrink-0" style={{ background: i.c }} />
                <span className="text-[#64748b] text-[10px]">{i.l}</span>
              </div>
            ))}
          </div>
        </div>

        <DataState
          loading={occupancy.loading}
          error={occupancy.error}
          forbidden={occupancy.forbidden}
          count={classes.length}
          emptyText="Tháng này chưa có lớp học nào."
          onRetry={occupancy.reload}
        />

        {classes.length > 0 && (
          <div className="flex gap-4 items-end justify-around h-36 px-4">
            {classes.map((c) => {
              const percent = fillPercent(c.fillRate);
              return (
                <div key={c.classId} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <div className="flex gap-1 items-end w-full" style={{ height: 120 }}>
                    <div className="bg-[#e2e8f0] rounded-t-sm flex-1" style={{ height: "100%" }} />
                    <div
                      className={`rounded-t-sm flex-1 ${percent >= 85 ? "bg-[#14b8a6]" : "bg-[#f97316]"}`}
                      style={{ height: `${percent}%` }}
                    />
                  </div>
                  <span className="text-[#64748b] text-[11px] text-center truncate w-full" title={c.className}>{c.className}</span>
                  <span className="text-[#64748b] text-[10px]">{c.fillRate} fill</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-col gap-4 p-6 rounded-xl shrink-0 w-[320px]">
        <p className="font-extrabold text-[#0f172a] text-base">Lớp học phổ biến nhất</p>

        <DataState
          loading={popular.loading}
          error={popular.error}
          forbidden={popular.forbidden}
          count={ranking.length}
          emptyText="Chưa có lớp học nào được đăng ký."
          onRetry={popular.reload}
        />

        {ranking.map(c => {
          const percent = fillPercent(c.fillRate);
          return (
            <div key={c.classId} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-[#0f172a] text-[13px] truncate">{c.rank}. {c.className}</p>
                  <p className="text-[#64748b] text-[11px] truncate">
                    {c.coachName ?? "Chưa phân công"}{c.sportName ? ` • ${c.sportName}` : ""}
                  </p>
                </div>
                <span className="font-bold text-[#0f172a] text-[13px] whitespace-nowrap">{c.enrolled}/{c.capacity}</span>
              </div>
              <div className="bg-[#f1f5f9] h-1.5 rounded-full w-full">
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${Math.min(percent, 100)}%`, background: percent >= 85 ? "#14b8a6" : "#f97316" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}
