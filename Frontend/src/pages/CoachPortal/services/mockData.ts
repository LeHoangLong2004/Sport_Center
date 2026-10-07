/**
 * MOCK DATA — COACH PORTAL (Demo Mode)
 * ─────────────────────────────────────────────────────────────────────────────
 * Nguồn dữ liệu giả lập dùng chung toàn Coach Portal.
 * ID thống nhất giữa lịch, học viên, giáo án, booking và điểm danh.
 * Dashboard tính từ cùng dữ liệu với màn chi tiết.
 *
 * ⚠️  Demo — lưu trên trình duyệt (localStorage). Không ghi vào database thật.
 *     Xem thêm: resetDemoData() bên dưới.
 */

export type SessionStatus = "sắp diễn ra" | "đang diễn ra" | "hoàn thành" | "đã hủy";
export type AttendanceStatus = "chưa điểm danh" | "attended" | "no_show" | "late";

export interface MockMember {
  id: string;
  name: string;
  code: string;
  avatar: string;
  goal: string;
  level: string;
  sport: string;
  phone: string;
  email: string;
  classIds: string[];
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
}

export interface AttendanceRecord {
  sessionId: string;
  memberId: string;
  /** API contract: "attended" | "no_show" — "late" là Demo chỉ */
  status: AttendanceStatus;
  note: string;
}

