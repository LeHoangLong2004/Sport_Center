import React from "react";
import { Dumbbell, Plus } from "lucide-react";
import { CoachAvatar, getRealCoachAvatar } from "../../utils/coachAvatar";

interface PtSlotsTabProps {
  slots: any[];
  onBookPtSlot: (slot: any) => void;
}

export const PtSlotsTab: React.FC<PtSlotsTabProps> = ({ slots, onBookPtSlot }) => {
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

            return (
              <div
                key={slot.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-purple-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800">
                      {slot.sport || "PT 1-1"} • Kèm riêng cá nhân
                    </span>
                    <span className="text-xs font-black text-purple-700 dark:text-purple-300">
                      Slot 60 phút
                    </span>
                  </div>

                  <div className="flex items-center gap-3 my-3 p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/40">
                    <CoachAvatar
                      src={coachAvatar}
                      name={slot.coachName}
                      className="w-11 h-11 rounded-full border-2 border-purple-500 shrink-0"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {slot.coachName}
                      </h4>
                      <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
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
                  onClick={() => onBookPtSlot(slot)}
                  className="mt-5 w-full py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Đặt lịch kèm 1-1 ngay</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
