import React from "react";
import { Calendar, User, MapPin, UserCheck, ChevronRight } from "lucide-react";
import type { CoachScheduleRequest } from "../useCoachScheduleRequests";
import { statusConfig } from "./types";

interface Props {
  request: CoachScheduleRequest;
  onOpenDetail: (request: CoachScheduleRequest) => void;
}

export function CoachScheduleRequestCard({ request, onOpenDetail }: Props) {
  const isPending =
    request.status.toLowerCase() === "pending" ||
    request.status.toLowerCase() === "substitute_accepted";
  const cfg = statusConfig[request.status.toLowerCase()] || statusConfig.pending;

  return (
    <div
      onClick={() => onOpenDetail(request)}
      className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
            {request.className}
          </span>
          {request.sportName && (
            <span className="rounded bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
              {request.sportName}
            </span>
          )}
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
            {request.requestType}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
          >
            {cfg.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>{request.sessionTime || request.scheduleTime || "Thời gian ca dạy"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Coach: <strong>{request.coachName}</strong></span>
          </div>
          {request.roomName && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{request.roomName}</span>
            </div>
          )}
          {request.substituteCoachName && (
            <div className="flex items-center gap-1 text-indigo-600 font-semibold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Dạy thay: {request.substituteCoachName}</span>
            </div>
          )}
        </div>

        <p className="mt-2 text-xs text-slate-500 line-clamp-1 italic">
          Lý do: &ldquo;{request.reason}&rdquo;
        </p>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(request);
          }}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
            isPending
              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <span>{isPending ? "Xem & Xử lý" : "Xem chi tiết"}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
