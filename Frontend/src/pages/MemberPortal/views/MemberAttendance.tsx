import React, { useState, useEffect, useMemo } from "react";
import type { MemberScreen, MemberSessionItem } from "../types";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  Search,
  Filter,
  QrCode,
  DoorOpen,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Info,
  UserCheck,
  Building,
  Timer,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { MemberBackendAPI, getSavedMemberData } from "../services/memberData";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

interface GateCheckInRecord {
  id: string;
  checkInTime: string;
  checkOutTime: string | null;
  durationMinutes: number | null;
  gate: string;
  status: "APPROVED" | "CHECKED_OUT";
}

interface AttendanceSession {
  id: string;
  className: string;
  sport: string;
  coachName: string;
  coachAvatar?: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "có mặt" | "vắng" | "đi muộn" | "chưa điểm danh" | "chưa diễn ra";
  coachNote?: string;
  type: "group" | "pt";
}

interface AttendanceSummary {
  attendanceRate: number | null;
  totalSessions: number;
  attendedCount: number;
  absentCount: number;
  lateCount: number;
  gateCheckInsCount: number;
  currentStreak: number;
  totalHoursTrained: number;
}

export default function MemberAttendance({ onNavigate }: Props) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const memberName = user?.fullName || user?.name || "Hội viên Sport Center";
  const memberEmail = user?.email || "";
  const memberId = user?.id || "m-demo";

  // Active Tab
  const [activeTab, setActiveTab] = useState<"classes" | "gate" | "qrcode">("classes");

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [gateCheckIns, setGateCheckIns] = useState<GateCheckInRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>({
    attendanceRate: null,
    totalSessions: 0,
    attendedCount: 0,
    absentCount: 0,
    lateCount: 0,
    gateCheckInsCount: 0,
    currentStreak: 0,
    totalHoursTrained: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Detail Modal
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Load Data
  const loadAttendanceData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // 1. Try dedicated endpoint first
      let fetchedSuccessfully = false;
      try {
        const res = await fetch("/api/member/attendance", { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && (Array.isArray(data.sessions) || Array.isArray(data.gateCheckIns))) {
            setSessions(data.sessions || []);
            setGateCheckIns(data.gateCheckIns || []);
            if (data.summary) {
              setSummary(data.summary);
            }
            fetchedSuccessfully = true;
          }
        }
      } catch (err) {
        console.warn("Direct /api/member/attendance failed, attempting fallback", err);
      }

      // 2. Fallback if dedicated endpoint wasn't reachable
      if (!fetchedSuccessfully) {
        // Fetch gate history
        let gateItems: GateCheckInRecord[] = [];
        try {
          const gateRes = await fetch("/api/checkin/history", { headers });
          if (gateRes.ok) {
            const gateData = await gateRes.json();
            if (Array.isArray(gateData)) {
              gateItems = gateData.map((g: any) => ({
                id: g.id || String(Math.random()),
                checkInTime: g.checkInTime,
                checkOutTime: g.checkOutTime || null,
                durationMinutes: g.durationMinutes || (g.duration ? Number(g.duration) : null),
                gate: "Cổng chính Sport Center",
                status: g.status === "CHECKED_OUT" ? "CHECKED_OUT" : "APPROVED",
              }));
              setGateCheckIns(gateItems);
            }
          }
        } catch (e) {
          console.warn("Failed to fetch checkin history", e);
        }

        // Fetch bookings / schedule
        const bookings = await MemberBackendAPI.getBookings();
        const fallbackSessions: AttendanceSession[] = bookings.map((b) => {
          let attStatus: AttendanceSession["status"] = "chưa điểm danh";
          if (b.attendanceStatus) {
            const raw = b.attendanceStatus.toLowerCase();
            if (raw.includes("có mặt") || raw.includes("present") || raw.includes("attended")) attStatus = "có mặt";
            else if (raw.includes("vắng") || raw.includes("absent")) attStatus = "vắng";
            else if (raw.includes("muộn") || raw.includes("late")) attStatus = "đi muộn";
          } else if (b.status === "hoàn thành") {
            attStatus = "có mặt";
          } else if (b.date && new Date(b.date) > new Date()) {
            attStatus = "chưa diễn ra";
          }

          return {
            id: b.id,
            className: b.name,
            sport: b.sport,
            coachName: b.coachName || "HLV Trung tâm",
            coachAvatar: b.coachAvatar,
            room: b.room || "Studio Sport Center",
            date: b.date,
            startTime: b.startTime,
            endTime: b.endTime,
            status: attStatus,
            coachNote: b.coachNote || "",
            type: b.type,
          };
        });

        setSessions(fallbackSessions);

        // Calculate fallback metrics
        const attended = fallbackSessions.filter((s) => s.status === "có mặt").length;
        const absent = fallbackSessions.filter((s) => s.status === "vắng").length;
        const late = fallbackSessions.filter((s) => s.status === "đi muộn").length;
        const evaluated = attended + absent + late;
        const rate = evaluated > 0 ? Math.round((attended / evaluated) * 100) : null;

        setSummary({
          attendanceRate: rate,
          totalSessions: fallbackSessions.length,
          attendedCount: attended,
          absentCount: absent,
          lateCount: late,
          gateCheckInsCount: gateItems.length,
          currentStreak: Math.min(attended + gateItems.length, 7),
          totalHoursTrained: Math.round((attended * 1.5 + gateItems.length * 1.0) * 10) / 10,
        });
      }
    } catch (err) {
      console.error("Error loading attendance", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAttendanceData();
  }, []);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // Search
      const matchesSearch =
        searchQuery === "" ||
        s.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.coachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sport.toLowerCase().includes(searchQuery.toLowerCase());

      // Status
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;

      // Type
      const matchesType = typeFilter === "all" || s.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [sessions, searchQuery, statusFilter, typeFilter]);

  // Format Helpers
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTimeDisplay = (isoStr: string) => {
    if (!isoStr) return "—";
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return isoStr;
    }
  };

  const getStatusBadge = (status: AttendanceSession["status"]) => {
    switch (status) {
      case "có mặt":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Có mặt
          </span>
        );
      case "vắng":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Vắng mặt
          </span>
        );
      case "đi muộn":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Đi muộn
          </span>
        );
      case "chưa diễn ra":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Calendar className="w-3.5 h-3.5" />
            Sắp diễn ra
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <Clock className="w-3.5 h-3.5" />
            Chưa điểm danh
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 p-6 sm:p-7 text-white shadow-xl border border-teal-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              Điểm danh & Check-in
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Lịch Sử Điểm Danh
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              Kiểm tra trạng thái điểm danh lớp học, lịch kèm PT và thời gian quét thẻ check-in tại sảnh Sport Center.
            </p>
            {/* Quick stats pills right inside header */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white font-medium flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-teal-300" />
                {sessions.length} buổi lớp & PT
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white font-medium flex items-center gap-1.5">
                <DoorOpen className="w-3.5 h-3.5 text-emerald-300" />
                {gateCheckIns.length} lượt check-in sảnh
              </span>
              {summary.absentCount > 0 ? (
                <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-200 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-300" />
                  {summary.absentCount} buổi vắng
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  Đầy đủ buổi học
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="btn-qr-modal-header"
              onClick={() => setShowQrModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-teal-500/25 transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <QrCode className="w-4 h-4" />
              Mã QR Check-in
            </button>
            <button
              id="btn-refresh-attendance"
              onClick={() => loadAttendanceData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/15 backdrop-blur-md transition-all duration-200 flex items-center justify-center disabled:opacity-50"
              title="Tải lại dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
          <button
            id="tab-btn-classes"
            onClick={() => setActiveTab("classes")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "classes"
                ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Điểm danh Lớp học & PT
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-200/60 dark:bg-slate-700">
              {sessions.length}
            </span>
          </button>
          <button
            id="tab-btn-gate"
            onClick={() => setActiveTab("gate")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "gate"
                ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <DoorOpen className="w-4 h-4" />
            Check-in Quầy Lễ Tân
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-200/60 dark:bg-slate-700">
              {gateCheckIns.length}
            </span>
          </button>
          <button
            id="tab-btn-qrcode"
            onClick={() => setActiveTab("qrcode")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "qrcode"
                ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <QrCode className="w-4 h-4" />
            Thẻ QR Hội Viên
          </button>
        </div>

        {activeTab === "classes" && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm lớp, huấn luyện viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="có mặt">Có mặt</option>
              <option value="vắng">Vắng mặt</option>
              <option value="đi muộn">Đi muộn</option>
              <option value="chưa điểm danh">Chưa điểm danh</option>
              <option value="chưa diễn ra">Sắp diễn ra</option>
            </select>

            {/* Filter by Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
            >
              <option value="all">Mọi hình thức</option>
              <option value="group">Lớp nhóm</option>
              <option value="pt">Kèm 1-1 PT</option>
            </select>
          </div>
        )}
      </div>

      {/* 4. Tab 1: Class & PT Attendance */}
      {activeTab === "classes" && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-16 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-500 mb-4" />
              <p className="text-slate-500 text-sm font-medium">Đang tải lịch sử điểm danh...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">
                Không tìm thấy dữ liệu điểm danh
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                {sessions.length === 0
                  ? "Bạn chưa có buổi tập hoặc lớp học nào đã được điểm danh. Hãy đặt lịch buổi tập mới ngay!"
                  : "Không có buổi học nào phù hợp với bộ lọc hiện tại."}
              </p>
              {sessions.length === 0 && (
                <button
                  onClick={() => onNavigate("booking")}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
                >
                  Khám phá & Đặt lịch ngay
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className="group relative flex flex-col justify-between p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-teal-500/50 transition-all duration-300 cursor-pointer"
                >
                  <div className="space-y-4">
                    {/* Header Row: Date & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-teal-500" />
                        <span>{formatDateDisplay(session.date)}</span>
                        <span>•</span>
                        <span>{session.startTime} - {session.endTime}</span>
                      </div>
                      {getStatusBadge(session.status)}
                    </div>

                    {/* Class Title & Sport Tag */}
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {session.sport}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                          {session.type === "pt" ? "Kèm 1-1" : "Lớp nhóm"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                        {session.className}
                      </h3>
                    </div>

                    {/* Coach & Room Info */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center overflow-hidden border border-teal-500/20 text-xs">
                          {session.coachAvatar ? (
                            <img src={session.coachAvatar} alt={session.coachName} className="w-full h-full object-cover" />
                          ) : (
                            session.coachName.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {session.coachName}
                          </p>
                          <p className="text-[11px] text-slate-400">Huấn luyện viên phụ trách</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {session.room}
                        </p>
                        <p className="text-[10px] text-slate-400">Phòng tập</p>
                      </div>
                    </div>

                    {/* Coach's feedback note if present */}
                    {session.coachNote && (
                      <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 text-xs">
                        <p className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                          Nhận xét từ HLV:
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 italic line-clamp-2">
                          "{session.coachNote}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Detail Link */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Xem chi tiết buổi học</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Tab 2: Gate Check-in Timeline */}
      {activeTab === "gate" && (
        <div className="space-y-4">
          {gateCheckIns.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
              <DoorOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">
                Chưa có lịch sử check-in tại sảnh
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                Khi đến trung tâm, hãy xuất trình mã QR cá nhân cho lễ tân để check-in vào cửa và kích hoạt phiên tập.
              </p>
              <button
                onClick={() => setShowQrModal(true)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Mở mã QR Check-in
              </button>
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Nhật Ký Quét Thẻ & Cổng Ra Vào
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Ghi nhận thời gian đến và rời khỏi cơ sở Sport Center qua cổng kiểm soát tự động.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  {gateCheckIns.length} lượt đã ghi nhận
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {gateCheckIns.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        item.status === "CHECKED_OUT"
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 animate-pulse"
                      }`}>
                        <DoorOpen className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {item.gate}
                          </span>
                          {item.status === "CHECKED_OUT" ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              Đã hoàn thành buổi tập
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              Đang trong phòng tập
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <span>
                            Vào lúc:{" "}
                            <strong className="text-slate-700 dark:text-slate-300">
                              {formatDateTimeDisplay(item.checkInTime)}
                            </strong>
                          </span>
                          {item.checkOutTime && (
                            <span>
                              Rời sảnh:{" "}
                              <strong className="text-slate-700 dark:text-slate-300">
                                {formatDateTimeDisplay(item.checkOutTime)}
                              </strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                        <Timer className="w-3.5 h-3.5 text-teal-500" />
                        {item.durationMinutes ? `${item.durationMinutes} phút` : "Đang tính giờ"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Tab 3: Member QR Pass Card */}
      {activeTab === "qrcode" && (
        <div className="max-w-md mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 border border-teal-500/30 shadow-2xl p-8 text-white">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-teal-500/20 rounded-full blur-2xl" />

            <div className="relative z-10 flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-base shadow-lg">
                  SC
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-wide">SPORT CENTER</h3>
                  <p className="text-[11px] text-teal-300 font-medium">Digital Member Pass</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                ACTIVE
              </span>
            </div>

            {/* QR Code Graphic */}
            <div className="relative z-10 my-8 flex flex-col items-center">
              <div className="p-4 bg-white rounded-3xl shadow-xl border-4 border-teal-500/30">
                <svg className="w-48 h-48" viewBox="0 0 100 100" fill="none">
                  {/* Outer Frame */}
                  <rect width="100" height="100" fill="white" />
                  {/* Position detection patterns (Top Left, Top Right, Bottom Left) */}
                  <rect x="10" y="10" width="24" height="24" fill="#0f172a" rx="4" />
                  <rect x="14" y="14" width="16" height="16" fill="white" rx="2" />
                  <rect x="18" y="18" width="8" height="8" fill="#14b8a6" rx="1" />

                  <rect x="66" y="10" width="24" height="24" fill="#0f172a" rx="4" />
                  <rect x="70" y="14" width="16" height="16" fill="white" rx="2" />
                  <rect x="74" y="18" width="8" height="8" fill="#14b8a6" rx="1" />

                  <rect x="10" y="66" width="24" height="24" fill="#0f172a" rx="4" />
                  <rect x="14" y="70" width="16" height="16" fill="white" rx="2" />
                  <rect x="18" y="74" width="8" height="8" fill="#14b8a6" rx="1" />

                  {/* QR Data Grid Matrix */}
                  <rect x="42" y="12" width="6" height="6" fill="#0f172a" />
                  <rect x="52" y="12" width="6" height="6" fill="#0f172a" />
                  <rect x="42" y="24" width="6" height="6" fill="#0f172a" />
                  <rect x="52" y="24" width="6" height="6" fill="#14b8a6" />

                  <rect x="12" y="42" width="6" height="6" fill="#0f172a" />
                  <rect x="24" y="42" width="6" height="6" fill="#14b8a6" />
                  <rect x="36" y="36" width="6" height="6" fill="#0f172a" />
                  <rect x="48" y="36" width="6" height="6" fill="#0f172a" />
                  <rect x="60" y="36" width="6" height="6" fill="#0f172a" />
                  <rect x="72" y="42" width="6" height="6" fill="#14b8a6" />
                  <rect x="84" y="42" width="6" height="6" fill="#0f172a" />

                  <rect x="36" y="48" width="8" height="8" fill="#10b981" rx="2" />
                  <rect x="48" y="48" width="6" height="6" fill="#0f172a" />
                  <rect x="58" y="48" width="8" height="8" fill="#14b8a6" rx="2" />

                  <rect x="12" y="54" width="6" height="6" fill="#0f172a" />
                  <rect x="24" y="54" width="6" height="6" fill="#0f172a" />
                  <rect x="72" y="54" width="6" height="6" fill="#0f172a" />
                  <rect x="84" y="54" width="6" height="6" fill="#14b8a6" />

                  <rect x="42" y="66" width="6" height="6" fill="#0f172a" />
                  <rect x="52" y="66" width="6" height="6" fill="#14b8a6" />
                  <rect x="66" y="66" width="6" height="6" fill="#0f172a" />
                  <rect x="76" y="66" width="6" height="6" fill="#0f172a" />
                  <rect x="42" y="78" width="6" height="6" fill="#14b8a6" />
                  <rect x="52" y="78" width="6" height="6" fill="#0f172a" />
                  <rect x="66" y="78" width="6" height="6" fill="#14b8a6" />
                  <rect x="76" y="78" width="6" height="6" fill="#0f172a" />
                </svg>
              </div>

              <p className="mt-4 text-xs text-slate-300 font-mono tracking-wider">
                ID: {memberId.slice(0, 8).toUpperCase()}-MEMBER
              </p>
            </div>

            {/* Member Details */}
            <div className="relative z-10 pt-4 border-t border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Họ và tên:</span>
                <span className="font-bold text-white">{memberName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono text-slate-300 text-[11px]">{memberEmail || "member@smartgym.com"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Thời gian tạo mã:</span>
                <span className="text-teal-300 font-mono text-[11px]">{new Date().toLocaleTimeString("vi-VN")}</span>
              </div>
            </div>

            <p className="relative z-10 mt-6 text-center text-[11px] text-slate-400">
              Xuất trình mã này tại quầy lễ tân để check-in mở cổng tự động.
            </p>
          </div>
        </div>
      )}

      {/* 7. Modal: Session Attendance Details */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                  {selectedSession.sport} • {selectedSession.type === "pt" ? "Kèm 1-1" : "Lớp nhóm"}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">
                  {selectedSession.className}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Attendance Status Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Trạng thái điểm danh:
              </span>
              {getStatusBadge(selectedSession.status)}
            </div>

            {/* Schedule Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <p className="text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-teal-500" />
                  Ngày học
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {formatDateDisplay(selectedSession.date)}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <p className="text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-teal-500" />
                  Thời gian
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedSession.startTime} - {selectedSession.endTime}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <p className="text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
                  <Building className="w-3.5 h-3.5 text-teal-500" />
                  Phòng tập
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedSession.room}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <p className="text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-teal-500" />
                  Huấn luyện viên
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedSession.coachName}
                </p>
              </div>
            </div>

            {/* Coach Feedback Note */}
            {selectedSession.coachNote ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 space-y-1">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Ghi chú từ Huấn luyện viên
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  "{selectedSession.coachNote}"
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 text-center">
                Chưa có nhận xét riêng từ Huấn luyện viên cho buổi học này.
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedSession(null);
                  onNavigate("chat");
                }}
                className="flex-1 py-3 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Nhắn tin với HLV
              </button>
              <button
                onClick={() => setSelectedSession(null)}
                className="flex-1 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Mã QR Check-in Quầy Lễ Tân
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex flex-col items-center">
              <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                <svg className="w-44 h-44" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="24" height="24" fill="#0f172a" rx="4" />
                  <rect x="14" y="14" width="16" height="16" fill="white" rx="2" />
                  <rect x="18" y="18" width="8" height="8" fill="#14b8a6" rx="1" />
                  <rect x="66" y="10" width="24" height="24" fill="#0f172a" rx="4" />
                  <rect x="70" y="14" width="16" height="16" fill="white" rx="2" />
                  <rect x="74" y="18" width="8" height="8" fill="#14b8a6" rx="1" />
                  <rect x="10" y="66" width="24" height="24" fill="#0f172a" rx="4" />
                  <rect x="14" y="70" width="16" height="16" fill="white" rx="2" />
                  <rect x="18" y="74" width="8" height="8" fill="#14b8a6" rx="1" />
                  <rect x="42" y="12" width="6" height="6" fill="#0f172a" />
                  <rect x="52" y="12" width="6" height="6" fill="#0f172a" />
                  <rect x="42" y="24" width="6" height="6" fill="#0f172a" />
                  <rect x="52" y="24" width="6" height="6" fill="#14b8a6" />
                  <rect x="12" y="42" width="6" height="6" fill="#0f172a" />
                  <rect x="24" y="42" width="6" height="6" fill="#14b8a6" />
                  <rect x="36" y="36" width="6" height="6" fill="#0f172a" />
                  <rect x="48" y="36" width="6" height="6" fill="#0f172a" />
                  <rect x="60" y="36" width="6" height="6" fill="#0f172a" />
                  <rect x="72" y="42" width="6" height="6" fill="#14b8a6" />
                  <rect x="84" y="42" width="6" height="6" fill="#0f172a" />
                  <rect x="36" y="48" width="8" height="8" fill="#10b981" rx="2" />
                  <rect x="48" y="48" width="6" height="6" fill="#0f172a" />
                  <rect x="58" y="48" width="8" height="8" fill="#14b8a6" rx="2" />
                  <rect x="12" y="54" width="6" height="6" fill="#0f172a" />
                  <rect x="24" y="54" width="6" height="6" fill="#0f172a" />
                  <rect x="72" y="54" width="6" height="6" fill="#0f172a" />
                  <rect x="84" y="54" width="6" height="6" fill="#14b8a6" />
                  <rect x="42" y="66" width="6" height="6" fill="#0f172a" />
                  <rect x="52" y="66" width="6" height="6" fill="#14b8a6" />
                  <rect x="66" y="66" width="6" height="6" fill="#0f172a" />
                  <rect x="76" y="66" width="6" height="6" fill="#0f172a" />
                </svg>
              </div>

              <p className="mt-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                {memberName}
              </p>
              <p className="text-[11px] font-mono text-slate-400">
                {memberId.slice(0, 8).toUpperCase()}-MEMBER
              </p>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Đưa mã này trước đầu đọc camera tại quầy lễ tân để ghi nhận lượt check-in mở cổng tự động.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors"
            >
              Hoàn tất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
