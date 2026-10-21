export interface GateCheckInRecord {
  id: string;
  checkInTime: string;
  checkOutTime: string | null;
  durationMinutes: number | null;
  gate: string;
  status: "APPROVED" | "CHECKED_OUT";
}

export interface AttendanceSession {
  id: string;
  className: string;
  sport: string;
  coachName: string;
  coachAvatar?: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "có mặt" | "vắng" | "đi muộn" | "chưa điểm danh" | "chưa diễn ra";
  coachNote?: string;
  type: "group" | "pt";
}

export interface AttendanceSummary {
  attendanceRate: number | null;
  totalSessions: number;
  attendedCount: number;
  absentCount: number;
  lateCount: number;
  gateCheckInsCount: number;
  currentStreak: number;
  totalHoursTrained: number;
}