export interface MockCurriculum {
  id: string;
  name: string;
  sport: string;
  goal: string;
  level: string;
  duration: number; // phút
  status: "Nháp" | "Đã giao" | "Lưu trữ";
  updatedAt: string;
  description: string;
  exercises: { name: string; reps: string; rest: string; note: string }[];
  assignedTo: { type: "class" | "member"; id: string; name: string }[];
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

// ─── MEMBERS ──────────────────────────────────────────────────────────────────
export const MOCK_MEMBERS: MockMember[] = [
  {
    id: "m1",
    name: "Nguyễn Lan Anh",
    code: "MB001",
    avatar: "https://i.pravatar.cc/80?u=lananh",
    goal: "Giảm cân, linh hoạt",
    level: "Cơ bản",
    sport: "Yoga",
    phone: "0901234001",
    email: "lananh@demo.vn",
    classIds: ["s1", "s3"],
  },
  {
    id: "m2",
    name: "Lê Minh Triết",
    code: "MB002",
    avatar: "https://i.pravatar.cc/80?u=minhtri",
    goal: "Tăng cơ, sức mạnh",
    level: "Nâng cao",
    sport: "Gym",
    phone: "0901234002",
    email: "minhtri@demo.vn",
    classIds: ["s2", "s4"],
  },
  {
    id: "m3",
    name: "Vũ Thu Trang",
    code: "MB003",
    avatar: "https://i.pravatar.cc/80?u=thutrang",
    goal: "Sức khỏe, bơi lội",
    level: "Trung cấp",
    sport: "Bơi",
    phone: "0901234003",
    email: "thutrang@demo.vn",
    classIds: ["s1", "s2"],
  },
  {
    id: "m4",
    name: "Trần Minh Khoa",
    code: "MB004",
    avatar: "https://i.pravatar.cc/80?u=minhkhoa",
    goal: "CrossFit, sức bền",
    level: "Nâng cao",
    sport: "CrossFit",
    phone: "0901234004",
    email: "minhkhoa@demo.vn",
    classIds: ["s2", "s3"],
  },
  {
    id: "m5",
    name: "Phạm Quỳnh Anh",
    code: "MB005",
    avatar: "https://i.pravatar.cc/80?u=quynhanh",
    goal: "Yoga, cân bằng",
    level: "Cơ bản",
    sport: "Yoga",
    phone: "0901234005",
    email: "quynhanh@demo.vn",
    classIds: ["s1"],
  },
];

// ─── SESSIONS ─────────────────────────────────────────────────────────────────
// Có ít nhất 2 buổi của cùng 1 lớp để test không lẫn kết quả (spec §15.1)
export const MOCK_SESSIONS: MockSession[] = [
  {
    id: "s1",
    classId: "cls-yoga",
    className: "Yoga Cơ Bản – Lớp A",
    sport: "Yoga",
    level: "Cơ bản",
    date: new Date().toISOString().split("T")[0], // hôm nay
    startTime: "07:00",
    endTime: "08:00",
    room: "Studio 2",
    coachName: "HLV Demo",
    capacity: 10,
    registeredMemberIds: ["m1", "m3", "m5"],
    status: "sắp diễn ra",
  },
  {
    id: "s2",
    classId: "cls-gym",
    className: "Gym Group BodyCombat – Lớp B",
    sport: "Gym",
    level: "Nâng cao",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:30",
    room: "Khu Tạ Tự Do",
    coachName: "HLV Demo",
    capacity: 8,
    registeredMemberIds: ["m2", "m3", "m4"],
    status: "đang diễn ra",
  },
  {
    id: "s3",
    classId: "cls-yoga",
    className: "Yoga Cơ Bản – Lớp A",  // Cùng lớp yoga, buổi khác → test độc lập
    sport: "Yoga",
    level: "Cơ bản",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // ngày mai
    startTime: "07:00",
    endTime: "08:00",
    room: "Studio 2",
    coachName: "HLV Demo",
    capacity: 10,
    registeredMemberIds: ["m1", "m4"],
    status: "sắp diễn ra",
  },
  {
    id: "s4",
    classId: "cls-swim",
    className: "Bơi Lội Nâng Cao",
    sport: "Bơi",
    level: "Nâng cao",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    startTime: "15:00",
    endTime: "16:30",
    room: "Hồ Bơi A",
    coachName: "HLV Demo",
    capacity: 6,
    registeredMemberIds: ["m2"],
    status: "sắp diễn ra",
  },
  {
    id: "s5",
    classId: "cls-empty",
    className: "CrossFit Thử Nghiệm",
    sport: "CrossFit",
    level: "Trung cấp",
    date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
    startTime: "17:00",
    endTime: "18:30",
    room: "Studio Ngoài Trời",
    coachName: "HLV Demo",
    capacity: 12,
    registeredMemberIds: [], // buổi chưa có học viên
    status: "sắp diễn ra",
  },
  {
    id: "s6",
    classId: "cls-cancelled",
    className: "Yoga Cao Cấp – Đã Hủy",
    sport: "Yoga",
    level: "Nâng cao",
    date: new Date().toISOString().split("T")[0],
    startTime: "18:00",
    endTime: "19:00",
    room: "Studio 1",
    coachName: "HLV Demo",
    capacity: 8,
    registeredMemberIds: ["m1", "m2"],
    status: "đã hủy",
  },
];

// ─── ATTENDANCE STORAGE (localStorage) ────────────────────────────────────────
const ATTENDANCE_KEY = (sessionId: string) => `cp_attendance_${sessionId}`;

export function getMockAttendance(sessionId: string): AttendanceRecord[] {
  const stored = localStorage.getItem(ATTENDANCE_KEY(sessionId));
  if (stored) return JSON.parse(stored);
  const session = MOCK_SESSIONS.find((s) => s.id === sessionId);
  if (!session) return [];
  // Mặc định: chưa điểm danh (spec §7.3 rule 1)
  return session.registeredMemberIds.map((memberId) => ({
    sessionId,
    memberId,
    status: "chưa điểm danh" as AttendanceStatus,
    note: "",
  }));
}

/**
 * Giả lập POST /api/classes/{id}/attendance
 * Ánh xạ "attended" / "no_show" theo API contract (spec §7.5)
 * "late" chỉ lưu local, không gửi BE thật.
 */
export async function saveMockAttendance(
  sessionId: string,
  records: AttendanceRecord[],
  simulateError = false
): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (simulateError) {
        reject({ message: "Lỗi máy chủ giả lập (500). Dữ liệu chưa được lưu." });
        return;
      }
      localStorage.setItem(ATTENDANCE_KEY(sessionId), JSON.stringify(records));
      resolve({ success: true, message: "Demo — lưu trên trình duyệt" });
    }, 1000);
  });
}

// ─── CURRICULUM ───────────────────────────────────────────────────────────────
const CURRICULUM_KEY = "cp_curricula";

