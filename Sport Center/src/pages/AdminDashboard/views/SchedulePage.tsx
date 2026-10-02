import React, { useState } from 'react';
import { iCalendar, iSearch2, iChevron, coachAvatar1, coachAvatar2, hrAvatar1 } from '../shared';

export function SchedulePage() {
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  const hours = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

  const classes = [
    { day: 0, hour: 0, name: "Yoga Morning", coach: "Elena", color: "bg-teal-50 border-teal-200", text: "text-teal-700", room: "Studio 1", enrolled: "15/20", duration: 2 },
    { day: 1, hour: 6, name: "Zumba Dance", coach: "Maria", color: "bg-pink-50 border-pink-200", text: "text-pink-700", room: "Studio 2", enrolled: "25/30", duration: 2 },
    { day: 2, hour: 4, name: "CrossFit X", coach: "David", color: "bg-orange-50 border-orange-200", text: "text-orange-700", room: "Gym Area", enrolled: "10/15", duration: 2 },
    { day: 4, hour: 5, name: "Pilates Core", coach: "Elena", color: "bg-teal-50 border-teal-200", text: "text-teal-700", room: "Studio 1", enrolled: "18/20", duration: 2 },
    { day: 5, hour: 1, name: "Body Pump", coach: "Alex", color: "bg-blue-50 border-blue-200", text: "text-blue-700", room: "Studio 3", enrolled: "22/25", duration: 2 },
  ];

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-[#0f172a] text-[28px]">Lịch trình & Lớp học</p>
          <p className="text-[#64748b] text-sm mt-1">Sắp xếp thời khóa biểu và phân công HLV cho các lớp Group-X.</p>
        </div>
        <button className="bg-[#2563eb] flex gap-2 items-center px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
          <span className="font-semibold text-white text-sm">+ Tạo lớp mới</span>
        </button>
      </div>

      <div className="flex gap-4">
        {/* Sidebar Filters */}
        <div className="w-[240px] shrink-0 flex flex-col gap-4">
          <div className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-3 py-2.5 rounded-lg">
            <img src={iSearch2} alt="" className="size-4 shrink-0" />
            <input placeholder="Tìm lớp, HLV..." className="flex-1 text-sm outline-none" />
          </div>
          
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 drop-shadow-sm">
            <p className="font-bold text-[#0f172a] text-sm mb-3">Bộ lọc Phòng tập</p>
            <div className="flex flex-col gap-2">
              {["Tất cả", "Studio 1 (Yoga/Pilates)", "Studio 2 (Dance)", "Studio 3 (Cycling)", "Gym Area"].map((r, i) => (
                <label key={i} className="flex gap-2 items-center cursor-pointer group">
                  <input type="checkbox" defaultChecked={i===0} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-[#475569] text-sm group-hover:text-[#0f172a]">{r}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 drop-shadow-sm">
            <p className="font-bold text-[#0f172a] text-sm mb-3">Huấn luyện viên (Workload)</p>
            <div className="flex flex-col gap-3">
              {[
                { name: "Elena (Yoga)", hours: 14, avatar: coachAvatar1, color: "bg-teal-500" },
                { name: "Maria (Dance)", hours: 18, avatar: coachAvatar2, color: "bg-pink-500" },
                { name: "David (Fitness)", hours: 26, avatar: hrAvatar1, color: "bg-orange-500" },
              ].map((c, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <img src={c.avatar} alt="" className="size-8 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#0f172a] text-sm font-medium truncate">{c.name}</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className={`h-full ${c.color}`} style={{ width: `${(c.hours/40)*100}%` }}></div>
                    </div>
                  </div>
                  <span className="text-[#64748b] text-[10px]">{c.hours}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="flex-1 bg-white border border-[#e2e8f0] rounded-xl drop-shadow-sm flex flex-col min-w-0">
          <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
            <div className="flex items-center gap-4">
              <button className="p-1 hover:bg-slate-100 rounded">
                <img src={iChevron} alt="" className="size-5 rotate-90 opacity-60" />
              </button>
              <p className="font-bold text-[#0f172a] text-base">21/09 - 27/09, 2026</p>
              <button className="p-1 hover:bg-slate-100 rounded">
                <img src={iChevron} alt="" className="size-5 -rotate-90 opacity-60" />
              </button>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button className="bg-white drop-shadow-sm px-4 py-1.5 rounded-md text-sm font-semibold text-[#0f172a]">Tuần</button>
              <button className="px-4 py-1.5 text-sm font-medium text-[#64748b] hover:text-[#0f172a]">Tháng</button>
            </div>
          </div>

          <div className="flex-1 flex overflow-auto relative p-4">
            {/* simple grid calendar */}
            <div className="flex flex-col w-full min-w-[800px]">
              <div className="grid grid-cols-8 gap-2 mb-2">
                <div className="w-16"></div>
                {days.map(d => (
                  <div key={d} className="text-center pb-2 border-b border-slate-200">
                    <p className="text-[#64748b] text-xs font-semibold uppercase">{d}</p>
                  </div>
                ))}
              </div>
              <div className="flex-1 relative">
                {hours.map((h, i) => (
                  <div key={h} className="grid grid-cols-8 gap-2 relative h-20 group">
                    <div className="w-16 flex justify-end pr-3">
                      <span className="text-[#94a3b8] text-[11px] font-medium -mt-2">{h}</span>
                    </div>
                    {days.map((_, col) => (
                      <div key={col} className="border-t border-slate-100 group-hover:bg-slate-50/50 transition-colors"></div>
                    ))}
                  </div>
                ))}

                {/* Render classes directly over the grid */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none grid grid-cols-8 gap-2 pl-[4.5rem]">
                  {days.map((_, colIdx) => (
                    <div key={colIdx} className="relative h-full">
                      {classes.filter(c => c.day === colIdx).map((c, i) => (
                        <div 
                          key={i} 
                          className={`absolute w-full rounded-lg border p-2 flex flex-col justify-between pointer-events-auto cursor-pointer hover:brightness-95 transition-all shadow-sm ${c.color}`}
                          style={{ 
                            top: `${c.hour * 5}rem`, 
                            height: `${c.duration * 5 - 0.5}rem`, 
                            marginTop: '2px'
                          }}
                        >
                          <div>
                            <p className={`font-bold text-xs leading-tight ${c.text}`}>{c.name}</p>
                            <p className={`text-[10px] font-medium opacity-80 ${c.text} mt-0.5`}>{c.room}</p>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className={`text-[10px] font-medium ${c.text}`}>{c.coach}</p>
                            <span className="bg-white/50 px-1.5 rounded text-[9px] font-bold">{c.enrolled}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
