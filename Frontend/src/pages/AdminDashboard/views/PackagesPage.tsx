import React, { useState } from 'react';
import { iPackage, iCheckCircle, iSearch2, mAvatar0, mAvatar1, mAvatar2 } from '../shared';

export function PackagesPage() {
  const [activeTab, setActiveTab] = useState("Danh mục gói");
  const [packages, setPackages] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState("");
  const [customFeatures, setCustomFeatures] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    packageType: "membership",
    monthlyPrice: 0,
    features: [] as string[]
  });

  const handleEdit = (pkg: any) => {
    setFormData({
      id: pkg.id,
      name: pkg.name,
      packageType: pkg.tag === "Gói Thành Viên" ? "membership" : "sport",
      monthlyPrice: pkg.monthlyPrice || parseInt(pkg.price.replace(/\D/g, "")),
      features: pkg.features
    });
    setEditingId(pkg.id);
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    const trimmed = newFeature.trim();
    if (trimmed && !formData.features.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, trimmed]
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const fetchPackages = () => {
    fetch("/api/packages")
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((pkg: any, index: number) => {
          const colors = [
            "from-amber-400 to-amber-600",
            "from-blue-500 to-indigo-600",
            "from-emerald-400 to-teal-500",
            "from-purple-500 to-fuchsia-600"
          ];
          return {
            id: pkg.id,
            name: pkg.name,
            monthlyPrice: pkg.monthlyPrice,
            status: pkg.status,
            price: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.monthlyPrice),
            duration: "1 tháng",
            color: colors[index % colors.length],
            features: pkg.features?.map((f: any) => typeof f === 'string' ? f : (f.featureText || "")) || [],
            tag: pkg.packageType === "membership" ? "Gói Thành Viên" : "Gói Tập"
          };
        });
        setPackages(mapped);
      })
      .catch(err => console.error("Failed to fetch packages:", err));
  };

  React.useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn khóa/xóa gói này không?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/packages/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchPackages();
      else alert("Xóa gói thất bại");
    } catch {
      alert("Lỗi kết nối");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        id: formData.id || "PKG-" + Date.now(),
        name: formData.name,
        packageType: formData.packageType,
        monthlyPrice: formData.monthlyPrice,
        yearlyPrice: formData.monthlyPrice * 10, // Giả lập giảm giá năm
        features: formData.features
      };

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/packages/${editingId}` : `/api/packages`;
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        setNewFeature("");
        fetchPackages();
        setFormData({ id: "", name: "", packageType: "membership", monthlyPrice: 0, features: [] });
      } else {
        const data = await res.json().catch(()=>({}));
        alert("Thêm gói thất bại: " + (data.message || res.statusText));
      }
    } catch {
      alert("Lỗi kết nối");
    }
  };

  const recentSubscriptions: any[] = [];

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-[#0f172a] text-[28px]">Gói hội viên</p>
          <p className="text-[#64748b] text-sm mt-1">Quản lý danh mục gói cước và theo dõi hợp đồng hội viên.</p>
        </div>
        <button onClick={() => {setIsModalOpen(true); setEditingId(null); setNewFeature(""); setFormData({ id: "", name: "", packageType: "membership", monthlyPrice: 0, features: [] })}} className="bg-[#2563eb] flex gap-2 items-center px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
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
                  {pkg.features.map((feat: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, i: React.Key | null | undefined) => (
                    <div key={i} className="flex gap-3 items-start">
                      <img src={iCheckCircle} alt="check" className="size-5 shrink-0 opacity-70" />
                      <span className="text-[#475569] text-sm leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(pkg)} className="flex-1 border border-[#cbd5e1] py-2 rounded-lg text-sm font-semibold text-[#0f172a] hover:bg-slate-50 transition-colors">Sửa</button>
                  {pkg.status !== false ? (
                    <button onClick={() => handleDelete(pkg.id)} className="flex-1 bg-slate-100 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">Khóa</button>
                  ) : (
                    <div className="flex-1 bg-red-100 py-2 rounded-lg text-sm font-bold text-red-700 text-center flex justify-center items-center cursor-not-allowed">Đã khóa</div>
                  )}
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

      {/* Modal Tạo Gói Mới */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">{editingId ? "Sửa Gói Tập" : "Tạo Gói Tập Mới"}</h3>
              <button onClick={() => {setIsModalOpen(false); setEditingId(null); setNewFeature(""); setFormData({ id: "", name: "", packageType: "membership", monthlyPrice: 0, features: [] })}} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mã Gói (ID)</label>
                <input disabled={!!editingId} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} placeholder="VD: PKG-YOGA" className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 ${editingId ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`} required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên Gói</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Premium Fitness" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Loại Gói</label>
                <select value={formData.packageType} onChange={e => setFormData({...formData, packageType: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  <option value="membership">Gói Thành Viên</option>
                  <option value="sport">Gói Tập</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Giá Tháng (VNĐ)</label>
                <input type="number" value={formData.monthlyPrice} onChange={e => setFormData({...formData, monthlyPrice: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
              </div>
              <div className="mt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Danh sách quyền lợi</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={e => setNewFeature(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                      placeholder="Tính năng mới..."
                      className="w-48 bg-slate-50 border border-slate-100 rounded-full px-4 py-2.5 text-[13px] focus:outline-none focus:border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="flex items-center gap-1 bg-white text-emerald-600 font-bold px-4 py-2.5 rounded-full text-[11px] border border-emerald-100 hover:bg-emerald-50 transition-colors shrink-0"
                    >
                      <span>+</span> THÊM
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                  {formData.features.map((feat, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-[12px] px-5 py-3.5 group">
                      <div className="flex items-center gap-3">
                        <svg className="w-[18px] h-[18px] text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className="font-extrabold text-slate-700 text-[13px]">{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      >
                        <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  ))}
                  {formData.features.length === 0 && (
                    <p className="text-[13px] text-slate-400 italic text-center py-6 border border-dashed border-slate-200 rounded-xl">Chưa có quyền lợi nào.</p>
                  )}
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => {setIsModalOpen(false); setEditingId(null); setNewFeature(""); setFormData({ id: "", name: "", packageType: "membership", monthlyPrice: 0, features: [] })}} className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-slate-200">Hủy</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-blue-700">{editingId ? "Lưu Thay Đổi" : "Xác Nhận Tạo"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
