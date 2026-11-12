import React, { useState } from 'react';
import { DataState } from '../components/DataState';
import { useApiResource } from '../../../hooks/useApiResource';
import { type TrainerPerformanceResponse, type AttendanceStatResponse } from '../../../hooks/flow3Api';

const ITEMS_PER_PAGE = 7;

export default function ReportsTabHR() {
  const [currentPage, setCurrentPage] = useState(1);
  const trainers = useApiResource<TrainerPerformanceResponse[]>("/api/reports/trainers/performance");
  const attendance = useApiResource<AttendanceStatResponse[]>("/api/reports/attendance");

  const ranking = trainers.data ?? [];
  const totalItems = ranking.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedRanking = ranking.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const maxCheckins = Math.max(1, ...(attendance.data ?? []).map(a => a.checkins));

  return (
    <div className="flex gap-5">
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-5 min-w-0 p-6 rounded-xl">
        <div>
          <p className="font-extrabold text-[#0f172a] text-base">Bảng xếp hạng HLV theo hiệu suất</p>
          <p className="text-[#64748b] text-[12px] mt-1">Số liệu lấy từ lớp học đã xếp lịch trong hệ thống.</p>
        </div>

        <div className="flex flex-col">
          <div className="bg-[#f1f5f9] flex gap-3 font-bold px-4 py-2.5 text-[#475569] text-[12px]">
            {["#", "HLV", "SỐ LỚP", "HỌC VIÊN", "LỚP SẮP TỚI", "TỶ LỆ LẤP ĐẦY"].map(h => (
              <span key={h} className={h === "#" ? "w-8" : h === "HLV" ? "flex-1" : "w-[110px]"}>{h}</span>
            ))}
          </div>
          <DataState
            loading={trainers.loading}
            error={trainers.error}
            forbidden={trainers.forbidden}
            count={ranking.length}
            emptyText="Chưa có lớp học nào được phân công cho HLV."
            onRetry={trainers.reload}
          />
          {paginatedRanking.map((r, index) => {
            const actualIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
            return (
              <div key={r.coachId} className="border-b border-[#e2e8f0] flex gap-3 items-center px-4 py-3 hover:bg-slate-50 transition-colors">
                <span className="text-[#64748b] text-[13px] w-8">{actualIndex}</span>
                <span className="font-semibold text-[#0f172a] text-sm flex-1 truncate">{r.coachName}</span>
                <span className="text-[#0f172a] text-sm w-[110px]">{r.sessions}</span>
                <span className="text-[#0f172a] text-sm w-[110px]">{r.members}</span>
                <span className="text-[#0f172a] text-sm w-[110px]">{r.upcomingSessions}</span>
                <span className="font-semibold text-[#0f172a] text-sm w-[110px]">{r.fillRate}</span>
              </div>
            );
          })}

          {/* Phân trang */}
          {totalItems > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between pt-4 px-2 select-none">
              <span className="text-[#64748b] text-xs">
                Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} trên tổng số {totalItems} HLV
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors ${
                    currentPage === 1
                      ? "border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                  }`}
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-7 h-7 flex items-center justify-center text-xs rounded-md font-medium transition-colors cursor-pointer ${
                      currentPage === pageNumber
                        ? "bg-emerald-600 text-white font-bold shadow-xs shadow-emerald-600/20"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors ${
                    currentPage === totalPages
                      ? "border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                  }`}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* attendance */}
      <div className="flex flex-col gap-5 shrink-0 w-[320px]">
        <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-col gap-4 p-6 rounded-xl">
          <p className="font-extrabold text-[#0f172a] text-base">Lượt check-in theo khung giờ</p>
          <p className="text-[#64748b] text-[12px]">7 ngày gần nhất (dữ liệu cổng check-in).</p>

          <DataState
            loading={attendance.loading}
            error={attendance.error}
            forbidden={attendance.forbidden}
            count={(attendance.data ?? []).length}
            emptyText="Chưa có lượt check-in nào."
            onRetry={attendance.reload}
          />

          {(attendance.data ?? []).map(a => (
            <div key={a.hour} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[#0f172a] text-[12px]">{a.hour}</span>
                <span className="font-semibold text-[#0f172a] text-[12px]">{a.checkins} lượt</span>
              </div>
              <div className="bg-[#f1f5f9] h-1.5 rounded-full w-full">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${Math.round((a.checkins / maxCheckins) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── BUDGET PAGE ──────────────────────────────────────────────────────────────