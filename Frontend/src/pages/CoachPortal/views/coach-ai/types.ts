export const LEVEL_OPTIONS = ["Cơ bản", "Trung cấp", "Nâng cao"] as const;

export const EQUIPMENT_OPTIONS = [
  "Thảm tập",
  "Tạ tay (Dumbbells)",
  "Tạ đòn (Barbell)",
  "Máy tập đa năng",
  "Xà đơn / Xà kép",
  "Dây kháng lực",
  "Kettlebell",
  "Không dụng cụ (Bodyweight)",
  "Hồ bơi",
  "Bao cát boxing",
];

export const GOAL_PRESETS = [
  "Giảm mỡ & đốt calo toàn thân",
  "Tăng cơ & phát triển sức mạnh",
  "Phục hồi thể lực & giãn cơ",
  "Tăng sức bền Cardio (HIIT)",
  "Hoàn thiện kỹ thuật động tác",
];

export const DURATION_PRESETS = [30, 45, 60, 90];

export interface RoutinePreset {
  id: string;
  title: string;
  sportName: string;
  level: string;
  goal: string;
  equipment: string[];
  durationMinutes: number;
  exerciseCount: number;
  badge: string;
  icon: string;
  description: string;
}

export const ROUTINE_PRESETS: RoutinePreset[] = [
  {
    id: "hiit-fatburn",
    title: "HIIT Đốt Mỡ Cường Độ Cao",
    sportName: "Gym",
    level: "Trung cấp",
    goal: "Giảm mỡ toàn thân & tăng sức bền Cardio (HIIT)",
    equipment: ["Thảm tập", "Tạ tay (Dumbbells)", "Dây kháng lực"],
    durationMinutes: 45,
    exerciseCount: 5,
    badge: "🔥 Phổ biến",
    icon: "Zap",
    description: "Tổ hợp 5 bài tập tăng nhịp tim, đốt calo tối đa trong 45 phút.",
  },
  {
    id: "upper-body-strength",
    title: "Sức Mạnh Thân Trên (Tạ Đơn)",
    sportName: "Gym",
    level: "Cơ bản",
    goal: "Tăng cơ ngực, vai & tay trước săn chắc",
    equipment: ["Tạ tay (Dumbbells)", "Thảm tập"],
    durationMinutes: 60,
    exerciseCount: 5,
    badge: "💪 Sức mạnh",
    icon: "Dumbbell",
    description: "Giáo án tập trung phát triển thân trên an toàn cho người mới.",
  },
  {
    id: "yoga-recovery",
    title: "Yoga Giãn Cơ & Phục Hồi Khớp",
    sportName: "Yoga",
    level: "Cơ bản",
    goal: "Phục hồi thể lực, dẻo dai & giải tỏa căng thẳng",
    equipment: ["Thảm tập"],
    durationMinutes: 30,
    exerciseCount: 4,
    badge: "🧘 Phục hồi",
    icon: "HeartPulse",
    description: "Thư giãn cột sống, mở khớp gối và hông sau tuần tập luyện căng thẳng.",
  },
  {
    id: "boxing-agility",
    title: "Boxing Phản Xạ & Tốc Độ",
    sportName: "Boxing",
    level: "Trung cấp",
    goal: "Phản xạ đòn đấm, né tránh & tốc độ di chuyển",
    equipment: ["Bao cát boxing", "Thảm tập"],
    durationMinutes: 45,
    exerciseCount: 5,
    badge: "🥊 Tốc độ",
    icon: "Flame",
    description: "Tổ hợp Jab-Cross, Hook và bài tập Footwork nhanh nhẹn.",
  },
];

export const DEFAULT_DEMO_MEMBERS = [
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    name: "Hồ Xuân Anh Nam",
    code: "HV001",
    avatar: "",
    goal: "Giảm mỡ bụng & săn chắc cơ đùi",
    level: "Cơ bản",
    sport: "Gym",
    phone: "0901234567",
    email: "nam.ho@example.com",
    classIds: [],
    attendanceRate: 0.92,
    healthMetrics: {
      heightCm: 175,
      weightKg: 72,
      bmi: 23.5,
      injuryNote: "Thoái hóa nhẹ khớp gối phải",
      caution: "Tránh động tác nhảy cao tiếp đất mạnh hoặc gánh tạ quá nặng lên gối",
      heartRateRest: 68,
    },
  },
  {
    id: "7b1c3e52-9481-432a-bc91-382a9f14d89a",
    name: "Lê Thị Bích Ngọc",
    code: "HV002",
    avatar: "",
    goal: "Phục hồi thể lực & dẻo dai",
    level: "Trung cấp",
    sport: "Yoga",
    phone: "0909876543",
    email: "ngoc.le@example.com",
    classIds: [],
    attendanceRate: 0.88,
    healthMetrics: {
      heightCm: 162,
      weightKg: 50,
      bmi: 19.1,
      injuryNote: "Cổ tay trái từng bong gân nhẹ",
      caution: "Hạn chế chống tay vuông góc 90 độ thời gian dài, ưu tiên nắm đấm hoặc dùng thảm đệm",
      heartRateRest: 72,
    },
  },
  {
    id: "1c89f52a-3372-4f18-a619-74d1a52e00bf",
    name: "Đặng Minh Quân",
    code: "HV003",
    avatar: "",
    goal: "Tăng cơ & phát triển sức mạnh",
    level: "Nâng cao",
    sport: "Gym",
    phone: "0912348899",
    email: "quan.dang@example.com",
    classIds: [],
    attendanceRate: 0.95,
    healthMetrics: {
      heightCm: 180,
      weightKg: 78,
      bmi: 24.1,
      injuryNote: "Không có tiền sử chấn thương",
      caution: "Thể lực tốt, đáp ứng tốt các bài compound tải trọng cao",
      heartRateRest: 62,
    },
  },
];

export const DEFAULT_DEMO_CLASSES = [
  {
    id: "9c3e4128-d820-4f51-b01f-0e12a45d7890",
    className: "Lớp Gym Cơ Bản T2-T4-T6",
    sport: "Gym",
    scheduleTime: "08:00 - 09:30",
    durationMinutes: 90,
    capacity: 20,
    enrolledCount: 14,
    status: true,
  },
  {
    id: "5a2d1e94-c102-4b3f-9e77-84f0b29c5412",
    className: "Lớp Yoga Thư Giãn T3-T5-T7",
    sport: "Yoga",
    scheduleTime: "17:30 - 18:30",
    durationMinutes: 60,
    capacity: 15,
    enrolledCount: 12,
    status: true,
  },
];

export const DEFAULT_DEMO_SPORTS = [
  { id: "e102f43a-7a89-42b1-912c-4f76239a0001", name: "Gym" },
  { id: "e102f43a-7a89-42b1-912c-4f76239a0002", name: "Yoga" },
  { id: "e102f43a-7a89-42b1-912c-4f76239a0003", name: "Bơi" },
  { id: "e102f43a-7a89-42b1-912c-4f76239a0004", name: "Boxing" },
  { id: "e102f43a-7a89-42b1-912c-4f76239a0005", name: "Cầu lông" },
];
