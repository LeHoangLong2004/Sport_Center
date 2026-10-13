import { createPortal } from "react-dom";
import { User, X, MessageSquare } from "lucide-react";
import type { CoachScreen } from "../../types";
import type { UnifiedScheduleItem } from "./types";

interface Props {
  session: UnifiedScheduleItem | null;
  onClose: () => void;
  onRequestReschedule: (sessionId: string) => void;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string; memberId?: string }) => void;
}

export default function PtSessionDetailModal({
  session,
  onClose,
  onRequestReschedule,
  navigateTo,
}: Props) {
  if (!session) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Chi tiết buổi tập PT 1–1
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kèm riêng hội viên cá nhân
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 text-xs">
          {/* Member Card */}
          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 dark:text-amber-400 block mb-0.5">
                Học viên kèm riêng
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {session.memberName || "Hội viên cá nhân"}
              </h4>
              {session.memberPhone && (
                <p className="text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 font-medium">
                  SĐT: {session.memberPhone}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                PT 1-1
              </span>
              {session.memberId ? (
                <button
                  type="button"
                  onClick={() => {
                    const mId = session.memberId;
                    onClose();
                    navigateTo("member-profile", { memberId: mId });
                  }}
                  className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  Hồ sơ chi tiết →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigateTo("members");
                  }}
                  className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  Danh sách HV →
                </button>
              )}
            </div>
          </div>

          {/* Session Info Grid */}
          <div className="space-y-2.5 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Bộ môn:</span>
              <span className="font-bold text-slate-900 dark:text-white">{session.sport}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Ngày tập:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{session.date}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Khung giờ:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {session.startTime} – {session.endTime}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Phòng / Địa điểm:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{session.room}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Trạng thái:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                {session.status}
              </span>
            </div>
            {session.goal && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 font-medium block mb-1">Mục tiêu huấn luyện:</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  🎯 {session.goal}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
          <button
            type="button"
            onClick={() => {
              const sid = session.id;
              onClose();
              onRequestReschedule(sid);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Yêu cầu dời ca
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigateTo("chat");
              }}
              className="px-3.5 py-2 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Nhắn tin
            </button>

            <button
              type="button"
              onClick={() => {
                if (session.memberId) {
                  const mId = session.memberId;
                  onClose();
                  navigateTo("member-profile", { memberId: mId });
                } else {
                  onClose();
                  navigateTo("members");
                }
              }}
              className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm transition-colors text-xs flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              Xem hồ sơ
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
