import React from "react";

interface BookingClassSummaryProps {
  info: any;
}

export const BookingClassSummary: React.FC<BookingClassSummaryProps> = ({ info }) => {
  const isCounter = info.paymentMethod === "counter";

  return (
    <>
      {/* Tóm tắt lớp học */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
        <div className="flex justify-between items-center font-extrabold text-sm text-slate-900 dark:text-white">
          <span>{info.classItem.name}</span>
          <span
            className={
              isCounter
                ? "text-amber-600 dark:text-amber-400 font-black"
                : "text-emerald-600 dark:text-emerald-400 font-black"
            }
          >
            {info.paidAmount?.toLocaleString("vi-VN")} đ
          </span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>{isCounter ? "Mã phiếu hẹn:" : "Mã hóa đơn:"}</span>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
            {info.invoiceId}
          </span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Hình thức thanh toán:</span>
          <span
            className={`font-bold ${
              isCounter ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"
            }`}
          >
            {isCounter ? "Thanh toán tại quầy lễ tân" : "Thanh toán trực tuyến"}
          </span>
        </div>
        <div className="flex justify-between text-slate-500 items-center">
          <span>Trạng thái:</span>
          <span
            className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-md ${
              isCounter
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300"
                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
            }`}
          >
            {isCounter ? "⏳ Chờ thanh toán tại quầy" : "✓ Đã thanh toán"}
          </span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Thời gian học:</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {info.classItem.startTime} - {info.classItem.endTime} (Ngày {info.classItem.dateStr || "Hôm nay"})
          </span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Phòng tập:</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {info.classItem.room}
          </span>
        </div>
      </div>

      {isCounter && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-xs">
            <span>📍</span> Hướng dẫn nhận vé vào lớp tại quầy:
          </p>
          <p>
            • Vui lòng có mặt tại quầy lễ tân chi nhánh trước giờ học <strong>10 phút</strong>.
          </p>
          <p>
            • Đọc <strong>Số điện thoại</strong> hoặc xuất trình mã phiếu{" "}
            <strong className="font-mono text-amber-950 dark:text-amber-100 font-bold">
              {info.invoiceId}
            </strong>{" "}
            để Lễ tân thu tiền ({info.paidAmount?.toLocaleString("vi-VN")} đ) bằng tiền mặt / thẻ POS và kích hoạt thẻ vào phòng.
          </p>
        </div>
      )}
    </>
  );
};
