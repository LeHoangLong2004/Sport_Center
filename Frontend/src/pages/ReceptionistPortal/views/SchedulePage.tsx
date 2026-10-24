import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  User,
  Dumbbell,
  Activity,
  Sparkles,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  X,
  ChevronDown,
  UserCheck,
  UserPlus,
  ShieldCheck,
  Flame,
  HeartPulse,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

interface Appointment {
  id: string;
  time: string;
  title: string;
  customerName: string;
  coachName: string | null;
  status: string;
}

interface Coach {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  specialty?: string;
  experienceYears?: number;
}

interface Member {
  id: string;
  fullName?: string;
  name?: string;
  phoneNumber?: string;
  memberCode?: string;
  avatarUrl?: string;
}

const PRESET_SERVICES = [
  { title: "Tập thử PT kèm riêng 1:1 - Kickfit & Thể lực", category: "Kickfit" },
  { title: "Tập PT kèm riêng 1:1 - Thể hình chuyên sâu", category: "Gym PT" },
  { title: "Đo chỉ số InBody & Đánh giá thể lực", category: "InBody" },
  { title: "Tư vấn kế hoạch giảm mỡ & Dinh dưỡng", category: "Dinh dưỡng" },
  { title: "Tập thử PT kèm riêng 1:1 - Pilates phục hồi", category: "Pilates" },
  { title: "Tư vấn gia hạn & Nâng cấp thẻ hội viên", category: "Tư vấn thẻ" },
];

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:30",
  "17:00",
  "18:30",
  "19:30",
];

