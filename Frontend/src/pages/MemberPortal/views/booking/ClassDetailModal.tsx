import React from "react";
import { createPortal } from "react-dom";
import { X, Award, Star, MessageCircle, ShieldCheck, Check, CreditCard } from "lucide-react";
import { CoachAvatar } from "../../utils/coachAvatar";

interface ClassDetailModalProps {
  classDetail: any | null;
  onClose: () => void;
  isBooked: boolean;
  onInitiateBook: (cls: any) => void;
  onStartChatWithCoach: (coachName: string, coachId?: string, coachAvatar?: string) => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  classDetail,
  onClose,
  isBooked,
  onInitiateBook,
  onStartChatWithCoach
}) => {
  if (!classDetail) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Chi tiết lớp học • {classDetail.sport}
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {classDetail.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300">
          <p className="leading-relaxed text-slate-600 dark:text-slate-300">
            {classDetail.description}
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Thời gian:</span>
              <strong className="text-slate-900 dark:text-white">
                {classDetail.startTime} - {classDetail.endTime} (Ngày {classDetail.dateStr || "Hôm nay"})
              </strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Địa điểm:</span>
              <strong className="text-slate-900 dark:text-white">{classDetail.room}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Sĩ số lớp:</span>
              <strong>{classDetail.registeredCount}/{classDetail.capacity} người</strong>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 font-semibold">Mức phí áp dụng:</span>
              <strong className="text-teal-700 dark:text-teal-300 font-black text-sm">
                Giá gốc: {classDetail.price ? `${classDetail.price.toLocaleString("vi-VN")} đ` : "150.000 đ"}
              </strong>
            </div>
          </div>

          {/* Coach Profile */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50/50 dark:from-slate-800 dark:to-slate-850 border border-teal-200 dark:border-teal-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1">
                <Award className="w-4 h-4 text-teal-600" /> Huấn luyện viên phụ trách
              </span>
              <span className="flex items-center gap-1 text-xs font-black text-amber-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-teal-100">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {classDetail.coachRating ?? "—"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <CoachAvatar
                src={classDetail.coachAvatar}
                name={classDetail.coachName}
                className="w-14 h-14 rounded-full border-2 border-teal-500 shadow-sm shrink-0"
              />
              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {classDetail.coachName}
                </h4>
                <p className="text-xs font-bold text-teal-700 dark:text-teal-400">
                  {classDetail.coachSpecialty}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Kinh nghiệm: {classDetail.coachExperienceYears || 5}+ năm • ĐT: {classDetail.coachPhone}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 italic pt-2.5 border-t border-teal-200/60 dark:border-slate-700">
              "{classDetail.coachBio}"
            </p>

            <button
              type="button"
              onClick={() =>
                onStartChatWithCoach(
                  classDetail.coachName,
                  classDetail.coachId,
                  classDetail.coachAvatar
                )
              }
              className="mt-3 w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 font-bold text-xs hover:bg-teal-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Nhắn tin hỏi đáp với HLV</span>
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Chính sách linh hoạt:
            </p>
            <p className="text-[11px] mt-1 leading-relaxed text-blue-800 dark:text-blue-300">
              Hội viên ở mọi gói (kể cả Hạng Cơ bản) đều được đặt lịch. Nếu là thành viên Cơ bản, bạn chỉ cần thanh toán đúng giá gốc của lớp học mà không phải trả thêm phí thường niên.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-850">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={isBooked}
            onClick={() => onInitiateBook(classDetail)}
            className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
              isBooked
                ? "cursor-not-allowed bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-white bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 active:scale-95"
            }`}
          >
            {isBooked ? (
              <>
                <Check className="w-4 h-4" /> Đã đăng ký lớp này
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" /> Đặt lịch & Thanh toán giá gốc
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
