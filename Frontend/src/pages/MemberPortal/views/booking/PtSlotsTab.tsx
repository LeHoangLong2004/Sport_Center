import React from "react";
import { Dumbbell, Plus, AlertCircle } from "lucide-react";
import { CoachAvatar, getRealCoachAvatar } from "../../utils/coachAvatar";
import { findConflictingSession } from "./bookingTypes";

interface PtSlotsTabProps {
  slots: any[];
  onBookPtSlot: (slot: any) => void;
  membership?: any | null;
  activeOrders?: any[];
  mySessions?: any[];
}

export const PtSlotsTab: React.FC<PtSlotsTabProps> = ({
  slots,
  onBookPtSlot,
  membership,
  activeOrders = [],
  mySessions = [],
}) => {
  const isPremium = membership?.tier === "premium";
  const discountPct = membership?.coachDiscountPct ?? 0;
  const tierName = discountPct > 0 ? `Hạng ${membership?.name || "thành viên"}` : "";
  const basePrice = 300000;
  const discountedPrice = Math.round(basePrice * (1 - discountPct / 100));

  const checkSlotCovered = (slot: any) => {
    if (!activeOrders || activeOrders.length === 0) return null;
    const nowStr = new Date().toISOString().slice(0, 10);
    const sSport = (slot.sport || "").toLowerCase();
    return activeOrders.find((o) => {
      if (o.status !== "paid") return false;
      if (o.endDate && o.endDate.slice(0, 10) < nowStr) return false;
      const pName = (o.packageSnapshot?.name || "").toLowerCase();
      const pSport = (o.packageSnapshot?.sport || "").toLowerCase();
      const isPtPkg =
        pName.includes("1-1") ||
        pName.includes("pt") ||
        pName.includes("coach") ||
        pName.includes("kèm");
      return (
        isPtPkg &&
        (sSport.includes(pSport) ||
          pSport.includes(sSport) ||
          pName.includes(sSport))
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {slots.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Dumbbell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Chưa có lịch trống kèm riêng phù hợp
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Vui lòng chọn ngày khác hoặc liên hệ bộ phận Lễ tân để được hỗ trợ sắp xếp lịch riêng.
            </p>
          </div>
        ) : (
          slots.map((slot) => {
            const coachAvatar = getRealCoachAvatar(slot.coachName, slot.coachAvatar, slot.coachId);
            const coveringPkg = checkSlotCovered(slot);
            const isCovered = Boolean(coveringPkg);
            const finalPrice = isCovered ? 0 : discountedPrice;
            const conflict = findConflictingSession(slot, mySessions);

            return (
              <div
                key={slot.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shrink-0">
                      {slot.sport || "PT 1-1"} • Kèm riêng cá nhân
                    </span>
                    <div className="text-right">
                      {isCovered ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] line-through text-slate-400">300.000 đ</span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                            0 đ (Theo gói PT)
                          </span>
                        </div>
                      ) : discountPct > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] line-through text-slate-400">300.000 đ</span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            {discountedPrice.toLocaleString("vi-VN")} đ
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isPremium ? "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300"}`}>
                            -{discountPct}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                          300.000 đ
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 my-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                    <CoachAvatar
                      src={coachAvatar}
                      name={slot.coachName}
                      className="w-11 h-11 rounded-full border-2 border-emerald-500 shrink-0"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {slot.coachName}
                      </h4>
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Chuyên gia huấn luyện thể hình
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Thời gian:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {slot.startTime} - {slot.endTime} • Ngày {slot.date}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phòng tập:</span>
                      <span className="font-semibold">{slot.room || "Khu PT chuyên biệt"}</span>
                    </div>
                    {slot.note && (
                      <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                        {slot.note}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onBookPtSlot({
                    ...slot,
                    computedPrice: finalPrice,
                    isCovered,
                    coveringPackageName: coveringPkg?.packageSnapshot?.name
                  })}
                  className="mt-5 w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isCovered
                      ? "Đặt lịch miễn phí theo gói"
                      : `Đặt lịch kèm 1-1 • ${finalPrice.toLocaleString("vi-VN")} đ`}
                  </span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
