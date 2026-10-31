import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Target,
  CheckCircle2,
  PlusCircle,
} from "lucide-react";
import type { MemberSessionItem, MemberScreen } from "../../types";
import { STATUS_BADGE } from "./scheduleConstants";

interface Props {
  byDate: [string, MemberSessionItem[]][];
  todayStr: string;
  onSelectSession: (session: MemberSessionItem) => void;
  onStartCancelSession: (session: MemberSessionItem) => void;
  onNavigate: (screen: MemberScreen) => void;
}

export default function ScheduleListView({
  byDate,
  todayStr,
  onSelectSession,
  onStartCancelSession,
  onNavigate,
}: Props) {
  if (byDate.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
        <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Không tìm thấy ca tập nào phù hợp
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Hãy đổi bộ lọc hoặc đăng ký thêm ca học mới nhé
        </p>
        <button
          type="button"
          onClick={() => onNavigate("booking")}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer shadow-emerald-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Đăng ký lớp ngay</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {byDate.map(([date, daySessions]) => {
        const d = new Date(date);
        const isToday = date === todayStr;
        const label = d.toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
        });

        return (
          <div key={date} className="flex flex-col gap-3">
            {/* Day Divider Header */}
            <div className="flex items-center gap-3">
              <div
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  isToday
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {label} {isToday && "• HÔM NAY"}
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            </div>

            {/* Day Sessions List */}
            <div className="grid grid-cols-1 gap-3">
              {daySessions.map((s) => {
                const badge = STATUS_BADGE[s.status] || {
                  label: s.status,
                  bg: "bg-slate-100",
                  text: "text-slate-600",
                };
                const isPT = s.type === "pt";

                return (
                  <div
                    key={s.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-xs"
                  >
                    <div className="flex-1 min-w-0">
                      {/* Top Badges Row */}
                      <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                        <span className="font-semibold text-base text-slate-900 dark:text-white">
                          {s.name}
                        </span>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            isPT
                              ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300"
                          }`}
                        >
                          {isPT ? "KÈM 1–1 (PT)" : "LỚP NHÓM"}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          {s.sport}
                        </span>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Meta Info Row */}
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {s.startTime} – {s.endTime}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {s.room}
                        </span>
                        {isPT ? (
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1 text-slate-800 dark:text-slate-100 font-bold">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              HLV: {s.coachName}
                            </span>
                            {s.goal && (
                              <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                                <Target className="w-3.5 h-3.5" />
                                Mục tiêu: {s.goal}
                              </span>
                            )}
                            {s.attendanceStatus === "có mặt" && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Có mặt
                              </span>
                            )}
                            {s.cancelReason && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                Lý do hủy: {s.cancelReason}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1 text-slate-800 dark:text-slate-100 font-medium">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              HLV: {s.coachName}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              {s.registeredCount || 8}/{s.capacity || 10} học viên
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Coach Feedback Note */}
                      {s.coachNote && (
                        <div className="mt-2 text-xs italic text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800 flex items-center gap-1.5">
                          <span>💬 Nhận xét từ HLV: "{s.coachNote}"</span>
                        </div>
                      )}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {s.status === "hoàn thành" ? (
                        <button
                          type="button"
                          onClick={() => onSelectSession(s)}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Điểm danh & Nhận xét
                        </button>
                      ) : s.status !== "đã hủy" ? (
                        <button
                          type="button"
                          onClick={() => onSelectSession(s)}
                          className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-xs cursor-pointer shadow-emerald-500/20"
                        >
                          Điểm danh
                        </button>
                      ) : null}

                      {s.status !== "đã hủy" && s.status !== "hoàn thành" && (
                        <button
                          type="button"
                          onClick={() => onStartCancelSession(s)}
                          className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs cursor-pointer"
                        >
                          Dời ca
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectSession(s)}
                        className="px-2 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        Chi tiết →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
