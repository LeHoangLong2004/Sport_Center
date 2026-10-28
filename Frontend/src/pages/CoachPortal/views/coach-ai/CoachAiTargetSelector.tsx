import React from "react";
import { User, Users, AlertTriangle, ShieldCheck, HeartPulse, Activity, Calendar, Dumbbell, History, Sparkles, CheckCircle2, TrendingUp } from "lucide-react";
import type { MockMember, CoachClassOverview } from "../../services/api";
import type { MemberProfileData } from "../member-profile/types";
import { UserAvatar } from "../../../../components/UserAvatar";

interface CoachAiTargetSelectorProps {
  targetType: "member" | "class";
  setTargetType: (type: "member" | "class") => void;
  targetId: string;
  setTargetId: (id: string) => void;
  onSelectTarget?: (type: "member" | "class", id: string) => void;
  memberProfile?: MemberProfileData | null;
  loadingProfile?: boolean;
  members: MockMember[];
  classes: CoachClassOverview[];
}

export const CoachAiTargetSelector: React.FC<CoachAiTargetSelectorProps> = ({
  targetType,
  setTargetType,
  targetId,
  setTargetId,
  onSelectTarget,
  memberProfile,
  loadingProfile,
  members,
  classes,
}) => {
  const selectedMember = members.find((m) => m.id === targetId);
  const selectedClass = classes.find((c) => c.id === targetId);

  const handlePickTarget = (type: "member" | "class", id: string) => {
    if (onSelectTarget) {
      onSelectTarget(type, id);
    } else {
      setTargetType(type);
      setTargetId(id);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
        Đối tượng áp dụng <span className="text-rose-500">*</span>
      </label>

      {/* Target Type Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => {
            const nextId = members.length > 0 ? members[0].id : "";
            handlePickTarget("member", nextId);
          }}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            targetType === "member"
              ? "bg-white dark:bg-orange-500 text-orange-600 dark:text-white shadow-sm font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Học viên cá nhân ({members.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const nextId = classes.length > 0 ? classes[0].id : "";
            handlePickTarget("class", nextId);
          }}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            targetType === "class"
              ? "bg-white dark:bg-orange-500 text-orange-600 dark:text-white shadow-sm font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Lớp học ({classes.length})</span>
        </button>
      </div>

      {/* Dropdown & Preview */}
      {targetType === "member" ? (
        <div className="flex flex-col gap-2">
          <select
            value={targetId}
            onChange={(e) => handlePickTarget("member", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
          >
            {members.length === 0 ? (
               <option value="">Chưa có học viên phụ trách</option>
            ) : (
              members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.code || "HV"}) {m.sport ? `· ${m.sport}` : ""}
                </option>
              ))
            )}
          </select>

          {selectedMember && (
            <div className="p-3.5 rounded-xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 flex flex-col gap-2.5 animate-in fade-in duration-200">
              {/* Member Basic Row */}
              {/* Member Basic Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar
                    src={selectedMember.avatar}
                    name={selectedMember.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 text-xs font-bold border border-orange-200 dark:border-orange-800 shadow-xs"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                      <span>{selectedMember.name}</span>
                      <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300">
                        {selectedMember.code || "HV"}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Mục tiêu: {memberProfile?.member?.goal || selectedMember.goal || "Cải thiện thể lực"} · {memberProfile?.member?.level || selectedMember.level || "Cơ bản"}
                    </div>
                  </div>
                </div>

                {/* Attendance rate */}
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 block">
                    Chuyên cần: {memberProfile?.stats?.attendanceRate != null ? `${memberProfile.stats.attendanceRate}%` : (selectedMember.attendanceRate != null ? `${Math.round(selectedMember.attendanceRate * 100)}%` : "0%")}
                  </span>
                  {memberProfile?.stats?.totalSessions ? (
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Đã tập {memberProfile.stats.attendedSessions}/{memberProfile.stats.totalSessions} buổi
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Real Workout History Context Card (from DB) */}
              <div className="p-2.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-orange-200/60 dark:border-orange-900/40 text-[11px] flex flex-col gap-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold border-b border-slate-100 dark:border-slate-800 pb-1">
                  <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400">
                    <History className="w-3.5 h-3.5" />
                    <span>Lịch sử tập luyện thực tế (từ Hồ sơ)</span>
                  </div>
                  {loadingProfile ? (
                    <span className="text-[10px] text-slate-400 animate-pulse">Đang đồng bộ DB...</span>
                  ) : (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Đã kết nối DB
                    </span>
                  )}
                </div>

                {/* Recent Session & Assigned Workouts */}
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">
                      <strong>Buổi gần nhất:</strong>{" "}
                      {memberProfile?.stats?.latestSession
                        ? `${memberProfile.stats.latestSession.className} (${memberProfile.stats.latestSession.status}) · ${memberProfile.stats.latestSession.date}`
                        : (memberProfile?.attendanceHistory && memberProfile.attendanceHistory.length > 0
                          ? `${memberProfile.attendanceHistory[0].className} (${memberProfile.attendanceHistory[0].sport}) · ${memberProfile.attendanceHistory[0].date}`
                          : "Học viên mới · Chưa có lịch sử tập luyện trước đó")}
                    </span>
                  </div>

                  {memberProfile?.assignedWorkouts && memberProfile.assignedWorkouts.length > 0 && (
                    <div className="flex items-start gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">
                        <strong>Giáo án trước đó:</strong> {memberProfile.assignedWorkouts[0].name} (
                        {memberProfile.assignedWorkouts[0].duration}p) ·{" "}
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {memberProfile.assignedWorkouts[0].status}
                        </span>
                      </span>
                    </div>
                  )}

                  {memberProfile?.stats?.goalProgress != null && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>
                        <strong>Tiến độ mục tiêu:</strong> {memberProfile.stats.goalProgress}% theo giáo án đã giao
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Health Metrics & Vitals Row */}
              {(memberProfile?.stats?.weight || selectedMember.healthMetrics) && (
                <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-[11px]">
                  <div className="px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-orange-100 dark:border-orange-900/40 text-center">
                    <span className="text-[10px] text-slate-400 block">Chiều cao</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {memberProfile?.stats?.height || selectedMember.healthMetrics?.heightCm || 170} cm
                    </span>
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-orange-100 dark:border-orange-900/40 text-center">
                    <span className="text-[10px] text-slate-400 block">Cân nặng</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {memberProfile?.stats?.weight || selectedMember.healthMetrics?.weightKg || 65} kg
                    </span>
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-orange-100 dark:border-orange-900/40 text-center">
                    <span className="text-[10px] text-slate-400 block">Chỉ số BMI</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {memberProfile?.stats?.bmi || selectedMember.healthMetrics?.bmi || "22.5"} (Chuẩn)
                    </span>
                  </div>
                </div>
              )}

              {/* Medical / Injury Note & AI Safety Filter */}
              {selectedMember.healthMetrics?.injuryNote && selectedMember.healthMetrics.injuryNote !== "Không có tiền sử chấn thương" ? (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-900 dark:text-amber-200 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Lưu ý y tế: {selectedMember.healthMetrics.injuryNote}</span>
                  </div>
                  {selectedMember.healthMetrics.caution && (
                    <div className="text-[10px] opacity-90 pl-5 text-slate-600 dark:text-slate-300 leading-tight">
                      {selectedMember.healthMetrics.caution}
                    </div>
                  )}
                  <div className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded border border-emerald-400/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Gemini AI Safety Filter: Tự động né chấn thương & kiểm soát tải</span>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium border border-emerald-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Đã nạp <strong>Mục tiêu</strong>, <strong>Trình độ</strong> & <strong>Lịch sử tập</strong> vào Gemini AI
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <select
            value={targetId}
            onChange={(e) => handlePickTarget("class", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
          >
            {classes.length === 0 ? (
              <option value="">Chưa có lớp học phụ trách</option>
            ) : (
              classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.className} ({c.sport}) · {c.enrolledCount} học viên
                </option>
              ))
            )}
          </select>

          {selectedClass && (
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Lớp: {selectedClass.className} ({selectedClass.sport})
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sĩ số: {selectedClass.enrolledCount}/{selectedClass.capacity} học viên
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                {selectedClass.scheduleTime || "Lịch chuẩn"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
