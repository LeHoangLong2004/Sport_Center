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
