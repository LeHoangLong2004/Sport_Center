import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CalendarDays, Clock3, Trash2, X } from "lucide-react";
import type { Appointment } from "./types";

interface Props {
  appointment: Appointment | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAppointmentModal({ appointment, isDeleting, onClose, onConfirm }: Props) {
  React.useEffect(() => {
    if (!appointment) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [appointment, isDeleting, onClose]);

  if (!appointment) return null;

  const displayDate = appointment.date
    ? appointment.date.split("-").reverse().join("/")
    : "Chưa có ngày";

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onClose();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-appointment-title"
        aria-describedby="delete-appointment-description"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="delete-appointment-title" className="text-base font-bold text-slate-900">
              Xóa lịch hẹn?
            </h2>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-600">
              {appointment.title || "Lịch hẹn PT"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Đóng hộp thoại"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="px-5 py-4">
          <p id="delete-appointment-description" className="text-sm leading-6 text-slate-600">
            Lịch hẹn này sẽ bị xóa khỏi danh sách và không thể khôi phục.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5 text-slate-400" />{displayDate}</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5 text-slate-400" />{appointment.time} · {appointment.durationMinutes || 60} phút</span>
            {appointment.location && <span className="w-full truncate">{appointment.location}</span>}
            <span className="w-full truncate font-medium text-slate-700">{appointment.customerName}</span>
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Giữ lại
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-wait disabled:opacity-60"
          >
            <Trash2 className="size-4" />
            {isDeleting ? "Đang xóa…" : "Xóa lịch hẹn"}
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
}