function defaultCurricula(): MockCurriculum[] {
  return [
    {
      id: "cur1",
      name: "Yoga Cơ Bản – Tuần 1",
      sport: "Yoga",
      goal: "Linh hoạt và thư giãn",
      level: "Cơ bản",
      duration: 60,
      status: "Đã giao",
      updatedAt: "2023-10-20",
      description: "Giáo án tuần đầu cho học viên mới.",
      exercises: [
        { name: "Khởi động hít thở", reps: "5 phút", rest: "0", note: "" },
        { name: "Tư thế Em bé (Balasana)", reps: "3 lần × 30s", rest: "10s", note: "" },
        { name: "Tư thế Mèo-Bò (Cat-Cow)", reps: "10 lần", rest: "15s", note: "" },
        { name: "Tư thế Chó úp mặt (Down Dog)", reps: "3 × 30s", rest: "10s", note: "" },
        { name: "Thư giãn (Savasana)", reps: "10 phút", rest: "0", note: "" },
      ],
      assignedTo: [{ type: "class", id: "cls-yoga", name: "Yoga Cơ Bản – Lớp A" }],
    },
    {
      id: "cur2",
      name: "Gym BodyCombat – Strength",
      sport: "Gym",
      goal: "Tăng cơ, sức mạnh",
      level: "Nâng cao",
      duration: 90,
      status: "Nháp",
      updatedAt: "2023-10-22",
      description: "Giáo án sức mạnh cho lớp Combat.",
      exercises: [
        { name: "Squat", reps: "4 × 12", rest: "60s", note: "Giữ lưng thẳng" },
        { name: "Bench Press", reps: "3 × 10", rest: "90s", note: "" },
        { name: "Deadlift", reps: "3 × 8", rest: "120s", note: "Form trước tạ" },
        { name: "Pull-up", reps: "3 × tối đa", rest: "90s", note: "" },
      ],
      assignedTo: [],
    },
    {
      id: "cur3",
      name: "Bơi Kỹ Thuật – Tự Do",
      sport: "Bơi",
      goal: "Cải thiện kỹ thuật tự do",
      level: "Trung cấp",
      duration: 60,
      status: "Lưu trữ",
      updatedAt: "2023-09-01",
      description: "Giáo án kỹ thuật freestyle cơ bản.",
      exercises: [
        { name: "Khởi động nước", reps: "200m dễ", rest: "1 phút", note: "" },
        { name: "Kỹ thuật tay", reps: "4 × 50m", rest: "30s", note: "" },
        { name: "Kick board", reps: "4 × 50m", rest: "30s", note: "" },
        { name: "Full stroke", reps: "4 × 100m", rest: "45s", note: "" },
      ],
      assignedTo: [],
    },
  ];
}

export function getMockCurricula(): MockCurriculum[] {
  const stored = localStorage.getItem(CURRICULUM_KEY);
  if (stored) return JSON.parse(stored);
  return defaultCurricula();
}

export async function saveCurriculum(c: MockCurriculum): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const all = getMockCurricula();
      const idx = all.findIndex((x) => x.id === c.id);
      if (idx >= 0) all[idx] = c;
      else all.push(c);
      localStorage.setItem(CURRICULUM_KEY, JSON.stringify(all));
      resolve({ success: true });
    }, 600);
  });
}

export async function assignCurriculum(
  curricId: string,
  target: { type: "class" | "member"; id: string; name: string }
): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const all = getMockCurricula();
      const cur = all.find((x) => x.id === curricId);
      if (cur) {
        if (!cur.assignedTo.find((t) => t.id === target.id)) {
          cur.assignedTo.push(target);
          cur.status = "Đã giao";
        }
        localStorage.setItem(CURRICULUM_KEY, JSON.stringify(all));
      }
      resolve({ success: true });
    }, 600);
  });
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
const NOTIF_KEY = "cp_notifications";

