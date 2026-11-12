import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { UnifiedScheduleItem } from "./types";
import { CoachAPI } from "../../services/api";
import { RequestSessionPicker } from "./scheduleRequestModal/RequestSessionPicker";
import { RequestTypePicker, type ScheduleRequestType } from "./scheduleRequestModal/RequestTypePicker";
import { RequestAdjustmentFields } from "./scheduleRequestModal/RequestAdjustmentFields";
import {
  parseSessionStartDateTime,
  isSessionInFuture,
  checkScheduleConflict,
} from "./scheduleRequestModal/scheduleConflictHelper";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sessions: UnifiedScheduleItem[];
  initialSessionId?: string;
  onSubmit: (data: {
    sessionId: string;
    className: string;
    sessionTime?: string;
    sport?: string;
    room?: string;
    requestType: ScheduleRequestType;
    substituteCoachId?: string;
    substituteCoachName: string;
    newDate: string;
    newTime: string;
    reason: string;
  }) => Promise<void>;
}

interface CoachOption {
  id: string;
  fullName: string;
  specialty?: string;
}

export default function ScheduleRequestModal({
  isOpen,
  onClose,
  sessions,
  initialSessionId,
  onSubmit,
}: Props) {
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [requestType, setRequestType] = useState<ScheduleRequestType>("dời lịch");
  const [substituteCoachId, setSubstituteCoachId] = useState("");
  const [substituteCoachName, setSubstituteCoachName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [availableCoaches, setAvailableCoaches] = useState<CoachOption[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(false);

  // Chỉ lấy những ca dạy trong tương lai (chưa bắt đầu) và sắp xếp theo thời gian sớm nhất
  const upcomingSessions = useMemo(() => {
    return sessions
      .filter((s) => isSessionInFuture(s.date, s.startTime))
      .sort((a, b) => {
        const tA = parseSessionStartDateTime(a.date, a.startTime)?.getTime() || 0;
        const tB = parseSessionStartDateTime(b.date, b.startTime)?.getTime() || 0;
        return tA - tB;
      });
  }, [sessions]);

  useEffect(() => {
    if (initialSessionId && upcomingSessions.some((s) => s.id === initialSessionId)) {
      setSelectedSessionId(initialSessionId);
    } else if (upcomingSessions.length > 0) {
      if (!selectedSessionId || !upcomingSessions.some((s) => s.id === selectedSessionId)) {
        setSelectedSessionId(upcomingSessions[0].id);
      }
    } else {
      setSelectedSessionId("");
    }
  }, [initialSessionId, upcomingSessions, selectedSessionId]);

  // Load coaches from database when modal is open
  useEffect(() => {
    if (!isOpen) return;
    setLoadingCoaches(true);
    CoachAPI.getCoaches()
      .then((data) => setAvailableCoaches(data))
      .catch((err) => console.error("Lỗi nạp danh sách huấn luyện viên:", err))
      .finally(() => setLoadingCoaches(false));
  }, [isOpen]);

  const currentSession = useMemo(
    () => upcomingSessions.find((s) => s.id === selectedSessionId) || sessions.find((s) => s.id === selectedSessionId),
    [upcomingSessions, sessions, selectedSessionId],
  );

  // Kiểm tra xung đột lịch thời gian thực khi HLV chọn ngày và giờ mới
  const conflictResult = useMemo(() => {
    if (requestType !== "dời lịch") {
      return { hasConflict: false, conflictingSession: null, warningMessage: null };
    }
    return checkScheduleConflict(sessions, selectedSessionId, newDate, newTime);
  }, [requestType, sessions, selectedSessionId, newDate, newTime]);

  // Filter out the current coach
  const filteredCoaches = useMemo(() => {
    const currentCoachName = currentSession?.coachName?.toLowerCase().trim();
    let currentUserName = "";
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        currentUserName = (u.fullName || u.name || "").toLowerCase().trim();
      }
    } catch {}

    return availableCoaches.filter((c) => {
      const name = c.fullName?.toLowerCase().trim();
      if (currentCoachName && name === currentCoachName) return false;
      if (currentUserName && name === currentUserName) return false;
      return true;
    });
  }, [availableCoaches, currentSession]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (upcomingSessions.length === 0 || !selectedSessionId) {
      toast.error("Không có ca dạy nào trong tương lai để thực hiện yêu cầu.");
      return;
    }

    if (requestType === "dời lịch") {
      if (!newDate) {
        toast.error("Vui lòng chọn ngày mới đề xuất.");
        return;
      }
      const parts = newTime.split("-").map((s) => s.trim());
      if (parts.length < 2 || !parts[0] || !parts[1]) {
        toast.error("Vui lòng chọn đầy đủ giờ bắt đầu và giờ kết thúc mới.");
        return;
      }
      if (parts[0] >= parts[1]) {
        toast.error("Giờ kết thúc phải sau giờ bắt đầu.");
        return;
      }
      if (conflictResult.hasConflict) {
        toast.error(conflictResult.warningMessage || "Khung giờ mới bị trùng với lịch dạy khác của bạn.");
        return;
      }
    }

    setSubmitting(true);
    const timeStr = currentSession
      ? `${currentSession.date} (${currentSession.startTime} - ${currentSession.endTime})`
      : "";
    try {
      await onSubmit({
        sessionId: selectedSessionId,
        className: currentSession?.className || "Lớp học",
        sessionTime: timeStr,
        sport: currentSession?.sport || "",
        room: currentSession?.room || "",
        requestType,
        substituteCoachId: substituteCoachId || undefined,
        substituteCoachName,
        newDate,
        newTime,
        reason,
      });
      setReason("");
      setSubstituteCoachId("");
      setSubstituteCoachName("");
      setNewDate("");
      setNewTime("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Gửi yêu cầu điều chỉnh ca dạy
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
            {/* 1. Session Picker */}
            <RequestSessionPicker
              sessions={upcomingSessions}
              selectedSessionId={selectedSessionId}
              onSelectSessionId={setSelectedSessionId}
            />

            {/* 2. Request Type Buttons */}
            <RequestTypePicker
              requestType={requestType}
              onRequestTypeChange={setRequestType}
            />

            {/* 3. Adjustment Fields (Date/Time, Conflict Warning, Substitute Coach, Reason) */}
            <RequestAdjustmentFields
              requestType={requestType}
              newDate={newDate}
              onNewDateChange={setNewDate}
              newTime={newTime}
              onNewTimeChange={setNewTime}
              conflictWarning={conflictResult.warningMessage}
              substituteCoachId={substituteCoachId}
              onSubstituteCoachChange={(id, name) => {
                setSubstituteCoachId(id);
                setSubstituteCoachName(name);
              }}
              filteredCoaches={filteredCoaches}
              loadingCoaches={loadingCoaches}
              reason={reason}
              onReasonChange={setReason}
            />
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || upcomingSessions.length === 0 || conflictResult.hasConflict}
              title={conflictResult.hasConflict ? "Vui lòng chọn khung giờ không bị trùng lịch trước khi gửi" : undefined}
              className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
