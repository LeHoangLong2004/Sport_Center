import { useState, useMemo, useEffect, useRef } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI, type MockMember, type CoachClassOverview } from "../services/api";
import { Search, Filter, RefreshCw, Users, AlertCircle, ArrowLeft, Clock, Dumbbell } from "lucide-react";
import { CoachMemberCard } from "./members/CoachMemberCard";
import CoachClassesOverviewList from "./members/CoachClassesOverviewList";

interface Props {
  navigateTo: (s: CoachScreen, extra?: { memberId?: string }) => void;
}

export default function CoachMembers({ navigateTo }: Props) {
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
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

  const selectedClass = useMemo(() => {
    if (!selectedClassId || selectedClassId === "all") return null;
    return classes.find((c) => String(c.id) === String(selectedClassId)) || null;
  }, [classes, selectedClassId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return members.filter((m) => {
      if (sportFilter !== "all" && m.sport !== sportFilter) return false;
      if (selectedClassId && selectedClassId !== "all" && !m.classIds?.some((cid) => String(cid) === String(selectedClassId))) {
        return false;
      }

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

  // View 1: When no class is selected yet, show class/session cards overview (like CoachAttendance)
  if (!selectedClassId) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
        <CoachClassesOverviewList
          classes={classes}
          members={members}
          isLoading={loading}
          onSelectClass={(id) => {
            setSelectedClassId(id);
            setSearch("");
            setSportFilter("all");
          }}
          onViewAllMembers={() => {
            setSelectedClassId("all");
            setSearch("");
            setSportFilter("all");
          }}
        />
      </div>
    );
  }

  // View 2: When a class is selected, show students of that class with back button
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => {
            setSelectedClassId(null);
            setSearch("");
            setSportFilter("all");
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>← Quay lại danh sách lớp học</span>
        </button>
      </div>

      {/* Selected Class Header Info */}
      {selectedClass ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Dumbbell className="w-3.5 h-3.5" />
                {selectedClass.sport}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {selectedClass.capacity === 1 ? "Kèm 1-1 PT" : "Lớp nhóm"}
              </span>
              {selectedClass.status && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  ● Đang mở lớp
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {selectedClass.className}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                {selectedClass.scheduleTime} ({selectedClass.durationMinutes} phút)
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Sĩ số: <strong className="text-slate-800 dark:text-slate-200">{filtered.length}</strong>/{selectedClass.capacity} học viên
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fetchOverview(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Cập nhật</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Toàn bộ học viên phụ trách
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Hiển thị danh sách tất cả {members.length} học viên thuộc các lớp và ca kèm bạn phụ trách.
            </p>
          </div>
        </div>
      )}

      {/* Search & Filters within this class */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
          <input
            type="text"
            placeholder="Tìm theo tên học viên, mã (MB001), SĐT, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-xs text-slate-400 hover:text-slate-600 px-2 cursor-pointer">
              Xóa
            </button>
          )}
        </div>

        {selectedClassId === "all" && (
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
        )}
      </div>

      {/* Grid Member Cards */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <p className="text-xs font-medium">Đang tải danh sách học viên...</p>
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
              {search || sportFilter !== "all"
                ? "Thử xóa bộ lọc hoặc tìm kiếm với từ khóa khác."
                : "Lớp học này hiện chưa có học viên nào đăng ký."}
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
              onChat={(id) => navigateTo("chat", { memberId: id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