function defaultNotifications(): MockNotification[] {
  return [
    {
      id: "n1",
      title: "Nhắc nhở buổi yoga ngày mai",
      content: "Các bạn nhớ mang thảm yoga và trang phục thoải mái nhé!",
      type: "Thông báo",
      sentAt: "2023-10-24T08:00:00",
      targetType: "class",
      targetId: "cls-yoga",
      targetName: "Yoga Cơ Bản – Lớp A",
    },
    {
      id: "n2",
      title: "Bài tập về nhà – Plank & Core",
      content: "Thực hiện 3 set plank 30s mỗi ngày, chụp video gửi lại coach nhé.",
      type: "Bài tập về nhà",
      sentAt: "2023-10-22T10:30:00",
      targetType: "member",
      targetId: "m1",
      targetName: "Nguyễn Lan Anh",
      deadline: "2023-10-29",
    },
  ];
}

export function getMockNotifications(): MockNotification[] {
  const stored = localStorage.getItem(NOTIF_KEY);
  if (stored) return JSON.parse(stored);
  return defaultNotifications();
}

export async function sendNotification(n: Omit<MockNotification, "id" | "sentAt">): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const all = getMockNotifications();
      all.unshift({
        ...n,
        id: `n_${Date.now()}`,
        sentAt: new Date().toISOString(),
      });
      localStorage.setItem(NOTIF_KEY, JSON.stringify(all));
      resolve({ success: true });
    }, 800);
  });
}

// ─── ASSESSMENT ───────────────────────────────────────────────────────────────
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

const ASSESSMENT_KEY = "cp_assessments";

export function getMockAssessments(): AssessmentRecord[] {
  const stored = localStorage.getItem(ASSESSMENT_KEY);
  if (stored) return JSON.parse(stored);
  return [
    {
      id: "as1",
      sessionId: "s1",
      memberId: "m1",
      completion: 90,
      metrics: [
        { label: "Số động tác hoàn thành", value: "9", unit: "/10" },
        { label: "Thời gian giữ tư thế", value: "25", unit: "s" },
      ],
      comment: "Tiến bộ rõ rệt ở tư thế Down Dog.",
      nextStep: "Tập thêm tư thế Warrior II.",
      createdAt: "2023-10-20T08:30:00",
    },
    {
      id: "as2",
      sessionId: "s2",
      memberId: "m2",
      completion: 75,
      metrics: [
        { label: "Số tạ", value: "70", unit: "kg" },
        { label: "Số hiệp hoàn thành", value: "3", unit: "/4" },
      ],
      comment: "Kỹ thuật squat cần cải thiện.",
      nextStep: "Giảm tạ, tập form chuẩn trước.",
      createdAt: "2023-10-20T10:00:00",
    },
  ];
}

export async function saveAssessment(a: AssessmentRecord): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const all = getMockAssessments();
      const idx = all.findIndex((x) => x.id === a.id);
      if (idx >= 0) all[idx] = a;
      else all.push(a);
      localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(all));
      resolve({ success: true });
    }, 700);
  });
}

// ─── RESET ────────────────────────────────────────────────────────────────────
/** Đặt lại dữ liệu demo về mặc định. Không xóa các key khác. */
export function resetDemoData() {
  MOCK_SESSIONS.forEach((s) => localStorage.removeItem(ATTENDANCE_KEY(s.id)));
  localStorage.removeItem(CURRICULUM_KEY);
  localStorage.removeItem(NOTIF_KEY);
  localStorage.removeItem(ASSESSMENT_KEY);
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export function getMemberById(id: string) {
  return MOCK_MEMBERS.find((m) => m.id === id);
}

export function getSessionById(id: string) {
  return MOCK_SESSIONS.find((s) => s.id === id);
}

export function getMembersForSession(sessionId: string) {
  const session = MOCK_SESSIONS.find((s) => s.id === sessionId);
  if (!session) return [];
  return session.registeredMemberIds
    .map((id) => MOCK_MEMBERS.find((m) => m.id === id))
    .filter(Boolean) as MockMember[];
}

export function getTodaySessions(): MockSession[] {
  const today = new Date().toISOString().split("T")[0];
  return MOCK_SESSIONS.filter((s) => s.date === today);
}

export function getSessionsForMember(memberId: string): MockSession[] {
  return MOCK_SESSIONS.filter((s) => s.registeredMemberIds.includes(memberId));
}
