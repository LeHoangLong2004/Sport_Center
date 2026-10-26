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

  useEffect(() => {
    if (initialSessionId) {
      setSelectedSessionId(initialSessionId);
    } else if (sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [initialSessionId, sessions]);

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
    () => sessions.find((s) => s.id === selectedSessionId),
    [sessions, selectedSessionId],
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
    if (requestType === "dạy thay" && !substituteCoachId) {
      toast.error("Vui lòng chọn một Huấn luyện viên thay thế từ danh sách.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        sessionId: selectedSessionId,
        className: currentSession?.className || "Lớp học",
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
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.date} ({s.startTime} - {s.endTime}) • {s.className}
                  </option>
                ))}
              </select>
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

            {requestType === "dạy thay" && (
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Huấn luyện viên thay thế đề xuất: <span className="text-rose-500">*</span>
                </label>
                {loadingCoaches ? (
                  <div className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                    <span>Đang nạp danh sách huấn luyện viên từ hệ thống...</span>
                  </div>
                ) : (
                  <select
                    value={substituteCoachId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSubstituteCoachId(id);
                      const selected = filteredCoaches.find((c) => c.id === id);
                      setSubstituteCoachName(selected?.fullName || "");
                    }}
                    required
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                  >
                    <option value="">-- Chọn Huấn luyện viên thay thế --</option>
                    {filteredCoaches.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} {c.specialty ? `• ${c.specialty}` : ""}
                      </option>
                    ))}
                  </select>
                )}
                {filteredCoaches.length === 0 && !loadingCoaches && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    Không tìm thấy huấn luyện viên thay thế khác khả dụng trong hệ thống.
                  </p>
                )}
              </div>
            )}

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
              disabled={submitting}
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
