import React, { useState, useEffect, useMemo } from "react";
import type { MemberScreen } from "../types";
import { UserCheck, DoorOpen, QrCode } from "lucide-react";
import { MemberBackendAPI } from "../services/memberData";

import type { AttendanceSession, GateCheckInRecord, AttendanceSummary } from "./attendance/types";
import AttendanceHeader from "./attendance/AttendanceHeader";
import AttendanceClassList from "./attendance/AttendanceClassList";
import AttendanceGateList from "./attendance/AttendanceGateList";
import AttendanceQrPass from "./attendance/AttendanceQrPass";
import AttendanceDetailModal from "./attendance/AttendanceDetailModal";
import AttendanceQrModal from "./attendance/AttendanceQrModal";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
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

  // Modals
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

        const bookings = await MemberBackendAPI.getBookings();
        const fallbackSessions: AttendanceSession[] = bookings.map((b) => {
          let isFuture = false;
          try {
            if (b.date) {
              const dt = new Date(`${b.date}T${b.startTime || "00:00"}`);
              isFuture = !isNaN(dt.getTime()) && dt.getTime() > Date.now();
            }
          } catch {}

          let attStatus: AttendanceSession["status"] = isFuture ? "chưa diễn ra" : "chưa điểm danh";
          if (!isFuture) {
            if (b.attendanceStatus) {
              const raw = b.attendanceStatus.toLowerCase();
              if (raw.includes("có mặt") || raw.includes("present") || raw.includes("attended")) attStatus = "có mặt";
              else if (raw.includes("vắng") || raw.includes("absent")) attStatus = "vắng";
              else if (raw.includes("muộn") || raw.includes("late")) attStatus = "đi muộn";
            } else if (b.status === "hoàn thành") {
              attStatus = "có mặt";
            }
          }

          return {
            id: b.id,
            className: b.name,
            sport: b.sport,
            packageName: b.sport ? `Gói ${b.sport}` : "Gói môn tập",
            coachName: b.coachName || "HLV Trung tâm",
            coachAvatar: b.coachAvatar,
            room: b.room || "Studio Sport Center",
            date: b.date,
            startTime: b.startTime,
            endTime: b.endTime,
            status: attStatus,
            coachNote: isFuture ? "" : (b.coachNote || ""),
            type: b.type,
          };
        });

        setSessions(fallbackSessions);

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
      const matchesSearch =
        searchQuery === "" ||
        s.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.coachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.packageName || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      const matchesType = typeFilter === "all" || s.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [sessions, searchQuery, statusFilter, typeFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <AttendanceHeader
        sessionsCount={sessions.length}
        gateCheckInsCount={gateCheckIns.length}
        absentCount={summary.absentCount}
        activePackages={summary.activePackages}
        refreshing={refreshing}
        onRefresh={() => loadAttendanceData(true)}
        onOpenQrModal={() => setShowQrModal(true)}
      />

      {/* 2. Navigation Tabs */}
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
      </div>

      {/* 3. Tab Contents */}
      {activeTab === "classes" && (
        <AttendanceClassList
          sessions={sessions}
          filteredSessions={filteredSessions}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          onSelectSession={setSelectedSession}
          onNavigate={onNavigate}
        />
      )}

      {activeTab === "gate" && (
        <AttendanceGateList
          gateCheckIns={gateCheckIns}
          onOpenQrModal={() => setShowQrModal(true)}
        />
      )}

      {activeTab === "qrcode" && (
        <AttendanceQrPass
          memberId={memberId}
          memberName={memberName}
          memberEmail={memberEmail}
        />
      )}

      {/* 4. Modals */}
      <AttendanceDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onNavigate={onNavigate}
      />

      <AttendanceQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        memberName={memberName}
        memberId={memberId}
      />
    </div>
  );
}
