/**
 * CO-03 — Chi tiết buổi học
 * Kết nối lịch, học viên, giáo án, điểm danh và kết quả.
 * Buổi đã hủy: thông báo nổi bật, khóa thao tác.
 */
import { useState, useEffect } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI } from "../services/api";
import type { MockSession, MockMember, AttendanceRecord, MockCurriculum, AssessmentRecord } from "../services/api";

interface Props {
  sessionId: string | null;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string; memberId?: string }) => void;
}

const STATUS_STYLE: Record<string, string> = {
  "sắp diễn ra":  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "đang diễn ra": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "hoàn thành":   "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  "đã hủy":       "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const ATTENDANCE_STYLE: Record<string, string> = {
  "chưa điểm danh": "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
  attended:          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  no_show:           "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  late:              "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};
const ATTENDANCE_LABEL: Record<string, string> = {
  "chưa điểm danh": "Chưa điểm danh",
  attended:          "Có mặt",
  no_show:           "Vắng",
  late:              "Đi trễ (Demo)",
};

export default function CoachClassDetail({ sessionId, navigateTo }: Props) {
  const [session, setSession] = useState<MockSession | null>(null);
  const [members, setMembers] = useState<MockMember[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [curricula, setCurricula] = useState<MockCurriculum[]>([]);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    Promise.all([
      CoachAPI.getSessionDetail(sessionId),
      CoachAPI.getSessionMembers(sessionId),
      CoachAPI.getAttendance(sessionId),
      CoachAPI.getCurricula(),
      CoachAPI.getAssessments()
    ]).then(([s, m, att, cur, ass]) => {
      setSession(s);
      setMembers(m);
      setAttendanceRecords(att);
      setCurricula(cur.filter((c: MockCurriculum) => c.assignedTo.some((t: any) => t.id === s.classId)));
      setAssessments(ass.filter((a: AssessmentRecord) => a.sessionId === sessionId));
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [sessionId]);

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Đang tải thông tin buổi học...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
        <p>Không tìm thấy buổi học.</p>
        <button type="button" className="text-teal-600 hover:underline text-sm" onClick={() => navigateTo("schedule")}>
          ← Quay lại lịch dạy
        </button>
      </div>
    );
  }

  const isCancelled = session.status === "đã hủy";

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-4xl">
      {/* Breadcrumb */}
      <button
        type="button"
        className="text-sm text-teal-600 hover:underline font-medium self-start"
        onClick={() => navigateTo("schedule")}
      >
        ← Quay lại lịch dạy
      </button>

      {/* Buổi đã hủy — thông báo nổi bật */}
      {isCancelled && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl p-4 text-red-700 dark:text-red-300 font-semibold flex items-center gap-2">
          <span>⛔</span>
          <span>Buổi học này đã bị hủy. Thông tin lịch sử được giữ lại để tra cứu. Các thao tác bị khóa.</span>
        </div>
      )}

      {/* Header info */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{session.className}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[session.status]}`}>
                {session.status}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {session.sport}
              </span>
              {session.level && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                  {session.level}
                </span>
              )}
            </div>
          </div>
          {/* Thao tác chính */}
          {!isCancelled && (
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm transition-colors"
                onClick={() => navigateTo("attendance", { sessionId: session.id })}
              >
                ✓ Điểm danh
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm transition-colors"
                onClick={() => navigateTo("notifications")}
              >
                📢 Gửi thông báo
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
          <InfoItem label="Ngày" value={session.date} />
          <InfoItem label="Giờ" value={`${session.startTime} – ${session.endTime}`} />
          <InfoItem label="Khu/Phòng" value={session.room} />
          <InfoItem label="Số người" value={`${session.registeredMemberIds.length}/${session.capacity}`} />
          <InfoItem label="Coach" value={session.coachName} />
        </div>
      </div>

      {/* Danh sách học viên */}
      <Section title="Học viên đăng ký" count={members.length}>
        {members.length === 0 ? (
          <p className="text-slate-400 text-sm py-4 px-4">Buổi này chưa có học viên đăng ký.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {members.map((m) => {
              const att = attendanceRecords.find((r) => r.memberId === m.id);
              const attStatus = att?.status || "chưa điểm danh";
              return (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer"
                  onClick={() => navigateTo("member-profile", { memberId: m.id })}>
                  <img src={m.avatar} alt={m.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 dark:text-slate-100 text-sm truncate">{m.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{m.code}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${ATTENDANCE_STYLE[attStatus]}`}>
                    {ATTENDANCE_LABEL[attStatus]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Giáo án */}
      <Section title="Giáo án áp dụng" count={curricula.length}>
        {curricula.length === 0 ? (
          <div className="px-4 py-4">
            <p className="text-slate-400 text-sm">Chưa có giáo án được giao cho lớp này.</p>
            {!isCancelled && (
              <button type="button" className="mt-2 text-teal-600 text-sm hover:underline"
                onClick={() => navigateTo("curriculum")}>
                → Đi đến Giáo án
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {curricula.map((c) => (
              <div key={c.id} className="px-4 py-3">
                <div className="font-medium text-slate-800 dark:text-slate-100 text-sm">{c.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {c.sport} · {c.level} · {c.duration} phút · {c.exercises.length} bài
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Kết quả */}
      <Section title="Kết quả buổi học" count={assessments.length}>
        {assessments.length === 0 ? (
          <div className="px-4 py-4">
            <p className="text-slate-400 text-sm">Chưa có kết quả được ghi nhận.</p>
            {!isCancelled && (
              <button type="button" className="mt-2 text-teal-600 text-sm hover:underline"
                onClick={() => navigateTo("assessment")}>
                → Ghi kết quả
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {assessments.map((a) => {
              const member = members.find((m) => m.id === a.memberId);
              return (
                <div key={a.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {member && <img src={member.avatar} alt="" className="w-7 h-7 rounded-full" />}
                    <span className="font-medium text-slate-800 dark:text-slate-100 text-sm">
                      {member?.name || a.memberId}
                    </span>
                    <span className="ml-auto text-xs text-slate-400">Hoàn thành: {a.completion}%</span>
                  </div>
                  {a.comment && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{a.comment}</p>}
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{title}</h2>
        {count !== undefined && (
          <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">{label}</div>
      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{value}</div>
    </div>
  );
}
