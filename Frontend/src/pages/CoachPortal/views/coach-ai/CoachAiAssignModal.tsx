import React, { useState } from "react";
import { X, Send, Calendar, FileText, CheckCircle2 } from "lucide-react";
import type { Flow5WorkoutPlan, Flow5Target, MockMember, CoachClassOverview } from "../../services/api";

interface CoachAiAssignModalProps {
  plan: Flow5WorkoutPlan;
  target: Flow5Target;
  members: MockMember[];
  classes: CoachClassOverview[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dueDate: string, notes: string) => Promise<void>;
}

export const CoachAiAssignModal: React.FC<CoachAiAssignModalProps> = ({
  plan,
  target,
  members,
  classes,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [dueDate, setDueDate] = useState<string>(() => {
    // Default to 7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState<string>("Vui lòng khởi động kỹ và hoàn thành đúng tiến độ.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const targetType = target?.type || "member";
  const targetId = target?.id;
  const targetName =
    targetType === "member"
      ? members.find((m) => m.id === targetId)?.name || "Học viên được chọn"
      : classes.find((c) => c.id === targetId)?.className || "Lớp học được chọn";

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(dueDate, notes);
      onClose();
    } catch {
      // Handled by parent notification
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 cursor-default">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Giao bài tập cho học viên (Flow 5)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Giao danh sách bài tập đã duyệt cho học viên tự luyện tập
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Target Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 flex flex-col gap-1.5">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Bài tập: <strong className="text-slate-800 dark:text-slate-200">{plan.planName}</strong>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Đối tượng nhận:{" "}
              <span className="font-bold text-orange-600 dark:text-orange-400">
                {target.type === "member" ? "Học viên" : "Lớp"}: {targetName}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              {plan.exercises.length} bài tập · Thời lượng {plan.durationMinutes || 60} phút
            </div>
          </div>

          {/* Due Date Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-500" />
              <span>Hạn hoàn thành (Due Date)</span>
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Notes Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>Lời dặn dò của HLV</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Nhớ khởi động khớp gối và cổ tay 5 phút trước khi bắt đầu..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all shadow-md shadow-orange-500/25 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Đang giao bài..." : "Xác nhận giao bài tập"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
