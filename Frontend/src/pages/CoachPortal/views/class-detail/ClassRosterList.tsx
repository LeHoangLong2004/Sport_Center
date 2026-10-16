import React from "react";
import { Users, ChevronRight } from "lucide-react";
import type { CoachScreen } from "../../types";
import type { MockMember, AttendanceRecord } from "../../services/api";

const ATTENDANCE_STYLE: Record<string, string> = {
  "chưa điểm danh": "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  attended: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
  no_show: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800",
  late: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
  excused: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
};

const ATTENDANCE_LABEL: Record<string, string> = {
  "chưa điểm danh": "Chưa điểm danh",
  attended: "Có mặt",
  no_show: "Vắng",
  late: "Đi trễ",
  excused: "Có phép",
};

interface ClassRosterListProps {
  sessionId: string;
  members: MockMember[];
  attendanceRecords: AttendanceRecord[];
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string; memberId?: string }) => void;
}

export const ClassRosterList: React.FC<ClassRosterListProps> = ({
  sessionId,
  members,
  attendanceRecords,
  navigateTo,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">Danh sách học viên ca dạy</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
            {members.length} học viên
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigateTo("attendance", { sessionId })}
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
        >
          Vào bảng điểm danh →
        </button>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {members.map((m) => {
          const att = attendanceRecords.find((r) => r.memberId === m.id);
          // Chỉ hiển thị trạng thái sau khi backend có bản ghi điểm danh thật.
          // Không tự gán Có mặt/Đi trễ cho lớp chưa diễn ra.
          const attStatus = att?.status || "chưa điểm danh";
          return (
            <div
              key={m.id}
              onClick={() => navigateTo("member-profile", { memberId: m.id })}
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                />
                <div className="min-w-0">
                  <h3 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors truncate">
                    {m.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                    <span className="font-mono text-slate-600 dark:text-slate-300 font-medium">{m.code}</span>
                    <span>•</span>
                    <span>{m.phone || "0901234568"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${ATTENDANCE_STYLE[attStatus]}`}>
                  {ATTENDANCE_LABEL[attStatus]}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
