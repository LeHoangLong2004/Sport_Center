import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calendar,
  Clock,
  User,
  Check,
  AlertCircle,
  Search,
  UserCheck,
  ChevronRight,
  Sparkles,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import type { CoachScheduleRequest } from "./useCoachScheduleRequests";
export type { CoachScheduleRequest } from "./useCoachScheduleRequests";
import { AppointmentService, isAppointmentForCoach } from "../../../services/appointmentService";

interface Props {
  requests: CoachScheduleRequest[];
  loading: boolean;
  onAction: (
    id: string,
    action: "approve" | "reject",
    managerNote: string,
    substituteCoachId?: string,
  ) => Promise<void>;
}

interface CoachOption {
  id: string;
  fullName: string;
  specialty?: string;
  email?: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  pending: {
    label: "Chờ duyệt",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  substitute_accepted: {
    label: "HLV thay thế đã nhận",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  substitute_declined: {
    label: "HLV thay thế từ chối",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
  },
  approved: {
    label: "Đã duyệt",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  rejected: {
    label: "Từ chối",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
  },
};

const isSubstituteRequest = (type: string) => {
  const t = (type || "").toLowerCase();
  return t.includes("thay") || t.includes("substitute");
};

interface ParsedTimeWindow {
  date: string; // YYYY-MM-DD
  startMinutes: number;
  endMinutes: number;
  formattedTime: string;
}

function parseShiftTimeWindow(
  sessionTime?: string,
  scheduleTime?: string,
  fallbackDuration = 60,
): ParsedTimeWindow | null {
  const text = (sessionTime || scheduleTime || "").trim();
  if (!text) return null;

  // Format 1: "2026-10-27 (17:00 - 18:00)" or "2026-10-27 17:00 - 18:00"
  const rangeMatch = text.match(/(\d{4}-\d{2}-\d{2}).*?(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (rangeMatch) {
    const date = rangeMatch[1];
    const [sH, sM] = rangeMatch[2].split(":").map(Number);
    const [eH, eM] = rangeMatch[3].split(":").map(Number);
    return {
      date,
      startMinutes: sH * 60 + sM,
      endMinutes: eH * 60 + eM,
      formattedTime: `${rangeMatch[2]} - ${rangeMatch[3]}`,
    };
  }

  // Format 2: "2026-10-27 17:00" or ISO "2026-10-27T17:00:00"
  const singleMatch = text.match(/(\d{4}-\d{2}-\d{2})[T\s](\d{1,2}:\d{2})/);
  if (singleMatch) {
    const date = singleMatch[1];
    const [sH, sM] = singleMatch[2].split(":").map(Number);
    const startMinutes = sH * 60 + sM;
    const endMinutes = startMinutes + (fallbackDuration > 0 ? fallbackDuration : 60);
    const eH = Math.floor(endMinutes / 60) % 24;
    const eM = endMinutes % 60;
    const formattedEnd = `${String(eH).padStart(2, "0")}:${String(eM).padStart(2, "0")}`;
    return {
      date,
      startMinutes,
      endMinutes,
      formattedTime: `${singleMatch[2]} - ${formattedEnd}`,
    };
  }

  return null;
}

function checkCoachConflict(
  coach: CoachOption,
  window: ParsedTimeWindow | null,
  classes: any[],
  appointments: any[],
  currentSessionId?: string,
): { isBusy: boolean; conflictReason?: string } {
  if (!window) return { isBusy: false };

  const normCoachName = (coach.fullName || "").toLowerCase().trim();

  // 1. Kiểm tra trong danh sách lớp học (classes)
  for (const cls of classes) {
    if (cls.status === false || cls.isCancelled === true) continue;
    if (cls.approvalStatus === "rejected") continue;
    if (currentSessionId && cls.id === currentSessionId) continue;

    const matchCoach =
      (cls.coachId && cls.coachId === coach.id) ||
      (cls.coachName &&
        (cls.coachName.toLowerCase().includes(normCoachName) ||
          normCoachName.includes(cls.coachName.toLowerCase())));
    if (!matchCoach) continue;

    let clsDate = "";
    let clsStartMin = 0;
    let clsEndMin = 0;
    let clsStartStr = "";
    let clsEndStr = "";

    if (cls.scheduleTime) {
      const str = String(cls.scheduleTime).trim();
      if (str.endsWith("Z")) {
        const dt = new Date(str);
        if (!isNaN(dt.getTime())) {
          clsDate = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Ho_Chi_Minh",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(dt);
          clsStartStr = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Ho_Chi_Minh",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(dt);
          const [h, m] = clsStartStr.split(":").map(Number);
          clsStartMin = h * 60 + m;
        }
      } else {
        const match = str.match(/(\d{4}-\d{2}-\d{2})[T\s](\d{1,2}):(\d{2})/);
        if (match) {
          clsDate = match[1];
          const h = Number(match[2]);
          const m = Number(match[3]);
          clsStartMin = h * 60 + m;
          clsStartStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        }
      }

      if (clsDate) {
        const dur = cls.durationMinutes || 60;
        clsEndMin = clsStartMin + dur;
        const eH = Math.floor(clsEndMin / 60) % 24;
        const eM = clsEndMin % 60;
        clsEndStr = `${String(eH).padStart(2, "0")}:${String(eM).padStart(2, "0")}`;
      }
    }

    if (clsDate === window.date) {
      if (clsStartMin < window.endMinutes && clsEndMin > window.startMinutes) {
        return {
          isBusy: true,
          conflictReason: `Trùng lớp: "${cls.className || cls.name || "Lớp học"}" (${clsStartStr} - ${clsEndStr})`,
        };
      }
    }
  }

  // 2. Kiểm tra trong danh sách lịch hẹn (appointments)
  for (const appt of appointments) {
    if (appt.status === "Đã hủy") continue;
    if (!isAppointmentForCoach(appt.coachName, coach.fullName)) continue;

    const apptDate = appt.date ? appt.date.slice(0, 10) : "";
    if (apptDate !== window.date) continue;

    const timeParts = (appt.time || "").split("-").map((t: string) => t.trim());
    if (timeParts.length >= 1 && timeParts[0].includes(":")) {
      const [aH, aM] = timeParts[0].split(":").map(Number);
      const apptStartMin = aH * 60 + aM;
      let apptEndMin = apptStartMin + 60;
      let apptEndStr = `${String(Math.floor(apptEndMin / 60) % 24).padStart(2, "0")}:${String(apptEndMin % 60).padStart(2, "0")}`;

      if (timeParts.length >= 2 && timeParts[1].includes(":")) {
        const [aeH, aeM] = timeParts[1].split(":").map(Number);
        apptEndMin = aeH * 60 + aeM;
        apptEndStr = timeParts[1];
      }

      if (apptStartMin < window.endMinutes && apptEndMin > window.startMinutes) {
        return {
          isBusy: true,
          conflictReason: `Trùng lịch hẹn: "${appt.title}" (${timeParts[0]} - ${apptEndStr})`,
        };
      }
    }
  }

  return { isBusy: false };
}

export function CoachScheduleRequestsSection({ requests, loading, onAction }: Props) {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // States inside modal
  const [modalSubstituteId, setModalSubstituteId] = useState("");
  const [modalManagerNote, setModalManagerNote] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/coaches")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!active || !Array.isArray(data)) return;
        const seen = new Set<string>();
        const list: CoachOption[] = [];
        for (const item of data) {
          if (item?.id && !seen.has(item.id)) {
            seen.add(item.id);
            list.push({
              id: item.id,
              fullName: item.fullName || "HLV",
              specialty: item.specialty,
              email: item.email,
            });
          }
        }
        setCoaches(list);
      })
      .catch((err) => console.error("Lỗi khi tải danh sách huấn luyện viên:", err));

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("auth_token");

    fetch("/api/classes/all", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (res.ok) return res.json();
        const fallback = await fetch("/api/classes/available");
        return fallback.ok ? fallback.json() : [];
      })
      .then((data) => {
        if (active && Array.isArray(data)) setAllClasses(data);
      })
      .catch(async () => {
        try {
          const fallback = await fetch("/api/classes/available");
          const data = fallback.ok ? await fallback.json() : [];
          if (active && Array.isArray(data)) setAllClasses(data);
        } catch (err) {
          console.error("Lỗi khi tải danh sách lớp học:", err);
        }
      });

    AppointmentService.getAll()
      .then((data) => {
        if (active && Array.isArray(data)) setAllAppointments(data);
      })
      .catch((err) => console.error("Lỗi khi tải danh sách lịch hẹn:", err));

    return () => {
      active = false;
    };
  }, []);

  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === selectedRequestId) || null,
    [requests, selectedRequestId],
  );

  const shiftTimeWindow = useMemo(() => {
    if (!selectedRequest) return null;
    return parseShiftTimeWindow(
      selectedRequest.sessionTime,
      selectedRequest.scheduleTime,
      selectedRequest.durationMinutes,
    );
  }, [selectedRequest]);

  const candidateCoaches = useMemo(() => {
    if (!selectedRequest) return [];
    const otherCoaches = coaches.filter((c) => c.id !== selectedRequest.coachId);

    return otherCoaches.map((c) => {
      const conflict = checkCoachConflict(
        c,
        shiftTimeWindow,
        allClasses,
        allAppointments,
        selectedRequest.sessionId,
      );
      return {
        ...c,
        isBusy: conflict.isBusy,
        conflictReason: conflict.conflictReason,
      };
    });
  }, [selectedRequest, coaches, shiftTimeWindow, allClasses, allAppointments]);

  const freeCoaches = useMemo(
    () => candidateCoaches.filter((c) => !c.isBusy),
    [candidateCoaches],
  );

  const selectedSubstitute = useMemo(
    () => candidateCoaches.find((c) => c.id === modalSubstituteId) || null,
    [candidateCoaches, modalSubstituteId],
  );

  const handleOpenDetail = (req: CoachScheduleRequest) => {
    setSelectedRequestId(req.id);
    setModalSubstituteId(req.substituteCoachId || "");
    setModalManagerNote(req.managerNote || "");
  };

  const handleCloseDetail = () => {
    setSelectedRequestId(null);
    setModalSubstituteId("");
    setModalManagerNote("");
  };

  const handleApprove = async () => {
    if (!selectedRequest || submitting) return;
    const isSub = isSubstituteRequest(selectedRequest.requestType);
    if (isSub && !modalSubstituteId) {
      toast.error("Vui lòng chọn Huấn luyện viên dạy thay trước khi duyệt.");
      return;
    }
    if (isSub && selectedSubstitute?.isBusy) {
      toast.error(`Huấn luyện viên ${selectedSubstitute.fullName} đang bị ${selectedSubstitute.conflictReason}. Vui lòng chọn HLV khác!`);
      return;
    }

    setSubmitting(true);
    try {
      const defaultNote = isSub
        ? "Yêu cầu đã được Manager duyệt và chỉ định HLV dạy thay."
        : "Yêu cầu đã được Manager duyệt.";
      await onAction(
        selectedRequest.id,
        "approve",
        modalManagerNote || defaultNote,
        isSub ? modalSubstituteId : undefined,
      );
      handleCloseDetail();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || submitting) return;
    setSubmitting(true);
    try {
      await onAction(
        selectedRequest.id,
        "reject",
        modalManagerNote || "Yêu cầu đã bị Manager từ chối.",
      );
      handleCloseDetail();
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = useMemo(
    () =>
      requests.filter(
        (item) =>
          item.status.toLowerCase() === "pending" ||
          item.status.toLowerCase() === "substitute_accepted",
      ).length,
    [requests],
  );

  const approvedCount = useMemo(
    () => requests.filter((item) => item.status.toLowerCase() === "approved").length,
    [requests],
  );

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      // Status filter
      const st = item.status.toLowerCase();
      if (statusFilter === "pending") {
        if (st !== "pending" && st !== "substitute_accepted") return false;
      } else if (statusFilter === "approved") {
        if (st !== "approved") return false;
      } else if (statusFilter === "rejected") {
        if (st !== "rejected" && st !== "substitute_declined") return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.className?.toLowerCase().includes(q);
        const matchesCoach = item.coachName?.toLowerCase().includes(q);
        const matchesSub = item.substituteCoachName?.toLowerCase().includes(q);
        const matchesReason = item.reason?.toLowerCase().includes(q);
        const matchesType = item.requestType?.toLowerCase().includes(q);
        if (!matchesName && !matchesCoach && !matchesSub && !matchesReason && !matchesType) {
          return false;
        }
      }
      return true;
    });
  }, [requests, statusFilter, searchQuery]);

  return (
    <section className="coach-schedule-requests flex flex-col gap-6 pt-2">
      {/* Header & Stats Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Yêu cầu điều chỉnh ca dạy</h2>
          <p className="mt-1 text-sm text-slate-500">
            Xem xét và xử lý các yêu cầu dời lịch, phân công dạy thay hoặc báo vắng từ Huấn luyện viên.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>{pendingCount} chờ duyệt</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            <Check className="h-3.5 w-3.5" />
            <span>{approvedCount} đã duyệt</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(
            [
              { id: "all", label: "Tất cả" },
              { id: "pending", label: `Chờ duyệt (${pendingCount})` },
              { id: "approved", label: "Đã duyệt" },
              { id: "rejected", label: "Từ chối" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                statusFilter === tab.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo lớp, HLV, lý do..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* List Content */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Đang tải yêu cầu điều chỉnh ca dạy...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Không có yêu cầu nào phù hợp</p>
          <p className="text-xs text-slate-500 mt-1">Các yêu cầu từ Coach sẽ hiển thị tại đây.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredRequests.map((request) => {
            const isPending =
              request.status.toLowerCase() === "pending" ||
              request.status.toLowerCase() === "substitute_accepted";
            const cfg = statusConfig[request.status.toLowerCase()] || statusConfig.pending;

            return (
              <div
                key={request.id}
                onClick={() => handleOpenDetail(request)}
                className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                      {request.className}
                    </span>
                    {request.sportName && (
                      <span className="rounded bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                        {request.sportName}
                      </span>
                    )}
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      {request.requestType}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{request.sessionTime || request.scheduleTime || "Thời gian ca dạy"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Coach: <strong>{request.coachName}</strong></span>
                    </div>
                    {request.roomName && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{request.roomName}</span>
                      </div>
                    )}
                    {request.substituteCoachName && (
                      <div className="flex items-center gap-1 text-indigo-600 font-semibold">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Dạy thay: {request.substituteCoachName}</span>
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-500 line-clamp-1 italic">
                    Lý do: &ldquo;{request.reason}&rdquo;
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(request);
                    }}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                      isPending
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <span>{isPending ? "Xem & Xử lý" : "Xem chi tiết"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL XEM CHI TIẾT & XỬ LÝ YÊU CẦU */}
      {selectedRequest &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="relative w-full max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0 bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Chi tiết yêu cầu điều chỉnh ca dạy
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Gửi lúc: {selectedRequest.createdAt}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseDetail}
                  disabled={submitting}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex flex-col gap-5 text-xs">
                {/* 1. Thẻ thông tin ca dạy */}
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {selectedRequest.className}
                      </span>
                      {selectedRequest.sportName && (
                        <span className="rounded-md bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[11px] font-semibold">
                          {selectedRequest.sportName}
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                        statusConfig[selectedRequest.status.toLowerCase()]?.bg || "bg-slate-100"
                      } ${statusConfig[selectedRequest.status.toLowerCase()]?.text || "text-slate-700"} ${
                        statusConfig[selectedRequest.status.toLowerCase()]?.border || "border-slate-200"
                      }`}
                    >
                      {statusConfig[selectedRequest.status.toLowerCase()]?.label || selectedRequest.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <span className="text-[11px] text-slate-400 block">Thời gian ca dạy:</span>
                        <strong className="text-indigo-900 font-semibold">
                          {selectedRequest.sessionTime || selectedRequest.scheduleTime || "Chưa xác định"}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <span className="text-[11px] text-slate-400 block">Huấn luyện viên phụ trách:</span>
                        <strong className="text-slate-900 font-semibold">
                          {selectedRequest.coachName}
                        </strong>
                      </div>
                    </div>

                    {selectedRequest.roomName && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <span className="text-[11px] text-slate-400 block">Phòng / Khu vực:</span>
                          <strong className="text-slate-900 font-semibold">
                            {selectedRequest.roomName}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedRequest.newDate && (
                    <div className="rounded-lg bg-white/80 border border-indigo-100 p-2.5 flex items-center gap-2 text-indigo-900">
                      <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>
                        Thời gian đề xuất dời: <strong>{selectedRequest.newDate} {selectedRequest.newTime}</strong>
                      </span>
                    </div>
                  )}

                  {selectedRequest.substituteCoachName && (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 flex items-center gap-2 text-emerald-900">
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Huấn luyện viên dạy thay: <strong>{selectedRequest.substituteCoachName}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Lý do từ Coach */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <span>Lý do từ Huấn luyện viên:</span>
                  </label>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 italic text-xs leading-relaxed">
                    &ldquo;{selectedRequest.reason}&rdquo;
                  </div>
                </div>

                {/* 3. Phản hồi trước đó của Quản lý nếu đã xử lý */}
                {selectedRequest.managerNote && !isSubstituteRequest(selectedRequest.requestType) && (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 text-xs">Ghi chú từ Quản lý:</label>
                    <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs">
                      {selectedRequest.managerNote}
                    </div>
                  </div>
                )}

                {/* 4. KHU VỰC QUẢN LÝ DUYỆT / CHỈ ĐỊNH (Khi đang chờ duyệt) */}
                {(selectedRequest.status.toLowerCase() === "pending" ||
                  selectedRequest.status.toLowerCase() === "substitute_accepted") && (
                  <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
                    {/* Nếu là yêu cầu Dạy Thay -> Hiển thị hộp chọn HLV thay thế */}
                    {isSubstituteRequest(selectedRequest.requestType) && (
                      <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-indigo-700 shrink-0" />
                          <label className="font-bold text-slate-800 text-xs">
                            Chỉ định Huấn luyện viên dạy thay <span className="text-rose-500">*</span>
                          </label>
                        </div>

                        <p className="text-[11px] text-slate-600">
                          Hệ thống lọc các Huấn luyện viên rảnh lịch trong khung giờ{" "}
                          <strong className="text-slate-800">
                            {shiftTimeWindow
                              ? `${shiftTimeWindow.date} (${shiftTimeWindow.formattedTime})`
                              : selectedRequest.sessionTime || selectedRequest.scheduleTime}
                          </strong>:
                        </p>

                        <select
                          value={modalSubstituteId}
                          onChange={(e) => setModalSubstituteId(e.target.value)}
                          disabled={submitting}
                          className="w-full mt-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        >
                          <option value="">-- Chọn Huấn luyện viên tiếp nhận ca dạy --</option>
                          {freeCoaches.length === 0 ? (
                            <option value="" disabled>
                              -- Không có Huấn luyện viên nào rảnh lịch vào khung giờ này --
                            </option>
                          ) : (
                            freeCoaches.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.fullName} {c.specialty ? `— ${c.specialty}` : ""}
                              </option>
                            ))
                          )}
                        </select>

                        {/* Thông tin xác nhận khi đã chọn */}
                        {selectedSubstitute && (
                          <div className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 flex items-center gap-2 text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              Đã chọn: <strong className="font-semibold text-slate-900">{selectedSubstitute.fullName}</strong>
                              {selectedSubstitute.specialty ? ` — ${selectedSubstitute.specialty}` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ô ghi chú phản hồi */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 text-xs">
                        Ghi chú gửi lại cho Coach (không bắt buộc):
                      </label>
                      <textarea
                        rows={2}
                        value={modalManagerNote}
                        onChange={(e) => setModalManagerNote(e.target.value)}
                        placeholder="Nhập lời nhắn hoặc lý do nếu từ chối..."
                        disabled={submitting}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-100 p-4 bg-slate-50/80 flex items-center justify-end gap-2.5 shrink-0">
                {selectedRequest.status.toLowerCase() === "pending" ||
                selectedRequest.status.toLowerCase() === "substitute_accepted" ? (
                  <>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleReject}
                      className="px-4 py-2 rounded-lg border border-rose-200 text-rose-700 font-semibold hover:bg-rose-50 disabled:opacity-50 transition-colors"
                    >
                      {submitting ? "Đang xử lý..." : "Từ chối yêu cầu"}
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleApprove}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>{submitting ? "Đang xử lý..." : "Duyệt yêu cầu"}</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleCloseDetail}
                    className="px-5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors"
                  >
                    Đóng
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
