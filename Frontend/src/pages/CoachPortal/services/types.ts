export type SessionStatus = "sắp diễn ra" | "đang diễn ra" | "hoàn thành" | "đã hủy";
export type AttendanceStatus = "chưa điểm danh" | "attended" | "no_show" | "late" | "excused";

export interface MockMember {
  id: string;
  name: string;
  code: string;
  avatar: string;
  goal: string;
  level: string;
  sport: string;
  className?: string;
  classNames?: string[];
  phone: string;
  email: string;
  classIds: string[];
  attendanceRate?: number | null;
  attendedSessions?: number;
  totalSessions?: number;
}

export interface CoachClassOverview {
  id: string;
  className: string;
  sport: string;
  scheduleTime: string;
  durationMinutes: number;
  capacity: number;
  enrolledCount: number;
  status: boolean;
}

export interface CoachMembersOverview {
  totalClasses: number;
  totalMembers: number;
  classes: CoachClassOverview[];
  members: MockMember[];
}

export interface MockSession {
  id: string;
  classId: string;
  className: string;
  sport: string;
  level: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;
  room: string;
  coachName: string;
  capacity: number;
  registeredMemberIds: string[];
  status: SessionStatus;
  approvalStatus?: "pending" | "approved" | "rejected";
}

export interface AttendanceRecord {
  sessionId: string;
  memberId: string;
  status: AttendanceStatus;
  note: string;
}

export interface MockCurriculum {
  id: string;
  name: string;
  sport: string;
  sportId?: string | null;
  goal: string;
  level: string;
  duration: number; // phút
  status: "Nháp" | "Đã giao" | "Lưu trữ";
  updatedAt: string;
  description: string;
  exercises: { name: string; reps: string; rest: string; note: string }[];
  assignedTo: { type: "class" | "member"; id: string; name: string }[];
}

export interface SportOption {
  id: string;
  name: string;
}

export interface FacilityOption {
  id: string;
  name: string;
}

export interface MockNotification {
  id: string;
  title: string;
  content: string;
  type: "Thông báo" | "Bài tập về nhà";
  sentAt: string;
  targetType: "class" | "member";
  targetId: string;
  targetName: string;
  deadline?: string;
}

export interface AssessmentRecord {
  id: string;
  sessionId: string;
  memberId: string;
  completion: number; // 0-100
  metrics: { label: string; value: string; unit: string }[];
  comment: string;
  nextStep: string;
  createdAt: string;
}

export interface ScheduleChangeRequest {
  id: string;
  sessionId: string;
  className: string;
  requestType: "dời lịch" | "dạy thay" | "báo vắng";
  substituteCoachName?: string;
  newDate?: string;
  newTime?: string;
  reason: string;
  status: "chờ duyệt" | "đã duyệt" | "từ chối";
  createdAt: string;
  managerNote?: string;
}

export interface AvailabilitySlot {
  id: string;
  date?: string; // YYYY-MM-DD for a concrete coach-published slot
  dayOfWeek?: number; // legacy recurring availability: 1: T2, ... 7: CN
  period?: "Sáng" | "Chiều" | "Tối";
  startTime: string;
  endTime: string;
  isOpen: boolean;
  status?: string;
  sport?: string;
  room?: string;
  note?: string;
  coachId?: string;
  coachName?: string;
  memberId?: string;
  bookedMemberName?: string;
  bookedMemberPhone?: string;
  goal?: string;
}
