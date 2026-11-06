import { useMemo, useState, useEffect, useCallback } from "react";
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
  Sparkles,
  CalendarCheck,
} from "lucide-react";
import { TodaySessionsList } from "./dashboard/TodaySessionsList";
import { DashboardSidebar } from "./dashboard/DashboardSidebar";
import {
  AppointmentService,
  Appointment,
  APPOINTMENT_UPDATED_EVENT,
} from "../../../services/appointmentService";
import { toast } from "sonner";

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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dashboardStats, setDashboardStats] = useState<{ averageRating: number | null; reviewCount: number }>({
    averageRating: null,
    reviewCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    try {
      const apptData = await AppointmentService.getForCoach(coachName);
      setAppointments(apptData);
    } catch (e) {
      console.warn("Lỗi tải lịch hẹn lễ tân:", e);
    }
  }, [coachName]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [allSessions, stats, apptData] = await Promise.all([
          CoachAPI.getSchedule(),
          CoachAPI.getDashboardStats(),
          AppointmentService.getForCoach(coachName),
        ]);
        const todayStr = new Date().toISOString().split("T")[0];
        const todays = allSessions.filter((s: MockSession) => s.date === todayStr);
        setTodaySessions(todays);
        setAppointments(apptData);
        setDashboardStats({
          averageRating: typeof stats?.averageRating === "number" ? stats.averageRating : null,
          reviewCount: Number(stats?.reviewCount || 0),
        });

        // Tải danh sách điểm danh song song thay vì tuần tự để UI không bị đơ
        const attResults = await Promise.all(
          todays.map(async (s) => {
            try {
              const att = await CoachAPI.getAttendance(s.id);
              return { id: s.id, att };
            } catch {
              return { id: s.id, att: [] };
            }
          })
        );
        const atts: Record<string, AttendanceRecord[]> = {};
        for (const item of attResults) {
          atts[item.id] = item.att;
        }
        setAttendances(atts);
      } catch (err) {
        console.error("Lỗi nạp dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const handleApptUpdate = () => {
      void loadAppointments();
    };
    window.addEventListener(APPOINTMENT_UPDATED_EVENT, handleApptUpdate);
    return () => {
      window.removeEventListener(APPOINTMENT_UPDATED_EVENT, handleApptUpdate);
    };
  }, [coachName, loadAppointments]);

  const handleUpdateAppointmentStatus = async (id: string, newStatus: string) => {
    const res = await AppointmentService.updateStatus(id, newStatus);
    if (res.success) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      toast.success(
        newStatus === "Đã hoàn tất"
          ? "Đã xác nhận tiếp đón khách thành công!"
          : "Đã cập nhật trạng thái lịch hẹn"
      );
    } else {
      toast.error(res.error || "Không thể cập nhật");
    }
  };

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
              Chào mừng bạn trở lại! Hôm nay bạn có <strong className="text-orange-400">{todaySessions.length} ca dạy</strong> ({totalRegistrations} học viên){appointments.length > 0 ? (
                <> và <strong className="text-amber-400">{appointments.length} lịch hẹn tiếp đón khách từ Lễ tân</strong></>
              ) : ""}. Hãy duy trì năng lượng và đồng hành cùng học viên nhé!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo("schedule")}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              Lịch dạy hôm nay
            </button>
            <button
              type="button"
              onClick={() => navigateTo("attendance")}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs backdrop-blur-sm transition-all border border-white/10 cursor-pointer"
            >
              Điểm danh lớp ({pendingAttendanceCount})
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
          label="Lịch làm việc hôm nay"
          value={todaySessions.length + appointments.length}
          sub={appointments.length > 0 ? `${todaySessions.length} lớp nhóm • ${appointments.length} hẹn lễ tân` : "buổi học trong ngày"}
          highlight={appointments.length > 0}
        />
        <StatCard
          label="Lượt học viên"
          value={totalRegistrations + appointments.length}
          sub="đã đăng ký & đặt hẹn"
        />
        <StatCard
          label="Cần điểm danh"
          value={pendingAttendanceCount}
          sub={pendingAttendanceCount > 0 ? "buổi chưa hoàn tất" : "đã xong toàn bộ"}
          highlight={pendingAttendanceCount > 0}
        />
        <StatCard
          label="Đánh giá trung bình"
          value={dashboardStats.averageRating === null ? "—" : dashboardStats.averageRating.toFixed(1)}
          sub={`Dựa trên ${dashboardStats.reviewCount} lượt nhận xét`}
          onClick={() => navigateTo("reviews")}
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <TodaySessionsList
          loading={loading}
          todaySessions={todaySessions}
          attendances={attendances}
          appointments={appointments}
          onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
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
  label,
  value,
  sub,
  highlight,
  onClick,
}: {
  icon?: React.ReactNode;
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
          ? "border-orange-300 dark:border-orange-700/60 shadow-sm"
          : "border-slate-200/90 dark:border-slate-800 shadow-xs"
      } ${onClick ? "cursor-pointer hover:border-orange-400 dark:hover:border-orange-500/60" : "hover:border-slate-300 dark:hover:border-slate-700"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
        <span className={`size-2 rounded-full ${highlight ? "bg-orange-500 animate-pulse" : "bg-orange-400"}`} />
      </div>
      <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
        {value}
      </div>
      <div className="text-xs text-slate-400 mt-1 font-medium">{sub}</div>
    </div>
  );
}
