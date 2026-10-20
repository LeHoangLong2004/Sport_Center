import React, { useState } from 'react';
import { toast } from 'sonner';
import { iSettings, iCheckCircle, iSearch2, mAvatar0 } from '../shared';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Nhật ký hệ thống");
  const [searchLog, setSearchLog] = useState("");
  const [centerConfig, setCenterConfig] = useState({
    name: "SportCenter Fitness & Sports Complex",
    hotline: "1900 6868",
    email: "contact@sportcenter.vn",
    address: "Khu Công Nghệ Cao, Long Thạnh Mỹ, TP. Thủ Đức, TP. Hồ Chí Minh",
    openHours: "06:00 - 22:00 (Hàng ngày)",
  });

  const auditLogs: any[] = [];
  const filteredLogs = auditLogs.filter(l => 
    !searchLog || 
    l.user?.toLowerCase().includes(searchLog.toLowerCase()) || 
    l.action?.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div>
        <p className="font-bold text-[#0f172a] text-[28px]">Cài đặt & Nhật ký</p>
        <p className="text-[#64748b] text-sm mt-1">Quản lý tham số hệ thống và tra cứu lịch sử thao tác.</p>
      </div>

      <div className="flex gap-6 h-full min-h-[500px]">
        {/* Vertical Tabs */}
        <div className="w-[240px] shrink-0 bg-white border border-[#e2e8f0] rounded-xl p-4 drop-shadow-sm flex flex-col gap-2">
          {["Cấu hình trung tâm", "Chi nhánh (Branches)", "Phân quyền (RBAC)", "Nhật ký hệ thống"].map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t)}
              className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === t 
                  ? "bg-blue-50 text-blue-700 font-bold" 
                  : "text-[#475569] hover:bg-slate-50 hover:text-[#0f172a]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-[#e2e8f0] rounded-xl drop-shadow-sm flex flex-col min-w-0">
          {activeTab === "Nhật ký hệ thống" && (
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-[#0f172a] text-lg">Audit Log</p>
                <div className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-3 py-2 rounded-lg w-[280px]">
                  <img src={iSearch2} alt="" className="size-4 shrink-0" />
                  <input
                    value={searchLog}
                    onChange={(e) => setSearchLog(e.target.value)}
                    placeholder="Tra cứu hành động, user..."
                    className="flex-1 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="border border-[#e2e8f0] overflow-hidden rounded-xl flex-1 flex flex-col">
                <div className="bg-[#f1f5f9] flex font-semibold items-center px-4 text-[#475569] text-[12px] border-b border-[#e2e8f0]">
                  <div className="py-3 w-[140px]">THỜI GIAN</div>
                  <div className="py-3 w-[140px]">NGƯỜI THỰC HIỆN</div>
                  <div className="py-3 flex-1">THAO TÁC / SỰ KIỆN</div>
                  <div className="py-3 w-[120px]">IP ADDRESS</div>
                </div>
                <div className="overflow-y-auto">
                  {filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-2">
                        📜
                      </div>
                      <p className="font-semibold text-slate-700 text-sm">Chưa có nhật ký hoạt động nào</p>
                      <p className="text-slate-400 text-xs mt-1">Các thao tác cập nhật dữ liệu, thanh toán hoặc đổi mật khẩu sẽ được tự động lưu vết tại đây.</p>
                    </div>
                  ) : (
                    filteredLogs.map(log => (
                      <div key={log.id} className="border-b border-[#f1f5f9] flex items-center px-4 py-3 hover:bg-slate-50 transition-colors">
                        <div className="w-[140px] text-[#475569] text-sm">{log.time}</div>
                        <div className="w-[140px] text-[#0f172a] text-sm font-medium">{log.user}</div>
                        <div className="flex-1">
                          <p className="text-[#0f172a] text-sm font-semibold">{log.action}</p>
                          <p className="text-[#64748b] text-[11px] mt-0.5 font-mono">
                            <span className="line-through opacity-70 text-red-500 mr-2">{log.oldVal}</span> 
                            <span className="text-green-600">{log.newVal}</span>
                          </p>
                        </div>
                        <div className="w-[120px] text-[#64748b] text-[12px] font-mono">{log.ip}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "Cấu hình trung tâm" && (
            <div className="p-8 flex flex-col max-w-2xl">
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Cấu hình thông tin trung tâm</h2>
              <p className="text-slate-500 text-sm mb-6">Thông tin này hiển thị trên phiếu hóa đơn, lịch tập và thông báo gửi đến hội viên.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên trung tâm</label>
                  <input
                    type="text"
                    value={centerConfig.name}
                    onChange={(e) => setCenterConfig({ ...centerConfig, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hotline hỗ trợ</label>
                    <input
                      type="text"
                      value={centerConfig.hotline}
                      onChange={(e) => setCenterConfig({ ...centerConfig, hotline: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email liên hệ</label>
                    <input
                      type="email"
                      value={centerConfig.email}
                      onChange={(e) => setCenterConfig({ ...centerConfig, email: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Địa chỉ trụ sở chính</label>
                  <input
                    type="text"
                    value={centerConfig.address}
                    onChange={(e) => setCenterConfig({ ...centerConfig, address: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Khung giờ hoạt động</label>
                  <input
                    type="text"
                    value={centerConfig.openHours}
                    onChange={(e) => setCenterConfig({ ...centerConfig, openHours: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => toast.success("Đã lưu thông tin cấu hình trung tâm thành công!")}
                    className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Chi nhánh (Branches)" && (
            <div className="p-8 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0f172a]">Danh sách chi nhánh</h2>
                  <p className="text-slate-500 text-sm mt-1">Hệ thống mạng lưới cơ sở trực thuộc SportCenter</p>
                </div>
                <button
                  onClick={() => toast.info("Đang mở form tạo cơ sở / chi nhánh mới...")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-all"
                >
                  + Thêm chi nhánh
                </button>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Cơ sở 1 - SportCenter Khu Công Nghệ Cao (Trụ sở chính)</p>
                    <p className="text-slate-500 text-xs mt-1">Long Thạnh Mỹ, TP. Thủ Đức | Hotline: 1900 6868</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Đang hoạt động</span>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Cơ sở 2 - SportCenter Quận 7</p>
                    <p className="text-slate-500 text-xs mt-1">Nguyễn Thị Thập, P. Tân Phú, Quận 7 | Hotline: 1900 6869</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Đang hoạt động</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Phân quyền (RBAC)" && (
            <div className="p-8 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0f172a]">Ma trận vai trò & quyền hạn (RBAC)</h2>
                  <p className="text-slate-500 text-sm mt-1">Kiểm soát phạm vi truy cập dữ liệu giữa Manager, Coach, Receptionist và Member.</p>
                </div>
                <button
                  onClick={() => toast.success("Đã đồng bộ chính sách phân quyền vai trò!")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-all"
                >
                  Đồng bộ quyền
                </button>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-sm">
                <div className="grid grid-cols-4 bg-slate-50 p-3 font-bold text-xs text-slate-600 uppercase">
                  <div>Vai trò (Role)</div>
                  <div>Quyền tài chính</div>
                  <div>Quyền lịch lớp / HLV</div>
                  <div>Quyền quản trị hội viên</div>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="grid grid-cols-4 p-3.5 items-center">
                    <span className="font-bold text-slate-900">Quản lý (Manager)</span>
                    <span className="text-emerald-600 font-medium">Toàn quyền (CRUD)</span>
                    <span className="text-emerald-600 font-medium">Toàn quyền (CRUD)</span>
                    <span className="text-emerald-600 font-medium">Toàn quyền (CRUD)</span>
                  </div>
                  <div className="grid grid-cols-4 p-3.5 items-center">
                    <span className="font-bold text-slate-900">Lễ tân (Receptionist)</span>
                    <span className="text-blue-600 font-medium">Thu ngân / POS</span>
                    <span className="text-blue-600 font-medium">Xem lịch & Check-in</span>
                    <span className="text-blue-600 font-medium">Tra cứu & Check-in</span>
                  </div>
                  <div className="grid grid-cols-4 p-3.5 items-center">
                    <span className="font-bold text-slate-900">HLV (Coach)</span>
                    <span className="text-slate-400 font-medium">Không có quyền</span>
                    <span className="text-blue-600 font-medium">Lớp phân công & Đánh giá</span>
                    <span className="text-blue-600 font-medium">Xem học viên lớp mình</span>
                  </div>
                  <div className="grid grid-cols-4 p-3.5 items-center">
                    <span className="font-bold text-slate-900">Hội viên (Member)</span>
                    <span className="text-slate-400 font-medium">Chỉ xem lịch sử cá nhân</span>
                    <span className="text-blue-600 font-medium">Đặt lớp & Đánh giá HLV</span>
                    <span className="text-slate-400 font-medium">Chỉ hồ sơ cá nhân</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}