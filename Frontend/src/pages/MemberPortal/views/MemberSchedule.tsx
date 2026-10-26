import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import type { MemberScreen, MemberSessionItem } from "../types";
import {
  getSavedMemberData,
  saveMemberData,
  MemberBackendAPI,
} from "../services/memberData";
import {
  CheckCircle2,
  X,
  CalendarPlus,
  Send,
} from "lucide-react";
import { scheduleSync } from "../services/scheduleSync";
import {
  type ViewMode,
  type TypeFilter,
  type SportFilter,
  type StatusFilter,
  DAYS_NAMES,
  getMonday,
  formatDateISO,
  isCancelledSession,
} from "./schedule/scheduleConstants";
import ScheduleFilterBar from "./schedule/ScheduleFilterBar";
import ScheduleWeekView from "./schedule/ScheduleWeekView";
import ScheduleListView from "./schedule/ScheduleListView";
import SessionDetailModal from "./schedule/SessionDetailModal";
import CancelSessionModal from "./schedule/CancelSessionModal";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

export default function MemberSchedule({ onNavigate }: Props) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id || "";
  const storageKey = userId ? `member_sessions_${userId}` : "member_sessions";

  // Data States
  const [sessions, setSessions] = useState<MemberSessionItem[]>(() =>
    getSavedMemberData(storageKey, [])
  );

  // View Mode & Filters
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [sportFilter, setSportFilter] = useState<SportFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Week Navigation
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));

  // Modals & Interactions
  const [selectedSession, setSelectedSession] = useState<MemberSessionItem | null>(null);
  const [cancellingSession, setCancellingSession] = useState<MemberSessionItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Load from Backend and Sync with Local
  const refreshSessions = async () => {
    try {
      const backendData = await MemberBackendAPI.getBookings();
      if (Array.isArray(backendData)) {
        setSessions(backendData);
        saveMemberData(storageKey, backendData);
        return;
      }
    } catch {}
    const local = getSavedMemberData(storageKey, []);
    setSessions(local);
  };

  useEffect(() => {
    refreshSessions();
    const unsub = scheduleSync.subscribe(() => {
      refreshSessions();
    });
    return unsub;
  }, []);

  // Lock scroll on modals
  useEffect(() => {
    if (cancellingSession || selectedSession) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [cancellingSession, selectedSession]);

  // Escape key handler to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedSession(null);
        setCancellingSession(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute 7 days of the active week
  const weekDates = useMemo(() => {
    const dates: { dateStr: string; dateObj: Date; dayName: string; dayOfMonth: number; isToday: boolean }[] = [];
    const todayISO = formatDateISO(new Date());

    for (let i = 0; i < 7; i++) {
      const d = new Date(currentMonday);
      d.setDate(currentMonday.getDate() + i);
      const iso = formatDateISO(d);
      dates.push({
        dateStr: iso,
        dateObj: d,
        dayName: DAYS_NAMES[i],
        dayOfMonth: d.getDate(),
        isToday: iso === todayISO,
      });
    }
    return dates;
  }, [currentMonday]);

  // Navigation handlers
  const handlePrevWeek = () => {
    const prev = new Date(currentMonday);
    prev.setDate(currentMonday.getDate() - 7);
    setCurrentMonday(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentMonday);
    next.setDate(currentMonday.getDate() + 7);
    setCurrentMonday(next);
  };

  const handleTodayWeek = () => {
    setCurrentMonday(getMonday(new Date()));
  };

  const isCurrentWeek = useMemo(() => {
    return formatDateISO(currentMonday) === formatDateISO(getMonday(new Date()));
  }, [currentMonday]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (isCancelledSession(s)) return false;
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (sportFilter !== "all" && s.sport.toLowerCase() !== sportFilter.toLowerCase()) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      return true;
    });
  }, [sessions, typeFilter, sportFilter, statusFilter]);

  // Sessions in this current week
  const weekSessions = useMemo(() => {
    const weekIsoSet = new Set(weekDates.map((w) => w.dateStr));
    return filteredSessions.filter((s) => weekIsoSet.has(s.date));
  }, [filteredSessions, weekDates]);

  // Dynamic time rows covering 06:00 - 22:00
  const activeTimeRows = useMemo(() => {
    const hoursSet = new Set<number>();
    for (let h = 6; h <= 22; h++) {
      hoursSet.add(h);
    }
    weekSessions.forEach((s) => {
      const match = s.startTime?.match(/^(\d{1,2})/);
      if (match) {
        const h = parseInt(match[1], 10);
        if (!isNaN(h) && h >= 0 && h <= 23) {
          hoursSet.add(h);
        }
      }
    });
    return Array.from(hoursSet)
      .sort((a, b) => a - b)
      .map((h) => `${String(h).padStart(2, "0")}:00`);
  }, [weekSessions]);

  const todayStr = useMemo(() => formatDateISO(new Date()), []);

  // Group filtered sessions by date for list view
  const byDate = useMemo(() => {
    const map: Record<string, MemberSessionItem[]> = {};
    filteredSessions.forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
    sorted.forEach(([, arr]) => arr.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return sorted;
  }, [filteredSessions]);

  // Handle Cancel Booking
  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingSession) return;
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy lịch.");
      return;
    }

    const reason = cancelReason.trim();
    scheduleSync.cancelBooking(cancellingSession.id, reason);
    await MemberBackendAPI.cancelBooking(cancellingSession.id, reason);

    const updated = sessions.map((s) =>
      s.id === cancellingSession.id
        ? {
            ...s,
            status: "đã hủy" as const,
            cancelReason: reason,
          }
        : s
    );
    setSessions(updated);
    saveMemberData(storageKey, updated);

    const msg = `Đã hủy buổi tập "${cancellingSession.name}". Chỗ học đã được hoàn trả về tài khoản.`;
    setFeedback(msg);
    toast.success(msg);
    setCancellingSession(null);
    setCancelReason("");
    if (selectedSession?.id === cancellingSession.id) {
      setSelectedSession(null);
    }
    setTimeout(() => setFeedback(null), 4500);
  };

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            HỘI VIÊN / LỊCH HỌC
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Lịch học & Ca tập
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("booking")}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" />
            Đăng ký lớp / PT mới
          </button>

          <button
            type="button"
            onClick={() => onNavigate("chat")}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            Trò chuyện HLV
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Unified Filters Bar */}
      <ScheduleFilterBar
        sportFilter={sportFilter}
        onSportFilterChange={setSportFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrevWeek={handlePrevWeek}
        onTodayWeek={handleTodayWeek}
        onNextWeek={handleNextWeek}
        isCurrentWeek={isCurrentWeek}
      />

      {/* 3. Week View Grid */}
      {viewMode === "week" && (
        <ScheduleWeekView
          weekDates={weekDates}
          activeTimeRows={activeTimeRows}
          weekSessions={weekSessions}
          onSelectSession={setSelectedSession}
        />
      )}

      {/* 4. List View Grouped by Day */}
      {viewMode === "list" && (
        <ScheduleListView
          byDate={byDate}
          todayStr={todayStr}
          onSelectSession={setSelectedSession}
          onStartCancelSession={setCancellingSession}
          onNavigate={onNavigate}
        />
      )}

      {/* 5. Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onNavigate={onNavigate}
        onStartCancelSession={setCancellingSession}
      />

      {/* 6. Cancel Session Modal */}
      <CancelSessionModal
        session={cancellingSession}
        cancelReason={cancelReason}
        onCancelReasonChange={setCancelReason}
        onClose={() => setCancellingSession(null)}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
}

