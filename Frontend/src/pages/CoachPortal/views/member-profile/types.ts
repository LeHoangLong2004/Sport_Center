export interface MemberAttendanceHistoryItem {
  id: string;
  className: string;
  sport: string;
  date: string;
  time: string;
  room: string;
  status: "attended" | "present" | "late" | "excused" | "no_show" | "absent" | "unmarked";
  note?: string | null;
}

export interface MemberWorkoutItem {
  id: string;
  name: string;
  sport: string;
  level: string;
  duration: number;
  status: "Đang tập luyện" | "Hoàn thành" | "Đã giao";
  progressPct?: number;
  exercises: { name: string; reps: string; rest: string; note?: string }[];
}

export interface MemberFitnessTest {
  metricName: string;
  value: number;
  unit?: string | null;
  effort?: number | null;
  comment?: string | null;
  recordedAt: string;
}

export interface MemberProfileData {
  member: {
    id: string;
    name: string;
    code: string;
    avatar?: string | null;
    goal?: string | null;
    level?: string | null;
    sport?: string | null;
    phone?: string | null;
    email?: string | null;
    classIds: string[];
    attendanceRate?: number | null;
    attendedSessions: number;
    totalSessions: number;
  };
  stats: {
    attendanceRate?: number | null;
    attendedSessions: number;
    totalSessions: number;
    weight?: number | null;
    height?: number | null;
    bodyFat?: number | null;
    muscleMass?: number | null;
    bmi?: number | null;
    latestSession?: { className: string; date: string; status: string; completion?: number | null } | null;
    goalProgress?: number | null;
  };
  attendanceHistory: MemberAttendanceHistoryItem[];
  notes: { id: string; comment: string; nextStep: string; completion: number; createdAt: string }[];
  assessments: { id: string; sessionId?: string | null; completion: number; metrics: { label?: string; value?: string; unit?: string }[]; comment: string; nextStep: string; createdAt: string }[];
  fitnessTests: MemberFitnessTest[];
  assignedWorkouts: MemberWorkoutItem[];
}
