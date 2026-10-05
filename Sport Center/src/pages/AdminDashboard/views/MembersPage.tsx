import React, { useState } from 'react';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members } from '../shared';
import KpiCard from '../components/KpiCard';
import SimpleLineChart from '../components/SimpleLineChart';
import { FinanceTopBar } from '../components/FinanceTopBar';

export function MembersPage({ onEditMember }: { onEditMember: (member: any) => void }) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [membersList, setMembersList] = useState<any[]>([])

  const fetchUsers = () => {
    const token = localStorage.getItem("token");
    fetch("/api/users", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        const mapped = data.map((u: any, index: number) => {
          const avatars = [mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4];
          return {
            id: u.id.substring(0, 8).toUpperCase(),
            realId: u.id,
            name: u.fullName,
            phone: u.phoneNumber || "N/A",
            email: u.email,
            pkg: u.roleName || "Member",
            vip: false,
            status: u.status ? "Đang hoạt động" : "Tạm khóa",
            statusRaw: u.status,
            expiry: new Date(u.createdAt).toLocaleDateString('vi-VN'),
            avatar: u.avatarUrl || avatars[index % avatars.length],
            dob: u.dateOfBirth ? u.dateOfBirth.split('T')[0] : "",
            gender: u.gender,
            emergencyContact: u.emergencyContact
          };
        });
        setMembersList(mapped);
      }
    })
    .catch(err => console.error("Failed to fetch users:", err));
  };

  React.useEffect(() => {
    fetchUsers();
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
        fetchUsers();
      } else {
        alert("Cập nhật trạng thái thất bại.");
      }
    } catch {
      alert("Lỗi kết nối.");
    }
  };

  const filtered = membersList.filter(m => {
    const q = query.toLowerCase()
    return (`${m.name} ${m.id} ${m.phone}`).toLowerCase().includes(q)
      && (statusFilter === "Tất cả" || m.status === statusFilter)
  })

  const statusStyle: Record<string, string> = {
    "Đang hoạt động": "bg-[#dcfce7] text-[#15803d]",
    "Sắp hết hạn":    "bg-[#fef3c7] text-[#b45309]",
    "Tạm khóa":       "bg-[#fee2e2] text-[#b91c1c]",
  }

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-[#0f172a] text-[28px]">Quản lý người dùng</p>
          <p className="text-[#64748b] text-sm mt-1">-- hồ sơ đang được quản lý tập trung trên toàn hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => alert("Đang xuất dữ liệu ra file Excel...")} className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-4 py-2.5 rounded-lg">
            <img src={iDownload} alt="" className="size-4" />
            <span className="font-semibold text-[#0f172a] text-sm">Xuất dữ liệu Excel</span>
          </button>
          <button onClick={() => alert("Vui lòng sử dụng màn hình Đăng ký (Register) để tạo tài khoản mới.")} className="bg-[#2563eb] flex gap-2 items-center px-4 py-2.5 rounded-lg">
            <span className="font-semibold text-white text-sm">+ Thêm hội viên mới</span>
          </button>
        </div>
      </div>

      {/* tabs */}
      <div className="border-b border-[#e2e8f0] flex gap-6">
        {[["Thành viên","--"],["Huấn luyện viên","--"],["Nhân viên","--"]].map(([t,c],i)=>(
          <button key={t} className={`pb-3 text-sm ${i===0?"border-b-2 border-[#2563eb] font-bold text-[#2563eb]":"font-medium text-[#64748b]"}`}>{t} ({c})</button>
        ))}
      </div>

      {/* filters */}
      <div className="flex gap-3 items-center">
        <div className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-3 py-2 rounded-lg flex-1 max-w-[320px]">
          <img src={iSearch2} alt="" className="size-4 shrink-0" />
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm theo tên, mã hội viên, số điện thoại..." className="flex-1 text-sm outline-none" />
        </div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="bg-white border border-[#cbd5e1] font-medium px-3 py-2 rounded-lg text-sm">
          <option value="Tất cả">Trạng thái: Tất cả</option>
          <option>Đang hoạt động</option>
          <option>Sắp hết hạn</option>
          <option>Tạm khóa</option>
        </select>
        <select className="bg-white border border-[#cbd5e1] font-medium px-3 py-2 rounded-lg text-sm">
          <option>Gói tập: Tất cả</option>
          <option>Premium 12 tháng</option>
          <option>Fitness 6 tháng</option>
        </select>
        <span className="ml-auto text-[#64748b] text-sm">Đã chọn 0 mục</span>
      </div>

      {/* table */}
      <div className="bg-white border border-[#e2e8f0] overflow-hidden rounded-xl">
        <div className="bg-[#f1f5f9] flex font-semibold items-center px-6 text-[#475569] text-[12px]">
          <div className="py-3 w-8"><input type="checkbox" /></div>
          <div className="py-3 flex-1">HỘI VIÊN</div>
          <div className="py-3 w-[170px]">GÓI HIỆN TẠI</div>
          <div className="py-3 w-[180px]">LIÊN HỆ</div>
          <div className="py-3 w-[140px]">TRẠNG THÁI</div>
          <div className="py-3 w-[120px]">NGÀY HẾT HẠN</div>
          <div className="py-3 w-[120px] text-right">THAO TÁC</div>
        </div>
        {filtered.map(m=>(
          <div key={m.id} className="border-b border-[#f1f5f9] flex h-16 items-center px-6">
            <div className="w-8"><input type="checkbox" /></div>
            <div className="flex gap-2.5 items-center flex-1">
              <img src={m.avatar} alt="" className="rounded-full size-9 object-cover" />
              <div>
                <p className="font-semibold text-[#0f172a] text-sm">{m.name}</p>
                <p className="text-[#64748b] text-[12px]">{m.id}</p>
              </div>
            </div>
            <div className="w-[170px]">
              <span className="text-[#0f172a] text-sm">{m.pkg}</span>
              {m.vip && <span className="bg-[#fef3c7] font-bold ml-1.5 px-1.5 py-0.5 rounded text-[#b45309] text-[10px]">VIP</span>}
            </div>
            <div className="w-[180px]">
              <p className="text-[#0f172a] text-sm">{m.phone}</p>
              <p className="text-[#64748b] text-[12px]">{m.email}</p>
            </div>
            <div className="w-[140px]">
              <span className={`font-semibold px-2.5 py-1 rounded-full text-[12px] ${statusStyle[m.status]}`}>{m.status}</span>
            </div>
            <div className="w-[120px]"><p className="text-[#0f172a] text-sm">{m.expiry}</p></div>
            <div className="flex gap-2 items-center justify-end w-[120px]">
              <button 
                onClick={() => handleToggleStatus(m.realId, m.statusRaw)} 
                title={m.statusRaw ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                className={`flex items-center justify-center rounded-md size-8 border ${m.statusRaw ? 'bg-white border-[#e2e8f0] hover:bg-red-50' : 'bg-red-100 border-red-200 hover:bg-green-100'}`}
              >
                <img src={m.statusRaw ? iEye : iRotateCcw} alt="Toggle Status" className="size-4" />
              </button>
              <button onClick={() => onEditMember(m)} title="Sửa thông tin" className="bg-white border border-[#e2e8f0] hover:bg-blue-50 flex items-center justify-center rounded-md size-8">
                <img src={iMore} alt="Edit" className="size-4" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex h-20 items-center justify-center">
            <p className="text-[#64748b] text-sm">Không tìm thấy hội viên phù hợp.</p>
          </div>
        )}
        <div className="flex h-14 items-center justify-between px-6">
          <span className="text-[#64748b] text-sm">Hiển thị 1-{filtered.length} trong tổng số 2.214 hội viên</span>
          <div className="flex gap-2">
            {["‹ Trước","1","2","3","...","222","Sau ›"].map((p,i)=>(
              <button key={i} className={`flex items-center px-3 py-1.5 rounded-md text-[13px] ${p==="1"?"bg-[#2563eb] font-semibold text-white":"bg-white border border-[#e2e8f0] text-[#0f172a]"}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SETTINGS PAGE ─────────────────────────────────────────────────────────────