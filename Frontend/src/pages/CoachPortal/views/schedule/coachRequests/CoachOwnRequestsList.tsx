import React from "react";
import type { ScheduleChangeRequest } from "../../../services/api";
import { REQUEST_STATUS_BADGE } from "../types";

interface Props {
  requests: ScheduleChangeRequest[];
}

export function CoachOwnRequestsList({ requests }: Props) {
  if (requests.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
        Chưa có yêu cầu nào được gửi.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {requests.map((req) => {
        const badge = REQUEST_STATUS_BADGE[req.status] || {
          label: req.status,
          bg: "bg-slate-100",
          text: "text-slate-600",
        };
        return (
          <div
            key={req.id}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-xs"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                  {req.className}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                  {req.requestType}
                </span>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${badge.bg} ${badge.text}`}
                >
                  {badge.label}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {req.requestType === "dạy thay" && req.substituteCoachName && (
                  <div>
                    HLV thay thế đề xuất:{" "}
                    <strong className="text-slate-800 dark:text-slate-100">
                      {req.substituteCoachName}
                    </strong>
                  </div>
                )}
                {req.newDate && (
                  <div>
                    Thời gian mới đề xuất:{" "}
                    <strong className="text-slate-800 dark:text-slate-100">
                      {req.newDate} {req.newTime}
                    </strong>
                  </div>
                )}
                <div>
                  Lý do: <span className="italic text-slate-500">"{req.reason}"</span>
                </div>
                {req.managerNote && (
                  <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                    Phản hồi quản lý: {req.managerNote}
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 shrink-0">
              Gửi lúc: {req.createdAt}
            </div>
          </div>
        );
      })}
    </div>
  );
}
