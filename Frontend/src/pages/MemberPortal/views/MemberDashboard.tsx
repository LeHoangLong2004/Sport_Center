import { useState } from "react";
import type { MemberScreen, MemberSessionItem, MemberTaskItem } from "../types";
import { useUserProfile } from "../../../hooks/useUserProfile";
import {
  DEFAULT_MEMBER_PACKAGES,
  DEFAULT_MEMBER_SESSIONS,
  DEFAULT_MEMBER_TASKS,
  getSavedMemberData,
  saveMemberData,
} from "../services/memberData";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CreditCard,
  CheckCircle2,
  Circle,
  Dumbbell,
  ArrowRight,
  Sparkles,
  ChevronRight,
  CalendarCheck,
  AlertCircle,
  PlusCircle,
  Bot,
  Compass,
  MessageSquare,
} from "lucide-react";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

export default function MemberDashboard({ onNavigate }: Props) {
  // Load data
  const [sessions, setSessions] = useState<MemberSessionItem[]>(() =>
    getSavedMemberData("member_sessions", DEFAULT_MEMBER_SESSIONS)
  );
  const [tasks, setTasks] = useState<MemberTaskItem[]>(() =>
    getSavedMemberData("member_tasks", DEFAULT_MEMBER_TASKS)
  );
  const packages = DEFAULT_MEMBER_PACKAGES;

  // User name
  const { profile } = useUserProfile('member');
  const userStr = localStorage.getItem("user");
  let userName = profile?.fullName;
  if (!userName && userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u.role?.toLowerCase() !== 'coach') {
        userName = u.fullName || u.name;
      }
    } catch (e) {}
  }
  userName = userName || "Hội viên";

  // Next upcoming sessions
  const upcomingSessions = sessions.filter(
    (s) => s.status === "sắp diễn ra" || s.status === "đang diễn ra"
  );
  const nextSession = upcomingSessions[0];

  // Toggle homework task
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    saveMemberData("member_tasks", updated);
  };

  const pendingTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="space-y-6">
      {/* 1. WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 text-white shadow-lg border border-slate-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hội viên Thể thao SportCenter</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Xin chào, {userName} 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Chào mừng bạn trở lại! Bạn có <strong className="text-emerald-400">{upcomingSessions.length} buổi tập</strong> được xếp lịch trong tuần này. Hãy duy trì năng lượng và tập luyện đều đặn nhé!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate("booking")}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Khám phá & Đặt lịch</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate("support")}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs backdrop-blur-sm transition-all flex items-center gap-1.5 border border-white/10"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Hỏi AI Trợ lý</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle background blur lights */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-48 -bottom-16 w-56 h-56 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. FOUR KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gói còn hiệu lực</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{packages.length} gói</div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Yoga & Gym đang mở</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Buổi đã đặt sắp tới</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{upcomingSessions.length} buổi</div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Đã xác nhận giữ chỗ</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bài tập cần làm</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{pendingTasks.length} nhiệm vụ</div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Coach đã giao riêng</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tỷ lệ tham dự</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">92%</div>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Chuyên cần xuất sắc</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN SECTION: 2 COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: SESSIONS & TASKS (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Lịch tập tiếp theo */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Lịch tập tiếp theo</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Các ca học sắp tới bạn đã đặt chỗ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("schedule")}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 group"
              >
                <span>Xem tất cả lịch</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Bạn chưa có buổi tập nào sắp tới</p>
                <button
                  type="button"
                  onClick={() => onNavigate("booking")}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Tìm lớp để đặt ngay</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Time box */}
                      <div className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shrink-0 min-w-[76px]">
                        <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {session.startTime}
                        </span>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                          {session.date}
                        </span>
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              session.type === "pt"
                                ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            }`}
                          >
                            {session.type === "pt" ? "Kèm 1-1 PT" : session.sport}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {session.name}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{session.room}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{session.coachName}</span>
                          </div>
                        </div>

                        {session.coachNote && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 italic">
                            💬 "{session.coachNote}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => onNavigate("schedule")}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bài tập & Nhiệm vụ Coach giao */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Bài tập & Lời dặn từ Huấn luyện viên</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Hoàn thành để duy trì tiến độ rèn luyện</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("workouts")}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Xem giáo án</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    task.completed
                      ? "bg-slate-50/60 dark:bg-slate-850 border-slate-200 dark:border-slate-800 opacity-70"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 shadow-xs"
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs font-semibold ${
                          task.completed
                            ? "line-through text-slate-400 dark:text-slate-500"
                            : "text-slate-800 dark:text-slate-100"
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.dueDate && (
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          Hạn: {task.dueDate}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {task.description}
                    </p>
                    <span className="inline-block text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                      Giao bởi {task.assignedBy}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: ACTIVE PACKAGES & BODY STATS (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Gói tập của bạn */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Gói tập đang dùng</h2>
              <button
                type="button"
                onClick={() => onNavigate("packages")}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Gia hạn
              </button>
            </div>

            <div className="space-y-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-800 dark:to-emerald-950/20 border border-slate-200 dark:border-slate-700/80"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                      {pkg.sport}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Còn {pkg.daysRemaining} ngày
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                    {pkg.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Hạn đến: {pkg.endDate}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (pkg.daysRemaining / 90) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>


          {/* Quick shortcuts */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 shadow-md">
            <h3 className="font-extrabold text-sm text-slate-950">Bạn muốn tập luyện hôm nay?</h3>
            <p className="text-xs text-slate-900/80 mt-1">
              Khám phá hơn 10 bộ môn thể thao và đặt lịch lớp yêu thích ngay.
            </p>
            <button
              type="button"
              onClick={() => onNavigate("booking")}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Đặt lịch lớp ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
