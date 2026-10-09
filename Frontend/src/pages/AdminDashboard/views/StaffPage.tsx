import React, { useState } from 'react';
import { iSearch2, iDownload, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iEye, iRotateCcw, iMore } from '../shared';

export function StaffPage() {
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("Tất cả")
  const [staffList, setStaffList] = useState<any[]>([])

  const fetchStaff = () => {
    const token = localStorage.getItem("token");
    fetch("/api/users", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        const mapped = data
          .filter((u: any) => u.roleName && u.roleName !== "Member")
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

  const filtered = staffList.filter(m => {
    const q = query.toLowerCase()
    return (`${m.name} ${m.id} ${m.phone}`).toLowerCase().includes(q)
      && (roleFilter === "Tất cả" || m.role === roleFilter)
  })

  const statusStyle: Record<string, string> = {
    "Đang hoạt động": "bg-[#dcfce7] text-[#15803d]",
    "Tạm khóa":       "bg-[#fee2e2] text-[#b91c1c]",
  }

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-[#0f172a] text-[28px]">Quản lý nhân sự</p>
          <p className="text-[#64748b] text-sm mt-1">-- danh sách ban quản lý, lễ tân và huấn luyện viên.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => alert("Đang xuất dữ liệu ra file Excel...")} className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-4 py-2.5 rounded-lg">
            <img src={iDownload} alt="" className="size-4" />
            <span className="font-semibold text-[#0f172a] text-sm">Xuất dữ liệu</span>
          </button>
          <button onClick={() => alert("Vui lòng sử dụng màn hình Đăng ký (Register) với tư cách Quản lý để tạo tài khoản nhân sự.")} className="bg-[#2563eb] flex gap-2 items-center px-4 py-2.5 rounded-lg">
            <span className="font-semibold text-white text-sm">+ Thêm nhân sự</span>
          </button>
        </div>
      </div>

      {/* filters */}
      <div className="flex gap-3 items-center mt-2">
        <div className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-3 py-2 rounded-lg flex-1 max-w-[320px]">
          <img src={iSearch2} alt="" className="size-4 shrink-0" />
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm theo tên, mã NV, số điện thoại..." className="flex-1 text-sm outline-none" />
        </div>
        <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="bg-white border border-[#cbd5e1] font-medium px-3 py-2 rounded-lg text-sm">
          <option value="Tất cả">Vai trò: Tất cả</option>
          <option value="Manager">Quản lý trung tâm (Manager)</option>
          <option value="Admin">Quản trị hệ thống (Admin)</option>
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
