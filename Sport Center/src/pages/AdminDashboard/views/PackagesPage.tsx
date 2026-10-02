import React, { useState } from 'react';
import { iPackage, iCheckCircle, iSearch2, mAvatar0, mAvatar1, mAvatar2 } from '../shared';

export function PackagesPage() {
  const [activeTab, setActiveTab] = useState("Danh mục gói");

  const packages = [
    {
      id: "pkg-1",
      name: "Premium VIP",
      price: "12.000.000 đ",
      duration: "12 tháng",
      color: "from-amber-400 to-amber-600",
      features: ["Truy cập tất cả CLB", "Không giới hạn lớp học", "Tặng 5 buổi PT 1:1", "Tủ đồ cá nhân VIP", "Miễn phí thức uống"],
      tag: "Phổ biến nhất"
    },
    {
      id: "pkg-2",
      name: "Fitness Standard",
      price: "5.400.000 đ",
      duration: "6 tháng",
      color: "from-blue-500 to-indigo-600",
      features: ["Truy cập 1 CLB đăng ký", "Tham gia các lớp cơ bản", "Đo InBody 1 lần/tháng", "Sử dụng phòng xông hơi"],
      tag: ""
    },
    {
      id: "pkg-3",
      name: "Yoga Focus",
      price: "3.200.000 đ",
      duration: "3 tháng",
      color: "from-emerald-400 to-teal-500",
      features: ["Không giới hạn lớp Yoga", "Sử dụng khu vực thư giãn", "Tặng thảm tập cá nhân"],
      tag: ""
    }
  ];

  const recentSubscriptions = [
    { name: "Nguyễn Lan Anh", pkg: "Premium VIP", date: "21/09/2026", amount: "12.000.000 đ", avatar: mAvatar0 },
    { name: "Trần Minh Khoa", pkg: "Fitness Standard", date: "21/09/2026", amount: "5.400.000 đ", avatar: mAvatar1 },
    { name: "Lê Gia Hân", pkg: "Yoga Focus", date: "20/09/2026", amount: "3.200.000 đ", avatar: mAvatar2 },
  ];

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-[#0f172a] text-[28px]">Gói hội viên</p>
          <p className="text-[#64748b] text-sm mt-1">Quản lý danh mục gói cước và theo dõi hợp đồng hội viên.</p>
        </div>
        <button className="bg-[#2563eb] flex gap-2 items-center px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
          <span className="font-semibold text-white text-sm">+ Tạo gói mới</span>
        </button>
      </div>

      <div className="border-b border-[#e2e8f0] flex gap-6">
        {["Danh mục gói", "Hợp đồng hội viên"].map(t => (
          <button 
            key={t} 
            onClick={() => setActiveTab(t)}
            className={`pb-3 text-sm ${activeTab === t ? "border-b-2 border-[#2563eb] font-bold text-[#2563eb]" : "font-medium text-[#64748b] hover:text-[#0f172a]"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === "Danh mục gói" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {packages.map(pkg => (
            <div key={pkg.id} className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden drop-shadow-sm hover:shadow-lg transition-shadow flex flex-col relative group">
              {pkg.tag && (
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30 z-10">
                  {pkg.tag}
                </div>
              )}
              <div className={`h-32 w-full bg-gradient-to-r ${pkg.color} p-6 flex flex-col justify-end`}>
                <h3 className="text-white text-2xl font-bold">{pkg.name}</h3>
                <p className="text-white/80 text-sm">{pkg.duration}</p>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-3xl font-extrabold text-[#0f172a] mb-6">{pkg.price}</p>
                <div className="flex flex-col gap-3 flex-1 mb-6">
                  {pkg.features.map((feat, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <img src={iCheckCircle} alt="check" className="size-5 shrink-0 opacity-70" />
                      <span className="text-[#475569] text-sm leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 border border-[#cbd5e1] py-2 rounded-lg text-sm font-semibold text-[#0f172a] hover:bg-slate-50 transition-colors">Sửa</button>
                  <button className="flex-1 bg-slate-100 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">Khóa</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex gap-3 items-center">
            <div className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-3 py-2 rounded-lg flex-1 max-w-[320px]">
              <img src={iSearch2} alt="" className="size-4 shrink-0" />
              <input placeholder="Tìm hợp đồng, tên hội viên..." className="flex-1 text-sm outline-none" />
            </div>
          </div>
          
          <div className="bg-white border border-[#e2e8f0] overflow-hidden rounded-xl">
            <div className="bg-[#f1f5f9] flex font-semibold items-center px-6 text-[#475569] text-[12px]">
              <div className="py-3 flex-1">HỘI VIÊN</div>
              <div className="py-3 w-[200px]">GÓI CƯỚC</div>
              <div className="py-3 w-[150px]">NGÀY ĐĂNG KÝ</div>
              <div className="py-3 w-[150px] text-right">GIÁ TRỊ</div>
            </div>
            {recentSubscriptions.map((sub, i) => (
              <div key={i} className="border-b border-[#f1f5f9] flex h-16 items-center px-6">
                <div className="flex gap-3 items-center flex-1">
                  <img src={sub.avatar} alt="" className="rounded-full size-9 object-cover border border-slate-200" />
                  <p className="font-semibold text-[#0f172a] text-sm">{sub.name}</p>
                </div>
                <div className="w-[200px]">
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 font-medium px-2.5 py-1 rounded-md text-[12px]">{sub.pkg}</span>
                </div>
                <div className="w-[150px]">
                  <p className="text-[#475569] text-sm">{sub.date}</p>
                </div>
                <div className="w-[150px] text-right">
                  <p className="font-bold text-[#0f172a] text-sm">{sub.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
