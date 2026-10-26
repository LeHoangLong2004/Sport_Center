import React, { useState, useEffect, useMemo } from "react"; import { toast } from "sonner"; import { createPortal } from "react-dom"; import type { MemberScreen, MemberSessionItem } from "../types"; import { getSavedMemberData, saveMemberData,
MemberBackendAPI, } from "../services/memberData"; import { Calendar, Clock, MapPin,
User, Users, CheckCircle2, AlertCircle, XCircle, HelpCircle,
X, Star, PlusCircle, RotateCcw, MessageSquare, ChevronLeft,
ChevronRight, Filter, Search, Grid3X3, List, Sparkles,
CalendarCheck, CalendarDays, CalendarPlus, Send, Target, Dumbbell,
ArrowRight, Info, Phone, Award, } from "lucide-react"; import { scheduleSync, type SyncedSession } from "../services/scheduleSync";
import { CoachAvatar } from "../utils/coachAvatar"; import { APPOINTMENT_UPDATED_EVENT } from "../../../services/appointmentService"; interface Props { onNavigate: (screen: MemberScreen) => void; } type ViewMode = "list" | "week"; type TypeFilter = "all" | "group" | "pt";
type SportFilter = "all" | string; type StatusFilter = "all" | "sắp diễn ra" | "đang diễn ra" | "hoàn thành" | "đã hủy"; const DAYS_NAMES = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
// Khung giờ hoạt động chuẩn từ 06:00 đến 22:00
const DEFAULT_TIME_ROWS = Array.from({ length: 17 }, (_, index) => `${String(index + 6).padStart(2, "0")}:00` ); const SPORT_OPTIONS = ["all", "Gym", "Yoga", "Boxing", "Pilates", "Zumba", "Bơi", "Cardio"]; const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = { "sắp diễn ra": {
label: "Sắp diễn ra", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400", }, "đang diễn ra": { label: "Đang diễn ra",
bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400", }, "hoàn thành": { label: "Hoàn thành", bg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
text: "text-slate-700 dark:text-slate-300", }, "đã hủy": { label: "Đã hủy", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-400",
}, }; const SPORT_THEME: Record<string, { badge: string; border: string }> = { Yoga: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800", border: "border-l-emerald-500",
}, Gym: { badge: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800", border: "border-l-orange-500", }, Boxing: {
badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800", border: "border-l-rose-500", }, Pilates: { badge: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800", border: "border-l-purple-500",
}, Bơi: { badge: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800", border: "border-l-cyan-500", }, Zumba: {
badge: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800", border: "border-l-pink-500", }, Cardio: { badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800", border: "border-l-amber-500",
}, }; function getMonday(d: Date): Date { const date = new Date(d); const day = date.getDay(); const diff = date.getDate() - day + (day === 0 ? -6 : 1);
date.setDate(diff); date.setHours(0, 0, 0, 0); return date; } function formatDateISO(d: Date): string { const y = d.getFullYear();
const m = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); return `${y}-${m}-${day}`; } export default function MemberSchedule({ onNavigate }: Props) { const userStr = localStorage.getItem("user");
const user = userStr ? JSON.parse(userStr) : null; const userId = user?.id || ""; const storageKey = userId ? `member_sessions_${userId}` : "member_sessions";
// 1. Data States
const [sessions, setSessions] = useState<MemberSessionItem[]>(() => getSavedMemberData(storageKey, []) ); const [loading, setLoading] = useState(false);
// 2. View Mode & Filters
const [viewMode, setViewMode] = useState<ViewMode>("week"); const [sportFilter, setSportFilter] = useState<SportFilter>("all"); const [typeFilter, setTypeFilter] = useState<TypeFilter>("all"); const [statusFilter, setStatusFilter] = useState<StatusFilter>("all"); const [searchQuery, setSearchQuery] = useState("");
// 3. Week Navigation (Monday reference)
const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));
// 4. Modals & Interactions
const [selectedSession, setSelectedSession] = useState<MemberSessionItem | null>(null); const [cancellingSession, setCancellingSession] = useState<MemberSessionItem | null>(null); const [cancelReason, setCancelReason] = useState(""); const [feedback, setFeedback] = useState<string | null>(null);

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
  window.addEventListener(APPOINTMENT_UPDATED_EVENT, refreshSessions);
  return () => {
    unsub();
    window.removeEventListener(APPOINTMENT_UPDATED_EVENT, refreshSessions);
  };
}, []);
// Lock scroll on modals
useEffect(() => { if (cancellingSession || selectedSession) { document.body.style.overflow = "hidden"; } else { document.body.style.overflow = "unset"; }
return () => { document.body.style.overflow = "unset"; }; }, [cancellingSession, selectedSession]);
// Escape key handler to close modals
useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") { setSelectedSession(null); setCancellingSession(null); }
}; window.addEventListener("keydown", handleKeyDown); return () => window.removeEventListener("keydown", handleKeyDown); }, []);
// Compute 7 days of the active week
const weekDates = useMemo(() => { const dates: { dateStr: string; dateObj: Date; dayName: string; dayOfMonth: number; isToday: boolean }[] = []; const todayISO = formatDateISO(new Date()); for (let i = 0; i < 7; i++) { const d = new Date(currentMonday); d.setDate(currentMonday.getDate() + i);
const iso = formatDateISO(d); dates.push({ dateStr: iso, dateObj: d, dayName: DAYS_NAMES[i], dayOfMonth: d.getDate(),
isToday: iso === todayISO, }); } return dates; }, [currentMonday]);
// Week range label
const weekLabel = useMemo(() => { const start = weekDates[0]; const end = weekDates[6]; const fmt = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`; return `${fmt(start.dateObj)} – ${fmt(end.dateObj)}`;
}, [weekDates]);
// Navigation handlers
const handlePrevWeek = () => { const prev = new Date(currentMonday); prev.setDate(currentMonday.getDate() - 7); setCurrentMonday(prev); }; const handleNextWeek = () => {
const next = new Date(currentMonday); next.setDate(currentMonday.getDate() + 7); setCurrentMonday(next); }; const handleTodayWeek = () => { setCurrentMonday(getMonday(new Date()));
}; const isCurrentWeek = useMemo(() => { return formatDateISO(currentMonday) === formatDateISO(getMonday(new Date())); }, [currentMonday]); const isCancelledSession = (session: MemberSessionItem) => { const normalizedStatus = String(session.status ?? "")
.trim() .toLowerCase() .normalize("NFD") .replace(/[\u0300-\u036f]/g, "") .replace(/đ/g, "d"); return ["da huy", "cancelled", "canceled", "rejected", "class_cancelled"].includes(normalizedStatus);
};
// Filtered Sessions
const filteredSessions = useMemo(() => { return sessions.filter((s) => { if (isCancelledSession(s)) return false; if (typeFilter !== "all" && s.type !== typeFilter) return false; if (sportFilter !== "all" && s.sport.toLowerCase() !== sportFilter.toLowerCase()) return false; if (statusFilter !== "all" && s.status !== statusFilter) return false;
if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); const matchName = s.name.toLowerCase().includes(q); const matchCoach = s.coachName.toLowerCase().includes(q); const matchRoom = s.room.toLowerCase().includes(q); if (!matchName && !matchCoach && !matchRoom) return false;
} return true; }); }, [sessions, typeFilter, sportFilter, statusFilter, searchQuery]);
// Sessions in this current week
const weekSessions = useMemo(() => { const weekIsoSet = new Set(weekDates.map((w) => w.dateStr)); return filteredSessions.filter((s) => weekIsoSet.has(s.date)); }, [filteredSessions, weekDates]);
// Dynamic time rows covering 06:00 - 22:00, expanding if there are sessions outside standard hours
const activeTimeRows = useMemo(() => { const hoursSet = new Set<number>(); for (let h = 6; h <= 22; h++) { hoursSet.add(h); } weekSessions.forEach((s) => {
const match = s.startTime?.match(/^(\d{1,2})/); if (match) { const h = parseInt(match[1], 10); if (!isNaN(h) && h >= 0 && h <= 23) { hoursSet.add(h); }
} }); return Array.from(hoursSet) .sort((a, b) => a - b) .map((h) => `${String(h).padStart(2, "0")}:00`); }, [weekSessions]);
const todayStr = useMemo(() => formatDateISO(new Date()), []);
// Group filtered sessions by date for list view (Image 1)
const byDate = useMemo(() => { const map: Record<string, MemberSessionItem[]> = {}; filteredSessions.forEach((s) => { if (!map[s.date]) map[s.date] = []; map[s.date].push(s); });
const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b)); sorted.forEach(([, arr]) => arr.sort((a, b) => a.startTime.localeCompare(b.startTime))); return sorted; }, [filteredSessions]);
// Handle Cancel Booking
const handleConfirmCancel = async (e: React.FormEvent) => { e.preventDefault(); if (!cancellingSession) return; if (!cancelReason.trim()) { toast.error("Vui lòng nhập lý do hủy lịch."); return;
} const reason = cancelReason.trim();
// 1. Sync through scheduleSync
scheduleSync.cancelBooking(cancellingSession.id, reason);
// 2. Call backend API
await MemberBackendAPI.cancelBooking(cancellingSession.id, reason);
// 3. Update local state
const updated = sessions.map((s) => s.id === cancellingSession.id ? { ...s, status: "đã hủy" as const, cancelReason: reason,
} : s ); setSessions(updated); saveMemberData(storageKey, updated); setFeedback(`Đã hủy buổi tập "${cancellingSession.name}". Chỗ học đã được hoàn trả về tài khoản.`);
toast.success(`Đã hủy buổi tập "${cancellingSession.name}".`);
setCancellingSession(null); setCancelReason(""); if (selectedSession?.id === cancellingSession.id) { setSelectedSession(null); } setTimeout(() => setFeedback(null), 4500);
}; return ( <div className="flex flex-col gap-5 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300"> {/* 1. Header Bar (Matching Coach Schedule Header) */} <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"> <div>
<div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1"> HỘI VIÊN / LỊCH HỌC </div> <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight"> Lịch học & Ca tập </h1>
</div> {/* Action buttons */} <div className="flex items-center gap-3"> <button type="button" onClick={() => onNavigate("booking")}
className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer" > <CalendarPlus className="w-4 h-4" /> Đăng ký lớp / PT mới </button> <button
type="button" onClick={() => onNavigate("chat")} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm cursor-pointer" > <Send className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Trò chuyện HLV
</button> </div> </div> {/* Toast Feedback */} {feedback && ( <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between shadow-xs">
<div className="flex items-center gap-3"> <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" /> <span>{feedback}</span> </div> <button type="button"
onClick={() => setFeedback(null)} className="text-emerald-600 hover:text-emerald-800 dark:hover:text-white p-1" > <X className="w-4 h-4" /> </button> </div>
)} {/* 2. Unified Filters Bar (Styled Exactly Like Image 1 & Image 2) */} <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs"> <div className="flex flex-wrap items-center gap-5"> {/* Dropdown 1: Bộ môn */} <div className="flex flex-col gap-1.5">
<label className="text-xs font-semibold text-slate-700 dark:text-slate-300"> Bộ môn </label> <div className="relative"> <select value={sportFilter}
onChange={(e) => setSportFilter(e.target.value)} className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-[150px] shadow-xs cursor-pointer" > {SPORT_OPTIONS.map((o) => ( <option key={o} value={o}> {o === "all" ? "Tất cả bộ môn" : o}
</option> ))} </select> </div> </div> {/* Dropdown 2: Hình thức */}
<div className="flex flex-col gap-1.5"> <label className="text-xs font-semibold text-slate-700 dark:text-slate-300"> Hình thức </label> <div className="relative"> <select
value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)} className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-[185px] shadow-xs cursor-pointer" > <option value="all">Tất cả lịch tập</option> <option value="group">Lớp học nhóm</option>
<option value="pt">Kèm 1–1 (PT)</option> </select> </div> </div> {/* Dropdown 3: Trạng thái */} <div className="flex flex-col gap-1.5">
<label className="text-xs font-semibold text-slate-700 dark:text-slate-300"> Trạng thái </label> <div className="relative"> <select value={statusFilter}
onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-[150px] shadow-xs cursor-pointer" > <option value="all">Tất cả trạng thái</option> <option value="sắp diễn ra">Sắp diễn ra</option> <option value="đang diễn ra">Đang diễn ra</option>
<option value="hoàn thành">Hoàn thành</option> <option value="đã hủy">Đã hủy</option> </select> </div> </div> </div>
{/* Right: View toggle & Week pagination */} <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto mt-2 sm:mt-0"> {/* View Toggle */} <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700"> <button type="button"
onClick={() => setViewMode("list")} className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${ viewMode === "list" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-700" }`}
> <List className="w-3.5 h-3.5" /> Danh sách </button> <button type="button" onClick={() => setViewMode("week")}
className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${ viewMode === "week" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-700" }`} >
<Calendar className="w-3.5 h-3.5" /> Theo tuần </button> </div> {/* Week Pagination Controls (Active for Week mode) */} {viewMode === "week" && ( <div className="flex items-center gap-1.5">
<button type="button" onClick={handlePrevWeek} className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer" title="Tuần trước" >
<ChevronLeft className="w-4 h-4" /> </button> <button type="button" onClick={handleTodayWeek} className={`text-xs font-semibold px-3.5 py-2 border rounded-xl transition-colors cursor-pointer ${
isCurrentWeek ? "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800 font-bold" : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" }`} > Hôm nay
</button> <button type="button" onClick={handleNextWeek} className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer" title="Tuần sau"
> <ChevronRight className="w-4 h-4" /> </button> </div> )} </div>
</div> {/* 3. WEEK VIEW GRID (EXACTLY LIKE IMAGE 2) */} {viewMode === "week" && ( <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs"> <div className="min-w-[960px]"> {/* Header Row: Giờ | Thứ 2 | Thứ 3 | Thứ 4 | Thứ 5 | Thứ 6 | Thứ 7 | Chủ nhật */}
<div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850"> <div className="p-3 text-xs font-semibold text-slate-400 text-center border-r border-slate-200 dark:border-slate-800 flex items-center justify-center"> Giờ </div> {DAYS_NAMES.map((d, di) => { const day = weekDates[di];
const isToday = day?.isToday; return ( <div key={d} className={`p-3 text-xs text-center border-r border-slate-200 dark:border-slate-800 last:border-0 ${ isToday
? "bg-orange-50/60 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold" : "text-slate-700 dark:text-slate-300 font-semibold" }`} > <div>{d}</div> <div className="text-[10px] font-normal text-slate-400 mt-0.5">
{day?.dateStr?.split("-").slice(1).reverse().join("/")} </div> </div> ); })} </div>
{/* Grid Rows by Time */} {activeTimeRows.map((hour) => { const rowHour = parseInt(hour.split(":")[0], 10); return ( <div key={hour}
className="grid grid-cols-8 min-h-[92px] border-b border-slate-100 dark:border-slate-800/60 last:border-0" > <div className="p-2 text-xs text-slate-400 font-medium border-r border-slate-200 dark:border-slate-800 flex items-center justify-center"> {hour} </div> {DAYS_NAMES.map((_, di) => {
const colDate = weekDates[di]?.dateStr; const cellSessions = weekSessions.filter((s) => { const isSameDay = s.date === colDate; const match = s.startTime?.match(/^(\d{1,2})/); const sHour = match ? parseInt(match[1], 10) : -1; return isSameDay && sHour === rowHour;
});
// Sắp xếp các buổi tập trong cùng ô theo giờ bắt đầu
cellSessions.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || "")); return ( <div key={di} className="p-1.5 border-r border-slate-100 dark:border-slate-800/60 last:border-0 relative space-y-1.5" >
{cellSessions.map((s) => { const isAppt = s.id?.startsWith("appt-") || s.sport === "Lễ tân xếp"; const isPT = s.type === "pt"; const isCancelled = s.status === "đã hủy"; return ( <button key={s.id}
type="button" onClick={() => setSelectedSession(s)} className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between shadow-xs hover:shadow-md cursor-pointer ${ isAppt ? "bg-orange-50/80 border-orange-200 hover:border-orange-300 dark:bg-orange-950/30 dark:border-orange-800/60" : isPT ? "bg-amber-50/70 border-amber-200 hover:border-amber-300 dark:bg-amber-950/30 dark:border-amber-800/60" : isCancelled
? "opacity-60 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700" : "bg-emerald-50/70 border-emerald-200 hover:border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800/60" }`} > <div> <div className="flex items-center justify-between gap-1 mb-1">
<span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${ isAppt ? "bg-orange-200/90 text-orange-950 dark:bg-orange-900/60 dark:text-orange-200" : isPT ? "bg-amber-200/80 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200" : "bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200" }`}
> {isAppt ? "LỄ TÂN XẾP" : isPT ? "PT 1–1" : s.sport.toUpperCase()} </span> <span className="text-[10px] text-slate-500 font-mono font-medium"> {s.startTime}{s.endTime ? ` – ${s.endTime}` : ""} </span>
</div> <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1"> {s.name} </div> </div> <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
<span className="truncate max-w-[85px]">{s.room}</span> {isPT ? ( <span className="text-amber-700 dark:text-amber-400 font-semibold truncate max-w-[80px]"> {s.goal || s.coachName} </span> ) : (
<span className="text-slate-600 dark:text-slate-300 font-medium"> {s.registeredCount || 8} HV </span> )} </div> </button>
); })} </div> ); })} </div>
); })} </div> </div> )} {/* 4. LIST VIEW GROUPED BY DAY (EXACTLY LIKE IMAGE 1) */}
{viewMode === "list" && ( <div className="flex flex-col gap-6"> {byDate.length === 0 ? ( <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center"> <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" /> <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
Không tìm thấy ca tập nào phù hợp </h3> <p className="text-xs text-slate-500 mt-1"> Hãy đổi bộ lọc hoặc đăng ký thêm ca học mới nhé </p> <button
type="button" onClick={() => onNavigate("booking")} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs cursor-pointer" > <PlusCircle className="w-4 h-4" /> <span>Đăng ký lớp ngay</span>
</button> </div> ) : ( byDate.map(([date, daySessions]) => { const d = new Date(date); const isToday = date === todayStr;
const label = d.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", }); return (
<div key={date} className="flex flex-col gap-3"> {/* Day Divider Header */} <div className="flex items-center gap-3"> <div className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${ isToday
? "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-300 dark:border-orange-800" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" }`} > {label} {isToday && "• HÔM NAY"} </div>
<div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div> </div> {/* Day Sessions List */} <div className="grid grid-cols-1 gap-3"> {daySessions.map((s) => { const badge = STATUS_BADGE[s.status] || {
label: s.status, bg: "bg-slate-100", text: "text-slate-600", }; const isAppt = s.id?.startsWith("appt-") || s.sport === "Lễ tân xếp"; const isPT = s.type === "pt"; return (
<div key={s.id} className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-xs" > <div className="flex-1 min-w-0"> {/* Top Badges Row */}
<div className="flex items-center gap-2.5 flex-wrap mb-1.5"> <span className="font-semibold text-base text-slate-900 dark:text-white"> {s.name} </span> <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
isAppt ? "bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950/60 dark:text-orange-300" : isPT ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300" : "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300" }`} > {isAppt ? "LỄ TÂN ĐẶT HẸN" : isPT ? "KÈM 1–1 (PT)" : "LỚP NHÓM"}
</span> <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"> {s.sport} </span> <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${badge.bg} ${badge.text}`}
> {badge.label} </span> </div> {/* Meta Info Row */} <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
<span className="flex items-center gap-1.5"> <Clock className="w-3.5 h-3.5 text-slate-400" /> {s.startTime} – {s.endTime} </span> <span className="flex items-center gap-1.5"> <MapPin className="w-3.5 h-3.5 text-slate-400" />
{s.room} </span> {isPT ? ( <div className="flex items-center gap-3 flex-wrap"> <span className="flex items-center gap-1 text-slate-800 dark:text-slate-100 font-bold"> <User className="w-3.5 h-3.5 text-slate-400" />
HLV: {s.coachName} </span> {s.goal && ( <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium"> <Target className="w-3.5 h-3.5" /> Mục tiêu: {s.goal}
</span> )} {s.attendanceStatus === "có mặt" && ( <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1"> <CheckCircle2 className="w-3 h-3" /> Có mặt
</span> )} {s.cancelReason && ( <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"> Lý do hủy: {s.cancelReason} </span>
)} </div> ) : ( <div className="flex items-center gap-3 flex-wrap"> <span className="flex items-center gap-1 text-slate-800 dark:text-slate-100 font-medium"> <User className="w-3.5 h-3.5 text-slate-400" />
HLV: {s.coachName} </span> <span className="flex items-center gap-1.5"> <Users className="w-3.5 h-3.5 text-slate-400" /> {s.registeredCount || 8}/{s.capacity || 10} học viên </span>
</div> )} </div> {/* Coach Feedback Note if available */} {s.coachNote && ( <div className="mt-2 text-xs italic text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800 flex items-center gap-1.5">
<span>💬 Nhận xét từ HLV: "{s.coachNote}"</span> </div> )} </div> {/* Right Actions matching Image 1 */} <div className="flex items-center gap-2 shrink-0">
{s.status === "hoàn thành" ? ( <button type="button" onClick={() => setSelectedSession(s)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs cursor-pointer" >
<CheckCircle2 className="w-3.5 h-3.5" /> Điểm danh & Nhận xét </button> ) : s.status !== "đã hủy" ? ( <button type="button"
onClick={() => setSelectedSession(s)} className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all shadow-xs cursor-pointer" > Điểm danh </button> ) : null}
{s.status !== "đã hủy" && s.status !== "hoàn thành" && ( <button type="button" onClick={() => setCancellingSession(s)} className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs cursor-pointer" >
Dời ca </button> )} <button type="button" onClick={() => setSelectedSession(s)}
className="px-2 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer" > Chi tiết → </button> </div> </div>
); })} </div> </div> ); })
)} </div> )} {/* 5. SESSION DETAIL MODAL (PORTAL) */} {selectedSession && createPortal(
<div onClick={(e) => { if (e.target === e.currentTarget) setSelectedSession(null); }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200" >
<div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-5" > {/* Close Button */} <button
type="button" onClick={() => setSelectedSession(null)} className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" > <X className="w-5 h-5" /> </button>
{/* Title & Badge */} <div> <div className="flex items-center gap-2 mb-2"> <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${ selectedSession.type === "pt"
? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" }`} > {selectedSession.type === "pt" ? "Kèm riêng 1-1 PT" : selectedSession.sport} </span>
<span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${ STATUS_BADGE[selectedSession.status]?.bg || "" } ${STATUS_BADGE[selectedSession.status]?.text || ""}`} > {STATUS_BADGE[selectedSession.status]?.label || selectedSession.status}
</span> </div> <h3 className="text-xl font-bold text-slate-900 dark:text-white"> {selectedSession.name} </h3> </div>
{/* Specs Grid */} <div className="grid grid-cols-2 gap-3 text-xs"> <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60"> <span className="text-slate-400 block mb-0.5">Thời gian & Ngày</span> <strong className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-bold"> <Clock className="w-3.5 h-3.5 text-slate-400" />
{selectedSession.startTime} – {selectedSession.endTime} ({selectedSession.date}) </strong> </div> <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60"> <span className="text-slate-400 block mb-0.5">Phòng / Địa điểm</span> <strong className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-bold">
<MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedSession.room} </strong> </div> <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 col-span-2 space-y-3"> <div className="flex items-center gap-3">
<CoachAvatar src={selectedSession.coachAvatar} name={selectedSession.coachName} className="w-12 h-12 rounded-xl shrink-0" /> <div className="flex-1 min-w-0">
<span className="text-slate-400 block text-[11px] font-medium">Huấn luyện viên phụ trách</span> <div className="flex items-center gap-1.5 flex-wrap"> <strong className="text-slate-900 dark:text-white font-bold text-sm truncate"> {selectedSession.coachName} </strong> {selectedSession.coachRating ? (
<span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded"> <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {selectedSession.coachRating} </span> ) : null} </div>
<p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium truncate"> {selectedSession.coachSpecialty || "Huấn luyện viên thể hình"} {selectedSession.coachExperienceYears ? ` • ${selectedSession.coachExperienceYears} năm kinh nghiệm` : ""} </p> </div> </div>
{selectedSession.coachBio && ( <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2 bg-white dark:bg-slate-900/50 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800/50"> "{selectedSession.coachBio}" </p> )} <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
{selectedSession.coachPhone ? ( <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300"> <Phone className="w-3 h-3 text-teal-600" /> <a href={`tel:${selectedSession.coachPhone}`} className="text-teal-600 dark:text-teal-400 font-bold hover:underline"> {selectedSession.coachPhone} </a>
</span> ) : ( <span className="text-slate-400">HLV SmartGym</span> )} <span className="font-semibold text-slate-700 dark:text-slate-300"> Phí buổi học: <strong className="text-teal-700 dark:text-teal-400">{selectedSession.price ? `${selectedSession.price.toLocaleString('vi-VN')} đ` : "150.000 đ (Giá gốc)"}</strong>
</span> </div> </div> </div> {/* Coach Note / Feedback */} {selectedSession.coachNote && (
<div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs"> <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1"> <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> Lời nhận xét & dặn dò từ HLV: </div> <p className="text-amber-900 dark:text-amber-200 leading-relaxed italic">
"{selectedSession.coachNote}" </p> </div> )} {/* Action Buttons */} <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
<button type="button" onClick={() => { setSelectedSession(null); onNavigate("chat"); }}
className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm" > <MessageSquare className="w-4 h-4" /> <span>Nhắn tin với HLV</span> </button> {(selectedSession.status === "sắp diễn ra" || selectedSession.status === "đang diễn ra") && (
selectedSession.id.startsWith("appt-") ? (
<span className="text-[11px] text-slate-500 italic px-2">Lịch do Lễ tân đặt hẹn</span>
) : (
<button type="button" onClick={() => { setCancellingSession(selectedSession); }} className="py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors"
> Hủy lịch đặt chỗ </button> )
)} </div> </div>
</div>, document.body )} {/* 6. CANCEL BOOKING MODAL (PORTAL) */} {cancellingSession && createPortal(
<div onClick={(e) => { if (e.target === e.currentTarget) setCancellingSession(null); }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200" >
<div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4" > <button type="button"
onClick={() => setCancellingSession(null)} className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" > <X className="w-5 h-5" /> </button> <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
<AlertCircle className="w-6 h-6" /> </div> <div> <h3 className="text-lg font-bold text-slate-900 dark:text-white"> Xác nhận hủy đặt chỗ </h3>
<p className="text-xs text-slate-500 dark:text-slate-400 mt-1"> Bạn có chắc chắn muốn hủy buổi tập <strong>"{cancellingSession.name}"</strong> vào lúc{" "} <strong>{cancellingSession.startTime} ({cancellingSession.date})</strong> không? </p> </div> {/* Reason Form */}
<form onSubmit={handleConfirmCancel} className="space-y-3"> <div> <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"> Lý do hủy lịch: <span className="text-rose-500">*</span> </label> <div className="flex flex-wrap gap-1.5 mb-2">
{["Bận việc đột xuất", "Sức khỏe không tốt", "Trùng lịch cá nhân", "Đổi sang buổi khác"].map((r) => ( <button key={r} type="button" onClick={() => setCancelReason(r)} className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
cancelReason === r ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700 font-bold" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300" }`} > {r}
</button> ))} </div> <textarea rows={3} required
value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Nhập lý do hủy lịch của bạn..." className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500" /> </div>
<div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2"> <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> <span> Chính sách: Suất học sẽ được hoàn lại tự động vào gói tập của bạn và thông báo tới HLV để mở lại suất cho học viên khác. </span> </div>
<div className="flex items-center justify-end gap-2.5 pt-2"> <button type="button" onClick={() => setCancellingSession(null)} className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors" >
Giữ lại lịch tập </button> <button type="submit" className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm" >
Xác nhận hủy chỗ </button> </div> </form> </div> </div>,
document.body )} </div> ); }


