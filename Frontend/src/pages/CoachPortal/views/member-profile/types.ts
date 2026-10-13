export interface MemberAttendanceHistoryItem {
  id: string;
  className: string;
  sport: string;
  date: string;
  time: string;
  room: string;
  status: "attended" | "late" | "excused" | "no_show";
  note?: string;
}

export interface MemberWorkoutItem {
  id: string;
  name: string;
  sport: string;
  level: string;
  duration: number;
  status: "Đang tập luyện" | "Hoàn thành" | "Đã giao";
  exercises: { name: string; reps: string; rest: string; note?: string }[];
}

export const MOCK_ATTENDANCE_HISTORY: MemberAttendanceHistoryItem[] = [
  { id: "att-1", className: "Gym Group BodyCombat", sport: "Gym", date: "11/10/2026", time: "09:00 - 10:30", room: "Khu Tạ Tự Do", status: "attended", note: "Hoàn thành 100% giáo án, form tạ rất chuẩn" },
  { id: "att-2", className: "Yoga Cơ Bản – Lớp A", sport: "Yoga", date: "09/10/2026", time: "07:00 - 08:00", room: "Studio 2", status: "attended", note: "Thở bụng sâu tốt, cơ hông giãn nở tự nhiên" },
  { id: "att-3", className: "Gym Group BodyCombat", sport: "Gym", date: "07/10/2026", time: "09:00 - 10:30", room: "Khu Tạ Tự Do", status: "attended", note: "Tăng tạ ngực lên 30kg, hoàn thành tốt" },
  { id: "att-4", className: "Yoga Phục Hồi Khớp", sport: "Yoga", date: "05/10/2026", time: "19:00 - 20:00", room: "Studio 2", status: "attended", note: "Khớp gối linh hoạt hơn, không còn mỏi lưng" },
  { id: "att-5", className: "Boxing Cơ Bản & Thể Lực", sport: "Boxing", date: "02/10/2026", time: "07:00 - 08:30", room: "Võ Đài", status: "excused", note: "Bận việc đột xuất cơ quan (Đã báo trước)" },
  { id: "att-6", className: "Gym Group BodyCombat", sport: "Gym", date: "30/09/2026", time: "09:00 - 10:30", room: "Khu Tạ Tự Do", status: "attended", note: "Thể lực bền bỉ, nhịp tim ổn định" },
  { id: "att-7", className: "Yoga Cơ Bản – Lớp A", sport: "Yoga", date: "28/09/2026", time: "07:00 - 08:00", room: "Studio 2", status: "attended", note: "Đúng giờ, tinh thần tích cực" },
  { id: "att-8", className: "Gym Group BodyCombat", sport: "Gym", date: "25/09/2026", time: "09:00 - 10:30", room: "Khu Tạ Tự Do", status: "attended", note: "Hoàn thành bài tập lưng xô rất chuẩn" },
  { id: "att-9", className: "Yoga Cơ Bản – Lớp A", sport: "Yoga", date: "23/09/2026", time: "07:00 - 08:00", room: "Studio 2", status: "attended", note: "Giữ thăng bằng tốt" },
  { id: "att-10", className: "Gym Group BodyCombat", sport: "Gym", date: "21/09/2026", time: "09:00 - 10:30", room: "Khu Tạ Tự Do", status: "attended", note: "Tập trung cao độ" },
  { id: "att-11", className: "Yoga Phục Hồi Khớp", sport: "Yoga", date: "18/09/2026", time: "19:00 - 20:00", room: "Studio 2", status: "attended", note: "Giãn cơ phục hồi sau buổi tạ" },
  { id: "att-12", className: "Gym Group BodyCombat", sport: "Gym", date: "15/09/2026", time: "09:00 - 10:30", room: "Khu Tạ Tự Do", status: "attended", note: "Buổi khởi đầu rất hào hứng" },
];

export const MOCK_ASSIGNED_WORKOUTS: MemberWorkoutItem[] = [
  {
    id: "w-1",
    name: "Giáo án Tăng Sức Bền & Kháng Lực Toàn Thân",
    sport: "Gym",
    level: "Cơ bản",
    duration: 60,
    status: "Đang tập luyện",
    exercises: [
      { name: "Barbell Back Squat", reps: "4 sets × 10 reps", rest: "90s", note: "Chú ý gồng core, lưng thẳng" },
      { name: "Dumbbell Bench Press", reps: "3 sets × 12 reps", rest: "60s", note: "Hạ tạ chậm 2 giây" },
      { name: "Seated Cable Row", reps: "3 sets × 12 reps", rest: "60s", note: "Kéo ép sát xương bả vai" },
      { name: "Plank Giữ Kháng Lực", reps: "3 sets × 60 giây", rest: "45s", note: "Không võng thắt lưng" }
    ]
  },
  {
    id: "w-2",
    name: "Giáo án Phục Hồi Cột Sống & Cốt Lõi",
    sport: "Yoga",
    level: "Cơ bản",
    duration: 45,
    status: "Hoàn thành",
    exercises: [
      { name: "Tư thế Mèo - Bò (Cat-Cow)", reps: "3 sets × 10 nhịp", rest: "30s", note: "Kết hợp hít thở sâu theo nhịp chuyển động" },
      { name: "Tư thế Đứa Trẻ (Child's Pose)", reps: "Giữ 3 phút", rest: "0s", note: "Thư giãn hoàn toàn cơ lưng dưới" },
      { name: "Tư thế Rắn Hổ Mang (Cobra)", reps: "3 sets × 8 nhịp", rest: "45s", note: "Mở rộng lồng ngực" }
    ]
  },
  {
    id: "w-3",
    name: "Cardio Đốt Mỡ & Thể Lực Sức Bền",
    sport: "HIIT",
    level: "Trung bình",
    duration: 35,
    status: "Đang tập luyện",
    exercises: [
      { name: "Jumping Jacks Khởi Động", reps: "3 sets × 45 giây", rest: "30s", note: "Duy trì nhịp thở đều" },
      { name: "Mountain Climbers", reps: "3 sets × 30 giây", rest: "45s", note: "Gồng chắc cơ bụng" },
      { name: "Burpees Thể Lực", reps: "3 sets × 10 reps", rest: "60s", note: "Bật nhảy tiếp đất bằng mũi chân" }
    ]
  }
];
