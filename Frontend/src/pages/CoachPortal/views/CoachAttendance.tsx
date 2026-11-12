import { useState, useMemo, useCallback } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI, type AttendanceStatus } from "../services/api";
import {
  Edit3,
  X,
  Clock,
  Search,
  CheckCircle2,
  ShieldCheck,
  Award,
  Users,
  UserCheck,
  UserX,
  RotateCcw,
  CheckCheck,
  AlertTriangle,
  Info,
  FileText,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import AttendanceClassSessionsList from "./attendance/AttendanceClassSessionsList";
import AttendanceHistoryTableView from "./attendance/AttendanceHistoryTableView";
import AttendanceSessionSidebarCard from "./attendance/AttendanceSessionSidebarCard";
import AttendanceMemberList from "./attendance/AttendanceMemberList";
import AttendanceAuditReasonModal from "./attendance/AttendanceAuditReasonModal";
import { useCoachAttendanceData } from "./attendance/useCoachAttendanceData";
import { isAttendanceLocked24h, getAttendanceLockDeadlineInfo } from "../utils/attendanceLock";
import { isSessionPast24Hours } from "../utils/attendanceTimeUtils";

interface Props {
  initialSessionId: string | null;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string }) => void;
}

type FilterStatus = "all" | "attended" | "late" | "no_show" | "pending";

type TopTab = "active" | "history";

