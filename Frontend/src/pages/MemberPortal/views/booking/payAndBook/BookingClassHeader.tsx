import React from "react";
import { CoachAvatar } from "../../../utils/coachAvatar";

interface Props {
  classToBook: any;
  classPrice: number;
}

export const BookingClassHeader: React.FC<Props> = ({ classToBook, classPrice }) => {
  return (
    <>
      {/* Lớp & Coach info box */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CoachAvatar
            src={classToBook.coachAvatar}
            name={classToBook.coachName}
            className="w-12 h-12 rounded-full border-2 border-teal-500 shrink-0"
          />
          <div>
            <p className="font-extrabold text-sm text-slate-900 dark:text-white">
              {classToBook.name}
            </p>
            <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
              HLV phụ trách: {classToBook.coachName}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {classToBook.startTime} - {classToBook.endTime} • {classToBook.room}
            </p>
          </div>
        </div>
      </div>

      {/* BẢNG CHI TIẾT THANH TOÁN GIÁ GỐC */}
      <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-slate-800/80 border border-teal-200 dark:border-slate-700 space-y-2.5">
        <h4 className="font-extrabold text-xs uppercase tracking-wider text-teal-800 dark:text-teal-300">
          Chi tiết hóa đơn đăng ký
        </h4>
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
          <span>Hạng thành viên của bạn:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            🥉 Cơ bản (Basic Member)
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
          <span>Giá gốc niêm yết buổi học:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {classPrice.toLocaleString("vi-VN")} đ
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
          <span>Ưu đãi thành viên:</span>
          <span className="font-bold text-slate-500">
            0 đ (Áp dụng 100% giá gốc)
          </span>
        </div>
        <div className="flex justify-between items-center pt-2.5 border-t border-teal-200 dark:border-slate-700 text-sm">
          <span className="font-extrabold text-slate-900 dark:text-white">
            Tổng tiền thanh toán:
          </span>
          <strong className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {classPrice.toLocaleString("vi-VN")} đ
          </strong>
        </div>
      </div>
    </>
  );
};
