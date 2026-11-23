import type { AttendanceSession } from "./types";

export interface AttendanceCourseGroup {
  key: string;
  name: string;
  sessions: AttendanceSession[];
  totalSessions: number;
}

const SESSION_SUFFIX = /\s*\(buổi\s+\d+\)\s*$/i;
const SESSION_NUMBER_SUFFIX = /\(buổi\s+(\d+)\)\s*$/i;

export function attendanceCourseName(session: AttendanceSession) {
  return session.className.replace(SESSION_SUFFIX, "").trim();
}

export function attendanceCourseKey(session: AttendanceSession) {
  if (session.courseId) return `course:${session.courseId}`;

  const hasSessionIdentity = session.sessionNumber != null || SESSION_SUFFIX.test(session.className);
  if (!hasSessionIdentity) return `session:${session.id}`;

  return [
    "course",
    attendanceCourseName(session).toLocaleLowerCase(),
    session.sport.toLocaleLowerCase(),
    session.coachName.toLocaleLowerCase(),
    session.room.toLocaleLowerCase(),
    session.startTime,
    session.type,
  ].join(":");
}

function courseFingerprint(session: AttendanceSession) {
  return [
    attendanceCourseName(session).toLocaleLowerCase("vi-VN"),
    session.sport.toLocaleLowerCase("vi-VN"),
    session.coachName.toLocaleLowerCase("vi-VN"),
    session.room.toLocaleLowerCase("vi-VN"),
    session.startTime,
    session.type,
  ].join(":");
}

function sessionOrdinal(session: AttendanceSession) {
  if (session.sessionNumber != null) return session.sessionNumber;
  const suffix = session.className.match(SESSION_NUMBER_SUFFIX);
  return suffix ? Number(suffix[1]) : null;
}

function daysBetween(first: AttendanceSession, second: AttendanceSession) {
  const firstDay = Date.parse(`${first.date}T00:00:00Z`);
  const secondDay = Date.parse(`${second.date}T00:00:00Z`);
  return Number.isFinite(firstDay) && Number.isFinite(secondDay)
    ? Math.abs(firstDay - secondDay) / 86_400_000
    : Number.POSITIVE_INFINITY;
}

function mergeLinkedCourseFragments(groups: AttendanceCourseGroup[]) {
  const byFingerprint = new Map<string, AttendanceCourseGroup[]>();
  for (const group of groups) {
    const fingerprint = courseFingerprint(group.sessions[0]);
    const matches = byFingerprint.get(fingerprint) ?? [];
    matches.push(group);
    byFingerprint.set(fingerprint, matches);
  }

  const merged = new Set<AttendanceCourseGroup>();
  const result: AttendanceCourseGroup[] = [];

  for (const [fingerprint, fragments] of byFingerprint) {
    if (fragments.length < 2) continue;

    const sessions = fragments.flatMap((fragment) => fragment.sessions);
    const totalSessions = Math.max(...fragments.map((fragment) => fragment.totalSessions));
    const ordinals = sessions.map(sessionOrdinal);
    const hasCompleteSequence = totalSessions > 1
      && sessions.length === totalSessions
      && ordinals.every((ordinal): ordinal is number => ordinal != null && ordinal >= 1 && ordinal <= totalSessions)
      && new Set(ordinals).size === totalSessions
      && Math.min(...ordinals) === 1
      && Math.max(...ordinals) === totalSessions;

    const recurringGroup = fragments
      .filter((fragment) => fragment.sessions.length > 1)
      .sort((a, b) => b.sessions.length - a.sessions.length)[0];
    const recurringGroupCount = fragments.filter((fragment) => fragment.sessions.length > 1).length;
    const recurringSessions = recurringGroup?.sessions ?? [];
    const recurringDates = new Set(recurringSessions.map((session) => session.date));
    const singletonFragments = fragments.filter((fragment) => fragment.sessions.length === 1);
    const adjacentSingletons = singletonFragments.length > 0
      && recurringGroup != null
      && recurringGroupCount === 1
      && fragments.length === singletonFragments.length + 1
      && singletonFragments.every((fragment) => {
        const [session] = fragment.sessions;
        return !recurringDates.has(session.date)
          && recurringSessions.some((candidate) => daysBetween(session, candidate) <= 10);
      });

    // Reconcile only split fragments that form one complete, non-overlapping course sequence.
    // Repeated session numbers indicate separate courses and must stay separate.
    if (!hasCompleteSequence && !adjacentSingletons) continue;

    const first = fragments[0];
    result.push({
      key: `course-sequence:${fingerprint}`,
      name: first.name,
      sessions,
      totalSessions: Math.max(totalSessions, sessions.length),
    });
    fragments.forEach((fragment) => merged.add(fragment));
  }

  result.push(...groups.filter((group) => !merged.has(group)));
  return result;
}

export function groupAttendanceSessions(sessions: AttendanceSession[]): AttendanceCourseGroup[] {
  const groups = new Map<string, AttendanceCourseGroup>();

  for (const session of sessions) {
    const key = attendanceCourseKey(session);
    const group = groups.get(key) ?? {
      key,
      name: attendanceCourseName(session),
      sessions: [],
      totalSessions: 0,
    };
    group.sessions.push(session);
    group.totalSessions = Math.max(group.totalSessions, session.totalSessions ?? 0);
    groups.set(key, group);
  }

  return mergeLinkedCourseFragments([...groups.values()])
    .map((group) => {
      group.sessions.sort((a, b) =>
        `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`),
      );
      group.totalSessions = Math.max(group.totalSessions, group.sessions.length);
      return group;
    })
    .sort((a, b) => {
      const aNext = a.sessions.find((session) => session.status === "chưa diễn ra") ?? a.sessions.at(-1)!;
      const bNext = b.sessions.find((session) => session.status === "chưa diễn ra") ?? b.sessions.at(-1)!;
      return `${aNext.date}T${aNext.startTime}`.localeCompare(`${bNext.date}T${bNext.startTime}`);
    });
}
