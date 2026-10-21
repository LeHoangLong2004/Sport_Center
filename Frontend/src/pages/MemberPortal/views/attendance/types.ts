export interface ActivePackageInfo {
  id: string;
  packageName: string;
  packageType: string;
  startDate: string;
  endDate: string;
  daysLeft: number;
}

export interface GateCheckInRecord {
  id: string;
  checkInTime: string;
  checkOutTime: string | null;
  durationMinutes: number | null;
  gate: string;
  packageName?: string;
  status: "APPROVED" | "CHECKED_OUT";
}

export interface AttendanceSession {
  id: string;
  className: string;
  sport: string;
  packageName?: string;
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
  activePackages?: ActivePackageInfo[];
}
