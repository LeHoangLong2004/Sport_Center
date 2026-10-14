import React, { useState } from 'react';
import { iSearch2, iPlus } from '../shared';

export function FacilitiesPage() {
  const [sports, setSports] = useState<any[]>([])
  const [facilities, setFacilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sportQuery, setSportQuery] = useState("")
  const [facilityQuery, setFacilityQuery] = useState("")

  // Modal states
  const [showModal, setShowModal] = useState<"sport" | "facility" | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [sportsRes, facilitiesRes] = await Promise.all([
          fetch("/api/sports", { headers: { "Authorization": `Bearer ${token}` } }),
          fetch("/api/facilities", { headers: { "Authorization": `Bearer ${token}` } })
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

  const handleSubmitItem = async () => {
    if (!newItemName.trim() || !showModal) return;
    setSubmitError("");
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const endpoint = showModal === "sport" ? "/api/sports" : "/api/facilities";
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name: newItemName.trim() })
      });
      
      if (res.ok) {
        const newItem = await res.json();
        if (showModal === "sport") {
          setSports(prev => [...prev, newItem]);
        } else {
          setFacilities(prev => [...prev, newItem]);
        }
        setShowModal(null);
        setNewItemName("");
      } else {
        const body = await res.text();
        let message = body;
        try {
          const parsed = JSON.parse(body);
          message = parsed?.message || parsed?.detail || parsed?.title || body;
        } catch { }
        setSubmitError(message || `Thêm ${showModal === "sport" ? "bộ môn" : "phòng tập"} thất bại.`);
      }
    } catch (err) {
      setSubmitError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSports = sports.filter(s => s.name.toLowerCase().includes(sportQuery.toLowerCase()));
  const filteredFacilities = facilities.filter(f => f.name.toLowerCase().includes(facilityQuery.toLowerCase()));
  const shortId = (id: string) => id ? id.substring(0, 8).toUpperCase() : "—";

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
            <button onClick={() => { setShowModal("sport"); setNewItemName(""); }} className="bg-white border border-[#cbd5e1] hover:bg-slate-50 flex gap-1.5 items-center px-3 py-1.5 rounded-md transition-colors">
              <img src={iPlus} alt="" className="size-3.5 opacity-70" />
              <span className="font-semibold text-[#0f172a] text-xs">Thêm bộ môn</span>
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#cbd5e1] bg-white px-3 py-2">
            <img src={iSearch2} alt="" className="size-4" />
            <input value={sportQuery} onChange={e => setSportQuery(e.target.value)} placeholder="Tìm bộ môn..." className="w-full text-sm outline-none" />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#cbd5e1] bg-white px-3 py-2">
            <img src={iSearch2} alt="" className="size-4" />
            <input value={facilityQuery} onChange={e => setFacilityQuery(e.target.value)} placeholder="Tìm phòng tập..." className="w-full text-sm outline-none" />
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
            ) : filteredSports.length === 0 ? (
              <div className="p-5 text-center text-sm text-slate-500">Không tìm thấy bộ môn phù hợp.</div>
            ) : filteredSports.map(s => (
              <div key={s.id} className="border-b border-[#f1f5f9] flex items-center px-5 py-3">
                <div className="flex-1 font-semibold text-sm text-[#0f172a]">{s.name}</div>
                <div className="w-[100px] text-xs text-slate-400 font-mono">{shortId(s.id)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Phòng tập */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#0f172a]">Phòng tập (Facilities)</h3>
            <button onClick={() => { setShowModal("facility"); setNewItemName(""); }} className="bg-white border border-[#cbd5e1] hover:bg-slate-50 flex gap-1.5 items-center px-3 py-1.5 rounded-md transition-colors">
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
            ) : filteredFacilities.length === 0 ? (
              <div className="p-5 text-center text-sm text-slate-500">Không tìm thấy phòng tập phù hợp.</div>
            ) : filteredFacilities.map(f => (
              <div key={f.id} className="border-b border-[#f1f5f9] flex items-center px-5 py-3">
                <div className="flex-1 font-semibold text-sm text-[#0f172a]">{f.name}</div>
                <div className="w-[100px] text-xs text-slate-400 font-mono">{shortId(f.id)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {showModal === "sport" ? "Thêm bộ môn mới" : "Thêm phòng tập mới"}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Nhập tên {showModal === "sport" ? "bộ môn" : "phòng tập"} để sử dụng trong lịch và lớp học.
            </p>
            {submitError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</div>}
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tên {showModal === "sport" ? "bộ môn" : "phòng tập"} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={newItemName}
                onChange={(e) => { setNewItemName(e.target.value); setSubmitError(""); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitItem(); }}
                autoFocus
                placeholder={showModal === "sport" ? "Ví dụ: Bơi lội, Yoga" : "Ví dụ: Studio 1, Gym Area"}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(null)} 
                disabled={isSubmitting}
                className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSubmitItem}
                disabled={!newItemName.trim() || isSubmitting}
                className="px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Đang lưu..." : "Xác nhận thêm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
