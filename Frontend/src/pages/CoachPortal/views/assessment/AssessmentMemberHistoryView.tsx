import React from "react";
import type { AssessmentRecord, MockSession } from "../../services/api";

const selectCls = "border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none";

interface Props {
  members: { id: string; name: string; code: string }[];
  selectedMemberId: string;
  setSelectedMemberId: (id: string) => void;
  selectedSessionId: string;
  setSelectedSessionId: (id: string) => void;
  eligibleSessionsForMember: MockSession[];
  sessions: MockSession[];
  memberAssessments: AssessmentRecord[];
  onOpenNew: () => void;
}

export default function AssessmentMemberHistoryView({
  members,
  selectedMemberId,
  setSelectedMemberId,
  selectedSessionId,
  setSelectedSessionId,
  eligibleSessionsForMember,
  sessions,
  memberAssessments,
  onOpenNew,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Chọn học viên & Buổi học */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Học viên</label>
          <select
            value={selectedMemberId}
            onChange={(e) => {
              setSelectedMemberId(e.target.value);
              setSelectedSessionId("");
            }}
            className={selectCls}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.code})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Buổi học (đủ điều kiện)</label>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            disabled={eligibleSessionsForMember.length === 0}
            className={`${selectCls} ${eligibleSessionsForMember.length === 0 ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <option value="">
              {eligibleSessionsForMember.length === 0
                ? "-- Học viên chưa có buổi học đủ điều kiện --"
                : "-- Chọn buổi --"}
            </option>
            {eligibleSessionsForMember.map((s) => (
              <option key={s.id} value={s.id}>
                {s.className} — {s.date}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={onOpenNew}
          disabled={!selectedSessionId}
          className={`px-4 py-2 text-white rounded-xl text-sm font-semibold transition-all ${
            !selectedSessionId
              ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 cursor-pointer"
          }`}
        >
          + Ghi kết quả
        </button>
      </div>

      {/* Tiến độ theo thời gian */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Lịch sử kết quả</h2>
        </div>
        {memberAssessments.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-400 text-sm">
            Chưa có kết quả nào. Bắt đầu ghi nhận sau mỗi buổi học.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:border-slate-700">
            {memberAssessments.map((a) => {
              const s = a.sessionId ? sessions.find((x) => x.id === a.sessionId) : null;
              return (
                <div key={a.id} className="px-4 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                        {s?.className || (a.sessionId ? a.sessionId : "Đánh giá chung / Định kỳ")}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {s?.date ? `${s.date} · ` : ""}{new Date(a.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Hoàn thành</div>
                        <div className={`text-lg font-black ${a.completion >= 80 ? "text-emerald-600" : a.completion >= 60 ? "text-slate-500" : "text-rose-600"}`}>
                          {a.completion}%
                        </div>
                      </div>
                      {/* Simple bar chart */}
                      <div className="w-20 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${a.completion >= 80 ? "bg-emerald-500" : a.completion >= 60 ? "bg-slate-400" : "bg-rose-500"}`}
                          style={{ width: `${a.completion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {a.metrics?.filter((m) => m && (m.value !== undefined && m.value !== "")).map((m, idx) => {
                      const metricLabel = m.label || (m as any).metricName || `Chỉ số ${idx + 1}`;
                      return (
                        <span key={idx} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">
                          {metricLabel}: {m.value}{m.unit ? ` ${m.unit}` : ""}
                        </span>
                      );
                    })}
                  </div>
                  {a.comment && <div className="text-sm text-slate-600 dark:text-slate-300 mt-2 italic">&ldquo;{a.comment}&rdquo;</div>}
                  {a.nextStep && <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">→ Hướng tiếp: {a.nextStep}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

