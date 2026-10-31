import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Check,
  Star,
  CreditCard,
  AlertCircle,
  LoaderCircle
} from "lucide-react";
import { CoachAvatar } from "../../utils/coachAvatar";
import type { MemberSessionItem } from "../../types";

interface GroupClassesTabProps {
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  classes: any[];
  mySessions: MemberSessionItem[];
  onRetry: () => void;
  onOpenDetail: (cls: any) => void;
  onInitiateBook: (cls: any) => void;
  onCancelBooking: (target: { classId: string; className: string }) => void;
  findActiveBooking: (classId: string, dateStr?: string) => MemberSessionItem | undefined;
  getBookingStatus: (session: MemberSessionItem) => string;
  isInactiveBookingStatus: (status: string) => boolean;
}

export const GroupClassesTab: React.FC<GroupClassesTabProps> = ({
  loading,
  error,
  refreshing,
  classes,
  mySessions,
  onRetry,
  onOpenDetail,
  onInitiateBook,
  onCancelBooking,
  findActiveBooking,
  getBookingStatus,
  isInactiveBookingStatus
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-16 rounded-3xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-3">
        <LoaderCircle className="w-8 h-8 animate-spin text-teal-600" />
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Đang tải lịch lớp học của toàn bộ Huấn luyện viên...
        </h4>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/30 p-8 rounded-2xl border border-rose-200 dark:border-rose-800 text-center">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">Không thể tải lịch học</h4>
        <p className="text-xs text-rose-600/80 dark:text-rose-300/80 mt-1">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
        >
          Thử tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {refreshing && (
        <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-300">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <span>Đang đồng bộ trạng thái đặt lớp...</span>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity ${refreshing ? "opacity-70" : ""}`}>
        {classes.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Không có lớp học phù hợp với bộ lọc
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Vui lòng thử chọn Huấn luyện viên khác, bộ môn hoặc ngày học khác.
            </p>
          </div>
        ) : (
          classes.map((item) => {
            const bookedSession = findActiveBooking(item.id, item.dateStr);
            const booked = Boolean(bookedSession);
            const isFull = item.registeredCount >= item.capacity;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-teal-500/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800">
                      {item.sport} • {item.level}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {item.price ? `${item.price.toLocaleString("vi-VN")} đ` : "150.000 đ"}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {item.name}
                  </h3>

                  {booked && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <Check className="w-3 h-3" /> Đã đăng ký lớp này
                    </span>
                  )}

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Coach mini profile */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CoachAvatar
                        src={item.coachAvatar}
                        name={item.coachName}
                        className="w-10 h-10 rounded-full border-2 border-teal-500 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                          {item.coachName}
                        </p>
                        <p className="text-[10px] font-medium text-teal-600 dark:text-teal-400 line-clamp-1">
                          {item.coachSpecialty}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800 shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{item.coachRating ?? "—"}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5" /> Khung giờ:
                      </span>
                      <span className="font-bold text-teal-700 dark:text-teal-300">
                        {item.startTime} - {item.endTime} ({item.dateStr || "Hôm nay"})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" /> Địa điểm:
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.room}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Users className="w-3.5 h-3.5" /> Chỗ trống:
                      </span>
                      <span className={`font-bold ${isFull ? "text-rose-600" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {isFull ? "Đã hết chỗ" : `Còn ${item.capacity - item.registeredCount} / ${item.capacity} chỗ`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenDetail(item)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                  >
                    Xem chi tiết
                  </button>

                  {booked ? (
                    <button
                      type="button"
                      onClick={() => {
                        const s = mySessions.find(
                          (x) =>
                            String((x as any).classId ?? x.id).toLowerCase() === String(item.id).toLowerCase() &&
                            x.date === item.dateStr &&
                            !isInactiveBookingStatus(getBookingStatus(x))
                        );
                        if (s) onCancelBooking({ classId: s.id, className: item.name });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-xs transition-colors border border-rose-200 dark:border-rose-800"
                    >
                      Hủy đặt
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isFull}
                      onClick={() => onInitiateBook(item)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                        isFull
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-[0.98]"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Đặt lịch & Thanh toán</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
