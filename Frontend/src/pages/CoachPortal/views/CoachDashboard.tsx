import { useMemo, useState, useEffect } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI } from "../services/api";
import type { MockSession, AttendanceRecord } from "../services/api";
import { useUserProfile } from "../../../hooks/useUserProfile";
import {
  Calendar,
  Users,
  CheckCircle2,
  Star,
  CalendarDays,
} from "lucide-react";
import { TodaySessionsList } from "./dashboard/TodaySessionsList";
import { DashboardSidebar } from "./dashboard/DashboardSidebar";

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

      {/* Modern SaaS Stat Cards */}
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
        <TodaySessionsList
          loading={loading}
          todaySessions={todaySessions}
          attendances={attendances}
          navigateTo={navigateTo}
        />

        <DashboardSidebar
          nextSession={nextSession}
          pendingSessions={pendingSessions}
          navigateTo={navigateTo}
        />
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
