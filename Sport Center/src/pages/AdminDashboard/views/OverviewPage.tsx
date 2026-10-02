import React from 'react';
import { iKpiRevenue, iKpiMembers, iKpiClasses, iActivity0, iActivity1, iActivity2 } from '../shared';
import KpiCard from '../components/KpiCard';
import SimpleLineChart from '../components/SimpleLineChart';

export function OverviewPage() {
  const activities = [
    { id: 1, text: "Nguyễn Lan Anh vừa đăng ký gói Premium 12 tháng", time: "10 phút trước", icon: iActivity0, color: "bg-blue-50 dark:bg-blue-500/20 text-blue-500" },
    { id: 2, text: "Trần Minh Khoa đã check-in vào phòng Gym", time: "25 phút trước", icon: iActivity1, color: "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-500" },
    { id: 3, text: "Lớp Yoga Hatha (18:00) đã đầy chỗ (20/20)", time: "1 giờ trước", icon: iActivity2, color: "bg-orange-50 dark:bg-orange-500/20 text-orange-500" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <p className="font-bold text-slate-900 dark:text-white text-3xl">Tổng quan hệ thống</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Cập nhật nhanh tình hình kinh doanh và vận hành hôm nay.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          label="Tổng doanh thu tháng"
          value="452.500.000 đ"
          sub="+12.5% so với tháng trước"
          badge="Tăng trưởng"
          badgeColor="green"
          icon={iKpiRevenue}
          iconBg="bg-blue-50 dark:bg-blue-500/10"
        />
        <KpiCard
          label="Hội viên đang hoạt động"
          value="2.486"
          sub="+42 hội viên mới tuần này"
          badge="Tích cực"
          badgeColor="green"
          icon={iKpiMembers}
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <KpiCard
          label="Lớp học diễn ra hôm nay"
          value="34"
          sub="Tỷ lệ lấp đầy trung bình 85%"
          badge="Tối ưu"
          badgeColor="yellow"
          icon={iKpiClasses}
          iconBg="bg-orange-50 dark:bg-orange-500/10"
        />
      </div>

      {/* Main Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-6 rounded-2xl flex flex-col hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-lg">Biểu đồ doanh thu</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Doanh thu 12 tháng gần nhất</p>
            </div>
            <select className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium px-3 py-1.5 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-shadow">
              <option>Năm nay (2026)</option>
              <option>Năm trước (2025)</option>
            </select>
          </div>
          <div className="flex-1 flex items-end w-full h-[240px]">
            <SimpleLineChart />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-6 rounded-2xl hover:shadow-xl transition-shadow flex flex-col">
          <p className="font-bold text-slate-900 dark:text-white text-lg mb-6">Hoạt động gần đây</p>
          <div className="flex flex-col gap-6 flex-1">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-4 items-start group">
                <div className={`shrink-0 flex items-center justify-center size-10 rounded-xl ${act.color} group-hover:scale-110 transition-transform`}>
                  <img src={act.icon} alt="" className="size-5 brightness-0 dark:invert opacity-70" />
                </div>
                <div>
                  <p className="text-slate-900 dark:text-slate-200 text-sm font-semibold leading-tight group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">{act.text}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[12px] mt-1.5 font-medium">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors">
            Xem toàn bộ nhật ký
          </button>
        </div>
      </div>
    </div>
  );
}
