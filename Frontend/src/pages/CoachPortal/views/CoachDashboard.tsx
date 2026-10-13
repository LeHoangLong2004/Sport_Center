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
  MessageSquare
} from "lucide-react";
import CoachDashboardView from "./CoachDashboardView";

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
  const { profile } = useUserProfile();
  const userName = profile?.fullName ? profile.fullName.split(" ").pop() : "HLV";

  const [todaySessions, setTodaySessions] = useState<MockSession[]>([]);
  const [attendances, setAttendances] = useState<Record<string, AttendanceRecord[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const allSessions = await CoachAPI.getSchedule();
        const todayStr = new Date().toISOString().split("T")[0];
        const todays = (Array.isArray(allSessions) ? allSessions : [])
          .filter((s: MockSession | null | undefined): s is MockSession => Boolean(s) && s.date === todayStr)
          .map((s) => ({ ...s, registeredMemberIds: Array.isArray(s.registeredMemberIds) ? s.registeredMemberIds : [] }));
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
    () => todaySessions.reduce((s, c) => s + (c.registeredMemberIds?.length ?? 0), 0),
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

  return <CoachDashboardView
    navigateTo={navigateTo}
    userName={userName}
    totalRegistrations={totalRegistrations}
    pendingAttendanceCount={pendingAttendanceCount}
    nextSession={nextSession}
    pendingSessions={pendingSessions}
    attendances={attendances}
    dateLabel={dateLabel}
    loading={loading}
    todaySessions={todaySessions}
  />;
}
