import React, { useState } from 'react';
import { A } from '../shared';
import StatusBadge from '../components/StatusBadge';

const apptSlots = [
  {
    time: "08:00",
    bg: "bg-[#eff6ff]",
    border: "border-[#bfdbfe]",
    title: "Lớp Yoga mở màn (Tư vấn hội viên)",
    sub: "Khách: Đặng Hồng Liên • Coach Minh Tuyết",
    badgeBg: "bg-[#dbeafe]",
    badgeText: "text-[#1e40af]",
    badge: "Đã hoàn tất",
  },
  {
    time: "10:00",
    bg: "bg-[#fffbeb]",
    border: "border-[#fef08a]",
    title: "Tập thử buổi 1 - PT kèm riêng 1:1",
    sub: "Khách: Trần Trung Kiên • PT Trần Khoa",
    badgeBg: "bg-[#fef3c7]",
    badgeText: "text-[#b45309]",
    badge: "Đang chờ khách",
  },
  {
    time: "14:00",
    bg: "bg-[#f8fafc]",
    border: "border-[#e2e8f0]",
    title: "Tư vấn gia hạn gói tập vàng",
    sub: "Khách: Vũ Phương Thảo • Lễ tân Ngọc Mai",
    badgeBg: "bg-[#e2e8f0]",
    badgeText: "text-[#64748b]",
    badge: "Đã hủy",
  },
]

export function SchedulePage() {
  return (
    <div className="flex flex-col items-start p-[32px] w-full">
      <div className="flex gap-[24px] items-start shrink-0 w-full">
        {/* Timeline */}
        <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-[20px] items-start min-w-0 p-[24px] rounded-[12px]">
          <div className="flex items-center justify-between shrink-0 w-full">
            <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[18px]">Lịch hẹn hôm nay</span>
            <button type="button" className="bg-[#3b82f6] flex items-center px-[14px] py-[8px] rounded-[6px] shrink-0">
              <span className="font-['Manrope:Bold'] font-bold text-[13px] text-white">+ Tạo lịch hẹn</span>
            </button>
          </div>
          <div className="flex flex-col gap-[16px] items-start w-full">
            {apptSlots.map((slot) => (
              <div key={slot.time} className="flex gap-[16px] items-center shrink-0 w-full">
                <span className="font-['Manrope:Bold'] font-bold text-[#64748b] text-[13px] w-[60px] shrink-0">{slot.time}</span>
                <div className={`${slot.bg} border ${slot.border} border-solid flex flex-1 items-center justify-between min-w-0 p-[12px] rounded-[8px]`}>
                  <div className="flex flex-col gap-[4px] items-start shrink-0">
                    <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[14px]">{slot.title}</span>
                    <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[12px]">{slot.sub}</span>
                  </div>
                  <span className={`${slot.badgeBg} ${slot.badgeText} font-['Manrope:Bold'] font-bold px-[8px] py-[2px] rounded-[4px] text-[11px] whitespace-nowrap shrink-0`}>{slot.badge}</span>
                </div>
              </div>
            ))}
            <div className="flex gap-[16px] items-center shrink-0 w-full">
              <span className="font-['Manrope:Bold'] font-bold text-[#64748b] text-[13px] w-[60px] shrink-0">16:00</span>
              <div className="border border-[#e2e8f0] border-dashed flex flex-1 items-center min-w-0 p-[12px] rounded-[8px]">
                <span className="font-['Manrope:Regular'] font-normal text-[#94a3b8] text-[13px]">Không có lịch hẹn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[20px] items-start p-[24px] rounded-[12px] shrink-0 w-[400px]">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Tổng quan lịch hẹn</span>
          <div className="flex flex-col gap-[12px] items-start w-full">
            {[
              { dot: `${A}/93b20.svg`, label: "Tổng số lịch hẹn", value: "8" },
              { dot: `${A}/0d428.svg`, label: "Đã hoàn tất", value: "6" },
              { dot: `${A}/5a32b.svg`, label: "Đang chờ khách", value: "1" },
              { dot: `${A}/45516.svg`, label: "Đã hủy", value: "1" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between shrink-0 w-full">
                <div className="flex gap-[8px] items-center shrink-0">
                  <img src={s.dot} alt="" className="size-[8px] shrink-0" />
                  <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[14px]">{s.label}</span>
                </div>
                <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[14px]">{s.value}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#f1f5f9] h-px w-full" />
          <div className="bg-[#eff6ff] flex flex-col gap-[8px] items-start p-[16px] rounded-[8px] w-full">
            <span className="font-['Manrope:Bold'] font-bold text-[#1e40af] text-[13px]">Lưu ý lễ tân</span>
            <span className="font-['Manrope:Regular'] font-normal leading-[1.4] text-[#1e40af] text-[12px]">
              Vui lòng gọi điện nhắc khách trước 30 phút đối với các lịch hẹn có HLV cá nhân tập thử.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

