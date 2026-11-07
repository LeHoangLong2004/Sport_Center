import React, { useMemo } from "react";
import { Clock, MapPin, User, Users, Eye, ChevronRight, Calendar as CalendarIcon, Sparkles } from "lucide-react";

interface ScheduleListViewProps {
  classes: any[];
  onSelectClass: (id: string) => void;
  onToday: () => void;
  onCreateClass?: () => void;
}

export function ScheduleListView({
  classes,
  onSelectClass,
  onToday,
  onCreateClass,
}: ScheduleListViewProps) {
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const getSessionStatus = (item: any) => {
    if (item.isCancelled) {
      return {
        label: "Đã hủy",
        bg: "bg-rose-50 text-rose-700 border-rose-200",
        dot: "bg-rose-500",
      };
    }
    if (item.approvalStatus === "pending") {
      return {
        label: "Chờ duyệt",
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
      };
    }

    const now = new Date();
    const start = item.rawStart instanceof Date ? item.rawStart : new Date(item.rawStart);
    const end = new Date(start.getTime() + (item.durationMinutes || 60) * 60000);

    if (now > end) {
      return {
        label: "Hoàn thành",
        bg: "bg-slate-100 text-slate-600 border-slate-200",
        dot: "bg-slate-400",
      };
    }
    if (now >= start && now <= end) {
      return {
        label: "Đang diễn ra",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
        dot: "bg-emerald-500 animate-pulse",
      };
    }
    return {
      label: "Sắp diễn ra",
      bg: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
    };
  };

  const byDate = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const c of classes) {
      const start = c.rawStart instanceof Date ? c.rawStart : new Date(c.rawStart);
      const dateKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
      const arr = map.get(dateKey) || [];
      arr.push(c);
      map.set(dateKey, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [classes]);

  if (classes.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
          <CalendarIcon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">
            Không có lớp học nào trong khoảng thời gian này
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Không tìm thấy lớp học nào phù hợp với bộ lọc phòng tập, từ khóa tìm kiếm hoặc tuần đang chọn.
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onToday}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            Về tuần hiện tại
          </button>
          {onCreateClass && (
            <button
              type="button"
              onClick={onCreateClass}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              + Tạo lớp học mới
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {byDate.map(([dateKey, dayClasses]) => {
        const d = new Date(dateKey + "T00:00:00");
        const isToday = dateKey === todayStr;
        const label = d.toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
        });

        return (
          <div key={dateKey} className="flex flex-col gap-3">
            {/* Date Header Pill */}
            <div className="flex items-center gap-3">
              <div
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  isToday
                    ? "bg-orange-100 text-orange-800 border border-orange-300"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {label} {isToday && "• Hôm nay"}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                ({dayClasses.length} lớp học)
              </span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            {/* List of class cards for this day */}
            <div className="grid grid-cols-1 gap-3">
              {dayClasses
                .sort((a, b) => {
                  const timeA = (a.rawStart instanceof Date ? a.rawStart : new Date(a.rawStart)).getTime();
                  const timeB = (b.rawStart instanceof Date ? b.rawStart : new Date(b.rawStart)).getTime();
                  return timeA - timeB;
                })
                .map((item) => {
                  const start = item.rawStart instanceof Date ? item.rawStart : new Date(item.rawStart);
                  const end = new Date(start.getTime() + (item.durationMinutes || 60) * 60000);
                  const startTime = start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                  const endTime = end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                  const status = getSessionStatus(item);
                  const isPT = /pt|personal|1:1|cá nhân/i.test(`${item.sport || ""} ${item.name || ""}`);

                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectClass(item.id)}
                      className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-xs hover:border-orange-300 hover:shadow-md cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0">
                        {/* Title and Badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                            {item.name}
                          </h4>
                          <span
                            className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide border ${
                              isPT
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : "bg-emerald-100 text-emerald-800 border-emerald-300"
                            }`}
                          >
                            {isPT ? "Kèm 1–1 (PT)" : "Lớp Nhóm"}
                          </span>
                          {item.sport && (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                              {item.sport}
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${status.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </div>

                        {/* Metadata row */}
                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {startTime} – {endTime} ({item.durationMinutes || 60}p)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {item.room}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <User className="w-3.5 h-3.5 text-orange-500" />
                            HLV: {item.coach || "Chưa phân công"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {item.enrolled} học viên
                          </span>
                        </div>
                      </div>

                      {/* Right Action Button */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectClass(item.id);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-slate-700 hover:text-orange-600 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                          <ChevronRight className="w-3.5 h-3.5" />
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
export default ScheduleListView;
