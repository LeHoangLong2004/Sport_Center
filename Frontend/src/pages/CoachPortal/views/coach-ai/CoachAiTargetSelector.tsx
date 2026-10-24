import React from "react";
import { User, Users } from "lucide-react";
import type { MockMember, CoachClassOverview } from "../../services/api";
import { UserAvatar } from "../../../../components/UserAvatar";

interface CoachAiTargetSelectorProps {
  targetType: "member" | "class";
  setTargetType: (type: "member" | "class") => void;
  targetId: string;
  setTargetId: (id: string) => void;
  members: MockMember[];
  classes: CoachClassOverview[];
}

export const CoachAiTargetSelector: React.FC<CoachAiTargetSelectorProps> = ({
  targetType,
  setTargetType,
  targetId,
  setTargetId,
  members,
  classes,
}) => {
  const selectedMember = members.find((m) => m.id === targetId);
  const selectedClass = classes.find((c) => c.id === targetId);

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
            setTargetType("member");
            if (members.length > 0 && targetType !== "member") {
              setTargetId(members[0].id);
            }
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
            setTargetType("class");
            if (classes.length > 0 && targetType !== "class") {
              setTargetId(classes[0].id);
            }
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
            onChange={(e) => setTargetId(e.target.value)}
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
            <div className="p-3 rounded-xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <UserAvatar
                  src={selectedMember.avatar}
                  name={selectedMember.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0 text-xs font-bold border border-orange-200 dark:border-orange-800 shadow-xs"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {selectedMember.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Mục tiêu: {selectedMember.goal || "Cải thiện thể lực"} · Trình độ: {selectedMember.level || "Cơ bản"}
                  </div>
                </div>
              </div>
              {selectedMember.attendanceRate !== undefined && selectedMember.attendanceRate !== null && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 shrink-0">
                  Chuyên cần: {Math.round(selectedMember.attendanceRate * 100)}%
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
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
