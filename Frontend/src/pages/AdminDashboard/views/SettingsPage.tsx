import React, { useState } from 'react';
import { iSettings, iCheckCircle, iSearch2, mAvatar0 } from '../shared';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Nhật ký hệ thống");

  const auditLogs: any[] = [];

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
              className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
          {activeTab === "Nhật ký hệ thống" ? (
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-[#0f172a] text-lg">Audit Log</p>
                <div className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-3 py-2 rounded-lg w-[280px]">
                  <img src={iSearch2} alt="" className="size-4 shrink-0" />
                  <input placeholder="Tra cứu hành động, user..." className="flex-1 text-sm outline-none" />
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
                  {auditLogs.map(log => (
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
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
              <img src={iSettings} alt="Cài đặt" className="size-16 mx-auto mb-2 opacity-30" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">Form {activeTab}</h2>
              <p className="text-slate-500 text-sm max-w-md">Khu vực cấu hình các tham số hệ thống. Tạm thời hiển thị chi tiết phần "Nhật ký hệ thống" theo yêu cầu quan trọng.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}