import { useState, useEffect } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI } from "../services/api";
import type { MockSession, MockMember, AttendanceRecord, MockCurriculum } from "../services/api";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  UserCheck,
  BookOpen,
  Award,
} from "lucide-react";
import { ClassRosterList } from "./class-detail/ClassRosterList";
import { ClassCurriculumCard } from "./class-detail/ClassCurriculumCard";

interface Props {
  sessionId: string | null;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string; memberId?: string }) => void;
}

const STATUS_STYLE: Record<string, string> = {
  "sắp diễn ra":  "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
  "đang diễn ra": "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
  "hoàn thành":   "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
  "đã hủy":       "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800",
};

export default function CoachClassDetail({ sessionId, navigateTo }: Props) {
  const [session, setSession] = useState<MockSession | null>(null);
  const [members, setMembers] = useState<MockMember[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [curricula, setCurricula] = useState<MockCurriculum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);

    Promise.all([
      CoachAPI.getSessionDetail(sessionId),
      CoachAPI.getSessionMembers(sessionId),
      CoachAPI.getAttendance(sessionId),
      CoachAPI.getCurricula(),
    ])
      .then(([s, sessionMems, att, cur]) => {
        setSession(s);
        setMembers(Array.isArray(sessionMems) ? sessionMems : []);

        setAttendanceRecords(att || []);

        const matchedCur = cur.filter((c: MockCurriculum) =>
          c.assignedTo?.some((t: any) => t.id === s.classId || t.id === s.id)
        );
        setCurricula(matchedCur);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 max-w-4xl mx-auto">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-orange-500 mb-3"></div>
        <p className="text-sm">Đang tải thông tin chi tiết ca dạy...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4 max-w-4xl mx-auto">
        <p>Không tìm thấy buổi học trong hệ thống.</p>
        <button
          type="button"
          className="text-orange-600 hover:underline text-sm font-semibold"
          onClick={() => navigateTo("schedule")}
        >
          ← Quay lại lịch dạy
        </button>
      </div>
    );
  }

  const isCancelled = session.status === "đã hủy";

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          onClick={() => navigateTo("schedule")}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Lịch dạy</span>
        </button>

        <span className="text-xs text-slate-400">
          Mã ca dạy: <strong className="font-mono text-slate-700 dark:text-slate-200">{session.id}</strong>
        </span>
      </div>

      {/* Hero Class Detail Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {session.className}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[session.status] || ""}`}>
                {session.status.toUpperCase()}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {session.sport} • {session.level}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {session.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {session.startTime} – {session.endTime}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {session.room}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Sĩ số: <strong className="text-slate-800 dark:text-slate-200">{members.length}/{session.capacity}</strong> học viên
              </span>
            </div>
          </div>

          {!isCancelled && (
            <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => navigateTo("attendance", { sessionId: session.id })}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors shadow-sm shadow-orange-500/20"
              >
                <UserCheck className="w-4 h-4" />
                Điểm danh lớp ngay
              </button>
              <button
                type="button"
                onClick={() => navigateTo("curriculum")}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Soạn giáo án
              </button>
              <button
                type="button"
                onClick={() => navigateTo("assessment")}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                Đánh giá tiến độ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left = Registered Roster | Right = Workout Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ClassRosterList
            sessionId={session.id}
            members={members}
            attendanceRecords={attendanceRecords}
            navigateTo={navigateTo}
          />
        </div>

        <div className="space-y-6">
          <ClassCurriculumCard
            curricula={curricula}
            onNavigateToCurriculum={() => navigateTo("curriculum")}
          />
        </div>
      </div>
    </div>
  );
}
