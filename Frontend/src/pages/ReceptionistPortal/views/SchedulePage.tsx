import React, { useState, useEffect, useMemo } from "react";
import { Calendar, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import type {
  Appointment,
  Coach,
  Member,
  DateFilterType,
  ScheduleStats,
  StatusFilterType,
} from "./schedule/types";
import { getTodayIso, getTomorrowIso } from "./schedule/constants";
import { ScheduleHeader } from "./schedule/ScheduleHeader";
import { ScheduleStatsCards } from "./schedule/ScheduleStatsCards";
import { ScheduleFilterBar } from "./schedule/ScheduleFilterBar";
import { AppointmentCard } from "./schedule/AppointmentCard";
import { ReceptionistProtocolSidebar } from "./schedule/ReceptionistProtocolSidebar";
import { CreateAppointmentModal } from "./schedule/CreateAppointmentModal";

export function SchedulePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");
  const [dateFilter, setDateFilter] = useState<DateFilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAppointments(data);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  // Fetch coaches
  const fetchCoaches = async () => {
    try {
      const res = await fetch("/api/coaches");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.value || [];
        setCoaches(list);
      }
    } catch (err) {
      console.error("Error fetching coaches:", err);
    }
  };

  // Fetch members for lookup
  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users/members-lookup", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setMembers(data);
      }
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchAppointments(), fetchCoaches(), fetchMembers()]);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
    toast.success("Đã đồng bộ lịch hẹn mới nhất");
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showModal]);

  // Status Change Handler
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
        toast.success(
          newStatus === "Đã hoàn tất"
            ? "Đã xác nhận khách đến thành công!"
            : newStatus === "Đã hủy"
            ? "Đã hủy lịch hẹn"
            : "Đã cập nhật trạng thái"
        );
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Không thể cập nhật");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi kết nối khi cập nhật");
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lịch hẹn này?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
        toast.success("Đã xóa lịch hẹn");
      } else {
        toast.error("Không thể xóa");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi máy chủ khi xóa");
    } finally {
      setDeletingId(null);
    }
  };

  // Copy Phone Number
  const handleCopyPhone = (phone: string) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    toast.success(`Đã sao chép SĐT: ${phone}`);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    const todayIso = getTodayIso();
    const tomorrowIso = getTomorrowIso();

    return appointments
      .filter((a) => {
        if (statusFilter !== "all" && a.status !== statusFilter) return false;
        if (dateFilter === "today" && (a.date || todayIso) !== todayIso) return false;
        if (dateFilter === "tomorrow" && a.date !== tomorrowIso) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchCustomer = a.customerName?.toLowerCase().includes(q);
          const matchCoach = a.coachName?.toLowerCase().includes(q);
          const matchTitle = a.title?.toLowerCase().includes(q);
          const matchTime = a.time?.toLowerCase().includes(q);
          const matchDate = a.date?.toLowerCase().includes(q);
          return matchCustomer || matchCoach || matchTitle || matchTime || matchDate;
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = a.date || todayIso;
        const dateB = b.date || todayIso;
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        return a.time.localeCompare(b.time);
      });
  }, [appointments, statusFilter, dateFilter, searchQuery]);

  // Statistics
  const stats: ScheduleStats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter((a) => a.status === "Đã hoàn tất").length;
    const waiting = appointments.filter((a) => a.status === "Đang chờ khách").length;
    const cancelled = appointments.filter((a) => a.status === "Đã hủy").length;
    return { total, completed, waiting, cancelled };
  }, [appointments]);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full max-w-[1300px] mx-auto min-h-screen text-slate-800">
      {/* ─── Compact Top Header ─────────────────────────────────── */}
      <ScheduleHeader
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onOpenCreateModal={() => setShowModal(true)}
      />

      {/* ─── Compact Stats Strip + Filter Bar ───────────────────── */}
      <ScheduleStatsCards
        stats={stats}
        statusFilter={statusFilter}
        onSelectFilter={setStatusFilter}
      />

      {/* ─── Search & Tab Filters ───────────────────────────────── */}
      <ScheduleFilterBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        stats={stats}
      />

      {/* ─── Main Content Grid (Timeline + Right Compact Sidebar) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Timeline List (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-2">
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <p className="text-xs text-slate-500">Đang tải lịch hẹn...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center flex flex-col items-center justify-center gap-2">
              <Calendar className="w-6 h-6 text-slate-400" />
              <p className="text-xs font-bold text-slate-700">Không có lịch hẹn nào</p>
              <p className="text-[11px] text-slate-500">
                {searchQuery || statusFilter !== "all"
                  ? "Không tìm thấy kết quả phù hợp với bộ lọc."
                  : "Chưa có lịch hẹn nào được ghi nhận cho hôm nay."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredAppointments.map((slot) => (
                <AppointmentCard
                  key={slot.id}
                  slot={slot}
                  members={members}
                  updatingId={updatingId}
                  deletingId={deletingId}
                  copiedPhone={copiedPhone}
                  onCopyPhone={handleCopyPhone}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* ─── Right Sidebar: Compact Guide & Coaches ─────────────── */}
        <ReceptionistProtocolSidebar coaches={coaches} />
      </div>

      {/* ─── COMPACT APPOINTMENT MODAL (createPortal) ───────────── */}
      <CreateAppointmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        coaches={coaches}
        members={members}
        onCreated={fetchAppointments}
      />
    </div>
  );
}
