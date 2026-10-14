import { useMemo, useState, useEffect } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI } from "../services/api";
import type { MockSession, AttendanceRecord } from "../services/api";
import { useUserProfile } from "../../../hooks/useUserProfile";
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Star,
  MapPin,
  ArrowRight,
  AlertCircle,
  PlusCircle,
  CalendarDays,
  MessageSquare,
  Sparkles,
} from "lucide-react";

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

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  "sắp diễn ra": { label: "Sắp diễn ra", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400" },
  "đang diễn ra": { label: "Đang diễn ra", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400" },
  "hoàn thành": { label: "Hoàn thành", bg: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700", text: "text-slate-600 dark:text-slate-400" },
  "đã hủy": { label: "Đã hủy", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-400" },
};

export default function CoachDashboard({ navigateTo }: Props) {
  const { profile } = useUserProfile('coach');
  const userStr = localStorage.getItem("user");
  let coachName = "Huấn luyện viên";
  if (profile?.fullName) {
    coachName = profile.fullName;
  } else if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u.role?.toLowerCase() === 'coach' || u.roleName?.toLowerCase() === 'coach') {
        coachName = u.fullName || u.name || "Huấn luyện viên";
      }
    } catch (e) {}
  }

  const [todaySessions, setTodaySessions] = useState<MockSession[]>([]);
  const [attendances, setAttendances] = useState<Record<string, AttendanceRecord[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const allSessions = await CoachAPI.getSchedule();
        const todayStr = new Date().toISOString().split("T")[0];
        const todays = allSessions.filter((s: MockSession) => s.date === todayStr);
        setTodaySessions(todays);

        const atts: Record<string, AttendanceRecord[]> = {};
        for (const s of todays) {
          atts[s.id] = await CoachAPI.getAttendance(s.id);
        }
        setAttendances(atts);
      } catch (err) {
        console.error("Lỗi nạp dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalRegistrations = useMemo(
    () => todaySessions.reduce((s, c) => s + (c.registeredMemberIds?.length ?? (c as any).registeredCount ?? 0), 0),
    [todaySessions]
  );

  const pendingAttendanceCount = useMemo(
    () =>
      todaySessions.filter((session) => {
        if (session.status === "đã hủy") return false;
        const recs = attendances[session.id] || [];
        return recs.some((r) => r.status === "chưa điểm danh");
      }).length,
    [todaySessions, attendances]
  );

  const nextSession = useMemo(
    () =>
      todaySessions.find((s) => s.status === "đang diễn ra") ||
      todaySessions.find((s) => s.status === "sắp diễn ra") ||
      todaySessions[0],
    [todaySessions]
  );

  const pendingSessions = useMemo(() => {
    return todaySessions.filter((s) => {
      if (s.status === "đã hủy") return false;
      const recs = attendances[s.id] || [];
      return recs.some((r) => r.status === "chưa điểm danh");
    });
  }, [todaySessions, attendances]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* 1. WELCOME BANNER (Matching Member's modern hero card, styled for Coach) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 text-white shadow-lg border border-slate-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold border border-orange-500/30">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Huấn luyện viên SportCenter</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Xin chào, {coachName} 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Chào mừng bạn trở lại! Hôm nay bạn có <strong className="text-orange-400">{todaySessions.length} ca dạy</strong> được xếp lịch ({totalRegistrations} học viên). Hãy duy trì năng lượng và đồng hành cùng học viên nhé!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo("schedule")}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center gap-2"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Lịch dạy hôm nay</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo("attendance")}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs backdrop-blur-sm transition-all flex items-center gap-1.5 border border-white/10"
            >
              <CheckCircle2 className="w-4 h-4 text-orange-400" />
              <span>Điểm danh lớp ({pendingAttendanceCount})</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle background blur lights */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-48 -bottom-16 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* Modern SaaS Stat Cards (Minimalist, border-focused, no loud gradients) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Calendar className="w-5 h-5 text-slate-700 dark:text-slate-300" />}
          label="Buổi dạy hôm nay"
          value={todaySessions.length}
          sub="buổi học trong ngày"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-slate-700 dark:text-slate-300" />}
          label="Lượt học viên"
          value={totalRegistrations}
          sub="đã đăng ký tham gia"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />}
          label="Cần điểm danh"
          value={pendingAttendanceCount}
          sub={pendingAttendanceCount > 0 ? "buổi chưa hoàn tất" : "đã xong toàn bộ"}
          highlight={pendingAttendanceCount > 0}
        />
        <StatCard
          icon={<Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
          label="Đánh giá trung bình"
          value="4.9"
          sub="Dựa trên 142 lượt nhận xét"
          onClick={() => navigateTo("reviews")}
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Schedule */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Lịch dạy hôm nay
            </h2>
            <button
              type="button"
              onClick={() => navigateTo("schedule")}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              Đang tải lịch hôm nay...
            </div>
          ) : todaySessions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
              Hôm nay bạn không có ca dạy nào. Hãy tận hưởng thời gian nghỉ hoặc soạn giáo án mới!
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {todaySessions.map((s) => {
                const badge = STATUS_BADGE[s.status] || {
                  label: s.status,
                  bg: "bg-slate-100",
                  text: "text-slate-600",
                };
                const recs = attendances[s.id] || [];
                const pending = recs.filter((r) => r.status === "chưa điểm danh").length;
                const isCancelled = s.status === "đã hủy";

                return (
                  <div
                    key={s.id}
                    className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-sm ${
                      isCancelled ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                        <span className="font-semibold text-base text-slate-900 dark:text-white">
                          {s.className}
                        </span>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          {s.sport}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {s.startTime} – {s.endTime}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {s.room}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {(s.registeredMemberIds?.length ?? (s as any).registeredCount ?? 0)}/{s.capacity} học viên
                        </span>
                      </div>

                      {pending > 0 && !isCancelled && (
                        <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Còn {pending} học viên chưa được điểm danh
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => navigateTo("attendance", { sessionId: s.id })}
                          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                        >
                          Điểm danh
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => navigateTo("class-detail", { sessionId: s.id })}
                        className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 col): Next Session, Todos & Quick Links */}
        <div className="flex flex-col gap-6">
          {/* Next upcoming class highlight */}
          {nextSession && (
            <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Lớp sắp bắt đầu
                </span>
                <h3 className="text-lg font-bold mt-1 text-white">{nextSession.className}</h3>
                <div className="text-xs text-slate-300 space-y-1 mt-2 font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {nextSession.startTime} – {nextSession.endTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {nextSession.room}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {(nextSession.registeredMemberIds?.length ?? (nextSession as any).registeredCount ?? 0)} học viên
                </span>
                <button
                  type="button"
                  onClick={() => navigateTo("class-detail", { sessionId: nextSession.id })}
                  className="px-4 py-1.5 text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Vào lớp ngay →
                </button>
              </div>
            </div>
          )}

          {/* Pending to-dos */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl flex flex-col gap-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Việc cần xử lý</span>
              <span className="text-xs font-semibold text-slate-400">
                {pendingSessions.length} việc
              </span>
            </h3>

            {pendingSessions.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 text-center font-medium">
                🎉 Tuyệt vời! Không có buổi học nào bị tồn đọng điểm danh.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {pendingSessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => navigateTo("attendance", { sessionId: s.id })}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        Chưa chốt điểm danh
                      </span>
                      <span className="text-[11px] text-slate-500">{s.className} ({s.startTime})</span>
                    </div>
                    <span className="text-emerald-600 font-semibold text-xs">Xử lý →</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl flex flex-col gap-2.5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Truy cập nhanh
            </h3>
            <button
              type="button"
              onClick={() => navigateTo("curriculum")}
              className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-slate-500" /> Soạn giáo án bài tập mới
              </span>
              <span>→</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo("reviews")}
              className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" /> Xem nhận xét & Đánh giá từ học viên
              </span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  highlight,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub: string;
  highlight?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 transition-all ${
        highlight
          ? "border-amber-300 dark:border-amber-700/60 shadow-sm"
          : "border-slate-200/90 dark:border-slate-800 shadow-sm"
      } ${onClick ? "cursor-pointer hover:border-slate-400" : ""}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        {value}
      </div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  );
}
