import React, { useState } from "react";

interface ScheduleProposalsSectionProps {
  classes: any[];
  pendingProposals: any[];
  onSelectClass: (id: string) => void;
  onClassApproval: (id: string, action: "approve" | "reject") => Promise<boolean>;
}

export const ScheduleProposalsSection: React.FC<ScheduleProposalsSectionProps> = ({
  classes,
  pendingProposals,
  onSelectClass,
  onClassApproval,
}) => {
  const [proposalSearch, setProposalSearch] = useState("");

  const filteredProposals = pendingProposals.filter((item) => {
    const query = proposalSearch.trim().toLowerCase();
    if (!query) return true;
    return [item.name, item.sport, item.coach, item.room]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">Lớp học chờ duyệt</h2>
          <p className="mt-1 text-xs text-slate-600">Các đề xuất từ Coach chưa được công khai cho hội viên.</p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
          {pendingProposals.length} đề xuất
        </span>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Chờ duyệt</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{pendingProposals.length}</p>
          <p className="mt-1 text-xs text-slate-500">Đề xuất cần xử lý</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tổng lớp</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{classes.length}</p>
          <p className="mt-1 text-xs text-slate-500">Đang có trên hệ thống</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Đã công khai</p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {classes.filter((item) => item.approvalStatus === "approved").length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Lớp đang hiển thị cho hội viên</p>
        </div>
      </div>

      {pendingProposals.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-emerald-600 shadow-sm ring-1 ring-slate-200">✓</div>
          <p className="text-sm font-semibold text-slate-700">Hiện không có đề xuất chờ duyệt</p>
          <p className="mt-1 text-xs text-slate-500">Các đề xuất mới từ Coach sẽ hiển thị tại đây.</p>
        </div>
      )}

      {pendingProposals.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">Danh sách đề xuất</p>
            <p className="text-xs text-slate-500">Bấm vào một dòng để xem đầy đủ thông tin lớp học.</p>
          </div>
          <input
            value={proposalSearch}
            onChange={(event) => setProposalSearch(event.target.value)}
            placeholder="Tìm theo tên lớp, môn, Coach..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 sm:max-w-xs"
          />
        </div>
      )}

      {pendingProposals.length > 0 && filteredProposals.length === 0 && (
        <div className="mb-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
          Không tìm thấy đề xuất phù hợp.
        </div>
      )}

      {filteredProposals.length > 0 && (
        <div className="mb-4 overflow-hidden rounded-xl border border-slate-200">
          <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(150px,1fr)_minmax(170px,1fr)_110px_160px] gap-4 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 md:grid">
            <span>Lớp học</span>
            <span>Coach</span>
            <span>Thời gian</span>
            <span>Trạng thái</span>
            <span className="text-right">Thao tác</span>
          </div>
          <div className="divide-y divide-slate-100 bg-white">
            {filteredProposals.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectClass(item.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") onSelectClass(item.id);
                }}
                className="grid cursor-pointer gap-3 px-4 py-4 transition hover:bg-emerald-50/40 md:grid-cols-[minmax(0,1.6fr)_minmax(150px,1fr)_minmax(170px,1fr)_110px_160px] md:items-center md:gap-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.sport} · {item.room}</p>
                </div>
                <div className="text-sm text-slate-700">{item.coach || "Chưa phân công"}</div>
                <div className="text-sm text-slate-700">{item.rawStart.toLocaleString("vi-VN")}</div>
                <div>
                  <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                    Chờ duyệt
                  </span>
                </div>
                <div
                  className="flex min-w-0 flex-col gap-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onSelectClass(item.id)}
                    className="w-full whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Xem chi tiết
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => void onClassApproval(item.id, "approve")}
                      className="whitespace-nowrap rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      Duyệt
                    </button>
                    <button
                      type="button"
                      onClick={() => void onClassApproval(item.id, "reject")}
                      className="whitespace-nowrap rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
