/**
 * CO-05 — Danh sách học viên
 * Chỉ hiển thị học viên trong phạm vi phụ trách.
 * Tìm theo tên/mã; lọc môn. Bấm hàng mở đúng học viên.
 */
import { useState, useMemo } from "react";
import type { CoachScreen } from "../types";
import { MOCK_MEMBERS } from "../services/mockData";

interface Props {
  navigateTo: (s: CoachScreen, extra?: { memberId?: string }) => void;
}

export default function CoachMembers({ navigateTo }: Props) {
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");

  const sports = ["all", ...Array.from(new Set(MOCK_MEMBERS.map((m) => m.sport)))];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_MEMBERS.filter((m) => {
      if (sportFilter !== "all" && m.sport !== sportFilter) return false;
      if (q && !m.name.toLowerCase().includes(q) && !m.code.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, sportFilter]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Học viên</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Tìm theo tên hoặc mã học viên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          className="border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500"
        >
          {sports.map((s) => (
            <option key={s} value={s}>{s === "all" ? "Tất cả môn" : s}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide grid grid-cols-[1fr_auto_auto_auto]">
          <span>Học viên</span>
          <span className="w-20 text-center">Môn</span>
          <span className="w-24 text-center">Trình độ</span>
          <span className="w-28 text-right">Hành động</span>
        </div>

        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-slate-400 text-sm">
            Không tìm thấy học viên nào.
          </div>
        )}

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer group"
              onClick={() => navigateTo("member-profile", { memberId: m.id })}
            >
              <div className="flex items-center gap-3 min-w-0">
                <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                    {m.name}
                  </div>
                  <div className="text-xs text-slate-400">{m.code} · {m.goal}</div>
                </div>
              </div>
              <span className="w-20 text-center text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                {m.sport}
              </span>
              <span className="w-24 text-center text-xs text-slate-500 dark:text-slate-400">
                {m.level}
              </span>
              <div className="w-28 flex justify-end">
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors border border-teal-200 dark:border-teal-700"
                  onClick={(e) => { e.stopPropagation(); navigateTo("member-profile", { memberId: m.id }); }}
                >
                  Xem hồ sơ →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
