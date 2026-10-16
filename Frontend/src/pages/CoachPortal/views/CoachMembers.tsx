import { useState, useMemo, useEffect } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI, type MockMember } from "../services/api";
import { Users, Search, Filter, Phone, Mail, Target, ArrowRight } from "lucide-react";

interface Props {
  navigateTo: (s: CoachScreen, extra?: { memberId?: string }) => void;
}

export default function CoachMembers({ navigateTo }: Props) {
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [members, setMembers] = useState<MockMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CoachAPI.getMembers()
      .then((data) => {
        setMembers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const sports = ["all", ...Array.from(new Set(members.map((m) => m.sport)))];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return members.filter((m) => {
      if (sportFilter !== "all" && m.sport !== sportFilter) return false;
      if (q && !m.name.toLowerCase().includes(q) && !m.code.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, sportFilter, members]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            Học viên phụ trách
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Danh sách học viên thuộc các lớp và học viên kèm 1–1 của bạn
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 self-start md:self-auto">
          Tổng cộng: {members.length} học viên
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã học viên (VD: MB001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Môn:
          </span>
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            {sports.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "Tất cả các môn" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          Đang tải danh sách học viên...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
          Không tìm thấy học viên nào phù hợp với bộ lọc.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <div
              key={m.id}
              onClick={() => navigateTo("member-profile", { memberId: m.id })}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm cursor-pointer group"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 transition-colors truncate">
                      {m.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-bold px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                        {m.code}
                      </span>
                      <span className="text-xs text-slate-400">{m.level}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {m.goal && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Target className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">Mục tiêu: <strong className="font-semibold">{m.goal}</strong></span>
                    </div>
                  )}

                  {/* Attendance Rate */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Độ chuyên cần:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {m.attendanceRate == null
                          ? "Chưa có dữ liệu"
                          : `${m.attendanceRate}% (${m.attendedSessions ?? 0}/${m.totalSessions ?? 0} buổi)`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(Math.max(m.attendanceRate ?? 0, 0), 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {m.phone && (
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{m.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  {m.sport}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Hồ sơ học viên <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
