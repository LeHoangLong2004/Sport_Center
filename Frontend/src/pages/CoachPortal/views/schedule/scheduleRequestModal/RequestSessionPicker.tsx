import React, { useMemo } from "react";
import type { UnifiedScheduleItem } from "../types";

interface RequestSessionPickerProps {
  sessions: UnifiedScheduleItem[];
  selectedCourseKey: string;
  selectedSessionId: string;
  onSelectCourse: (key: string) => void;
  onSelectSessionId: (id: string) => void;
}

const courseNameFor = (session: UnifiedScheduleItem) =>
  session.courseName?.trim() || session.className.replace(/\s*\(Buổi\s+\d+\)\s*$/i, "").trim();

export const courseKeyFor = (session: UnifiedScheduleItem) => {
  if (session.courseId) return `course:${session.courseId}`;
  // Legacy and one-off sessions do not always carry parent course metadata.
  // Keep unrelated classes separated while grouping numbered sessions together.
  if (session.sessionNumber || /\(Buổi\s+\d+\)\s*$/i.test(session.className)) {
    return `legacy:${courseNameFor(session)}|${session.sport}|${session.room}|${session.coachName}`;
  }
  return `session:${session.id}`;
};

const sessionLabel = (session: UnifiedScheduleItem) => {
  const occurrence = session.sessionNumber ? `Buổi ${session.sessionNumber} · ` : "";
  return `${occurrence}${session.date} · ${session.startTime}–${session.endTime}`;
};

export const RequestSessionPicker: React.FC<RequestSessionPickerProps> = ({
  sessions,
  selectedCourseKey,
  selectedSessionId,
  onSelectCourse,
  onSelectSessionId,
}) => {
  const courses = useMemo(() => {
    const grouped = new Map<string, UnifiedScheduleItem[]>();
    sessions.forEach((session) => {
      const key = courseKeyFor(session);
      grouped.set(key, [...(grouped.get(key) || []), session]);
    });
    return [...grouped.entries()]
      .map(([key, courseSessions]) => ({
        key,
        name: courseNameFor(courseSessions[0]),
        sport: courseSessions[0].sport,
        sessions: courseSessions.sort((a, b) =>
          `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`),
        ),
      }))
      .sort((a, b) => `${a.name} ${a.sport}`.localeCompare(`${b.name} ${b.sport}`, "vi"));
  }, [sessions]);

  const selectedCourse = courses.find((course) => course.key === selectedCourseKey);
  const selectedSession = selectedCourse?.sessions.find((session) => session.id === selectedSessionId);

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="request-course" className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
          1. Chọn khóa học: <span className="text-rose-500">*</span>
        </label>
        {sessions.length === 0 ? (
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-700 dark:text-slate-400 text-xs">
            Không có ca dạy nào sắp diễn ra trong tương lai để điều chỉnh. Các ca dạy đã bắt đầu hoặc kết thúc không thể gửi yêu cầu.
          </div>
        ) : (
          <select
            id="request-course"
            value={selectedCourseKey}
            onChange={(event) => onSelectCourse(event.target.value)}
            required
            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="" disabled>Chọn khóa học cần điều chỉnh</option>
            {courses.map((course) => (
              <option key={course.key} value={course.key}>
                {course.name} · {course.sport} ({course.sessions.length} buổi sắp tới)
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label htmlFor="request-session" className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
          2. Chọn buổi cần điều chỉnh: <span className="text-rose-500">*</span>
        </label>
        <select
          id="request-session"
          value={selectedSessionId}
          onChange={(event) => onSelectSessionId(event.target.value)}
          disabled={!selectedCourse}
          required
          className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 disabled:opacity-60"
        >
          <option value="" disabled>
            {selectedCourse ? "Chọn buổi cụ thể" : "Vui lòng chọn khóa học trước"}
          </option>
          {selectedCourse?.sessions.map((session) => (
            <option key={session.id} value={session.id}>{sessionLabel(session)}</option>
          ))}
        </select>
      </div>

      {selectedSession && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/20 px-3 py-2.5 text-slate-700 dark:text-slate-300">
          <div className="font-semibold text-emerald-800 dark:text-emerald-300">Buổi sẽ áp dụng yêu cầu</div>
          <div className="mt-1">{courseNameFor(selectedSession)}{selectedSession.sessionNumber ? ` · Buổi ${selectedSession.sessionNumber}` : ""}</div>
          <div className="text-slate-500 dark:text-slate-400">{selectedSession.date} · {selectedSession.startTime}–{selectedSession.endTime} · {selectedSession.room}</div>
        </div>
      )}
    </div>
  );
};
