import React from "react";
import { Dumbbell, Clock, Calendar, MapPin, Users, Lock } from "lucide-react";
import type { MockSession } from "../../services/api";

interface Props {
  selectedSession: MockSession;
  sessions: MockSession[];
  selectedSessionId: string;
  setSelectedSessionId: (id: string) => void;
  isExpired24h?: boolean;
  memberCount: number;
}

export default function AssessmentSessionHeaderCard({
  selectedSession,
  sessions,
  selectedSessionId,
  setSelectedSessionId,
  isExpired24h,
  memberCount,
}: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Dumbbell className="w-3.5 h-3.5" />
            {selectedSession.sport || "Lớp nhóm"}
          </span>
          {selectedSession.level && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {selectedSession.level}
            </span>
          )}
          {isExpired24h && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Đã đóng (Quá 24 giờ)
            </span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          {selectedSession.className}
        </h2>

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            {selectedSession.startTime} - {selectedSession.endTime}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {selectedSession.date}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {selectedSession.room || "Studio trung tâm"}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            Sĩ số: {memberCount} học viên
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <select
          value={selectedSessionId}
          onChange={(e) => setSelectedSessionId(e.target.value)}
          className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
        >
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.className} — {s.date}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

