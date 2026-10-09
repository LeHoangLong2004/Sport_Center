import React, { useState } from 'react';
import { iSearch2, iDownload, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iEye, iRotateCcw, iMore } from '../shared';

export function StaffPage() {
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("Tất cả")
  const [staffList, setStaffList] = useState<any[]>([])

  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    roleName: "receptionist"
  })

  const fetchStaff = () => {
    const token = localStorage.getItem("token");
    fetch("/api/users", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        const mapped = data
          .filter((u: any) => u.roleName && u.roleName.toLowerCase() !== "member")
          .map((u: any, index: number) => {
            const avatars = [mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4];
            return {
              id: u.id.substring(0, 8).toUpperCase(),
              realId: u.id,
              name: u.fullName,
              phone: u.phoneNumber || "N/A",
              email: u.email,
              role: u.roleName || "Nhân viên",
              status: u.status ? "Đang hoạt động" : "Tạm khóa",
              statusRaw: u.status,
              joined: new Date(u.createdAt).toLocaleDateString('vi-VN'),
              avatar: u.avatarUrl || avatars[index % avatars.length],
            };
          });
        setStaffList(mapped);
      }
    })
    .catch(err => console.error("Failed to fetch staff:", err));
  };

  React.useEffect(() => {
    fetchStaff();
  }, []);

  const handleToggleStatus = async (realId: string, currentStatus: boolean) => {
    if (!window.confirm(`Bạn có chắc muốn ${currentStatus ? "KHÓA" : "MỞ KHÓA"} tài khoản này không?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/${realId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: !currentStatus })
      });
      if (res.ok) {
        fetchStaff();
      } else {
        alert("Cập nhật trạng thái thất bại.");
      }
    } catch {
      alert("Lỗi kết nối.");
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ fullName: "", email: "", phoneNumber: "", password: "", roleName: "receptionist" });
        fetchStaff();
      } else {
        alert("Lỗi: " + (data.message || "Không thể tạo nhân sự"));
      }
    } catch (err) {
      alert("Lỗi kết nối khi tạo nhân sự.");
    }
  }

  const filtered = staffList.filter(m => {
    const q = query.toLowerCase()
    return (`${m.name} ${m.id} ${m.phone}`).toLowerCase().includes(q)
      && (roleFilter === "Tất cả" || String(m.role).toLowerCase() === roleFilter.toLowerCase())
  })

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }
    
    const headers = ["Mã NV", "Họ và tên", "Vai trò", "Số điện thoại", "Email", "Trạng thái", "Ngày tham gia"];
    const rows = filtered.map(m => [
      m.id,
      m.name,
      m.role,
      m.phone,
      m.email,
      m.status,
      m.joined
    ]);
    
    // Add BOM for UTF-8 Excel support
    const csvContent = "\uFEFF" + 
      headers.join(",") + "\n" + 
      rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `danh_sach_nhan_su_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusStyle: Record<string, string> = {
    "Đang hoạt động": "bg-[#dcfce7] text-[#15803d]",
    "Tạm khóa":       "bg-[#fee2e2] text-[#b91c1c]",
  }

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto relative">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-[#0f172a] text-[28px]">Quản lý nhân sự</p>
          <p className="text-[#64748b] text-sm mt-1">-- danh sách ban quản lý, lễ tân và huấn luyện viên.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
            <img src={iDownload} alt="" className="size-4" />
            <span className="font-semibold text-[#0f172a] text-sm">Xuất dữ liệu</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#2563eb] flex gap-2 items-center px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20">
            <span className="font-semibold text-white text-sm">+ Thêm nhân sự</span>
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#0f172a] mb-6">Thêm nhân sự mới</h2>
            <form onSubmit={handleAddStaff} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#475569] mb-1">Họ và tên</label>
                <input required type="text" className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 outline-none focus:border-blue-500" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#475569] mb-1">Email</label>
                <input required type="email" className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 outline-none focus:border-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="example@smartgym.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#475569] mb-1">Số điện thoại</label>
                <input required type="text" className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 outline-none focus:border-blue-500" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} placeholder="0987654321" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#475569] mb-1">Mật khẩu</label>
                <input required type="password" minLength={6} className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 outline-none focus:border-blue-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Ít nhất 6 ký tự" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#475569] mb-1">Vai trò (Role)</label>
                <select className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 outline-none focus:border-blue-500" value={formData.roleName} onChange={e => setFormData({...formData, roleName: e.target.value})}>
                  <option value="receptionist">Lễ tân (receptionist)</option>
                  <option value="coach">Huấn luyện viên (coach)</option>
                  <option value="manager">Quản lý trung tâm (manager)</option>
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-white border border-[#cbd5e1] font-semibold text-[#475569] py-2 rounded-lg hover:bg-slate-50 transition-colors">Hủy</button>
                <button type="submit" className="flex-1 bg-[#2563eb] font-semibold text-white py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md">Lưu nhân sự</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* filters */}
      <div className="flex gap-3 items-center mt-2">
        <div className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-3 py-2 rounded-lg flex-1 max-w-[320px]">
          <img src={iSearch2} alt="" className="size-4 shrink-0" />
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm theo tên, mã NV, số điện thoại..." className="flex-1 text-sm outline-none" />
        </div>
        <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="bg-white border border-[#cbd5e1] font-medium px-3 py-2 rounded-lg text-sm">
          <option value="Tất cả">Vai trò: Tất cả</option>
          <option value="Manager">Quản lý trung tâm (Manager)</option>
          <option value="Coach">Huấn luyện viên (Coach)</option>
          <option value="Receptionist">Lễ tân (Receptionist)</option>
        </select>
        <span className="ml-auto text-[#64748b] text-sm">Đã chọn 0 mục</span>
      </div>

      {/* table */}
      <div className="bg-white border border-[#e2e8f0] overflow-hidden rounded-xl">
        <div className="bg-[#f1f5f9] flex font-semibold items-center px-6 text-[#475569] text-[12px]">
          <div className="py-3 flex-1">NHÂN VIÊN</div>
          <div className="py-3 w-[180px]">VAI TRÒ</div>
          <div className="py-3 w-[200px]">LIÊN HỆ</div>
          <div className="py-3 w-[140px]">TRẠNG THÁI</div>
          <div className="py-3 w-[140px]">NGÀY THAM GIA</div>
          <div className="py-3 w-[100px] text-right">THAO TÁC</div>
        </div>
        {filtered.map(m=>(
          <div key={m.id} className="border-b border-[#f1f5f9] flex h-16 items-center px-6">
            <div className="flex gap-2.5 items-center flex-1">
              <img src={m.avatar} alt="" className="rounded-full size-9 object-cover" />
              <div>
                <p className="font-semibold text-[#0f172a] text-sm">{m.name}</p>
                <p className="text-[#64748b] text-[12px]">{m.id}</p>
              </div>
            </div>
            <div className="w-[180px]">
              <span className="text-[#0f172a] text-sm font-medium">{m.role}</span>
            </div>
            <div className="w-[200px]">
              <p className="text-[#0f172a] text-sm">{m.phone}</p>
              <p className="text-[#64748b] text-[12px]">{m.email}</p>
            </div>
            <div className="w-[140px]">
              <span className={`font-semibold px-2.5 py-1 rounded-full text-[12px] ${statusStyle[m.status]}`}>{m.status}</span>
            </div>
            <div className="w-[140px]"><p className="text-[#0f172a] text-sm">{m.joined}</p></div>
            <div className="flex gap-2 items-center justify-end w-[100px]">
              <button 
                onClick={() => handleToggleStatus(m.realId, m.statusRaw)} 
                title={m.statusRaw ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                className={`flex items-center justify-center rounded-md size-8 border ${m.statusRaw ? 'bg-white border-[#e2e8f0] hover:bg-red-50' : 'bg-red-100 border-red-200 hover:bg-green-100'}`}
              >
                <img src={m.statusRaw ? iEye : iRotateCcw} alt="Toggle Status" className="size-4" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex h-20 items-center justify-center">
            <p className="text-[#64748b] text-sm">Không tìm thấy nhân sự phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  )
}
