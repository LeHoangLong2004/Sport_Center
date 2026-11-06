import type { CoachScreen } from "../../types";
import type { UnifiedScheduleItem } from "./types";
import { ScheduleSessionCard } from "./scheduleList/ScheduleSessionCard";

interface Props {
  byDate: [string, UnifiedScheduleItem[]][];
  todayStr: string;
  loading: boolean;
  onSelectOpenSlot: (item: UnifiedScheduleItem) => void;
  onSelectPtSession: (item: UnifiedScheduleItem) => void;
  onOpenRequestModal: (sessionId?: string) => void;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string; memberId?: string }) => void;
}

export default function ScheduleListView({
  byDate,
  todayStr,
  loading,
  onSelectOpenSlot,
  onSelectPtSession,
  onOpenRequestModal,
  navigateTo,
}: Props) {
  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        Đang tải lịch dạy...
      </div>
    );
  }

  if (byDate.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
        Không tìm thấy buổi học nào phù hợp với bộ lọc đã chọn.
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
            <div className="flex items-center gap-3">
              <div
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  isToday
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-300 dark:border-orange-800"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {label} {isToday && "• Hôm nay"}
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {daySessions.map((s) => (
                <ScheduleSessionCard
                  key={s.id}
                  session={s}
                  onSelectOpenSlot={onSelectOpenSlot}
                  onSelectPtSession={onSelectPtSession}
                  onOpenRequestModal={onOpenRequestModal}
                  navigateTo={navigateTo}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