export default function CoachAttendance({ initialSessionId, navigateTo }: Props) {
  const [topTab, setTopTab] = useState<TopTab>("active");
  const {
    activeSessions,
    isLoadingSessions,
    selectedSessionId,
    setSelectedSessionId,
    records,
    setRecords,
    savedRecords,
    setSavedRecords,
    members,
    sheetState,
    setSheetState,
  } = useCoachAttendanceData(initialSessionId);

  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const [finalizedMap, setFinalizedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("coach_attendance_finalized_sessions");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [auditReason, setAuditReason] = useState("");
  const [showReasonModal, setShowReasonModal] = useState(false);

  const hasChanges = useMemo(
    () => JSON.stringify(records) !== JSON.stringify(savedRecords),
    [records, savedRecords]
  );

  const session = useMemo(
    () => activeSessions.find((s) => s.id === selectedSessionId),
    [activeSessions, selectedSessionId]
  );

  const isPast24h = useMemo(() => {
    return isSessionPast24Hours(session?.date, session?.startTime);
  }, [session?.date, session?.startTime]);

  const isFinalized = sheetState === "finalized" || !!finalizedMap[selectedSessionId];
  const isDraft = sheetState === "draft" || (!isFinalized && records.some((r) => r.status !== "chưa điểm danh"));

  // QUY ĐỊNH 24 GIỜ: Kiểm tra xem ca học đã quá 24h kể từ khi bắt đầu hay chưa
  const isExpired24h = useMemo(
    () => isAttendanceLocked24h(session?.date, session?.startTime),
    [session?.date, session?.startTime]
  );

  const deadlineInfo = useMemo(
    () => getAttendanceLockDeadlineInfo(session?.date, session?.startTime),
    [session?.date, session?.startTime]
  );

  // Nếu đã quá 24h từ lúc học thì KHÓA VĨNH VIỄN, không cho phép mở sửa dưới bất kỳ hình thức nào
  const isEditingThisSession = !isExpired24h && editingSessionId === selectedSessionId;
  const isLocked = isExpired24h || (isFinalized && !isEditingThisSession);
  // Nếu đã quá 24h tính từ lúc bắt đầu thì KHÔNG cho phép chỉnh sửa dưới bất kỳ hình thức nào
  const isEditingThisSession = !isPast24h && editingSessionId === selectedSessionId;
  const isLocked = isPast24h || (isFinalized && !isEditingThisSession);

  const handleSessionChange = useCallback(
    (newId: string) => {
      if (hasChanges && !window.confirm("Bạn có thay đổi chưa lưu. Tiếp tục chuyển sang buổi khác?")) {
        return;
      }
      setEditingSessionId(null);
      setSelectedSessionId(newId);
      setFilterStatus("all");
      setSearch("");
    },
    [hasChanges, setSelectedSessionId]
  );

  const handleStatusChange = useCallback(
    (memberId: string, status: AttendanceStatus) => {
      if (isLocked) return;
      const next = records.map((r) => (r.memberId === memberId ? { ...r, status } : r));
      setRecords(next);

      // Lưu ngay vào localStorage
      if (selectedSessionId) {
        localStorage.setItem(`coach_attendance_${selectedSessionId}`, JSON.stringify(next));
        // Tự động lưu bản nháp vào server
        if (!isFinalized) {
          void CoachAPI.saveAttendanceDraft(selectedSessionId, next).catch(() => {});
        }
      }
      if (!isFinalized) setSheetState("draft");
    },
    [isLocked, records, selectedSessionId, isFinalized, setRecords, setSheetState]
  );

  const handleNoteChange = useCallback(
    (memberId: string, note: string) => {
      if (isLocked) return;
      const next = records.map((r) => (r.memberId === memberId ? { ...r, note } : r));
      setRecords(next);

      if (selectedSessionId) {
        localStorage.setItem(`coach_attendance_${selectedSessionId}`, JSON.stringify(next));
        if (!isFinalized) {
          void CoachAPI.saveAttendanceDraft(selectedSessionId, next).catch(() => {});
        }
      }
    },
    [isLocked, records, selectedSessionId, isFinalized, setRecords]
  );

  const handleMarkAllPresent = () => {
    if (isLocked) return;
    const next = records.map((r) => ({ ...r, status: "attended" as const }));
    setRecords(next);
    if (selectedSessionId) {
      localStorage.setItem(`coach_attendance_${selectedSessionId}`, JSON.stringify(next));
      if (!isFinalized) {
        void CoachAPI.saveAttendanceDraft(selectedSessionId, next).catch(() => {});
      }
    }
    if (!isFinalized) setSheetState("draft");
    toast.info("Đã đánh dấu tất cả học viên có mặt (đã lưu nháp).");
  };

  const handleResetAll = () => {
    if (isLocked) return;
    const next = records.map((r) => ({ ...r, status: "chưa điểm danh" as const, note: "" }));
    setRecords(next);
    if (selectedSessionId) {
      localStorage.setItem(`coach_attendance_${selectedSessionId}`, JSON.stringify(next));
      if (!isFinalized) {
        void CoachAPI.saveAttendanceDraft(selectedSessionId, next).catch(() => {});
      }
    }
    setSheetState("unmarked");
    toast.info("Đã đặt lại trạng thái điểm danh về chưa điểm danh.");
  };

  const handleSaveDraft = async () => {
    if (!selectedSessionId || isSaving) return;
    if (isExpired24h) {
      toast.error("Buổi học đã đóng ( Không thể sửa điểm vì đã quá 24 giờ )");
    if (isPast24h) {
      toast.error("Ca dạy này đã bắt đầu quá 24 giờ. Theo quy định, không thể lưu nháp điểm danh.");
      return;
    }
    setIsSaving(true);
    try {
      localStorage.setItem(`coach_attendance_${selectedSessionId}`, JSON.stringify(records));
      await CoachAPI.saveAttendanceDraft(selectedSessionId, records);
      setSavedRecords(records);
      setSheetState("draft");
      toast.success("Đã lưu bản nháp điểm danh vào hệ thống!");
    } catch (err: any) {
      toast.error(err?.message || "Lưu nháp thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!selectedSessionId || isSaving) return;
    if (isExpired24h) {
      toast.error("Buổi học đã đóng ( Không thể sửa điểm vì đã quá 24 giờ )");
    if (isPast24h) {
      toast.error("Buổi học này đã bắt đầu quá 24 giờ. Sổ điểm danh đã bị khóa vĩnh viễn và không thể điều chỉnh.");
      return;
    }

    if (isFinalized && isEditingThisSession && !auditReason.trim()) {
      setShowReasonModal(true);
      return;
    }

    setIsSaving(true);
    try {
      localStorage.setItem(`coach_attendance_${selectedSessionId}`, JSON.stringify(records));
      await CoachAPI.finalizeAttendance(selectedSessionId, records, auditReason.trim() || undefined);

      const updatedMap = { ...finalizedMap, [selectedSessionId]: true };
      setFinalizedMap(updatedMap);
      localStorage.setItem("coach_attendance_finalized_sessions", JSON.stringify(updatedMap));

      setEditingSessionId(null);
      setAuditReason("");
      setSavedRecords(records);
      setSheetState("finalized");
      toast.success(isEditingThisSession ? "Đã lưu điều chỉnh điểm danh!" : "Đã chốt sổ điểm danh thành công!");
    } catch (err: any) {
      toast.error(err?.message || "Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const stats = useMemo(() => {
    const total = records.length;
    const attended = records.filter((r) => r.status === "attended").length;
    const absent = records.filter((r) => r.status === "no_show").length;
    const pending = total - attended - absent;
    const attendanceRate = total > 0 ? Math.round((attended / total) * 100) : 0;
    return { total, attended, absent, pending, attendanceRate };
  }, [records]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        (m.phone && m.phone.includes(q));

      if (!matchSearch) return false;

      const record = records.find((r) => r.memberId === m.id);
      const status = record?.status || "chưa điểm danh";

      if (filterStatus === "all") return true;
      if (filterStatus === "attended") return status === "attended";
      if (filterStatus === "no_show") return status === "no_show";
      if (filterStatus === "pending") return status !== "attended" && status !== "no_show";

      return true;
    });
  }, [members, search, filterStatus, records]);

  if (!selectedSessionId || !session) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
        <AttendanceClassSessionsList
          activeSessions={activeSessions}
          isLoading={isLoadingSessions}
          onSelectSession={handleSessionChange}
          finalizedMap={finalizedMap}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Back to class list button */}
      <div>
        <button
          type="button"
          onClick={() => {
            if (hasChanges && !window.confirm("Bạn có thay đổi chưa lưu. Tiếp tục quay lại danh sách lớp?")) {
              return;
            }
            setSelectedSessionId("");
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>← Quay lại danh sách lớp học</span>
        </button>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Điểm danh buổi học
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ghi nhận sĩ số, theo dõi chuyên cần và cập nhật ghi chú luyện tập cho từng học viên.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigateTo("assessment", { sessionId: selectedSessionId })}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl hover:bg-emerald-100/70 transition-colors shadow-xs"
          >
            <Award className="w-4 h-4" />
            {isExpired24h ? "Xem đánh giá buổi tập" : "Đánh giá buổi tập"}
          </button>

          {isExpired24h ? (
            <div
              title="Buổi học đã bắt đầu quá 24 giờ. Buổi học đã đóng và không thể sửa đổi."
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs cursor-not-allowed"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Đã đóng (Quá 24 giờ)</span>
            </div>
          ) : isFinalized && !isEditingThisSession ? (
            <button
              onClick={() => setEditingSessionId(selectedSessionId)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              <span>Điều chỉnh điểm danh</span>
            </button>
          ) : null}

          {isEditingThisSession && (
            <button
              onClick={() => {
                setEditingSessionId(null);
                setRecords(savedRecords);
                setAuditReason("");
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl hover:bg-rose-100/70 transition-colors shadow-xs"
            >
              <X className="w-4 h-4" />
              Hủy điều chỉnh
            </button>
          )}
        </div>
      </div>

      {/* Audit / Locking Alerts */}
      {isExpired24h ? (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/50 text-amber-950 dark:text-amber-200 text-xs sm:text-sm animate-in fade-in">
          <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-bold text-sm text-amber-900 dark:text-amber-200">
              Buổi học đã đóng ( Không thể sửa điểm vì đã quá 24 giờ )
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Ca học bắt đầu lúc <strong>{session.startTime} ngày {session.date}</strong>. Quy định trung tâm chỉ cho phép HLV điểm danh hoặc chỉnh sửa trong vòng <strong>24 giờ</strong> kể từ lúc bắt đầu ca học (đã hết hạn lúc <strong>{deadlineInfo.formattedDeadline}</strong>).
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
              🔒 Danh sách học viên và trạng thái điểm danh hiện tại ở chế độ chỉ xem (Read-only). HLV không thể điểm danh bổ sung hay sửa lại.
            </p>
          </div>
        </div>
      ) : isLocked ? (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/30 border border-slate-200/80 dark:border-slate-900/50 text-slate-900 dark:text-slate-300 text-xs sm:text-sm">
          <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Sổ điểm danh buổi học này đã được chốt.</p>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
              Danh sách học viên hiện đang ở chế độ xem. Nếu phát hiện sai sót cần chỉnh sửa, hãy nhấn <strong>&ldquo;Điều chỉnh điểm danh&rdquo;</strong> ở phía trên ({deadlineInfo.remainingText}).
            </p>
          </div>
        </div>
      ) : null}

      {isEditingThisSession && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-900/50 text-slate-900 dark:text-slate-300 text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Đang ở chế độ điều chỉnh điểm danh ({deadlineInfo.remainingText}).</p>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
              Bạn có thể cập nhật lại trạng thái học viên hoặc thêm ghi chú. Khi hoàn tất, hãy nhấn nút <strong>&ldquo;Lưu điều chỉnh cho buổi này&rdquo;</strong> ở thanh dưới cùng và nhập lý do điều chỉnh.
            </p>
          </div>
        </div>
      )}

      {/* Selected Session Hero Banner */}
      <AttendanceSessionSelector
        selectedSessionId={selectedSessionId}
        onSessionChange={handleSessionChange}
        activeSessions={activeSessions}
        session={session}
        isFinalized={isFinalized}
        isDraft={isDraft}
        isExpired24h={isExpired24h}
        deadlineInfo={deadlineInfo}
        enrolledCount={members.length}
      />

      {/* Live Attendance Statistics & Visual Progress */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Total */}
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Tổng sĩ số</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.total}
              </span>
              <span className="text-xs text-slate-400">học viên</span>
            </div>
          </div>
      {/* TOP-LEVEL TABS: ĐIỂM DANH BUỔI HỌC & LỊCH SỬ ĐIỂM DANH */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setTopTab("active")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            topTab === "active"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Điểm danh ca dạy</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            topTab === "active" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700"
          }`}>
            {members.length} học viên
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTopTab("history")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            topTab === "history"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Lịch sử các ca đã chốt</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            topTab === "history" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700"
          }`}>
            {activeSessions.filter(s => finalizedMap[s.id]).length || Object.keys(finalizedMap).length} đã chốt
          </span>
        </button>
      </div>

      {topTab === "history" ? (
        /* TAB 2: LỊCH SỬ ĐIỂM DANH DẠNG BẢNG BÁO CÁO CHUYÊN NGHIỆP */
        <AttendanceHistoryTableView
          activeSessions={activeSessions}
          isLoading={isLoadingSessions}
          onSelectSession={(id) => {
            handleSessionChange(id);
            setTopTab("active");
          }}
          finalizedMap={finalizedMap}
        />
      ) : (
        /* TAB 1: BỐ CỤC 2 CỘT SONG SONG ĐIỂM DANH */
        <>
          {/* Audit / Locking Alert Bar (1 dòng gọn gàng, height ~48px) */}
          {isPast24h ? (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                <p className="font-medium truncate">
                  Ca dạy đã bắt đầu quá 24 giờ • <span className="text-slate-500 dark:text-slate-400">Sổ điểm danh đã bị khóa vĩnh viễn (Chế độ chỉ xem)</span>
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs shrink-0">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Đã khóa quá hạn 24h
              </span>
            </div>
          ) : isLocked ? (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="font-medium truncate">
                  Sổ điểm danh buổi học này đã được chốt • <span className="text-slate-500 dark:text-slate-400">Chế độ chỉ xem</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSessionId(selectedSessionId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg hover:bg-amber-100/60 transition-colors shadow-2xs shrink-0 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                Điều chỉnh điểm danh
              </button>
            </div>
          ) : null}

          {isEditingThisSession && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <AlertTriangle className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="font-medium truncate">
                  Đang ở chế độ điều chỉnh điểm danh đã chốt • <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Chỉnh sửa trực tiếp danh sách</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingSessionId(null);
                  setRecords(savedRecords);
                  setAuditReason("");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 rounded-lg hover:bg-rose-50 transition-colors shadow-2xs shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-rose-600" />
                Hủy điều chỉnh
              </button>
            </div>
          )}

          {/* BỐ CỤC 2 CỘT SONG SONG (2-COLUMN SPLIT-VIEW DASHBOARD) */}
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
            {/* CỘT TRÁI (340px): Card ca dạy & Điều khiển tổng */}
            <AttendanceSessionSidebarCard
              selectedSessionId={selectedSessionId}
              onSessionChange={handleSessionChange}
              activeSessions={activeSessions}
              session={session}
              isFinalized={isFinalized}
              isDraft={isDraft}
              isEditingThisSession={isEditingThisSession}
              isLocked={isLocked}
              isSaving={isSaving}
              isPast24h={isPast24h}
              stats={stats}
              onSave={handleSave}
              onSaveDraft={handleSaveDraft}
              onNavigateToAssessment={() => navigateTo("assessment", { sessionId: selectedSessionId })}
              onOpenReasonModal={() => setShowReasonModal(true)}
            />

            {/* CỘT PHẢI (1fr): Danh sách học viên & Bộ lọc */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 space-y-4">
              {/* Header Cột phải: Tiêu đề kèm nút thao tác nhanh */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Danh sách học viên</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      {members.length}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Xác nhận học viên có mặt và theo dõi sĩ số buổi tập trực tiếp
                  </p>
                </div>

                {/* Nút thao tác nhanh trên header danh sách */}
                {!isLocked && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleMarkAllPresent}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>✓ Tất cả có mặt</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetAll}
                      title="Đặt lại về chưa điểm danh"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Đặt lại</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Thanh tìm kiếm học viên */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo họ tên, mã học viên (#MB...), hoặc số điện thoại..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Bảng danh sách học viên dạng row thoáng mắt */}
              <AttendanceMemberList
                members={filteredMembers}
                records={records}
                isLocked={isLocked}
                onStatusChange={handleStatusChange}
                onNoteChange={handleNoteChange}
                totalEnrolledCount={members.length}
              />
            </div>
          </div>
        </>
      )}

      {/* Read-only notification bar when locked by 24h */}
      {isExpired24h && (
        <div className="sticky bottom-6 z-30 bg-slate-900/95 dark:bg-slate-900/95 text-white backdrop-blur-md rounded-2xl border border-slate-700/80 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block sm:inline">
                Buổi học đã đóng ( Không thể sửa điểm vì đã quá 24 giờ ).
              </span>
              <span className="text-slate-300 text-xs sm:ml-2">
                Có mặt: {stats.attended}/{stats.total} · Vắng: {stats.absent} · Chưa điểm danh: {stats.pending}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigateTo("assessment", { sessionId: selectedSessionId })}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Xem đánh giá buổi học</span>
          </button>
        </div>
      )}

      {/* Audit Reason Modal for post-finalized modifications */}
      <AttendanceAuditReasonModal
        isOpen={showReasonModal}
        onClose={() => setShowReasonModal(false)}
        className={session.className}
        auditReason={auditReason}
        setAuditReason={setAuditReason}
        onConfirm={() => {
          setShowReasonModal(false);
          handleSave();
        }}
      />
    </div>
  );
}
