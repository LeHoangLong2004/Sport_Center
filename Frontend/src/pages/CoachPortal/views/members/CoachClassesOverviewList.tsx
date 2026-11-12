import { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Filter,
} from "lucide-react";
import type { CoachClassOverview, MockMember } from "../../services/api";

interface Props {
  classes: CoachClassOverview[];
  members: MockMember[];
  isLoading: boolean;
  onSelectClass: (classId: string) => void;
  onViewAllMembers: () => void;
}

type TypeFilter = "all" | "group" | "pt" | "active";

export default function CoachClassesOverviewList({
  classes,
  members,
  isLoading,
  onSelectClass,
  onViewAllMembers,
}: Props) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sportFilter, setSportFilter] = useState("all");
  const [search, setSearch] = useState("");

  const sports = useMemo(() => {
    return ["all", ...Array.from(new Set(classes.map((c) => c.sport).filter(Boolean)))];
  }, [classes]);

  // Statistics
  const totalCapacity = useMemo(
    () => classes.reduce((sum, c) => sum + (c.capacity || 0), 0),
    [classes]
  );
  const totalEnrolled = useMemo(
    () => classes.reduce((sum, c) => sum + (c.enrolledCount || 0), 0),
    [classes]
  );
  const averageFillRate = useMemo(() => {
    if (totalCapacity === 0) return 0;
    return Math.round((totalEnrolled / totalCapacity) * 100);
  }, [totalCapacity, totalEnrolled]);

  const groupClassesCount = useMemo(
    () => classes.filter((c) => (c.capacity || 0) > 1).length,
    [classes]
  );
  const ptClassesCount = useMemo(
    () =>
      classes.filter(
        (c) =>
          c.capacity === 1 ||
          c.className.toLowerCase().includes("pt") ||
          c.className.toLowerCase().includes("1-1") ||
          c.className.toLowerCase().includes("kèm riêng")
      ).length,
    [classes]
  );

  const topClass = useMemo(() => {
    if (classes.length === 0) return null;
    return [...classes].sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0))[0];
  }, [classes]);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      // 1. Type filter
      const isPt =
        c.capacity === 1 ||
        c.className.toLowerCase().includes("pt") ||
        c.className.toLowerCase().includes("1-1") ||
        c.className.toLowerCase().includes("kèm riêng");
      if (typeFilter === "group" && isPt) return false;
      if (typeFilter === "pt" && !isPt) return false;
      if (typeFilter === "active" && !c.status) return false;

      // 2. Sport filter
      if (sportFilter !== "all" && c.sport !== sportFilter) return false;

      // 3. Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const nameMatch = c.className?.toLowerCase().includes(q);
        const sportMatch = c.sport?.toLowerCase().includes(q);
        const timeMatch = c.scheduleTime?.toLowerCase().includes(q);
        if (!nameMatch && !sportMatch && !timeMatch) return false;
      }

      return true;
    });
  }, [classes, typeFilter, sportFilter, search]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 text-white shadow-lg border border-slate-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Users className="w-3.5 h-3.5" />
              <span>Học viên phụ trách & Lớp học</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Danh sách Lớp học & Học viên phụ trách
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Chọn lớp học nhóm hoặc ca kèm PT 1-1 bên dưới để xem danh sách học viên, hồ sơ sức khỏe và cập nhật tiến độ tập luyện.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs backdrop-blur-sm border border-white/10">
              Tổng cộng <strong className="text-emerald-400 font-bold">{classes.length}</strong> lớp •{" "}
              <strong className="text-emerald-400 font-bold">{members.length}</strong> học viên
            </div>
          </div>
        </div>

        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng lớp & ca dạy</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{classes.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">đang phụ trách</p>
          </div>
          <div className="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Tổng học viên</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{members.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">đang theo học</p>
          </div>
          <div className="size-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Tỷ lệ lấp đầy TB</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{averageFillRate}%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {totalEnrolled}/{totalCapacity} chỗ đã đăng ký
            </p>
          </div>
          <div className="size-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Dumbbell className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lớp đông nhất</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate max-w-[150px]">
              {topClass?.className || "—"}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              {topClass?.enrolledCount || 0} học viên
            </p>
          </div>
          <div className="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* 3. Toolbar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: "all", label: `Tất cả (${classes.length})` },
            { key: "group", label: `Lớp nhóm (${groupClassesCount})` },
            { key: "pt", label: `Kèm 1-1 (${ptClassesCount})` },
            { key: "active", label: "Đang mở lớp" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTypeFilter(tab.key as TypeFilter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                typeFilter === tab.key
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sport Dropdown, Search, and All Members Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none"
          >
            {sports.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "Tất cả các môn" : s}
              </option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm lớp, môn, lịch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={onViewAllMembers}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>Toàn bộ học viên ({members.length})</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 4. Classes Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="size-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold">Đang tải danh sách lớp học phụ trách...</span>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
          <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Không tìm thấy lớp học nào phù hợp
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Thử thay đổi bộ môn hoặc từ khóa tìm kiếm.
          </p>
          {(typeFilter !== "all" || sportFilter !== "all" || search) && (
            <button
              type="button"
              onClick={() => {
                setTypeFilter("all");
                setSportFilter("all");
                setSearch("");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              Xem tất cả lớp học
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => {
            const isPt =
              cls.capacity === 1 ||
              cls.className.toLowerCase().includes("pt") ||
              cls.className.toLowerCase().includes("1-1") ||
              cls.className.toLowerCase().includes("kèm riêng");
            const fillPct = cls.capacity ? Math.min(Math.round((cls.enrolledCount / cls.capacity) * 100), 100) : 0;

            return (
              <div
                key={cls.id}
                onClick={() => onSelectClass(cls.id)}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 p-5 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
              >
                {/* Accent top stripe */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isPt ? "bg-cyan-500" : "bg-emerald-500"
                  }`}
                />

                <div className="space-y-3.5 pt-1">
                  {/* Tags & Status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <Dumbbell className="w-3 h-3" />
                        {cls.sport || "Thể thao"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          isPt
                            ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {isPt ? "Kèm 1-1 PT" : "Lớp nhóm"}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        cls.status
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${cls.status ? "bg-emerald-500" : "bg-slate-400"}`}
                      />
                      {cls.status ? "Đang mở lớp" : "Tạm ngưng"}
                    </span>
                  </div>

                  {/* Class Title */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {cls.className}
                    </h3>
                  </div>

                  {/* Meta Details */}
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {cls.scheduleTime} ({cls.durationMinutes} phút)
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {cls.enrolledCount}/{cls.capacity} Học viên
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {fillPct}% lấp đầy
                      </span>
                    </div>

                    {/* Fill rate progress bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          fillPct >= 90
                            ? "bg-amber-500"
                            : fillPct > 0
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                        }`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClass(cls.id);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 group-hover:scale-[1.02]"
                  >
                    <span>Xem danh sách học viên ({cls.enrolledCount})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

