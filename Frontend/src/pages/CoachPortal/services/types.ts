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
  status: "Nháp" | "Đã duyệt" | "Đã giao" | "Lưu trữ";
  source?: string;
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

export interface SubstituteInvitation {
  id: string;
  sessionId: string;
  coachId: string;
  coachName: string;
  className: string;
  scheduleTime: string;
  durationMinutes: number;
  facilityName: string;
  requestType: string;
  newDate: string;
  newTime: string;
  reason: string;
  status: string;
  createdAt: string;
  managerNote: string;
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

// Flow 5 - AI Workout Recommendation Types
export interface Flow5Target {
  type: "member" | "class";
  id: string;
}

export interface Flow5Exercise {
  id?: string;
  name: string;
  sets?: string;
  reps?: string;
  duration?: string;
  rest?: string;
  note?: string;
  order: number;
}

export interface Flow5AiMetadata {
  provider: string;
  model: string;
  promptVersion: string;
  schemaVersion: string;
  generatedAt?: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface Flow5WorkoutPlan {
  id: string;
  coachId: string;
  sportId?: string | null;
  planName: string;
  description?: string;
  goal?: string;
  level?: string;
  durationMinutes?: number;
  status: "draft" | "approved" | "assigned" | "archived";
  source: "manual" | "ai_recommendation";
  version: number;
  recommendationTarget?: Flow5Target | null;
  aiMetadata?: Flow5AiMetadata | null;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
  exercises: Flow5Exercise[];
}

export interface GenerateFlow5RecommendationRequest {
  target: Flow5Target;
  sportId: string;
  level: string;
  goal?: string;
  equipment?: string[];
  durationMinutes: number;
  exerciseCount?: number;
  idempotencyKey?: string;
}

export interface UpdateFlow5DraftRequest {
  planName: string;
  sportId?: string | null;
  description?: string;
  goal?: string;
  level?: string;
  durationMinutes?: number;
  source?: string;
  expectedVersion: number;
  target?: Flow5Target;
  exercises: Flow5Exercise[];
}

export interface AssignFlow5PlanRequest {
  target: Flow5Target;
  expectedVersion: number;
  dueDate?: string;
  notes?: string;
  idempotencyKey?: string;
}

export interface AssignFlow5PlanResponse {
  planId: string;
  assignedCount: number;
  skippedCount: number;
  assignments: Array<{
    id: string;
    planId: string;
    targetType: string;
    targetId: string;
    memberId: string;
    status: string;
    assignedAt: string;
    dueDate?: string | null;
  }>;
}
