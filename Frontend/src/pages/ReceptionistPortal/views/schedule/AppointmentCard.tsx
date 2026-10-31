import React from "react";
import {
  User,
  Copy,
  Check,
  Dumbbell,
  Phone,
  CheckCircle2,
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

  return (
    <div
      className={`bg-white rounded-lg border transition-all duration-150 hover:shadow-xs p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
        isWaiting
          ? "border-amber-300 bg-white"
          : isCompleted
          ? "border-emerald-200 bg-emerald-50/20"
          : "border-slate-200 opacity-75 bg-slate-50/40"
      }`}
    >
      {/* Left: Time + Main Info */}
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        {/* Compact Time & Date Badge */}
        <div className="flex flex-col items-center justify-center w-14 py-1 px-1 bg-slate-900 text-white rounded font-mono text-xs font-bold shrink-0 text-center">
          <span>{slot.time}</span>
          <span className="text-[9px] text-slate-300 font-sans font-medium">
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
              className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${tag.bg} shrink-0`}
            >
              {tag.label}
            </span>
          </div>

          {/* Customer & Coach row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-600">
            {/* Customer */}
            <div className="flex items-center gap-1 font-medium text-slate-800">
              <User className="w-3 h-3 text-slate-400" />
              <span>{customer.name}</span>
              {customer.phone && (
                <span className="text-slate-500 flex items-center gap-1">
                  <span>• {customer.phone}</span>
                  <button
                    type="button"
                    onClick={() => onCopyPhone(customer.phone)}
                    className="text-slate-400 hover:text-purple-600 transition cursor-pointer"
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
            <div className="flex items-center gap-1 text-slate-500">
              <Dumbbell className="w-3 h-3 text-amber-600" />
              <span>
                HLV:{" "}
                <strong className="text-slate-700">
                  {slot.coachName || "Chưa gán"}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Status & Quick Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
        {isWaiting && (
          <>
            {customer.phone && (
              <a
                href={`tel:${customer.phone}`}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition cursor-pointer"
                title="Gọi nhắc trước 30 phút"
              >
                <Phone className="w-3 h-3 text-purple-600" />
                <span className="hidden sm:inline">Gọi</span>
              </a>
            )}
            <button
              disabled={updatingId === slot.id}
              onClick={() => onUpdateStatus(slot.id, "Đã hoàn tất")}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Khách đến</span>
            </button>
            <button
              disabled={updatingId === slot.id}
              onClick={() => onUpdateStatus(slot.id, "Đã hủy")}
              className="p-1 text-rose-500 hover:bg-rose-50 rounded transition cursor-pointer"
              title="Hủy lịch hẹn"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {isCompleted && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Đã tiếp đón</span>
            </span>
            <button
              disabled={updatingId === slot.id}
              onClick={() => onUpdateStatus(slot.id, "Đang chờ khách")}
              className="text-[10px] text-slate-400 hover:text-slate-700 underline cursor-pointer"
            >
              Hoàn tác
            </button>
          </div>
        )}

        {isCancelled && (
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-600">
              Đã hủy
            </span>
            <button
              disabled={updatingId === slot.id}
              onClick={() => onUpdateStatus(slot.id, "Đang chờ khách")}
              className="px-2 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition cursor-pointer"
            >
              Khôi phục
            </button>
            <button
              disabled={deletingId === slot.id}
              onClick={() => onDelete(slot.id)}
              className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
              title="Xóa vĩnh viễn"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
