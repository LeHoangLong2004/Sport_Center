import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { UnifiedScheduleItem } from "./types";
import { CoachAPI } from "../../services/api";
import { DateInput } from "../../../../components/DateInput";

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
    requestType: "dời lịch" | "dạy thay" | "báo vắng";
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

function parseSessionStartDateTime(dateStr?: string, startTimeStr?: string): Date | null {
  if (!dateStr) return null;
  const cleanDate = dateStr.slice(0, 10);
  const parts = cleanDate.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [y, m, d] = parts;

  let hour = 0;
  let minute = 0;
  if (startTimeStr) {
    const timeParts = startTimeStr.split(":");
    if (timeParts.length >= 2) {
      hour = Number(timeParts[0]) || 0;
      minute = Number(timeParts[1]) || 0;
    }
  }

  return new Date(y, m - 1, d, hour, minute, 0, 0);
}

function isSessionInFuture(dateStr?: string, startTimeStr?: string): boolean {
  const dt = parseSessionStartDateTime(dateStr, startTimeStr);
  if (!dt) return false;
  return dt.getTime() > Date.now();
}

export default function ScheduleRequestModal({
  isOpen,
  onClose,
  sessions,
  initialSessionId,
  onSubmit,
}: Props) {
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [requestType, setRequestType] = useState<"dời lịch" | "dạy thay" | "báo vắng">("dời lịch");
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
      .then((data) => {
        setAvailableCoaches(data);
      })
      .catch((err) => {
        console.error("Lỗi nạp danh sách huấn luyện viên:", err);
      })
      .finally(() => {
        setLoadingCoaches(false);
      });
  }, [isOpen]);

  const currentSession = useMemo(
    () => upcomingSessions.find((s) => s.id === selectedSessionId) || sessions.find((s) => s.id === selectedSessionId),
    [upcomingSessions, sessions, selectedSessionId],
  );

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
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Chọn ca dạy cần điều chỉnh: <span className="text-rose-500">*</span>
              </label>
              {upcomingSessions.length === 0 ? (
                <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs">
                  Không có ca dạy nào sắp diễn ra trong tương lai để điều chỉnh. Các ca dạy trong quá khứ đã kết thúc nên không thể dời lịch, dạy thay hoặc báo vắng.
                </div>
              ) : (
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {upcomingSessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.date} ({s.startTime} - {s.endTime}) • {s.className}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Loại yêu cầu:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["dời lịch", "dạy thay", "báo vắng"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setRequestType(t)}
                    className={`p-2.5 rounded-lg border text-center font-semibold capitalize transition-all ${
                      requestType === t
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>


            {requestType === "dời lịch" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Ngày mới đề xuất:
                  </label>
                  <DateInput
                    value={newDate}
                    onChange={setNewDate}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Khung giờ mới:
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 08:00 - 09:30"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Lý do cụ thể: <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Điền lý do cụ thể gửi tới ban quản lý..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || upcomingSessions.length === 0}
              className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
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
