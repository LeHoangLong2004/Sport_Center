import React from "react";
import type { MemberScreen, MemberSessionItem, MemberTaskItem } from "../../types";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Dumbbell,
  ChevronRight,
  PlusCircle,
  MapPin,
  User,
} from "lucide-react";

interface DashboardSessionsTasksProps {
  upcomingSessions: MemberSessionItem[];
  tasks: MemberTaskItem[];
  onToggleTask: (taskId: string) => void;
  onNavigate: (screen: MemberScreen) => void;
}

export const DashboardSessionsTasks: React.FC<DashboardSessionsTasksProps> = ({
  upcomingSessions,
  tasks,
  onToggleTask,
  onNavigate,
}) => (
  <div className="space-y-6">
    {/* Lịch tập */}
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-4 rounded-full bg-emerald-500 shrink-0" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Lịch tập tiếp theo</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Các ca học sắp tới bạn đã đặt chỗ</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate("schedule")}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 group"
        >
          <span>Xem tất cả lịch</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {upcomingSessions.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Bạn chưa có buổi tập nào sắp tới</p>
          <button
            onClick={() => onNavigate("booking")}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tìm lớp để đặt ngay</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingSessions.slice(0, 3).map((session) => {
            const isAppt = session.id?.startsWith("appt-") || session.sport === "Lễ tân xếp";
            return (
              <div key={session.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`px-3 py-2 rounded-lg border text-center shrink-0 min-w-[76px] ${
                    isAppt
                      ? "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}>
                    <span className={`block text-xs font-bold ${isAppt ? "text-amber-700 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {session.startTime}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">{session.date}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isAppt
                          ? "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                          : session.type === "pt"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}>
                        {isAppt ? "Lễ tân đặt hẹn" : session.type === "pt" ? "Kèm 1-1 PT" : session.sport}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{session.name}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{session.room}</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />HLV: {session.coachName}</span>
                    </div>
                    {session.coachNote && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 italic">
                        {session.coachNote}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onNavigate("schedule")}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Chi tiết
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>

    {/* Bài tập Coach giao */}
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-4 rounded-full bg-emerald-500 shrink-0" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Bài tập & Lời dặn từ Huấn luyện viên</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Hoàn thành để duy trì tiến độ rèn luyện</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate("workouts")}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
        >
          <span>Xem giáo án</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
          Chưa có nhiệm vụ bài tập riêng từ HLV. Khi bạn tập luyện cùng HLV, bài tập sẽ hiển thị tại đây.
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                task.completed
                  ? "bg-slate-50/60 dark:bg-slate-850 border-slate-200 opacity-70"
                  : "bg-white dark:bg-slate-800 border-slate-200 hover:border-emerald-500/50"
              }`}
            >
              <div className="mt-0.5">
                {task.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${task.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-100"}`}>
                  {task.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{task.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  </div>
);
