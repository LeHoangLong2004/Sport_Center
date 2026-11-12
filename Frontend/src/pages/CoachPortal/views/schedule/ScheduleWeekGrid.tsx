import { Sparkles, Clock, MapPin, Users, CheckCircle2, Eye, Plus } from "lucide-react";
import type { CoachScreen } from "../../types";
import { DAYS_NAMES, TIME_ROWS, type UnifiedScheduleItem } from "./types";
import { isAttendanceLocked24h } from "../../utils/attendanceLock";

interface Props {
  weekDates: string[];
  todayStr: string;
  filteredSessions: UnifiedScheduleItem[];
  onSelectOpenSlot: (item: UnifiedScheduleItem) => void;
  onSelectPtSession: (item: UnifiedScheduleItem) => void;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string; memberId?: string }) => void;
  onSwitchToList?: () => void;
  onOpenSlotModal?: (defaultDate?: string, defaultHour?: string) => void;
  nearestSessionInfo?: any;
  onJumpToWeek?: (offset: number) => void;
}

export default function ScheduleWeekGrid({
  weekDates,
  todayStr,
  filteredSessions,
  onSelectOpenSlot,
  onSelectPtSession,
  navigateTo,
  onOpenSlotModal,
}: Props) {
  const activeTimeRows = TIME_ROWS;

  return (
    <div className="flex flex-col gap-4">
      {/* Thanh trạng thái tuần & Đăng ca rảnh (Đồng bộ hiển thị trên tất cả các tuần) */}
      <div className="p-4 md:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {hasSessionsInWeek
                  ? `Lịch dạy tuần này (${weekRangeLabel})`
                  : `Tuần này chưa có ca dạy (${weekRangeLabel})`}
              </h4>
              {hasSessionsInWeek ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {weekSessionsCount} ca dạy
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Trống lịch
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {hasSessionsInWeek
                ? "Bấm vào các khung giờ trống trên bảng lịch hoặc bấm Đăng ca rảnh để mở nhận thêm học viên 1–1."
                : "Bạn có thể bấm trực tiếp vào các khung giờ trên lịch để mở ca nhận học viên 1–1."}
            </p>
          </div>
        </div>

        {/* Body Rows theo từng khung giờ */}
        {activeTimeRows.map((hour) => {
            const hourNum = parseInt(hour.split(":")[0], 10);

            return (
              <div
                key={hour}
                className="grid grid-cols-[76px_repeat(7,1fr)] min-h-[84px] border-b border-slate-100 dark:border-slate-800/60 last:border-b-0"
              >
                {/* Cột thời gian bên trái */}
                <div className="p-2 text-xs text-slate-400 dark:text-slate-500 font-semibold border-r border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850/40 flex items-start justify-center pt-2.5 select-none">
                  {hour}
                </div>

                {/* 7 ô tương ứng 7 ngày trong tuần */}
                {DAYS_NAMES.map((_, di) => {
                  const colDate = weekDates[di];
                  const isToday = colDate === todayStr;

                  // Lọc ca dạy rơi vào khung giờ này (khớp giờ bắt đầu)
                  const cellSessions = filteredSessions.filter((s) => {
                    if (s.date !== colDate) return false;
                    const sessionStartH = parseInt(s.startTime.split(":")[0], 10);
                    return sessionStartH === hourNum;
                  });

                  return (
                    <div
                      key={di}
                      className={`p-1.5 border-r border-slate-100 dark:border-slate-800/60 last:border-r-0 relative group flex flex-col gap-1.5 transition-colors ${
                        isToday
                          ? "bg-emerald-50/15 dark:bg-emerald-950/10"
                          : "hover:bg-slate-50/60 dark:hover:bg-slate-800/20"
                      }`}
                    >
                      {/* Hiển thị các ca dạy trong khung giờ */}
                      {cellSessions.map((s) => {
                        const isPT = s.type === "pt";
                        const isOpenPT = s.type === "open_pt";
                        const isGroup = !isPT && !isOpenPT;
                        const isPendingApproval = isGroup && s.approvalStatus === "pending";

                        return (
                          <div
                            key={s.id}
                            className={`rounded-xl p-2.5 border transition-all shadow-2xs hover:shadow-md flex flex-col justify-between gap-1.5 text-left ${
                              isOpenPT
                                ? "border-l-4 border-l-slate-400 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-850"
                                : isPT
                                ? "border-l-4 border-l-teal-500 border-teal-200/90 dark:border-teal-800/60 bg-teal-50/50 dark:bg-teal-950/20"
                                : isPendingApproval
                                ? "border-l-4 border-l-amber-500 border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20"
                                : "border-l-4 border-l-emerald-500 border-emerald-200/90 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20"
                            }`}
                          >
                            {/* Khung giờ & Badge bộ môn */}
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-800 dark:text-slate-200">
                                  <Clock className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                  {s.startTime} – {s.endTime}
                                </span>
                                <span
                                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                                    isOpenPT
                                      ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                      : isPT
                                      ? "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300"
                                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  }`}
                                >
                                  {isOpenPT ? "Trống" : isPT ? "PT 1–1" : s.sport}
                                </span>
                              </div>

                              {/* Tên lớp / Tên học viên */}
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                {isOpenPT
                                  ? s.className
                                  : isPT
                                  ? s.memberName || s.className
                                  : s.className}
                              </h5>

                              {/* Phòng học & Sĩ số */}
                              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                                <span className="flex items-center gap-1 truncate" title={s.room}>
                                  <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{s.room}</span>
                                </span>

                                {isOpenPT ? (
                                  <span className="text-slate-600 dark:text-slate-400 font-semibold shrink-0 flex items-center gap-0.5">
                                    <Sparkles className="w-2.5 h-2.5" /> Mở
                                  </span>
                                ) : isPT ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[70px]">
                                    {s.goal || "1–1"}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-0.5 shrink-0 font-medium">
                                    <Users className="w-2.5 h-2.5 text-slate-400" />
                                    {s.registeredCount}/{s.capacity}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Nút hành động trực tiếp */}
                            <div className="flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                              {isOpenPT ? (
                                <button
                                  type="button"
                                  onClick={() => onSelectOpenSlot(s)}
                                  className="w-full py-0.5 px-2 text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 rounded-md transition-colors cursor-pointer text-center"
                                >
                                  Hủy ca
                                </button>
                              ) : isPT ? (
                                <button
                                  type="button"
                                  onClick={() => onSelectPtSession(s)}
                                  className="w-full py-0.5 px-2 text-[10px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 rounded-md transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                                >
                                  <Eye className="w-2.5 h-2.5" />
                                  <span>Chi tiết PT</span>
                                </button>
                              ) : (
                                <>
                                  {isAttendanceLocked24h(s.date, s.startTime) ? (
                                    <button
                                      type="button"
                                      onClick={() => navigateTo("attendance", { sessionId: s.id })}
                                      className="flex-1 py-1 px-1.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors shadow-2xs cursor-pointer text-center flex items-center justify-center gap-1"
                                    >
                                      <Eye className="w-2.5 h-2.5" />
                                      <span>Xem điểm danh</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => navigateTo("attendance", { sessionId: s.id })}
                                      className="flex-1 py-1 px-1.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-2xs cursor-pointer text-center flex items-center justify-center gap-1"
                                    >
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                      <span>Điểm danh</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => navigateTo("class-detail", { sessionId: s.id })}
                                    className="py-1 px-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                                  >
                                    Chi tiết
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Khi ô trống: Nút bấm nhẹ nhàng khi hover để mở ca rảnh tại khung giờ này */}
                      {cellSessions.length === 0 && onOpenSlotModal && (
                        <button
                          type="button"
                          onClick={() => onOpenSlotModal(colDate, hour)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-full h-full min-h-[40px] flex items-center justify-center text-[10px] font-semibold text-slate-400 hover:text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 rounded-lg border border-dashed border-transparent hover:border-emerald-300 dark:hover:border-emerald-800 cursor-pointer gap-1"
                          title={`Mở ca rảnh ${hour} ngày ${colDate}`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>Mở ca</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
