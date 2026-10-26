import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Navigate } from "./types";
import { Shell } from "./MemberShellV2";
import { MemberScheduleGrid, type ScheduleEvent } from "./MemberScheduleGrid";

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

function localIso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function getMonday(date = new Date()) {
  const monday = new Date(date);
  const day = monday.getDay();
  monday.setDate(monday.getDate() - day + (day === 0 ? -6 : 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function Schedule({ onNavigate }: { onNavigate: Navigate }) {
  const [allEvents, setAllEvents] = useState<ScheduleEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday());

  const weekDates = DAYS.map((label, index) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + index);
    return { label, iso: localIso(date) };
  });

  const getWeekString = () => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    return `${localIso(currentWeekStart).slice(8, 10)}/${localIso(currentWeekStart).slice(5, 7)} - ${
      localIso(end).slice(8, 10)
    }/${localIso(end).slice(5, 7)}, ${end.getFullYear()}`;
  };

  const handlePrevWeek = () => {
    const previous = new Date(currentWeekStart);
    previous.setDate(previous.getDate() - 7);
    setCurrentWeekStart(previous);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/schedule/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setAllEvents(
            data.map((item: any, index: number): ScheduleEvent => {
              const startDate = new Date(item.startTime);
              const type = String(item.sportType || "").toLowerCase();
              const tone: ScheduleEvent["tone"] =
                type.includes("pt") || item.role === "Coach"
                  ? "orange"
                  : type.includes("gym") || type.includes("cardio")
                    ? "green"
                    : "teal";

              return {
                id: String(item.id || `${startDate.getTime()}-${index}`),
                rawStart: startDate,
                column: startDate.getDay() === 0 ? 7 : startDate.getDay(),
                tone,
                title: item.className || "Lớp học",
                detail: item.coachName || "Coach",
                meta: item.roomName || "Phòng tập",
                sport: item.sportType || "Lớp nhóm",
                status: item.bookingStatus,
              };
            }),
          );
        } else if (response.status === 401 || response.status === 403) {
          toast.error("Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại để xem lịch!");
        }
      } catch (error) {
        console.error("Failed to fetch schedule", error);
      }
    };

    fetchSchedule();
  }, []);

  const calendarEvents = allEvents.filter((event) => {
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    return event.rawStart >= currentWeekStart && event.rawStart < endOfWeek;
  });

  const isCurrentWeek = localIso(currentWeekStart) === localIso(getMonday());
  const nextEvent = allEvents
    .filter((event) => event.rawStart > new Date())
    .sort((a, b) => a.rawStart.getTime() - b.rawStart.getTime())[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthEventCount = allEvents.filter(
    (event) => event.rawStart.getMonth() === currentMonth && event.rawStart.getFullYear() === currentYear,
  ).length;

  return (
    <Shell page="schedule" onNavigate={onNavigate}>
      <section className="p-8 bg-slate-50 min-h-[calc(100vh-78px)] flex gap-6 flex-col xl:flex-row items-start">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex-1 w-full min-w-0">
          <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-white">
            <div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={handlePrevWeek} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors" aria-label="Tuần trước">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">{isCurrentWeek ? "Tuần học hiện tại" : "Lịch học tuần"}</h2>
                <button type="button" onClick={handleNextWeek} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors" aria-label="Tuần sau">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5 ml-10">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                {getWeekString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setCurrentWeekStart(getMonday())} className="px-3.5 py-2 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 text-xs font-bold">
                Hôm nay
              </button>
              <div className="flex flex-wrap gap-4 bg-slate-50 px-4 py-2.5 rounded-full border border-slate-200/60">
                <LegendDot color="bg-teal-500" label="Lớp nhóm" />
                <LegendDot color="bg-orange-400" label="PT cá nhân" />
                <LegendDot color="bg-emerald-400" label="Tự tập tự do" />
              </div>
            </div>
          </div>

          <MemberScheduleGrid weekDates={weekDates} events={calendarEvents} onSelect={setSelectedEvent} />
        </div>

        <aside className="w-full xl:w-[320px] shrink-0 flex flex-col gap-6">
          <button type="button" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-4 rounded-2xl shadow-md shadow-teal-600/20 transition-all hover:-translate-y-0.5" onClick={() => onNavigate("classes")}>
            + Đặt lớp mới
          </button>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <strong className="block text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-4">Buổi tập tiếp theo</strong>
            {nextEvent ? (
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex flex-col items-center justify-center bg-white border border-slate-200 w-14 h-16 rounded-xl shadow-sm shrink-0">
                  <span className="text-[10px] font-bold text-teal-600 uppercase">{DAYS[nextEvent.column - 1]}</span>
                  <b className="text-xl font-black text-slate-800">{nextEvent.rawStart.getDate()}</b>
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="block text-base font-bold text-slate-800 truncate mb-1">{nextEvent.title}</strong>
                  <small className="block text-xs font-medium text-slate-500 truncate">{formatTime(nextEvent.rawStart)} • {nextEvent.detail}</small>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Chưa có lịch sắp tới</p>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <strong className="block text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-4">Tiến trình tháng {currentMonth + 1}</strong>
            <dl className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100"><dt className="text-sm font-medium text-slate-500">Số buổi tập</dt><dd className="text-sm font-bold text-slate-800">{monthEventCount} buổi</dd></div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100"><dt className="text-sm font-medium text-slate-500">Tiêu thụ calo (ước tính)</dt><dd className="text-sm font-bold text-orange-600">{(monthEventCount * 450).toLocaleString("vi-VN")} kcal</dd></div>
              <div className="flex justify-between items-center"><dt className="text-sm font-medium text-slate-500">Chuỗi tập</dt><dd className="text-sm font-bold text-emerald-600">✓ -- ngày</dd></div>
            </dl>
          </div>
        </aside>
      </section>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-label="Chi tiết lịch học">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-widest text-teal-600">Chi tiết lịch học</p><h3 className="mt-2 text-xl font-bold text-slate-800">{selectedEvent.title}</h3></div>
              <button type="button" onClick={() => setSelectedEvent(null)} className="rounded-lg p-2 text-xl leading-none text-slate-400 hover:bg-slate-100" aria-label="Đóng">×</button>
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <p><strong className="text-slate-800">Thời gian:</strong> {selectedEvent.rawStart.toLocaleDateString("vi-VN")} · {formatTime(selectedEvent.rawStart)}</p>
              <p><strong className="text-slate-800">Huấn luyện viên:</strong> {selectedEvent.detail}</p>
              <p><strong className="text-slate-800">Địa điểm:</strong> {selectedEvent.meta}</p>
              {selectedEvent.status && <p><strong className="text-slate-800">Trạng thái:</strong> {selectedEvent.status}</p>}
            </div>
            <button type="button" onClick={() => setSelectedEvent(null)} className="mt-6 w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700">Đóng</button>
          </div>
        </div>
      )}
    </Shell>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return <div className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${color}`} /><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</span></div>;
}
