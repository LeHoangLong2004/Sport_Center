/**
 * CO-01 — Tổng quan
 * Dữ liệu tính từ cùng nguồn mock với màn chi tiết (spec §15.1 & CO-01).
 */
import { useMemo, useState, useEffect } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI } from "../services/api";
import type { MockSession, AttendanceRecord } from "../services/api"; // Dùng type tạm

interface Props {
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string }) => void;
}

const today = new Date();
const dateLabel = today.toLocaleDateString("vi-VN", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default function CoachDashboard({ navigateTo }: Props) {
  const [todaySessions, setTodaySessions] = useState<MockSession[]>([]);
  const [attendances, setAttendances] = useState<Record<string, AttendanceRecord[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const stats = await CoachAPI.getDashboardStats(); // Gọi nhưng chưa dùng hết trên UI
        const allSessions = await CoachAPI.getSchedule();
        const todayStr = new Date().toISOString().split("T")[0];
        const todays = allSessions.filter((s: MockSession) => s.date === todayStr);
        setTodaySessions(todays);
        
        // Load điểm danh cho từng buổi hôm nay
        const atts: Record<string, AttendanceRecord[]> = {};
        for (const s of todays) {
          atts[s.id] = await CoachAPI.getAttendance(s.id);
        }
        setAttendances(atts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Tính các chỉ số
  const totalRegistrations = useMemo(
    () => todaySessions.reduce((s, c) => s + c.registeredMemberIds.length, 0),
    [todaySessions]
  );

  const pendingAttendance = useMemo(
    () =>
      todaySessions.filter((session) => {
        if (session.status === "đã hủy") return false;
        const recs = attendances[session.id] || [];
        return recs.some((r) => r.status === "chưa điểm danh");
      }).length,
    [todaySessions, attendances]
  );

  // Buổi sắp bắt đầu (ưu tiên đang diễn ra, rồi sắp diễn ra)
  const upcomingSession = useMemo(
    () =>
      todaySessions.find((s) => s.status === "đang diễn ra") ||
      todaySessions.find((s) => s.status === "sắp diễn ra"),
    [todaySessions]
  );

  // Việc cần xử lý
  const todos = useMemo(() => {
    const list: string[] = [];
    todaySessions.forEach((s) => {
      if (s.status === "đã hủy") return;
      const recs = attendances[s.id] || [];
      const pending = recs.filter((r) => r.status === "chưa điểm danh").length;
      if (pending > 0) list.push(`Chưa điểm danh ${pending} học viên — ${s.className}`);
    });
    return list;
  }, [todaySessions, attendances]);

  const statusColor: Record<string, string> = {
    "sắp diễn ra": "bg-blue-100 text-blue-700",
    "đang diễn ra": "bg-green-100 text-green-700",
    "hoàn thành": "bg-gray-100 text-gray-600",
    "đã hủy": "bg-red-100 text-red-600",
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
      {/* Lời chào */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Xin chào, HLV! 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{dateLabel}</p>
      </div>

      {/* Thống kê — tính từ cùng dữ liệu lịch + điểm danh */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Buổi dạy hôm nay"
          value={todaySessions.length}
          color="text-teal-600"
          bg="bg-teal-50 dark:bg-teal-900/20"
        />
        <StatCard
          label="Lượt học viên"
          value={totalRegistrations}
          sub="hôm nay"
          color="text-blue-600"
          bg="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          label="Buổi chưa điểm danh"
          value={pendingAttendance}
          color={pendingAttendance > 0 ? "text-amber-600" : "text-green-600"}
          bg={pendingAttendance > 0 ? "bg-amber-50 dark:bg-amber-900/20" : "bg-green-50 dark:bg-green-900/20"}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Lịch hôm nay */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800 dark:text-white text-lg">Lịch dạy hôm nay</h2>
            <button
              type="button"
              className="text-sm text-teal-600 hover:underline font-medium"
              onClick={() => navigateTo("schedule")}
            >
              Xem lịch →
            </button>
          </div>

          {loading ? (
            <EmptyState text="Đang tải dữ liệu..." />
          ) : todaySessions.length === 0 ? (
            <EmptyState text="Không có buổi học nào hôm nay." />
          ) : (
            <div className="flex flex-col gap-3">
              {todaySessions.map((s) => {
                const recs = attendances[s.id] || [];
                const pending = recs.filter((r) => r.status === "chưa điểm danh").length;
                return (
                  <div
                    key={s.id}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => navigateTo("class-detail", { sessionId: s.id })}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 transition-colors">
                          {s.className}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[s.status]}`}>
                          {s.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {s.startTime}–{s.endTime} · {s.room} · {s.registeredMemberIds.length}/{s.capacity} người
                      </div>
                      {pending > 0 && (
                        <div className="text-xs text-amber-600 mt-1 font-medium">
                          ⚠ {pending} học viên chưa điểm danh
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo("class-detail", { sessionId: s.id });
                        }}
                      >
                        Chi tiết
                      </button>
                      {s.status !== "đã hủy" && (
                        <button
                          type="button"
                          className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo("attendance", { sessionId: s.id });
                          }}
                        >
                          Điểm danh
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Việc cần xử lý */}
        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-slate-800 dark:text-white text-lg">Việc cần xử lý</h2>
          {todos.length === 0 ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-green-700 dark:text-green-300 text-sm font-medium">
              ✓ Không có việc nào cần xử lý hôm nay!
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {todos.map((t, i) => (
                <div
                  key={i}
                  className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-amber-800 dark:text-amber-200 text-sm"
                >
                  ⚠ {t}
                </div>
              ))}
            </div>
          )}

          {/* Buổi sắp bắt đầu */}
          {upcomingSession && (
            <div className="mt-2">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-2">Buổi sắp bắt đầu</h3>
              <div className="bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 rounded-xl p-4">
                <div className="font-semibold text-teal-700 dark:text-teal-300">{upcomingSession.className}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {upcomingSession.startTime}–{upcomingSession.endTime} · {upcomingSession.room}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {upcomingSession.registeredMemberIds.length}/{upcomingSession.capacity} người đăng ký
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, sub, color, bg,
}: {
  label: string; value: number; sub?: string; color: string; bg: string;
}) {
  return (
    <div className={`${bg} border border-transparent rounded-xl p-4`}>
      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{label}</div>
      <div className={`text-3xl font-black ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center text-slate-400 text-sm">
      {text}
    </div>
  );
}
