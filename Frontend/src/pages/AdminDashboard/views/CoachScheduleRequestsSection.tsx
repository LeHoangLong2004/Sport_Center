import { useEffect, useMemo, useState } from "react";
import { Check, AlertCircle, Search } from "lucide-react";
import { toast } from "sonner";
import type { CoachScheduleRequest } from "./useCoachScheduleRequests";
export type { CoachScheduleRequest } from "./useCoachScheduleRequests";
import { AppointmentService } from "../../../services/appointmentService";
import type { CoachOption } from "./coachScheduleRequests/types";
import { isSubstituteRequest } from "./coachScheduleRequests/types";
import { parseShiftTimeWindow, checkCoachConflict } from "./coachScheduleRequests/conflictUtils";
import { CoachScheduleRequestCard } from "./coachScheduleRequests/CoachScheduleRequestCard";
import { CoachScheduleRequestModal } from "./coachScheduleRequests/CoachScheduleRequestModal";

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
          {filteredRequests.map((request) => (
            <CoachScheduleRequestCard
              key={request.id}
              request={request}
              onOpenDetail={handleOpenDetail}
            />
          ))}
        </div>
      )}

      {/* MODAL XEM CHI TIẾT & XỬ LÝ YÊU CẦU */}
      {selectedRequest && (
        <CoachScheduleRequestModal
          selectedRequest={selectedRequest}
          submitting={submitting}
          shiftTimeWindow={shiftTimeWindow}
          freeCoaches={freeCoaches}
          selectedSubstitute={selectedSubstitute}
          modalSubstituteId={modalSubstituteId}
          modalManagerNote={modalManagerNote}
          setModalSubstituteId={setModalSubstituteId}
          setModalManagerNote={setModalManagerNote}
          onClose={handleCloseDetail}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </section>
  );
}
