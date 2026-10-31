import React from "react";
import {
  GraduationCap,
  Target,
  Phone,
  Mail,
  ArrowRight
} from "lucide-react";
import type { MockMember } from "../../services/api";

interface CoachMemberCardProps {
  member: MockMember;
  onSelect: (id: string) => void;
}

export const CoachMemberCard: React.FC<CoachMemberCardProps> = ({
  member: m,
  onSelect
}) => {
  const displayClassName = m.className || (m.classNames && m.classNames.length > 0 ? m.classNames[0] : null);

  return (
    <div
      onClick={() => onSelect(m.id)}
      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-md cursor-pointer group relative overflow-hidden"
    >
      <div>
        <div className="flex items-center gap-3.5 mb-3">
          <img
            src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random`}
            alt={m.name}
            className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 ring-2 ring-slate-100 dark:ring-slate-800"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
              {m.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                {m.code}
              </span>
              <span className="text-xs text-slate-400">{m.level || "Học viên"}</span>
            </div>
          </div>
        </div>

        {/* Class Badge */}
        {displayClassName && (
          <div className="mb-3 px-2.5 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/70 dark:border-orange-800/50 text-orange-800 dark:text-orange-300 flex items-center gap-2 text-xs">
            <GraduationCap className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span className="font-semibold truncate">Lớp: {displayClassName}</span>
          </div>
        )}

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
          {m.goal && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Target className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="truncate">Mục tiêu: <strong className="font-semibold">{m.goal}</strong></span>
            </div>
          )}

          {/* Attendance Rate */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-500 dark:text-slate-400">Độ chuyên cần:</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">
                {m.attendanceRate == null
                  ? "Chưa có dữ liệu"
                  : `${m.attendanceRate}% (${m.attendedSessions ?? 0}/${m.totalSessions ?? 0} buổi)`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${Math.min(Math.max(m.attendanceRate ?? 0, 0), 100)}%` }}
              ></div>
            </div>
          </div>

          {m.phone && (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
              <Phone className="w-3 h-3 shrink-0" />
              <span className="truncate">{m.phone}</span>
            </div>
          )}

          {m.email && (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
              <Mail className="w-3 h-3 shrink-0" />
              <span className="truncate">{m.email}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
          {m.sport || "Thể thao"}
        </span>
        <span className="text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform text-xs">
          Hồ sơ học viên <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
