export const LEVEL_OPTIONS = ["Cơ bản", "Trung cấp", "Nâng cao"] as const;

export const EQUIPMENT_OPTIONS = [
  "Thảm tập",
  "Tạ tay (Dumbbells)",
  "Tạ đòn (Barbell)",
  "Dây kháng lực",
  "Không dụng cụ (Bodyweight)",
];

export const GOAL_PRESETS = [
  "Giảm mỡ & Đốt calo",
  "Tăng cơ & Sức mạnh",
  "Phục hồi & Giãn cơ",
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
    badge: "Phổ biến",
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
    badge: "Sức mạnh",
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
    badge: "Phục hồi",
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
    badge: "Tốc độ",
    icon: "Flame",
    description: "Tổ hợp Jab-Cross, Hook và bài tập Footwork nhanh nhẹn.",
  },
];

export const DEFAULT_DEMO_MEMBERS: any[] = [];

export const DEFAULT_DEMO_CLASSES: any[] = [];

export const DEFAULT_DEMO_SPORTS: any[] = [];
