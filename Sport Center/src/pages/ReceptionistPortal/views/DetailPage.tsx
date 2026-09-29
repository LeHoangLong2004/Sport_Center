import React, { useState } from 'react';
import { A } from '../shared';
import StatusBadge from '../components/StatusBadge';

export function DetailPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col gap-[24px] items-start min-h-0 overflow-y-auto p-[32px] w-full">
      {/* Header card */}
      <div className="bg-white border border-[#e2e8f0] flex items-center justify-between p-[24px] rounded-[12px] shrink-0 w-full">
        <div className="flex gap-[20px] items-center shrink-0">
          <img src={`${A}/04936.png`} alt="" className="shrink-0 size-[72px] rounded-full object-cover" />
          <div className="flex flex-col gap-[6px] items-start shrink-0">
            <div className="flex gap-[12px] items-center shrink-0">
              <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[22px]">Nguyễn Lan Anh</span>
              <span className="bg-[#dcfce7] font-['Manrope:Bold'] font-bold px-[8px] py-[4px] rounded-[6px] text-[#15803d] text-[11px]">Đang hoạt động</span>
            </div>
            <div className="flex gap-[16px] items-center shrink-0 text-[14px]">
              <span className="font-['Manrope:Bold'] font-bold text-[#3b82f6]">Mã thẻ: MB-2048</span>
              <span className="font-['Manrope:Regular'] font-normal text-[#64748b]">•</span>
              <span className="font-['Manrope:SemiBold'] font-semibold text-[#64748b]">Hội viên Premium</span>
            </div>
          </div>
        </div>
        <div className="flex gap-[12px] items-start shrink-0">
          <button type="button" className="bg-[#3b82f6] flex items-start px-[18px] py-[10px] rounded-[8px] shrink-0">
            <span className="font-['Manrope:Bold'] font-bold text-[14px] text-white">Gia hạn gói tập</span>
          </button>
          <button type="button" className="bg-white border border-[#e2e8f0] border-solid flex items-start px-[18px] py-[10px] rounded-[8px] shrink-0">
            <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[14px]">In thẻ thành viên</span>
          </button>
          <button type="button" className="bg-[#fee2e2] border border-[#fee2e2] border-solid flex items-start px-[18px] py-[10px] rounded-[8px] shrink-0">
            <span className="font-['Manrope:Bold'] font-bold text-[#ef4444] text-[14px]">Tạm khóa thẻ</span>
          </button>
          <button type="button" onClick={onBack} className="border border-[#e2e8f0] border-solid flex items-start px-[18px] py-[10px] rounded-[8px] shrink-0">
            <span className="font-['Manrope:Bold'] font-bold text-[#64748b] text-[14px]">← Quay lại</span>
          </button>
        </div>
      </div>

      {/* Split */}
      <div className="flex flex-1 gap-[24px] items-start min-h-0 w-full">
        {/* Left column */}
        <div className="flex flex-col gap-[24px] items-start shrink-0 w-[450px]">
          {/* Personal info */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start p-[24px] rounded-[12px] w-full">
            <div className="flex items-center justify-between w-full">
              <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Thông tin cá nhân</span>
              <img src={`${A}/bc662.svg`} alt="Chỉnh sửa" className="size-[16px]" />
            </div>
            <div className="bg-[#e2e8f0] h-px w-full" />
            {[
              { label: "Ngày sinh:", value: "15/08/1996" },
              { label: "Giới tính:", value: "Nữ" },
              { label: "Số điện thoại:", value: "0912 345 678" },
              { label: "Email:", value: "lananh@email.com" },
              { label: "Địa chỉ:", value: "Số 15 Ngõ 102, Chùa Bộc, Đống Đa, Hà Nội" },
              { label: "Liên hệ khẩn cấp:", value: "Nguyễn Văn Hùng (Bố) - 0988 123 456" },
            ].map((row) => (
              <div key={row.label} className="flex gap-[12px] items-start w-full">
                <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[13px] w-[130px] shrink-0">{row.label}</span>
                <span className="font-['Manrope:SemiBold'] font-semibold text-[#0f172a] text-[13px] flex-1 min-w-0">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Membership */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start p-[24px] rounded-[12px] w-full">
            <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Thông tin gói tập hiện tại</span>
            <div className="bg-[#e2e8f0] h-px w-full" />
            {[
              { label: "Gói đăng ký:", value: "Premium 12 tháng", highlight: true },
              { label: "Ngày đăng ký:", value: "18/01/2026" },
              { label: "Hạn sử dụng:", value: "18/12/2026" },
              { label: "Tổng tiền gói tập:", value: "12,500,000 đ" },
            ].map((row) => (
              <div key={row.label} className="flex gap-[12px] items-start w-full text-[13px]">
                <span className="font-['Manrope:Regular'] font-normal text-[#64748b] w-[140px] shrink-0">{row.label}</span>
                {row.highlight
                  ? <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#3b82f6]">{row.value}</span>
                  : <span className="font-['Manrope:SemiBold'] font-semibold text-[#0f172a]">{row.value}</span>
                }
              </div>
            ))}
            <div className="flex gap-[12px] items-start w-full text-[13px]">
              <span className="font-['Manrope:Regular'] font-normal text-[#64748b] w-[140px] shrink-0">Số ngày còn lại:</span>
              <span className="bg-[#eff6ff] font-['Manrope:Bold'] font-bold px-[8px] py-[2px] rounded-[4px] text-[#3b82f6] text-[12px]">324 ngày</span>
            </div>
            <div className="flex gap-[12px] items-start w-full text-[13px]">
              <span className="font-['Manrope:Regular'] font-normal text-[#64748b] w-[140px] shrink-0">Trạng thái thanh toán:</span>
              <span className="bg-[#dcfce7] font-['Manrope:Bold'] font-bold px-[8px] py-[2px] rounded-[4px] text-[#15803d] text-[11px]">Đã thanh toán 100%</span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-1 flex-col gap-[24px] items-start min-w-0">
          {/* Training history */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start px-[24px] py-[20px] rounded-[12px] w-full">
            <div className="flex items-center justify-between shrink-0 w-full">
              <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Lịch sử tập luyện gần đây</span>
              <span className="font-['Manrope:Bold'] font-bold text-[#3b82f6] text-[13px] cursor-pointer">Xem tất cả</span>
            </div>
            <div className="border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[8px] w-full">
              <div className="bg-[#f1f5f9] flex font-['Manrope:ExtraBold'] font-extrabold items-center px-[16px] py-[10px] text-[#64748b] text-[12px] w-full">
                <span className="w-[110px] shrink-0">NGÀY</span>
                <span className="flex-1 min-w-0">PHÒNG / HOẠT ĐỘNG</span>
                <span className="w-[120px] shrink-0">HLV HƯỚNG DẪN</span>
                <span className="w-[100px] shrink-0">THỜI LƯỢNG</span>
                <span className="w-[100px] shrink-0 text-right">GIỜ CHECK-IN</span>
              </div>
              {[
                { date: "15/02/2026", activity: "Yoga Advanced Class", trainer: "HLV Minh Tuyết", duration: "60 phút", checkin: "18:05" },
                { date: "12/02/2026", activity: "Cardio & Fitness Gym", trainer: "Tự do", duration: "90 phút", checkin: "17:30" },
                { date: "09/02/2026", activity: "Swimming pool", trainer: "Tự do", duration: "45 phút", checkin: "07:15" },
              ].map((r) => (
                <div key={r.date} className="bg-white border-[#e2e8f0] border-b border-solid flex items-center px-[16px] py-[12px] text-[13px] w-full last:border-b-0">
                  <span className="font-['Manrope:SemiBold'] font-semibold text-[#0f172a] w-[110px] shrink-0">{r.date}</span>
                  <span className="flex-1 font-['Manrope:SemiBold'] font-semibold min-w-0 text-[#0f172a]">{r.activity}</span>
                  <span className="font-['Manrope:Regular'] font-normal text-[#64748b] w-[120px] shrink-0">{r.trainer}</span>
                  <span className="font-['Manrope:Regular'] font-normal text-[#64748b] w-[100px] shrink-0">{r.duration}</span>
                  <span className="font-['Manrope:Bold'] font-bold text-[#15803d] text-right w-[100px] shrink-0">{r.checkin}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment history */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start px-[24px] py-[20px] rounded-[12px] w-full">
            <div className="flex items-center justify-between shrink-0 w-full">
              <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Lịch sử giao dịch thanh toán</span>
              <span className="font-['Manrope:Bold'] font-bold text-[#3b82f6] text-[13px] cursor-pointer">Xem tất cả hóa đơn</span>
            </div>
            <div className="border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[8px] w-full">
              <div className="bg-[#f1f5f9] flex font-['Manrope:ExtraBold'] font-extrabold items-center px-[16px] py-[10px] text-[#64748b] text-[12px] w-full">
                <span className="w-[110px] shrink-0">NGÀY GD</span>
                <span className="flex-1 min-w-0">NỘI DUNG THANH TOÁN</span>
                <span className="w-[120px] shrink-0">HÌNH THỨC</span>
                <span className="w-[120px] shrink-0">TRẠNG THÁI</span>
                <span className="w-[110px] shrink-0 text-right">SỐ TIỀN</span>
              </div>
              {[
                { date: "18/01/2026", content: "Thanh toán gói Premium 12 tháng", method: "Chuyển khoản QR", amount: "12,500,000 đ" },
                { date: "15/01/2026", content: "Mua nước khoáng Lavie & Khăn tập", method: "Tiền mặt", amount: "150,000 đ" },
              ].map((r) => (
                <div key={r.date + r.content} className="bg-white border-[#e2e8f0] border-b border-solid flex items-center px-[16px] py-[12px] w-full last:border-b-0">
                  <span className="font-['Manrope:SemiBold'] font-semibold text-[#0f172a] text-[13px] w-[110px] shrink-0">{r.date}</span>
                  <span className="flex-1 font-['Manrope:SemiBold'] font-semibold min-w-0 overflow-hidden text-[#0f172a] text-[13px] text-ellipsis whitespace-nowrap">{r.content}</span>
                  <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[13px] w-[120px] shrink-0">{r.method}</span>
                  <div className="flex items-start w-[120px] shrink-0">
                    <span className="bg-[#dcfce7] font-['Manrope:Bold'] font-bold px-[6px] py-[2px] rounded-[4px] text-[#15803d] text-[11px]">Thành công</span>
                  </div>
                  <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[13px] text-right w-[110px] shrink-0">{r.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
