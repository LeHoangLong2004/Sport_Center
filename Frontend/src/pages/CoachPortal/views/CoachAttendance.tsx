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
} from "lucide-react";
import { toast } from "sonner";
import AttendanceSessionSelector from "./attendance/AttendanceSessionSelector";
import AttendanceMemberList from "./attendance/AttendanceMemberList";
import AttendanceAuditReasonModal from "./attendance/AttendanceAuditReasonModal";
import { useCoachAttendanceData } from "./attendance/useCoachAttendanceData";

interface Props {
  initialSessionId: string | null;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string }) => void;
}

type FilterStatus = "all" | "attended" | "no_show" | "pending";

export default function CoachAttendance({ initialSessionId, navigateTo }: Props) {
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
      return saved ? JSON.parse(saved) : { s1: true };
    } catch {
      return { s1: true };
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

  const isFinalized = sheetState === "finalized" || !!finalizedMap[selectedSessionId];
  const isDraft = sheetState === "draft" || (!isFinalized && records.some((r) => r.status !== "chưa điểm danh"));
  const isEditingThisSession = editingSessionId === selectedSessionId;
  const isLocked = isFinalized && !isEditingThisSession;

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

  if (!session) {
    if (isLoadingSessions) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <Clock className="w-10 h-10 text-orange-500 animate-spin" />
          <p className="text-base font-medium">Đang tải lịch dạy và ca học...</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
        <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        <p className="text-base font-medium">Không có buổi học nào cần điểm danh.</p>
        <button
          type="button"
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 cursor-pointer"
          onClick={() => navigateTo("schedule")}
        >
          Xem lịch dạy →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              HLV / ĐIỂM DANH LỚP
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Quản lý ca dạy
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1.5">
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
            Đánh giá buổi tập
          </button>

          {isFinalized && !isEditingThisSession && (
            <button
              onClick={() => setEditingSessionId(selectedSessionId)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              Điều chỉnh điểm danh
            </button>
          )}

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
      {isLocked && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/30 border border-slate-200/80 dark:border-slate-900/50 text-slate-900 dark:text-slate-300 text-xs sm:text-sm">
          <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Sổ điểm danh buổi học này đã được chốt.</p>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
              Để bảo vệ dữ liệu báo cáo, danh sách học viên hiện đang ở chế độ xem. Nếu phát hiện sai sót cần chỉnh sửa, hãy nhấn <strong>&ldquo;Điều chỉnh điểm danh&rdquo;</strong> ở phía trên.
            </p>
          </div>
        </div>
      )}

      {isEditingThisSession && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-900/50 text-slate-900 dark:text-slate-300 text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Đang ở chế độ điều chỉnh điểm danh đã chốt.</p>
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

          {/* Attended */}
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1.5">
              <span className="text-xs font-semibold">Đã có mặt</span>
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.attended}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                {stats.attendanceRate}%
              </span>
            </div>
          </div>

          {/* Absent */}
          <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
            <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-1.5">
              <span className="text-xs font-semibold">Vắng mặt</span>
              <UserX className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {stats.absent}
              </span>
              <span className="text-xs text-slate-400">học viên</span>
            </div>
          </div>

          {/* Pending */}
          <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/40">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Chưa điểm danh</span>
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                {stats.pending}
              </span>
              <span className="text-xs text-slate-400">chờ xác nhận</span>
            </div>
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        {stats.total > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(stats.attended / stats.total) * 100}%` }}
                className="bg-emerald-500 transition-all duration-300"
                title={`Có mặt: ${stats.attended}`}
              />
              <div
                style={{ width: `${(stats.absent / stats.total) * 100}%` }}
                className="bg-rose-500 transition-all duration-300"
                title={`Vắng: ${stats.absent}`}
              />
              <div
                style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                className="bg-slate-300 dark:bg-slate-500/40 transition-all duration-300"
                title={`Chưa điểm danh: ${stats.pending}`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Có mặt ({stats.attended})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Vắng ({stats.absent})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" /> Chưa điểm danh ({stats.pending})
                </span>
              </div>
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Chuyên cần: {stats.attendanceRate}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar: Search, Status Filter Tabs, Batch Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên, mã HV (#MEM...) hoặc SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterStatus === "all"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Tất cả ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus("attended")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterStatus === "attended"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Có mặt ({stats.attended})
          </button>
          <button
            onClick={() => setFilterStatus("no_show")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterStatus === "no_show"
                ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Vắng ({stats.absent})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterStatus === "pending"
                ? "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Chưa điểm danh ({stats.pending})
          </button>
        </div>

        {/* Quick Batch Actions */}
        {!isLocked && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 transition-colors shadow-xs"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Tất cả có mặt
            </button>
            <button
              type="button"
              onClick={handleResetAll}
              title="Đặt lại về chưa điểm danh"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại
            </button>
          </div>
        )}
      </div>

      {/* Roster / Member List */}
      <AttendanceMemberList
        members={filteredMembers}
        records={records}
        isLocked={isLocked}
        onStatusChange={handleStatusChange}
        onNoteChange={handleNoteChange}
        totalEnrolledCount={members.length}
      />

      {/* Floating Bottom Action Bar */}
      {!isLocked && (
        <div className="sticky bottom-6 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white">
                Có mặt: {stats.attended}/{stats.total}
              </span>
              <span className="mx-2 text-slate-300 dark:text-slate-700">|</span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                Vắng: {stats.absent}
              </span>
              <span className="mx-2 text-slate-300 dark:text-slate-700">|</span>
              <span className="text-slate-400 font-medium">
                Chờ: {stats.pending}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isFinalized && (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveDraft}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 border border-amber-300 dark:border-amber-700 rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Lưu bản nháp
              </button>
            )}

            <button
              type="button"
              onClick={() => navigateTo("assessment", { sessionId: selectedSessionId })}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Award className="w-4 h-4" />
              Đánh giá buổi học
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                if (isEditingThisSession) setShowReasonModal(true);
                else handleSave();
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              {isEditingThisSession ? "Lưu điều chỉnh cho buổi này" : "Chốt điểm danh"}
            </button>
          </div>
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
