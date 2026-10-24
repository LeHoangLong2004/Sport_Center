import { useMemo, useState } from "react";
import type { CoachScheduleRequest } from "./useCoachScheduleRequests";
export type { CoachScheduleRequest } from "./useCoachScheduleRequests";

interface Props {
  requests: CoachScheduleRequest[];
  loading: boolean;
  onAction: (id: string, action: "approve" | "reject", managerNote: string) => Promise<void>;
}

const statusLabel: Record<string, string> = {
  pending: "Chờ duyệt",
  substitute_accepted: "HLV thay thế đã nhận (Chờ duyệt)",
  substitute_declined: "HLV thay thế từ chối",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

export function CoachScheduleRequestsSection({ requests, loading, onAction }: Props) {
  const [note, setNote] = useState<Record<string, string>>({});
  const pending = useMemo(
    () =>
      requests.filter(
        (item) =>
          item.status.toLowerCase() === "pending" ||
          item.status.toLowerCase() === "substitute_accepted",
      ),
    [requests],
  );

  return (
    <section className="coach-schedule-requests flex flex-col gap-5 pt-2">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Yêu cầu điều chỉnh ca dạy</h2>
        <p className="mt-1 text-sm text-slate-500">Duyệt yêu cầu đổi lịch, dạy thay hoặc báo vắng của Coach.</p>
      </div>
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Đang tải yêu cầu...</div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">Chưa có yêu cầu nào.</div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => {
            const isPending =
              request.status.toLowerCase() === "pending" ||
              request.status.toLowerCase() === "substitute_accepted";
            return (
              <article key={request.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900">{request.className}</h3>
                      <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{request.requestType}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isPending ? "bg-amber-50 text-amber-700" : request.status.toLowerCase() === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                        {statusLabel[request.status.toLowerCase()] || request.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Coach hiện tại: <strong>{request.coachName}</strong></p>
                    {request.substituteCoachName && <p className="text-sm text-slate-600">Coach thay thế: <strong>{request.substituteCoachName}</strong></p>}
                    {request.newDate && <p className="text-sm text-slate-600">Thời gian đề xuất: <strong>{request.newDate} {request.newTime}</strong></p>}
                    <p className="mt-2 text-sm text-slate-700">Lý do: <span className="italic">{request.reason}</span></p>
                    <p className="mt-1 text-xs text-slate-400">Gửi lúc: {request.createdAt}</p>
                    {request.managerNote && <p className="mt-2 text-sm font-medium text-emerald-700">Phản hồi: {request.managerNote}</p>}
                  </div>
                </div>
                {isPending && (
                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end">
                    <textarea
                      value={note[request.id] || ""}
                      onChange={(event) => setNote((current) => ({ ...current, [request.id]: event.target.value }))}
                      placeholder="Ghi chú cho Coach (không bắt buộc)"
                      rows={2}
                      className="min-h-10 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => void onAction(request.id, "reject", note[request.id] || "Yêu cầu đã bị Manager từ chối.")} className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50">Từ chối</button>
                      <button type="button" onClick={() => void onAction(request.id, "approve", note[request.id] || "Yêu cầu đã được Manager duyệt.")} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Duyệt</button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
      <div className="text-xs text-slate-400">{pending.length} yêu cầu đang chờ xử lý</div>
    </section>
  );
}
