import { useState, useMemo, useEffect, useRef } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI, type MockMember, type CoachClassOverview } from "../services/api";
import { Search, Filter, RefreshCw, Users, AlertCircle } from "lucide-react";
import { CoachMembersStats } from "./members/CoachMembersStats";
import { CoachClassFilterBar } from "./members/CoachClassFilterBar";
import { CoachMemberCard } from "./members/CoachMemberCard";

interface Props {
  navigateTo: (s: CoachScreen, extra?: { memberId?: string }) => void;
}

export default function CoachMembers({ navigateTo }: Props) {
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [members, setMembers] = useState<MockMember[]>([]);
  const [classes, setClasses] = useState<CoachClassOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<any>(null);

  const fetchOverview = async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const data = await CoachAPI.getMembersOverview();
      setError(null);
      if (data) {
        setMembers(Array.isArray(data.members) ? data.members : []);
        setClasses(Array.isArray(data.classes) ? data.classes : []);
      }
    } catch (err) {
      console.error("Lỗi tải thông tin học viên & lớp học:", err);
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu học viên phụ trách.");
    } finally {
      setLoading(false);
      if (!isSilent) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview(false);

    // Đồng bộ thời gian thực mỗi 3.5 giây
    pollTimerRef.current = setInterval(() => {
      fetchOverview(true);
    }, 3500);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const sports = useMemo(() => {
    return ["all", ...Array.from(new Set(members.map((m) => m.sport).filter(Boolean)))];
  }, [members]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return members.filter((m) => {
      if (sportFilter !== "all" && m.sport !== sportFilter) return false;
      if (selectedClassId !== "all" && !m.classIds?.includes(selectedClassId)) return false;

      if (q) {
        const nameMatch = m.name?.toLowerCase().includes(q);
        const codeMatch = m.code?.toLowerCase().includes(q);
        const phoneMatch = m.phone?.toLowerCase().includes(q);
        const emailMatch = m.email?.toLowerCase().includes(q);
        const classMatch = m.className?.toLowerCase().includes(q) || m.classNames?.some((cn) => cn.toLowerCase().includes(q));
        if (!nameMatch && !codeMatch && !phoneMatch && !emailMatch && !classMatch) return false;
      }

      return true;
    });
  }, [search, sportFilter, selectedClassId, members]);

  // Thống kê tổng quan
  const totalCapacity = useMemo(() => classes.reduce((sum, c) => sum + (c.capacity || 0), 0), [classes]);
  const totalEnrolled = useMemo(() => classes.reduce((sum, c) => sum + (c.enrolledCount || 0), 0), [classes]);
  const averageFillRate = useMemo(() => {
    if (totalCapacity === 0) return 0;
    return Math.round((totalEnrolled / totalCapacity) * 100);
  }, [totalCapacity, totalEnrolled]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Overview Stats & Real-time Live Header */}
      <CoachMembersStats
        totalMembersCount={members.length}
        classesCount={classes.length}
        totalCapacity={totalCapacity}
        totalEnrolled={totalEnrolled}
        averageFillRate={averageFillRate}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchOverview(false)}
      />

      {/* Real-time Class Cards Bar */}
      <CoachClassFilterBar
        classes={classes}
        selectedClassId={selectedClassId}
        totalMembersCount={members.length}
        onSelectClassId={setSelectedClassId}
      />

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã (MB001), SĐT, tên lớp học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-xs text-slate-400 hover:text-slate-600 px-2">
              Xóa
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Môn:
          </span>
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            {sports.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "Tất cả các môn" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Member Cards */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
          <p className="text-xs font-medium">Đang tải danh sách học viên theo thời gian thực...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-6 h-6" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={() => fetchOverview(false)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 hover:bg-red-50"
          >
            Thử tải lại
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Users className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Không tìm thấy học viên nào</h3>
            <p className="text-xs text-slate-400 mt-1">
              {search || sportFilter !== "all" || selectedClassId !== "all"
                ? "Thử xóa bộ lọc hoặc tìm kiếm với từ khóa khác."
                : "Huấn luyện viên chưa có học viên nào đăng ký tham gia lớp học hoặc PT."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <CoachMemberCard
              key={m.id}
              member={m}
              onSelect={(id) => navigateTo("member-profile", { memberId: id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
