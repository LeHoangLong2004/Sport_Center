import React from "react";
import type { GateCheckInRecord } from "./types";
import { DoorOpen, QrCode, Timer } from "lucide-react";

interface AttendanceGateListProps {
  gateCheckIns: GateCheckInRecord[];
  onOpenQrModal: () => void;
}

export default function AttendanceGateList({
  gateCheckIns,
  onOpenQrModal,
}: AttendanceGateListProps) {
  const formatDateTimeDisplay = (isoStr: string) => {
    if (!isoStr) return "—";
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-4">
      {gateCheckIns.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
          <DoorOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">
            Chưa có lịch sử check-in tại sảnh
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
            Khi đến trung tâm, hãy xuất trình mã QR cá nhân cho lễ tân để check-in vào cửa và kích hoạt phiên tập.
          </p>
          <button
            onClick={onOpenQrModal}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            Mở mã QR Check-in
          </button>
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Nhật Ký Quét Thẻ & Cổng Ra Vào
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ghi nhận thời gian đến và rời khỏi cơ sở Sport Center qua cổng kiểm soát tự động.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              {gateCheckIns.length} lượt đã ghi nhận
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {gateCheckIns.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      item.status === "CHECKED_OUT"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 animate-pulse"
                    }`}
                  >
                    <DoorOpen className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.gate}
                      </span>
                      {item.packageName && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                          {item.packageName}
                        </span>
                      )}
                      {item.status === "CHECKED_OUT" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          Đã hoàn thành buổi tập
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          Đang trong phòng tập
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        Vào lúc:{" "}
                        <strong className="text-slate-700 dark:text-slate-300">
                          {formatDateTimeDisplay(item.checkInTime)}
                        </strong>
                      </span>
                      {item.checkOutTime && (
                        <span>
                          Rời sảnh:{" "}
                          <strong className="text-slate-700 dark:text-slate-300">
                            {formatDateTimeDisplay(item.checkOutTime)}
                          </strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                    <Timer className="w-3.5 h-3.5 text-teal-500" />
                    {item.durationMinutes ? `${item.durationMinutes} phút` : "Đang tính giờ"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
