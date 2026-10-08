/**
 * CO-05 — Hồ sơ chi tiết học viên
 * Thông tin cơ bản phục vụ huấn luyện; không hiển thị thanh toán.
 * Lịch sử điểm danh, giáo án đã giao, kết quả và nhận xét.
 */
import { useState, useEffect, useMemo } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI } from "../services/api";
import type { MockSession, MockCurriculum, AssessmentRecord, AttendanceRecord, MockMember } from "../services/api";

interface Props {
  memberId: string | null;
  navigateTo: (s: CoachScreen, extra?: { memberId?: string; sessionId?: string }) => void;
}

const ATT_LABEL: Record<string, string> = {
  "chưa điểm danh": "Chưa điểm danh",
  attended:          "Có mặt",
  no_show:           "Vắng",
  late:              "Đi trễ (Demo)",
};

const ATT_STYLE: Record<string, string> = {
  "chưa điểm danh": "text-slate-500",
  attended:          "text-green-600 font-semibold",
  no_show:           "text-red-600 font-semibold",
  late:              "text-amber-600 font-semibold",
};

export default function CoachMemberProfile({ memberId, navigateTo }: Props) {
  const [member, setMember] = useState<MockMember | null>(null);
  const [sessions, setSessions] = useState<MockSession[]>([]);
  const [curricula, setCurricula] = useState<MockCurriculum[]>([]);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId) return;
    
    Promise.all([
      CoachAPI.getMembers(),
      CoachAPI.getSchedule(),
      CoachAPI.getCurricula(),
      CoachAPI.getAssessments()
    ]).then(async ([membersData, sch, cur, ass]) => {
      const m = membersData.find((x: MockMember) => x.id === memberId) || null;
      setMember(m);
      
      const memberSessions = sch.filter((s: MockSession) => s.registeredMemberIds.includes(memberId));
      setSessions(memberSessions);
      setCurricula(cur.filter((c: MockCurriculum) => c.assignedTo.some((t: any) => t.id === memberId)));
      setAssessments(ass.filter((a: AssessmentRecord) => a.memberId === memberId));
      
      const attMap: Record<string, AttendanceRecord> = {};
      await Promise.all(memberSessions.map(async (s: MockSession) => {
        try {
          const recs = await CoachAPI.getAttendance(s.id);
          const r = recs.find((x: AttendanceRecord) => x.memberId === memberId);
          if (r) attMap[s.id] = r;
        } catch (e) { }
      }));
      setAttendanceRecords(attMap);
      setLoading(false);
    }).catch(console.error);
  }, [memberId]);

  if (loading) return <div className="py-20 text-center text-slate-400">Đang tải hồ sơ...</div>;

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
        <p>Không tìm thấy học viên.</p>
        <button type="button" className="text-teal-600 hover:underline text-sm" onClick={() => navigateTo("members")}>
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  const history = sessions.map((s) => {
    const rec = attendanceRecords[s.id];
    return {
      session: s,
      status: rec?.status || "chưa điểm danh",
      note: rec?.note || "",
    };
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-3xl">
      <button type="button" className="text-sm text-teal-600 hover:underline font-medium self-start"
        onClick={() => navigateTo("members")}>
        ← Quay lại học viên
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex items-start gap-4">
        <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full object-cover shrink-0" />
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{member.name}</h1>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{member.code} · {member.phone} · {member.email}</div>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full border border-teal-200 dark:border-teal-700">
              {member.sport}
            </span>
            <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-700">
              {member.level}
            </span>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 mt-2">
            <span className="font-medium">Mục tiêu:</span> {member.goal}
          </div>
        </div>
      </div>

      {/* Lịch sử điểm danh */}
      <Section title="Lịch sử điểm danh" count={history.length}>
        {history.length === 0 ? (
          <EmptyRow text="Chưa có buổi học nào." />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {history.map(({ session, status, note }) => (
              <div key={session.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{session.className}</div>
                  <div className="text-xs text-slate-400">{session.date} · {session.startTime}–{session.endTime}</div>
                </div>
                <span className={`text-xs shrink-0 ${ATT_STYLE[status]}`}>{ATT_LABEL[status]}</span>
                {note && <span className="text-xs text-slate-400 shrink-0">{note}</span>}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Giáo án đã giao */}
      <Section title="Giáo án đã giao" count={curricula.length}>
        {curricula.length === 0 ? (
          <EmptyRow text="Chưa có giáo án nào được giao." />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {curricula.map((c) => (
              <div key={c.id} className="px-4 py-3">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{c.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{c.sport} · {c.level} · {c.duration} phút</div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Kết quả & nhận xét */}
      <Section title="Kết quả & Nhận xét" count={assessments.length}>
        {assessments.length === 0 ? (
          <EmptyRow text="Chưa có kết quả nào được ghi." />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {assessments.map((a) => {
              const s = sessions.find((x) => x.id === a.sessionId);
              return (
                <div key={a.id} className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {s?.className || a.sessionId}
                    </div>
                    <span className="text-xs text-slate-400">Hoàn thành: {a.completion}%</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    {a.metrics.map((m) => (
                      <span key={m.label} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                        {m.label}: {m.value}{m.unit}
                      </span>
                    ))}
                  </div>
                  {a.comment && <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 italic">"{a.comment}"</div>}
                  {a.nextStep && <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">→ {a.nextStep}</div>}
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

function EmptyRow({ text }: { text: string }) {
  return <div className="px-4 py-4 text-slate-400 text-sm">{text}</div>;
}
