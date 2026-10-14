import { useState, useEffect, useMemo } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI } from "../services/api";
import type { MockSession, MockCurriculum, AssessmentRecord, AttendanceRecord, MockMember } from "../services/api";
import { curriculumSync } from "../../MemberPortal/services/curriculumSync";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  ShieldCheck,
  Target,
  TrendingUp,
  User,
  Award,
  Activity,
  Heart,
  AlertCircle,
  FileText,
  Save,
  Check,
  ChevronRight
} from "lucide-react";

interface Props {
  memberId: string | null;
  navigateTo: (s: CoachScreen, extra?: { memberId?: string; sessionId?: string }) => void;
}

interface MemberAttendanceHistoryItem {
  id: string;
  className: string;
  sport: string;
  date: string;
  time: string;
  room: string;
  status: "attended" | "late" | "excused" | "no_show";
  note?: string;
}

interface MemberWorkoutItem {
  id: string;
  name: string;
  sport: string;
  level: string;
  duration: number;
  status: "Đang tập luyện" | "Hoàn thành" | "Đã giao";
  exercises: { name: string; reps: string; rest: string; note?: string }[];
}

export default function CoachMemberProfile({ memberId, navigateTo }: Props) {
  const [member, setMember] = useState<MockMember | null>(null);
  const [loading, setLoading] = useState(true);

  // Notes state
  const [notes, setNotes] = useState<string[]>([
    "Học viên có ý thức tự giác rất cao, tiếp thu kỹ thuật nhanh và luôn đến đúng giờ.",
    "Động tác Squat và Deadlift đã chuẩn form, cột sống giữ thẳng tự nhiên.",
    "Khuyên học viên chú ý khởi động kỹ khớp cổ tay và bổ sung đủ 2 lít nước mỗi ngày."
  ]);
  const [newNote, setNewNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);

    CoachAPI.getMembers()
      .then((membersData) => {
        const m = membersData.find((x: MockMember) => x.id === memberId) || null;
        if (m) {
          setMember(m);
        } else {
          // Fallback member if id not in list
          setMember({
            id: memberId,
            name: "Member Two",
            code: "MBCBCE",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            goal: "Sức khỏe & Săn chắc cơ",
            level: "Cơ bản",
            sport: "Đa môn",
            phone: "0901234568",
            email: "member2@test.com",
            classIds: ["s1", "s2"]
          });
        }
      })
      .catch(() => {
        setMember({
          id: memberId,
          name: "Member Two",
          code: "MBCBCE",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          goal: "Sức khỏe & Săn chắc cơ",
          level: "Cơ bản",
          sport: "Đa môn",
          phone: "0901234568",
          email: "member2@test.com",
          classIds: ["s1", "s2"]
        });
      })
      .finally(() => setLoading(false));
  }, [memberId]);

  // Comprehensive 12 sessions history matching 92% (11/12 attended, 1 excused)
  const attendanceHistory: MemberAttendanceHistoryItem[] = useMemo(() => {
    return [
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
  }, []);

  // Assigned workout plans linked to curriculumSync
  const assignedWorkouts: MemberWorkoutItem[] = useMemo(() => {
    const fromSync = curriculumSync.getCurricula().filter(
      (c) => c.assignedTo.some((a) => a.id.includes("bbbb") || a.name.includes("Nam"))
    ).map((c) => {
      const assignee = c.assignedTo.find((a) => a.id.includes("bbbb") || a.name.includes("Nam"));
      const isComplete = assignee ? assignee.progressPercent === 100 : false;
      return {
        id: c.id,
        name: `${c.name || c.title} (${assignee?.progressPercent || 0}% hoàn thành)`,
        sport: c.sport,
        level: c.level,
        duration: c.duration,
        status: (isComplete ? "Hoàn thành" : "Đang tập luyện") as any,
        exercises: c.exercises.map((e) => ({
          name: e.name,
          reps: e.reps,
          rest: e.rest,
          note: e.note,
        })),
      };
    });

    if (fromSync.length > 0) return fromSync;

    return [
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
      }
    ];
  }, [curriculaTick]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([newNote.trim(), ...notes]);
    setNewNote("");
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 max-w-4xl mx-auto">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-orange-500 mb-3"></div>
        <p className="text-sm">Đang tải hồ sơ học viên...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4 max-w-4xl mx-auto">
        <p>Không tìm thấy học viên trong hệ thống.</p>
        <button
          type="button"
          className="text-orange-600 hover:underline text-sm font-semibold"
          onClick={() => navigateTo("members")}
        >
          ← Quay lại danh sách học viên
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          onClick={() => navigateTo("members")}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách học viên</span>
        </button>

        <span className="text-xs text-slate-400">
          Mã học viên: <strong className="font-mono text-slate-700 dark:text-slate-200">{member.code}</strong>
        </span>
      </div>

      {/* Hero Member Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-20 h-20 rounded-2xl object-cover shrink-0 border-2 border-orange-500/20 shadow-md shadow-orange-500/10"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {member.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                  Đang tập luyện
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {member.level}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {member.phone || "0901234568"}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {member.email || "member@test.com"}
                </span>
                <span className="flex items-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5 text-slate-400" />
                  Môn: <strong className="text-slate-700 dark:text-slate-300">{member.sport}</strong>
                </span>
              </div>

              <div className="pt-1 flex items-center gap-2 text-xs">
                <span className="text-slate-400">Mục tiêu huấn luyện:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Target className="w-3 h-3 text-emerald-600" />
                  {member.goal || "Sức khỏe & Săn chắc cơ"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => navigateTo("chat")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors shadow-sm shadow-orange-500/20"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Nhắn tin trao đổi
            </button>
            <button
              type="button"
              onClick={() => navigateTo("curriculum")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Giao giáo án mới
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards (Matches 92% - 11/12 Sessions) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Chuyên cần */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>ĐỘ CHUYÊN CẦN</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">92%</span>
            <span className="text-xs text-emerald-600 font-medium">11/12 buổi</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "92%" }}></div>
          </div>
        </div>

        {/* Cân nặng & BMI */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>CHỈ SỐ THỂ CHẤT</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">64.5 <span className="text-sm font-normal text-slate-500">kg</span></span>
            <span className="text-xs text-blue-600 font-medium">BMI 21.8</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cao: 172cm · Mỡ: 16.2%</p>
        </div>

        {/* Buổi tập gần nhất */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>BUỔI GẦN NHẤT</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">Gym BodyCombat</span>
            <span className="text-xs text-emerald-600 font-medium">Có mặt (11/10/2026)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Hoàn thành 100% giáo án</p>
        </div>

        {/* Tiến độ mục tiêu */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>TIẾN ĐỘ MỤC TIÊU</span>
            <TrendingUp className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">78%</span>
            <span className="text-xs text-orange-600 font-medium">Giai đoạn 1</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sức bền & cơ bắp săn chắc</p>
        </div>
      </div>

      {/* Main Grid: Left = Attendance & Workouts | Right = Coach Notes & Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lịch sử điểm danh (11 Có mặt, 1 Có phép) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">Lịch sử điểm danh</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                  {attendanceHistory.length} ca dạy
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Tỷ lệ tham dự: 92%
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[420px] overflow-y-auto">
              {attendanceHistory.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                        {item.className}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                        {item.room}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span>{item.time}</span>
                      {item.note && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500 dark:text-slate-400 italic truncate max-w-[240px]">
                            "{item.note}"
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {item.status === "attended" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Có mặt
                      </span>
                    )}
                    {item.status === "excused" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                        <AlertCircle className="w-3 h-3 text-blue-600" />
                        Có phép
                      </span>
                    )}
                    {item.status === "late" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Đi trễ
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Giáo án bài tập đã giao */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-slate-500" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">Giáo án bài tập đã giao</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                  {assignedWorkouts.length} giáo án
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigateTo("curriculum")}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                + Thêm giáo án
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-6 space-y-6">
              {assignedWorkouts.map((workout) => (
                <div key={workout.id} className="pt-4 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {workout.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="font-medium text-slate-600 dark:text-slate-300">{workout.sport}</span>
                        <span>•</span>
                        <span>{workout.level}</span>
                        <span>•</span>
                        <span>Thời lượng: {workout.duration} phút</span>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        workout.status === "Hoàn thành"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
                          : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200"
                      }`}
                    >
                      {workout.status}
                    </span>
                  </div>

                  {/* Exercise list sub-table */}
                  <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {workout.exercises.map((ex, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{ex.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
                            <span>{ex.reps}</span>
                            <span className="text-orange-600 dark:text-orange-400">Nghỉ: {ex.rest}</span>
                          </div>
                          {ex.note && (
                            <div className="text-[10px] text-slate-400 italic mt-1 border-t border-slate-100 dark:border-slate-700 pt-1">
                              * {ex.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Coach Notes & Assessments */}
        <div className="space-y-6">
          {/* Nhận xét & Đánh giá của Coach */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">Ghi chú & Đánh giá của Coach</h2>
              </div>
            </div>

            {/* Note form */}
            <form onSubmit={handleAddNote} className="mt-4 space-y-2">
              <textarea
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Nhập ghi chú hoặc đánh giá buổi tập cho học viên này..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <div className="flex items-center justify-between">
                {noteSaved ? (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Đã lưu ghi chú!
                  </span>
                ) : (
                  <span></span>
                )}
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  Lưu nhận xét
                </button>
              </div>
            </form>

            {/* Note stream */}
            <div className="mt-4 space-y-2.5">
              {notes.map((note, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Huấn luyện viên Enam</span>
                    <span>{index === 0 ? "Hôm nay" : `${index + 1} tuần trước`}</span>
                  </div>
                  <p>{note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Test Thể lực định kỳ */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">Kiểm tra Thể lực Định kỳ</h2>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600">Đạt chuẩn</span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Chống đẩy (Push-up test)</span>
                <span className="font-bold text-slate-900 dark:text-white">25 cái / phút <span className="text-emerald-600 font-semibold">(Tốt)</span></span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Plank giữ cốt lõi</span>
                <span className="font-bold text-slate-900 dark:text-white">90 giây <span className="text-emerald-600 font-semibold">(Đạt)</span></span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Bodyweight Squat</span>
                <span className="font-bold text-slate-900 dark:text-white">35 lần / phút <span className="text-emerald-600 font-semibold">(Tốt)</span></span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Độ dẻo chạm mũi chân</span>
                <span className="font-bold text-slate-900 dark:text-white">+4 cm <span className="text-blue-600 font-semibold">(Cải thiện)</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
