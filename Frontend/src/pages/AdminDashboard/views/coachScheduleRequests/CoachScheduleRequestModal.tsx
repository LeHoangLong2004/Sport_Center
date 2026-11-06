import React from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calendar,
  Clock,
  User,
  Check,
  UserCheck,
  Sparkles,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import type { CoachScheduleRequest } from "../useCoachScheduleRequests";
import { CandidateCoach, ParsedTimeWindow, statusConfig, isSubstituteRequest } from "./types";

interface Props {
  selectedRequest: CoachScheduleRequest;
  submitting: boolean;
  shiftTimeWindow: ParsedTimeWindow | null;
  freeCoaches: CandidateCoach[];
  selectedSubstitute: CandidateCoach | null;
  modalSubstituteId: string;
  modalManagerNote: string;
  setModalSubstituteId: (id: string) => void;
  setModalManagerNote: (note: string) => void;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function CoachScheduleRequestModal({
  selectedRequest,
  submitting,
  shiftTimeWindow,
  freeCoaches,
  selectedSubstitute,
  modalSubstituteId,
  modalManagerNote,
  setModalSubstituteId,
  setModalManagerNote,
  onClose,
  onApprove,
  onReject,
}: Props) {
  const isPending =
    selectedRequest.status.toLowerCase() === "pending" ||
    selectedRequest.status.toLowerCase() === "substitute_accepted";
  const isSub = isSubstituteRequest(selectedRequest.requestType);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Chi tiết yêu cầu điều chỉnh ca dạy
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Gửi lúc: {selectedRequest.createdAt}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 text-xs">
          {/* 1. Thẻ thông tin ca dạy */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {selectedRequest.className}
                </span>
                {selectedRequest.sportName && (
                  <span className="rounded-md bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[11px] font-semibold">
                    {selectedRequest.sportName}
                  </span>
                )}
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                  statusConfig[selectedRequest.status.toLowerCase()]?.bg || "bg-slate-100"
                } ${statusConfig[selectedRequest.status.toLowerCase()]?.text || "text-slate-700"} ${
                  statusConfig[selectedRequest.status.toLowerCase()]?.border || "border-slate-200"
                }`}
              >
                {statusConfig[selectedRequest.status.toLowerCase()]?.label || selectedRequest.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-400 block">Thời gian ca dạy:</span>
                  <strong className="text-indigo-900 font-semibold">
                    {selectedRequest.sessionTime || selectedRequest.scheduleTime || "Chưa xác định"}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-400 block">Huấn luyện viên phụ trách:</span>
                  <strong className="text-slate-900 font-semibold">
                    {selectedRequest.coachName}
                  </strong>
                </div>
              </div>

              {selectedRequest.roomName && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Phòng / Khu vực:</span>
                    <strong className="text-slate-900 font-semibold">
                      {selectedRequest.roomName}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {selectedRequest.newDate && (
              <div className="rounded-lg bg-white/80 border border-indigo-100 p-2.5 flex items-center gap-2 text-indigo-900">
                <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Thời gian đề xuất dời: <strong>{selectedRequest.newDate} {selectedRequest.newTime}</strong>
                </span>
              </div>
            )}

            {selectedRequest.substituteCoachName && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 flex items-center gap-2 text-emerald-900">
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Huấn luyện viên dạy thay: <strong>{selectedRequest.substituteCoachName}</strong>
                </span>
              </div>
            )}
          </div>

          {/* 2. Lý do từ Coach */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <span>Lý do từ Huấn luyện viên:</span>
            </label>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 italic text-xs leading-relaxed">
              &ldquo;{selectedRequest.reason}&rdquo;
            </div>
          </div>

          {/* 3. Phản hồi trước đó của Quản lý nếu đã xử lý */}
          {selectedRequest.managerNote && !isSub && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 text-xs">Ghi chú từ Quản lý:</label>
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs">
                {selectedRequest.managerNote}
              </div>
            </div>
          )}

          {/* 4. KHU VỰC QUẢN LÝ DUYỆT / CHỈ ĐỊNH (Khi đang chờ duyệt) */}
          {isPending && (
            <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
              {/* Nếu là yêu cầu Dạy Thay -> Hiển thị hộp chọn HLV thay thế */}
              {isSub && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-700 shrink-0" />
                    <label className="font-bold text-slate-800 text-xs">
                      Chỉ định Huấn luyện viên dạy thay <span className="text-rose-500">*</span>
                    </label>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    Hệ thống lọc các Huấn luyện viên rảnh lịch trong khung giờ{" "}
                    <strong className="text-slate-800">
                      {shiftTimeWindow
                        ? `${shiftTimeWindow.date} (${shiftTimeWindow.formattedTime})`
                        : selectedRequest.sessionTime || selectedRequest.scheduleTime}
                    </strong>:
                  </p>

                  <select
                    value={modalSubstituteId}
                    onChange={(e) => setModalSubstituteId(e.target.value)}
                    disabled={submitting}
                    className="w-full mt-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">-- Chọn Huấn luyện viên tiếp nhận ca dạy --</option>
                    {freeCoaches.length === 0 ? (
                      <option value="" disabled>
                        -- Không có Huấn luyện viên nào rảnh lịch vào khung giờ này --
                      </option>
                    ) : (
                      freeCoaches.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.fullName} {c.specialty ? `— ${c.specialty}` : ""}
                        </option>
                      ))
                    )}
                  </select>

                  {/* Thông tin xác nhận khi đã chọn */}
                  {selectedSubstitute && (
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Đã chọn: <strong className="font-semibold text-slate-900">{selectedSubstitute.fullName}</strong>
                        {selectedSubstitute.specialty ? ` — ${selectedSubstitute.specialty}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Ô ghi chú phản hồi */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-xs">
                  Ghi chú gửi lại cho Coach (không bắt buộc):
                </label>
                <textarea
                  rows={2}
                  value={modalManagerNote}
                  onChange={(e) => setModalManagerNote(e.target.value)}
                  placeholder="Nhập lời nhắn hoặc lý do nếu từ chối..."
                  disabled={submitting}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/80 flex items-center justify-end gap-2.5 shrink-0">
          {isPending ? (
            <>
              <button
                type="button"
                disabled={submitting}
                onClick={onReject}
                className="px-4 py-2 rounded-lg border border-rose-200 text-rose-700 font-semibold hover:bg-rose-50 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Đang xử lý..." : "Từ chối yêu cầu"}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={onApprove}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>{submitting ? "Đang xử lý..." : "Duyệt yêu cầu"}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
