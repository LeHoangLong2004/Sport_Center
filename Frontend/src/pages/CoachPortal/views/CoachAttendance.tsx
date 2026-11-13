import React from "react";
import type { CoachScreen } from "../types";
import {
  Edit3,
  X,
  Clock,
  Search,
  Award,
  RotateCcw,
  CheckCheck,
  FileText,
  ArrowLeft,
  Lock,
} from "lucide-react";
import AttendanceSessionSelector from "./attendance/AttendanceSessionSelector";
import AttendanceClassSessionsList from "./attendance/AttendanceClassSessionsList";
import AttendanceMemberList from "./attendance/AttendanceMemberList";
import AttendanceAuditReasonModal from "./attendance/AttendanceAuditReasonModal";
import AttendanceStatsGrid from "./attendance/AttendanceStatsGrid";
import AttendanceLockAlertBanner from "./attendance/AttendanceLockAlertBanner";
import AttendanceHistoryTableView from "./attendance/AttendanceHistoryTableView";
import AttendanceSessionSidebarCard from "./attendance/AttendanceSessionSidebarCard";
import { useCoachAttendanceData } from "./attendance/useCoachAttendanceData";
import { useCoachAttendanceActions } from "./attendance/useCoachAttendanceActions";

interface Props {
  initialSessionId: string | null;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string }) => void;
}

/**
 * Màn hình Điểm danh buổi học của Huấn luyện viên (Coach Attendance View).
 * Cung cấp quy trình điểm danh học viên, lưu nháp, chốt sổ (finalize) và quy định khóa 24h.
 */
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

  const {
    topTab,
    setTopTab,
    isSaving,
    search,
    setSearch,
    finalizedMap,
    editingSessionId,
    setEditingSessionId,
    auditReason,
    setAuditReason,
    showReasonModal,
    setShowReasonModal,
    hasChanges,
    session,
    isFinalized,
    isDraft,
    isExpired24h,
    deadlineInfo,
    isLocked,
    isEditingThisSession,
    handleSessionChange,
    handleStatusChange,
    handleNoteChange,
    handleMarkAllPresent,
    handleResetAll,
    handleSaveDraft,
    handleSave,
    stats,
    filteredMembers,
  } = useCoachAttendanceActions({
    selectedSessionId,
    setSelectedSessionId,
    activeSessions,
    records,
    setRecords,
    savedRecords,
    setSavedRecords,
    members,
    sheetState,
    setSheetState,
  });

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
      {/* Nút quay lại danh sách lớp */}
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
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl hover:bg-emerald-100/70 transition-colors shadow-xs cursor-pointer"
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
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
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
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl hover:bg-rose-100/70 transition-colors shadow-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
              Hủy điều chỉnh
            </button>
          )}
        </div>
      </div>

      {/* Cảnh báo khóa 24h / Quy định */}
      <AttendanceLockAlertBanner
        session={session}
        isExpired24h={isExpired24h}
        isLocked={isLocked}
        isEditingThisSession={isEditingThisSession}
        deadlineInfo={deadlineInfo}
        onEditClick={() => setEditingSessionId(selectedSessionId)}
        onCancelEditClick={() => {
          setEditingSessionId(null);
          setRecords(savedRecords);
          setAuditReason("");
        }}
      />

      {/* Selected Session Hero Banner */}
      {session && (
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
          stats={stats}
        />
      )}

      {/* Live Attendance Statistics & Visual Progress */}
      <AttendanceStatsGrid stats={stats} />

      {/* TABS: Điểm danh ca dạy & Lịch sử các ca đã chốt */}
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
        <AttendanceHistoryTableView
          activeSessions={activeSessions}
          isLoading={isLoadingSessions}
          onSelectSession={(id: string) => {
            handleSessionChange(id);
            setTopTab("active");
          }}
          finalizedMap={finalizedMap}
        />
      ) : (
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
            isPast24h={isExpired24h}
            stats={stats}
            onSave={handleSave}
            onSaveDraft={handleSaveDraft}
            onNavigateToAssessment={() => navigateTo("assessment", { sessionId: selectedSessionId })}
            onOpenReasonModal={() => setShowReasonModal(true)}
          />

          {/* CỘT PHẢI (1fr): Danh sách học viên & Bộ lọc */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 space-y-4">
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

            {/* Danh sách học viên */}
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
      )}

      {/* Thông báo buổi học đóng sau 24h */}
      {isExpired24h && (
        <div className="sticky bottom-6 z-30 bg-slate-900/95 dark:bg-slate-900/95 text-white backdrop-blur-md rounded-2xl border border-slate-700/80 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block sm:inline">
                Buổi học đã đóng (Không thể sửa điểm vì đã quá 24 giờ).
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
