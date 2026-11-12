import { Sparkles } from "lucide-react";
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
  onOpenSlotModal?: (defaultDate?: string) => void;
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
}: Props) {
  return (
    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
      <div className="min-w-[960px]">
        {/* Header Row: Giờ | Thứ 2 | Thứ 3 | Thứ 4 | Thứ 5 | Thứ 6 | Thứ 7 | Chủ nhật */}
        <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850">
          <div className="p-3 text-xs font-semibold text-slate-400 text-center border-r border-slate-200 dark:border-slate-800">
            Giờ
          </div>
          {DAYS_NAMES.map((d, di) => {
            const dateStr = weekDates[di];
            const isToday = dateStr === todayStr;
            return (
              <div
                key={d}
                className={`p-3 text-xs font-semibold text-center border-r border-slate-200 dark:border-slate-800 last:border-0 ${
                  isToday
                    ? "bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <div>{d}</div>
                <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                  {dateStr?.split("-").slice(1).reverse().join("/")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid Rows by Time */}
        {TIME_ROWS.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-8 min-h-[92px] border-b border-slate-100 dark:border-slate-800/60 last:border-0"
          >
            <div className="p-2 text-xs text-slate-400 font-medium border-r border-slate-200 dark:border-slate-800 flex items-center justify-center">
              {hour}
            </div>

            {DAYS_NAMES.map((_, di) => {
              const colDate = weekDates[di];
              const cellSessions = filteredSessions.filter((s) => {
                const isSameDay = s.date === colDate;
                const isSameHour = s.startTime.startsWith(hour.slice(0, 2));
                return isSameDay && isSameHour;
              });

              return (
                <div
                  key={di}
                  className="p-1.5 border-r border-slate-100 dark:border-slate-800/60 last:border-0 relative space-y-1.5"
                >
                  {cellSessions.map((sessionItem) => {
                    const isPT = sessionItem.type === "pt";
                    const isOpenPT = sessionItem.type === "open_pt";
                    const isPendingApproval = !isPT && !isOpenPT && sessionItem.approvalStatus === "pending";
                    return (
                      <button
                        key={sessionItem.id}
                        type="button"
                        onClick={() => {
                          if (isOpenPT) {
                            onSelectOpenSlot(sessionItem);
                          } else if (isPT) {
                            onSelectPtSession(sessionItem);
                          } else {
                            navigateTo("class-detail", { sessionId: sessionItem.id });
                          }
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between shadow-xs hover:shadow-md cursor-pointer ${
                          isPendingApproval
                            ? "bg-slate-50/70 dark:bg-slate-950/30 border-slate-300 dark:border-slate-700"
                            : isOpenPT
                            ? "bg-slate-50/70 dark:bg-slate-950/30 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-500 hover:bg-slate-50"
                            : isPT
                            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/90 dark:border-emerald-800/60 hover:border-emerald-400"
                            : "bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.2 rounded ${
                                isOpenPT
                                  ? "bg-slate-100 text-slate-800 dark:bg-slate-900/60 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                                  : isPT
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              }`}
                            >
                              {isOpenPT ? "Trống 1–1" : isPT ? "PT 1–1" : sessionItem.sport}
                            </span>

                            <span className="text-[10px] text-slate-400 ">
                              {sessionItem.startTime}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                            {isOpenPT
                              ? sessionItem.className
                              : isPT
                              ? sessionItem.memberName
                              : sessionItem.className}
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between mt-1 pt-1 border-t border-slate-100 dark:border-slate-700/40">
                          <span className="truncate">{sessionItem.room}</span>
                          {isOpenPT ? (
                            <span className="text-slate-600 dark:text-slate-400 font-semibold truncate flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> Mở nhận HV
                            </span>
                          ) : isPT ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[80px]">
                              {sessionItem.goal}
                            </span>
                          ) : (
                            <span>{sessionItem.registeredCount} HV</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
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
                          onClick={() => onOpenSlotModal(colDate)}
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
        ))}
      </div>
    </div>
  );
}
