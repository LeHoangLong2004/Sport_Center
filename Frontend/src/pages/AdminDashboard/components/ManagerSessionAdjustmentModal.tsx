import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { X } from "lucide-react";
import { isCoachQualifiedForSport } from "../../../utils/coachQualification";

type AdjustmentAction = "reschedule" | "substitute";

interface Props {
  classDetail: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface CoachOption {
  id: string;
  fullName: string;
  specialty?: string;
}

function toLocalInput(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function ManagerSessionAdjustmentModal({ classDetail, onClose, onSuccess }: Props) {
  const [action, setAction] = useState<AdjustmentAction>("reschedule");
  const [newScheduleTime, setNewScheduleTime] = useState(() => toLocalInput(classDetail.scheduleTime));
  const [substituteCoachId, setSubstituteCoachId] = useState("");
  const [reason, setReason] = useState("");
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (action !== "substitute") return;
    const token = localStorage.getItem("token");
    setLoadingCoaches(true);
    fetch("/api/coaches", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(async (response) => {
        if (!response.ok) throw new Error("Không tải được danh sách HLV.");
        return response.json();
      })
      .then((data) => setCoaches(Array.isArray(data) ? data : []))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Không tải được danh sách HLV."))
      .finally(() => setLoadingCoaches(false));
  }, [action]);

  const eligibleCoaches = useMemo(
    () => coaches.filter((coach) =>
      coach.id && coach.id !== classDetail.coachId &&
      isCoachQualifiedForSport(coach.specialty, classDetail.sportName || classDetail.sport, classDetail.className),
    ),
    [coaches, classDetail.coachId, classDetail.sportName, classDetail.sport, classDetail.className],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do điều chỉnh.");
      return;
    }
    if (action === "reschedule" && !newScheduleTime) {
      toast.error("Vui lòng chọn ngày và giờ mới.");
      return;
    }
    if (action === "substitute" && !substituteCoachId) {
      toast.error("Vui lòng chọn HLV dạy thay.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/classes/${classDetail.id}/manager-adjustment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action,
          newScheduleTime: action === "reschedule" ? new Date(newScheduleTime).toISOString() : null,
          substituteCoachId: action === "substitute" ? substituteCoachId : null,
          reason: reason.trim(),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Không thể điều chỉnh buổi học.");
      toast.success(result.message || "Đã điều chỉnh buổi học.");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể điều chỉnh buổi học.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10010] flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="manager-adjustment-title">
      <form onSubmit={handleSubmit} className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <h3 id="manager-adjustment-title" className="font-bold text-slate-900 dark:text-white">Điều chỉnh buổi học</h3>
            <p className="mt-1 text-xs text-slate-500">Chỉ tác động đến buổi này, không đổi các buổi còn lại trong khóa.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Đóng"><X className="size-5" /></button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">
            <div className="font-semibold text-slate-900 dark:text-white">{classDetail.className}</div>
            <div className="mt-1 text-xs text-slate-500">{new Date(classDetail.scheduleTime).toLocaleString("vi-VN")} · {classDetail.coachName || "Chưa có HLV"}</div>
          </div>

          <fieldset className="grid grid-cols-2 gap-2">
            <legend className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Thao tác của Manager</legend>
            {([ ["reschedule", "Dời lịch buổi"], ["substitute", "Phân công dạy thay"] ] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => { setAction(value); setSubstituteCoachId(""); }} className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${action === value ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300" : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}>
                {label}
              </button>
            ))}
          </fieldset>

          {action === "reschedule" ? (
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ngày và giờ mới <span className="text-rose-500">*</span>
              <input required type="datetime-local" min={toLocalInput(new Date())} value={newScheduleTime} onChange={(event) => setNewScheduleTime(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            </label>
          ) : (
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              HLV dạy thay <span className="text-rose-500">*</span>
              <select required value={substituteCoachId} onChange={(event) => setSubstituteCoachId(event.target.value)} disabled={loadingCoaches} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                <option value="">{loadingCoaches ? "Đang tải HLV phù hợp bộ môn..." : "Chọn HLV dạy thay"}</option>
                {eligibleCoaches.map((coach) => <option key={coach.id} value={coach.id}>{coach.fullName}{coach.specialty ? ` · ${coach.specialty}` : ""}</option>)}
              </select>
              {!loadingCoaches && eligibleCoaches.length === 0 && (
                <span className="mt-1 block font-normal text-amber-700 dark:text-amber-400">Chưa có HLV nào được khai báo phụ trách bộ môn {classDetail.sportName || classDetail.sport || "này"}.</span>
              )}
            </label>
          )}

          {action === "substitute" && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              HLV được chọn sẽ nhận lời mời và cần xác nhận. Lịch chỉ đổi sau khi HLV chấp nhận.
            </p>
          )}

          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Lý do <span className="text-rose-500">*</span>
            <textarea required rows={3} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Nhập lý do để học viên nắm được thay đổi..." className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </label>
          <p className="text-xs leading-5 text-slate-500">
            {action === "substitute"
              ? "HLV dạy thay cần xác nhận trước khi lịch được cập nhật; hệ thống sẽ kiểm tra trùng lịch khi HLV phản hồi."
              : "Sau khi lưu, học viên đã đặt buổi này sẽ nhận được thông báo. Hệ thống sẽ kiểm tra trùng lịch trước khi cập nhật."}
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-850">
          <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800">Hủy</button>
          <button type="submit" disabled={submitting || (action === "substitute" && (loadingCoaches || eligibleCoaches.length === 0))} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{submitting ? "Đang lưu..." : "Lưu điều chỉnh"}</button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
