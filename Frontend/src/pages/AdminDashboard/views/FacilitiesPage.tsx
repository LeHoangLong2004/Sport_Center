import React, { useState } from 'react';
import { iSearch2, iPlus } from '../shared';

export function FacilitiesPage() {
  const [sports, setSports] = useState<any[]>([])
  const [facilities, setFacilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [sportsRes, facilitiesRes] = await Promise.all([
          fetch("/api/sports"),
          fetch("/api/facilities")
        ]);
        
        if (sportsRes.ok) setSports(await sportsRes.json());
        if (facilitiesRes.ok) setFacilities(await facilitiesRes.json());
      } catch (err) {
        console.error("Failed to fetch sports/facilities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-[#0f172a] text-[28px]">Bộ môn & Phòng tập</p>
          <p className="text-[#64748b] text-sm mt-1">-- quản lý các môn thể thao và phòng tập của trung tâm.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Bộ môn */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#0f172a]">Bộ môn (Sports)</h3>
            <button className="bg-white border border-[#cbd5e1] hover:bg-slate-50 flex gap-1.5 items-center px-3 py-1.5 rounded-md transition-colors">
              <img src={iPlus} alt="" className="size-3.5 opacity-70" />
              <span className="font-semibold text-[#0f172a] text-xs">Thêm bộ môn</span>
            </button>
          </div>
          <div className="bg-white border border-[#e2e8f0] overflow-hidden rounded-xl shadow-sm">
            <div className="bg-[#f1f5f9] flex font-semibold items-center px-5 py-3 text-[#475569] text-[12px]">
              <div className="flex-1">TÊN BỘ MÔN</div>
              <div className="w-[100px]">ID RÚT GỌN</div>
            </div>
            {loading ? (
              <div className="p-5 text-center text-sm text-slate-500">Đang tải...</div>
            ) : sports.length === 0 ? (
              <div className="p-5 text-center text-sm text-slate-500">Chưa có dữ liệu bộ môn.</div>
            ) : sports.map(s => (
              <div key={s.id} className="border-b border-[#f1f5f9] flex items-center px-5 py-3">
                <div className="flex-1 font-semibold text-sm text-[#0f172a]">{s.name}</div>
                <div className="w-[100px] text-xs text-slate-400 font-mono">{s.id.substring(0, 8)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Phòng tập */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#0f172a]">Phòng tập (Facilities)</h3>
            <button className="bg-white border border-[#cbd5e1] hover:bg-slate-50 flex gap-1.5 items-center px-3 py-1.5 rounded-md transition-colors">
              <img src={iPlus} alt="" className="size-3.5 opacity-70" />
              <span className="font-semibold text-[#0f172a] text-xs">Thêm phòng tập</span>
            </button>
          </div>
          <div className="bg-white border border-[#e2e8f0] overflow-hidden rounded-xl shadow-sm">
            <div className="bg-[#f1f5f9] flex font-semibold items-center px-5 py-3 text-[#475569] text-[12px]">
              <div className="flex-1">TÊN PHÒNG TẬP</div>
              <div className="w-[100px]">ID RÚT GỌN</div>
            </div>
            {loading ? (
              <div className="p-5 text-center text-sm text-slate-500">Đang tải...</div>
            ) : facilities.length === 0 ? (
              <div className="p-5 text-center text-sm text-slate-500">Chưa có dữ liệu phòng tập.</div>
            ) : facilities.map(f => (
              <div key={f.id} className="border-b border-[#f1f5f9] flex items-center px-5 py-3">
                <div className="flex-1 font-semibold text-sm text-[#0f172a]">{f.name}</div>
                <div className="w-[100px] text-xs text-slate-400 font-mono">{f.id.substring(0, 8)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
