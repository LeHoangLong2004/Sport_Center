import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Check,
  Star,
  CreditCard,
  AlertCircle,
  LoaderCircle,
  Lock,
} from "lucide-react";
import { CoachAvatar } from "../../utils/coachAvatar";
import type { MemberSessionItem } from "../../types";
import { type CancelBookingTarget } from "./bookingTypes";
import { parseScheduleTime } from "../../../../utils/scheduleTimeHelper";
import { EarlyBookingModal } from "./EarlyBookingModal";

interface GroupClassesTabProps {
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  classes: any[];
  mySessions: MemberSessionItem[];
  membership?: any;
  onNavigate?: (screen: any) => void;
  onRetry: () => void;
  onOpenDetail: (cls: any) => void;
  onInitiateBook: (cls: any) => void;
  onCancelBooking: (target: CancelBookingTarget) => void;
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
  membership,
  onNavigate,
  onRetry,
  onOpenDetail,
  onInitiateBook,
  onCancelBooking,
  findActiveBooking,
  getBookingStatus,
  isInactiveBookingStatus,
}) => {
  const [lockedTarget, setLockedTarget] = useState<{
    item: any;
    opensAtDateStr: string;
    advanceHours: number;
    tierName: string;
    isMaxTier?: boolean;
  } | null>(null);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-16 rounded-3xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-3">
        <LoaderCircle className="w-8 h-8 animate-spin" />
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Đang tải lịch lớp học của toàn bộ Huấn luyện viên...
        </h4>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/30 p-8 rounded-2xl border border-rose-200 dark:border-rose-800 text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">Không thể tải lịch học</h4>
        <p className="text-xs text-rose-600/80 dark:text-rose-300/80 mt-1">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
        >
          Thử tải lại
        </button>
      </div>
    );
  }

  const now = Date.now();
  const advanceHours =
    membership?.bookingAdvanceHours && membership.bookingAdvanceHours > 0
      ? membership.bookingAdvanceHours
      : membership?.tier === "premium"
      ? 120
      : membership?.tier === "plus"
      ? 72
      : 24;

  const tierName =
    membership?.name ||
    (membership?.tier === "premium" ? "Premium" : membership?.tier === "plus" ? "Plus" : "Cơ bản");

  return (
    <div className="space-y-4">
      {refreshing && (
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <LoaderCircle className="w-4 h-4 animate-spin" />
          <span>Đang làm mới danh sách lớp học...</span>
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
            const rawBookingStatus = bookedSession ? String(getBookingStatus(bookedSession) || "").toLowerCase() : null;
            const isCounterPending = rawBookingStatus === "pending";
            const isPaymentPending = rawBookingStatus === "pending_payment";
            const booked = Boolean(bookedSession) && !isCounterPending && !isPaymentPending;
            const isFull = item.registeredCount >= item.capacity;

            const classStartMs =
              item.startMs ??
              (item.scheduleTime ? parseScheduleTime(item.scheduleTime).getTime() : null);
            const classEndMs =
              item.endMs ??
              (classStartMs !== null
                ? classStartMs + Number(item.durationMinutes || 60) * 60000
                : null);

            // Quy tắc: Nếu lớp đã thật sự kết thúc, ẩn hoàn toàn khỏi giao diện đặt lịch
            const isEnded = classEndMs !== null && classEndMs <= now;
            if (isEnded) return null;

            // Nếu đang trong đúng khung giờ diễn ra, hiển thị trạng thái "Đang diễn ra"
            const isOngoing =
              classStartMs !== null &&
              classEndMs !== null &&
              classStartMs <= now &&
              now < classEndMs;
            // const isTooEarly = classStartMs !== null && classStartMs - now > advanceHours * 3600 * 1000;
            const isTooEarly = false; // Tạm thời tắt ràng buộc đặt trước theo gói để phục vụ kiểm thử tính năng

            let opensAtDateStr = "";
            if (isTooEarly && classStartMs !== null) {
              const openTimeMs = classStartMs - advanceHours * 3600 * 1000;
              const openD = new Date(openTimeMs);
              const openHours = String(openD.getHours()).padStart(2, "0");
              const openMins = String(openD.getMinutes()).padStart(2, "0");
              const openDate = `${String(openD.getDate()).padStart(2, "0")}/${String(openD.getMonth() + 1).padStart(2, "0")}`;
              opensAtDateStr = `${openHours}:${openMins} ngày ${openDate}`;
            }

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                      {item.sport} • {item.level}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {item.price !== null && item.price !== undefined
                        ? `${Number(item.price).toLocaleString("vi-VN")} đ`
                        : "Chưa có giá áp dụng"}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.name}
                  </h3>

                  {/* Status badges */}
                  {booked ? (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <Check className="w-3 h-3" /> Đã đăng ký lớp này
                    </span>
                  ) : isCounterPending ? (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                      <Clock className="w-3 h-3 text-amber-600" /> Chờ thanh toán tại quầy
                    </span>
                  ) : isOngoing ? (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
                      <Clock className="w-3 h-3 text-blue-600 animate-pulse" /> Đang diễn ra
                    </span>
                  ) : isTooEarly ? (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                      <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Mở đặt lúc {opensAtDateStr}
                    </span>
                  ) : null}

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Coach mini profile */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CoachAvatar
                        src={item.coachAvatar}
                        name={item.coachName}
                        className="w-10 h-10 rounded-full shrink-0"
                      />
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                          {item.coachName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {item.coachSpecialty || "Huấn luyện viên"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800 shrink-0">
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
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
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
                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Xem chi tiết
                  </button>

                  {isCounterPending ? (
                    <button
                      type="button"
                      onClick={() => {
                        const targetClassId = (bookedSession as any)?.classId || item.id;
                        onCancelBooking({
                          classId: targetClassId,
                          className: item.name,
                          scheduleTime: item.scheduleTime,
                          startTime: item.startTime,
                          endTime: item.endTime,
                          dateStr: item.dateStr,
                          price: item.price,
                          sport: item.sport,
                          room: item.room,
                        });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-bold text-xs transition-colors border border-amber-200 dark:border-amber-800 cursor-pointer"
                    >
                      Hủy giữ chỗ
                    </button>
                  ) : booked ? (
                    <button
                      type="button"
                      onClick={() => {
                        const targetClassId = (bookedSession as any)?.classId || item.id;
                        onCancelBooking({
                          classId: targetClassId,
                          className: item.name,
                          scheduleTime: item.scheduleTime,
                          startTime: item.startTime,
                          endTime: item.endTime,
                          dateStr: item.dateStr,
                          price: item.price,
                          sport: item.sport,
                          room: item.room,
                        });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-xs transition-colors border border-rose-200 dark:border-rose-800 cursor-pointer"
                    >
                      Hủy đặt
                    </button>
                  ) : isPaymentPending ? (
                    <button
                      type="button"
                      onClick={() => onInitiateBook(item)}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-[0.98]"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Đặt lịch &amp; Thanh toán</span>
                    </button>
                  ) : isFull ? (
                    <button
                      type="button"
                      disabled
                      className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    >
                      <span>Đã hết chỗ</span>
                    </button>
                  ) : isOngoing ? (
                    <button
                      type="button"
                      disabled
                      className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Đã đóng đặt</span>
                    </button>
                  ) : isTooEarly ? (
                    <button
                      type="button"
                      onClick={() =>
                        setLockedTarget({
                          item,
                          opensAtDateStr,
                          advanceHours,
                          tierName,
                          isMaxTier: membership?.tier === "premium",
                        })
                      }
                      className="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Chưa mở đặt</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onInitiateBook(item)}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-[0.98]"
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

      {/* Early Booking Explanation & Upsell Modal */}
      <EarlyBookingModal
        target={lockedTarget}
        onClose={() => setLockedTarget(null)}
        onUpgrade={onNavigate ? () => onNavigate("packages") : undefined}
      />
    </div>
  );
};
