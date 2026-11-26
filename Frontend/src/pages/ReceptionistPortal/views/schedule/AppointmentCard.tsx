import React from "react";
import {
  User,
  Copy,
  Check,
  Dumbbell,
  Phone,
  CheckCircle2,
  RotateCcw,
  X,
  Trash2,
} from "lucide-react";
import type { Appointment, Member } from "./types";
import {
  getServiceTag,
  getTodayIso,
  getTomorrowIso,
  parseCustomerInfo,
} from "./constants";

interface Props {
  slot: Appointment;
  members: Member[];
  updatingId: string | null;
  deletingId: string | null;
  copiedPhone: string | null;
  onCopyPhone: (phone: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export const AppointmentCard: React.FC<Props> = ({
  slot,
  members,
  updatingId,
  deletingId,
  copiedPhone,
  onCopyPhone,
  onUpdateStatus,
  onDelete,
}) => {
  const customer = parseCustomerInfo(slot.customerName, members);
  const tag = getServiceTag(slot.title);
  const isWaiting = slot.status === "Đang chờ khách";
  const isCompleted = slot.status === "Đã hoàn tất";
  const isCancelled = slot.status === "Đã hủy";

  const getDateBadgeLabel = () => {
    const todayIso = getTodayIso();
    const tomorrowIso = getTomorrowIso();
    if (!slot.date || slot.date === todayIso) return "Hôm nay";
    if (slot.date === tomorrowIso) return "Ngày mai";
    const parts = slot.date.split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : slot.date;
  };

  const customerInitial = (customer.name || "K").trim().charAt(0).toUpperCase();

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-150 hover:shadow-xs p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isWaiting
          ? "border-slate-200/90 hover:border-emerald-300"
          : isCompleted
          ? "border-emerald-200/80 bg-emerald-50/15"
          : "border-slate-200/70 bg-slate-50/40 opacity-80"
      }`}
    >
      {/* Left: Time + Main Info */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Modern Time & Date Badge */}
        <div
          className={`flex flex-col items-center justify-center w-14 py-1.5 px-1 rounded-xl text-xs font-bold shrink-0 text-center transition-colors ${
            isWaiting
              ? "bg-emerald-50 border border-emerald-200/90 text-emerald-800 shadow-2xs"
              : isCompleted
              ? "bg-slate-100 border border-slate-200 text-slate-700"
              : "bg-slate-100 border border-dashed border-slate-200 text-slate-400"
          }`}
        >
          <span className="font-extrabold tracking-tight">{slot.time}</span>
          <span
            className={`text-[9px] font-semibold mt-0.5 ${
              isWaiting
                ? "text-emerald-700 font-bold"
                : isCompleted
                ? "text-slate-500"
                : "text-slate-400"
            }`}
          >
            {getDateBadgeLabel()}
          </span>
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          {/* Title & Service Tag */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-xs text-slate-900 truncate">
              {slot.title}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${tag.bg} shrink-0`}
            >
              {tag.label}
            </span>
          </div>

          {/* Customer & Coach row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5 text-[11px] text-slate-600">
            {/* Customer with initials avatar */}
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px] flex items-center justify-center shrink-0">
                {customerInitial}
              </div>
              <span className="font-semibold text-slate-800">{customer.name}</span>
              {customer.phone && (
                <span className="text-slate-500 flex items-center gap-1">
                  <span>• {customer.phone}</span>
                  <button
                    type="button"
                    onClick={() => onCopyPhone(customer.phone)}
                    className="text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                    title="Sao chép SĐT"
                  >
                    {copiedPhone === customer.phone ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </span>
              )}
            </div>

            {/* Coach */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/70 text-slate-600">
              <Dumbbell className="w-3 h-3 text-emerald-600" />
              <span>
                HLV:{" "}
                <strong className="text-slate-800 font-semibold">
                  {slot.coachName || "Chưa gán"}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Status & Quick Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
        {isWaiting && (
          <>
            {customer.phone && (
              <a
                href={`tel:${customer.phone}`}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition cursor-pointer"
                title="Gọi nhắc trước 30 phút"
              >
                <Phone className="w-3 h-3 text-slate-600" />
                <span className="hidden sm:inline">Gọi</span>
              </a>
            )}
            <button
              disabled={updatingId === slot.id}
              onClick={() => onUpdateStatus(slot.id, "Đã hoàn tất")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Khách đến</span>
            </button>
            <button
              type="button"
              disabled={updatingId === slot.id}
              onClick={() => onUpdateStatus(slot.id, "Đã hủy")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Hủy lịch hẹn"
            >
              <X className="w-3.5 h-3.5" />
              <span>Hủy lịch</span>
            </button>
          </>
        )}

        {isCompleted && (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/90 flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đã tiếp đón</span>
            </span>
            <button
              type="button"
              disabled={updatingId === slot.id}
              onClick={() => onUpdateStatus(slot.id, "Đang chờ khách")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200 rounded-lg shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3 h-3" />
              Hoàn tác
            </button>
          </div>
        )}

        {isCancelled && (
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
              Đã hủy
            </span>
            <button
              disabled={updatingId === slot.id}
              onClick={() => onUpdateStatus(slot.id, "Đang chờ khách")}
              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 rounded-md border border-emerald-200 transition cursor-pointer"
            >
              Khôi phục
            </button>
            <button
              disabled={deletingId === slot.id}
              onClick={() => onDelete(slot.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition cursor-pointer"
              title="Xóa vĩnh viễn"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