export function SchedulePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Đang chờ khách" | "Đã hoàn tất" | "Đã hủy"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Form State
  const [customerMode, setCustomerMode] = useState<"member" | "guest">("member");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  const [isCustomService, setIsCustomService] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [selectedCoachId, setSelectedCoachId] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const memberDropdownRef = useRef<HTMLDivElement>(null);

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
        if (list.length > 0 && !selectedCoachId) {
          setSelectedCoachId(list[0].id);
        }
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

  // Close member dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        memberDropdownRef.current &&
        !memberDropdownRef.current.contains(e.target as Node)
      ) {
        setShowMemberDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Parse customer string to extract name and phone number
  const parseCustomerInfo = (raw: string) => {
    if (!raw) return { name: "N/A", phone: "", isMember: false };
    let name = raw.trim();
    let phone = "";

    const matchParen = raw.match(/^(.*?)\s*\((0[0-9\s\.\-]{8,13})\)$/);
    if (matchParen) {
      name = matchParen[1].trim();
      phone = matchParen[2].replace(/[\s\.\-]/g, "");
    } else {
      const matchDash = raw.match(/^(.*?)\s*-\s*(0[0-9\s\.\-]{8,13})$/);
      if (matchDash) {
        name = matchDash[1].trim();
        phone = matchDash[2].replace(/[\s\.\-]/g, "");
      }
    }

    if (!phone && members.length > 0) {
      const matched = members.find(
        (m) =>
          (m.fullName && m.fullName.toLowerCase() === name.toLowerCase()) ||
          (m.name && m.name.toLowerCase() === name.toLowerCase())
      );
      if (matched?.phoneNumber) phone = matched.phoneNumber;
    }

    const isMember = members.some(
      (m) =>
        (m.fullName && m.fullName.toLowerCase() === name.toLowerCase()) ||
        (m.name && m.name.toLowerCase() === name.toLowerCase())
    );

    return { name, phone, isMember };
  };

  // Filtered members for modal search
  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members.slice(0, 8);
    const q = memberSearch.toLowerCase().trim();
    return members
      .filter(
        (m) =>
          (m.fullName && m.fullName.toLowerCase().includes(q)) ||
          (m.name && m.name.toLowerCase().includes(q)) ||
          (m.phoneNumber && m.phoneNumber.includes(q)) ||
          (m.memberCode && m.memberCode.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [members, memberSearch]);

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

  // Form Submit Handler
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    let finalCustomerName = "";
    if (customerMode === "member") {
      if (!selectedMember) {
        setFormError("Vui lòng chọn một hội viên từ danh sách.");
        return;
      }
      const memberDisplayName = selectedMember.fullName || selectedMember.name || "";
      const memberPhone = selectedMember.phoneNumber ? ` (${selectedMember.phoneNumber})` : "";
      finalCustomerName = `${memberDisplayName}${memberPhone}`;
    } else {
      if (!guestName.trim()) {
        setFormError("Vui lòng nhập họ và tên khách hàng.");
        return;
      }
      const phoneSuffix = guestPhone.trim() ? ` (${guestPhone.trim()})` : "";
      finalCustomerName = `${guestName.trim()}${phoneSuffix}`;
    }

    const finalTitle = isCustomService
      ? customTitle.trim()
      : PRESET_SERVICES[selectedServiceIndex]?.title || "";

    if (!finalTitle) {
      setFormError("Vui lòng chọn hoặc nhập nội dung lịch hẹn.");
      return;
    }

    const coach = coaches.find((c) => c.id === selectedCoachId);
    if (!coach) {
      setFormError("Vui lòng chọn Huấn luyện viên phụ trách.");
      return;
    }

    if (!selectedTime) {
      setFormError("Vui lòng chọn thời gian hẹn.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          time: selectedTime,
          title: finalTitle,
          customerName: finalCustomerName,
          coachName: coach.fullName,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setFormError(result?.message || "Không thể tạo lịch hẹn. Vui lòng kiểm tra lại.");
        setSubmitting(false);
        return;
      }

      toast.success(`Đã tạo lịch hẹn thành công cho ${finalCustomerName}!`);
      setShowModal(false);
      // Reset form
      setGuestName("");
      setGuestPhone("");
      setSelectedMember(null);
      setCustomTitle("");
      setIsCustomService(false);
      setFormError("");
      fetchAppointments();
    } catch (err) {
      console.error(err);
      setFormError("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        if (statusFilter !== "all" && a.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchCustomer = a.customerName?.toLowerCase().includes(q);
          const matchCoach = a.coachName?.toLowerCase().includes(q);
          const matchTitle = a.title?.toLowerCase().includes(q);
          const matchTime = a.time?.toLowerCase().includes(q);
          return matchCustomer || matchCoach || matchTitle || matchTime;
        }
        return true;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter((a) => a.status === "Đã hoàn tất").length;
    const waiting = appointments.filter((a) => a.status === "Đang chờ khách").length;
    const cancelled = appointments.filter((a) => a.status === "Đã hủy").length;
    return { total, completed, waiting, cancelled };
  }, [appointments]);

  // Service tag helper
  const getServiceTag = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("inbody")) {
      return { label: "InBody", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    if (lower.includes("kickfit")) {
      return { label: "Kickfit 1:1", bg: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    if (lower.includes("dinh dưỡng") || lower.includes("giảm mỡ")) {
      return { label: "Dinh dưỡng", bg: "bg-rose-50 text-rose-700 border-rose-200" };
    }
    if (lower.includes("pilates")) {
      return { label: "Pilates 1:1", bg: "bg-purple-50 text-purple-700 border-purple-200" };
    }
    if (lower.includes("gia hạn") || lower.includes("gói")) {
      return { label: "Tư vấn gói", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    }
    return { label: "PT Gym 1:1", bg: "bg-blue-50 text-blue-700 border-blue-200" };
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full max-w-[1300px] mx-auto min-h-screen text-slate-800">
      {/* ─── Compact Top Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                Lịch Hẹn Coach & Tiếp Đón
              </h1>
              <span className="text-[11px] text-slate-500 font-medium">
                ({new Date().toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" })})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Theo dõi và điều phối buổi tập thử 1:1, đo InBody, nhắc hẹn trước 30 phút
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Tạo lịch hẹn</span>
          </button>
        </div>
      </div>

      {/* ─── Compact Stats Strip + Filter Bar ───────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => setStatusFilter("all")}
          className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition cursor-pointer ${
            statusFilter === "all"
              ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-300"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <div>
            <span className="text-[11px] text-slate-500 block">Tất cả hôm nay</span>
            <span className="text-lg font-extrabold text-slate-900 leading-tight">
              {stats.total}
            </span>
          </div>
          <div className="w-7 h-7 rounded-md bg-blue-100/70 text-blue-700 flex items-center justify-center text-xs font-bold">
            All
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("Đang chờ khách")}
          className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition cursor-pointer ${
            statusFilter === "Đang chờ khách"
              ? "bg-amber-50/80 border-amber-300 ring-1 ring-amber-300"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <div>
            <span className="text-[11px] text-amber-700 font-medium block">Chờ tiếp đón</span>
            <span className="text-lg font-extrabold text-amber-700 leading-tight">
              {stats.waiting}
            </span>
          </div>
          <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center">
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("Đã hoàn tất")}
          className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition cursor-pointer ${
            statusFilter === "Đã hoàn tất"
              ? "bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-300"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <div>
            <span className="text-[11px] text-emerald-700 font-medium block">Đã hoàn tất</span>
            <span className="text-lg font-extrabold text-emerald-700 leading-tight">
              {stats.completed}
            </span>
          </div>
          <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("Đã hủy")}
          className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition cursor-pointer ${
            statusFilter === "Đã hủy"
              ? "bg-slate-100 border-slate-300 ring-1 ring-slate-300"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <div>
            <span className="text-[11px] text-slate-500 block">Đã hủy hẹn</span>
            <span className="text-lg font-extrabold text-slate-600 leading-tight">
              {stats.cancelled}
            </span>
          </div>
          <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center">
            <XCircle className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* ─── Search & Tab Filters ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          {[
            { id: "all", label: "Tất cả", count: stats.total },
            { id: "Đang chờ khách", label: "Chờ tiếp đón", count: stats.waiting },
            { id: "Đã hoàn tất", label: "Đã hoàn tất", count: stats.completed },
            { id: "Đã hủy", label: "Đã hủy", count: stats.cancelled },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1 py-0.2 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Compact Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo khách, SĐT, HLV..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

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
              {filteredAppointments.map((slot) => {
                const customer = parseCustomerInfo(slot.customerName);
                const tag = getServiceTag(slot.title);
                const isWaiting = slot.status === "Đang chờ khách";
                const isCompleted = slot.status === "Đã hoàn tất";
                const isCancelled = slot.status === "Đã hủy";

                return (
                  <div
                    key={slot.id}
                    className={`bg-white rounded-lg border transition-all duration-150 hover:shadow-xs p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                      isWaiting
                        ? "border-amber-300 bg-white"
                        : isCompleted
                        ? "border-emerald-200 bg-emerald-50/20"
                        : "border-slate-200 opacity-75 bg-slate-50/40"
                    }`}
                  >
                    {/* Left: Time + Main Info */}
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {/* Compact Time Badge */}
                      <div className="flex flex-col items-center justify-center w-12 py-1 bg-slate-900 text-white rounded font-mono text-xs font-bold shrink-0">
                        <span>{slot.time}</span>
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        {/* Title & Service Tag */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {slot.title}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${tag.bg} shrink-0`}
                          >
                            {tag.label}
                          </span>
                        </div>

                        {/* Customer & Coach row */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-600">
                          {/* Customer */}
                          <div className="flex items-center gap-1 font-medium text-slate-800">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{customer.name}</span>
                            {customer.phone && (
                              <span className="text-slate-500 flex items-center gap-1">
                                <span>• {customer.phone}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyPhone(customer.phone)}
                                  className="text-slate-400 hover:text-blue-600 transition cursor-pointer"
                                  title="Sao chép SĐT"
                                >
                                  {copiedPhone === customer.phone ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </span>
                            )}
                          </div>

                          {/* Coach */}
                          <div className="flex items-center gap-1 text-slate-500">
                            <Dumbbell className="w-3 h-3 text-amber-600" />
                            <span>HLV: <strong className="text-slate-700">{slot.coachName || "Chưa gán"}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status & Quick Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      {isWaiting && (
                        <>
                          {customer.phone && (
                            <a
                              href={`tel:${customer.phone}`}
                              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition cursor-pointer"
                              title="Gọi nhắc trước 30 phút"
                            >
                              <Phone className="w-3 h-3 text-blue-600" />
                              <span className="hidden sm:inline">Gọi</span>
                            </a>
                          )}
                          <button
                            disabled={updatingId === slot.id}
                            onClick={() => handleUpdateStatus(slot.id, "Đã hoàn tất")}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Khách đến</span>
                          </button>
                          <button
                            disabled={updatingId === slot.id}
                            onClick={() => handleUpdateStatus(slot.id, "Đã hủy")}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded transition cursor-pointer"
                            title="Hủy lịch hẹn"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {isCompleted && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đã tiếp đón</span>
                          </span>
                          <button
                            disabled={updatingId === slot.id}
                            onClick={() => handleUpdateStatus(slot.id, "Đang chờ khách")}
                            className="text-[10px] text-slate-400 hover:text-slate-700 underline cursor-pointer"
                          >
                            Hoàn tác
                          </button>
                        </div>
                      )}

                      {isCancelled && (
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-600">
                            Đã hủy
                          </span>
                          <button
                            disabled={updatingId === slot.id}
                            onClick={() => handleUpdateStatus(slot.id, "Đang chờ khách")}
                            className="px-2 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition cursor-pointer"
                          >
                            Khôi phục
                          </button>
                          <button
                            disabled={deletingId === slot.id}
                            onClick={() => handleDelete(slot.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                            title="Xóa vĩnh viễn"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Right Sidebar: Compact Guide & Coaches ─────────────── */}
        <div className="flex flex-col gap-3">
          {/* Compact Checklist */}
          <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-xs text-xs">
            <div className="flex items-center gap-2 mb-2 font-bold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Quy trình đón tiếp lễ tân</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              <li className="flex items-start gap-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">1</span>
                <span>Gọi nhắc khách trước 30p, kiểm tra trang phục tập.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">2</span>
                <span>Phát vòng tay tủ đồ, khăn tập & mời nước tại sảnh.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">3</span>
                <span>Bấm "Khách đến" để báo HLV ra đón vào tập.</span>
              </li>
            </ul>
          </div>

          {/* Compact Coaches Roster */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900">HLV Trực Hôm Nay ({coaches.length})</span>
              <span className="text-[10px] text-slate-400">Hotline nhanh</span>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-1">
              {coaches.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-1.5 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-100 transition text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {c.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-slate-800 text-[11px] truncate">
                        {c.fullName}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {c.specialty || "HLV Cá nhân"}
                      </span>
                    </div>
                  </div>

                  {c.phoneNumber && (
                    <a
                      href={`tel:${c.phoneNumber}`}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded transition cursor-pointer shrink-0"
                      title={`Gọi HLV: ${c.phoneNumber}`}
                    >
                      <Phone className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── COMPACT APPOINTMENT MODAL (createPortal) ───────────── */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Compact Header */}
              <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    Tạo Lịch Hẹn Coach & Tư Vấn
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleCreateAppointment} className="p-4 overflow-y-auto flex-1 flex flex-col gap-3 text-xs">
                {formError && (
                  <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded text-[11px] flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. Customer Selection */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      1. Khách hàng
                    </span>
                    {/* Small Segmented Switch */}
                    <div className="flex p-0.5 bg-slate-100 rounded text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerMode("member");
                          setShowMemberDropdown(false);
                        }}
                        className={`px-2 py-0.5 rounded transition cursor-pointer ${
                          customerMode === "member"
                            ? "bg-white text-blue-700 shadow-2xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Hội viên
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerMode("guest");
                          setShowMemberDropdown(false);
                        }}
                        className={`px-2 py-0.5 rounded transition cursor-pointer ${
                          customerMode === "guest"
                            ? "bg-white text-blue-700 shadow-2xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Khách mới
                      </button>
                    </div>
                  </div>

                  {customerMode === "member" ? (
                    <div className="relative" ref={memberDropdownRef}>
                      {selectedMember ? (
                        <div className="flex items-center justify-between p-2 bg-blue-50/80 border border-blue-200 rounded text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                              {(selectedMember.fullName || selectedMember.name || "M").slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-800">
                              {selectedMember.fullName || selectedMember.name}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              ({selectedMember.phoneNumber || "Chưa có SĐT"})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMember(null);
                              setMemberSearch("");
                            }}
                            className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                          >
                            Đổi
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Tìm tên, SĐT hoặc mã hội viên..."
                              value={memberSearch}
                              onFocus={() => setShowMemberDropdown(true)}
                              onChange={(e) => {
                                setMemberSearch(e.target.value);
                                setShowMemberDropdown(true);
                              }}
                              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          {/* Floating Dropdown */}
                          {showMemberDropdown && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-36 overflow-y-auto z-30 divide-y divide-slate-100">
                              {filteredMembers.length === 0 ? (
                                <div className="p-2 text-center text-slate-400 text-[11px]">
                                  Không tìm thấy hội viên
                                </div>
                              ) : (
                                filteredMembers.map((m) => (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedMember(m);
                                      setShowMemberDropdown(false);
                                    }}
                                    className="w-full flex items-center justify-between p-2 hover:bg-blue-50 text-left text-xs transition cursor-pointer"
                                  >
                                    <span className="font-semibold text-slate-800">
                                      {m.fullName || m.name}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                      {m.phoneNumber || "Không có SĐT"}
                                    </span>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Họ tên khách *"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Số điện thoại *"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Service Selection */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      2. Dịch vụ / Buổi hẹn
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCustomService(!isCustomService)}
                      className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                    >
                      {isCustomService ? "Chọn có sẵn" : "Nhập tay"}
                    </button>
                  </div>

                  {isCustomService ? (
                    <input
                      type="text"
                      required
                      placeholder="Nhập tên dịch vụ lịch hẹn..."
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <select
                      value={selectedServiceIndex}
                      onChange={(e) => setSelectedServiceIndex(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                    >
                      {PRESET_SERVICES.map((s, idx) => (
                        <option key={idx} value={idx}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 3. Coach Selection */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                    3. Huấn luyện viên phụ trách *
                  </span>
                  <select
                    value={selectedCoachId}
                    onChange={(e) => setSelectedCoachId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                  >
                    {coaches.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} — {c.specialty || "HLV Cá nhân"} ({c.phoneNumber || "N/A"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Time Selection */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      4. Khung giờ hẹn *
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCustomTime(!isCustomTime)}
                      className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                    >
                      {isCustomTime ? "Khung giờ sẵn" : "Giờ khác"}
                    </button>
                  </div>

                  {isCustomTime ? (
                    <input
                      type="time"
                      required
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="grid grid-cols-5 gap-1.5">
                      {TIME_SLOTS.map((slot) => {
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`py-1 rounded text-[11px] font-mono font-bold border transition cursor-pointer ${
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Compact Modal Footer */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Xác nhận & Báo HLV</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
