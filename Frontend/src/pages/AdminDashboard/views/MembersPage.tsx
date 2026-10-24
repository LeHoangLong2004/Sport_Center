import React, { useState } from 'react';
import { toast } from 'sonner';
import { LockKeyhole, UnlockKeyhole } from 'lucide-react';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members } from '../shared';
import { UserAvatar } from '../../../components/UserAvatar';
import KpiCard from '../components/KpiCard';
import SimpleLineChart from '../components/SimpleLineChart';
import { FinanceTopBar } from '../components/FinanceTopBar';
import { DateInput } from '../../../components/DateInput';

export function MembersPage({ onEditMember }: { onEditMember: (member: any) => void }) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("Thành viên")
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateMember, setShowCreateMember] = useState(false);
  const [isCreatingMember, setIsCreatingMember] = useState(false);
  const [createError, setCreateError] = useState("");
  const rowsPerPage = 10;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, activeTab]);

  const fetchUsers = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch("/api/users", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        const mapped = data.map((u: any) => {
          return {
            id: u.id.substring(0, 8).toUpperCase(),
            realId: u.id,
            name: u.fullName,
            phone: u.phoneNumber || "N/A",
            email: u.email,
            roleName: u.roleName?.toLowerCase() || "member",
            pkg: u.roleName || "Member",
            vip: false,
            status: u.status ? "Đang hoạt động" : "Tạm khóa",
            statusRaw: u.status,
            expiry: new Date(u.createdAt).toLocaleDateString('vi-VN'),
            avatar: u.avatarUrl || null,
            dob: u.dateOfBirth ? u.dateOfBirth.split('T')[0] : "",
            gender: u.gender,
            emergencyContact: u.emergencyContact
          };
        });
        setAllUsers(mapped);
      }
    })
    .catch(err => console.error("Failed to fetch users:", err))
    .finally(() => setLoading(false));
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
        toast.success("Đã cập nhật trạng thái tài khoản!");
      } else {
        toast.error("Cập nhật trạng thái thất bại.");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ.");
    }
  };

  const handleCreateMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      fullName: String(form.get("fullName") || "").trim(),
      email: String(form.get("email") || "").trim(),
      phoneNumber: String(form.get("phoneNumber") || "").trim(),
      password: String(form.get("password") || ""),
      dateOfBirth: form.get("dateOfBirth") || null,
      gender: String(form.get("gender") || "").trim() || null,
      emergencyContact: String(form.get("emergencyContact") || "").trim() || null,
    };

    setIsCreatingMember(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users/members", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const rawBody = await response.text();
        let message = rawBody;
        try {
          const body = JSON.parse(rawBody);
          message = body?.message || body?.detail || body?.title || rawBody;
        } catch {
          // Keep the plain-text response when the API does not return JSON.
        }
        throw new Error(message || `Không thể tạo hội viên (HTTP ${response.status}).`);
      }
      setShowCreateMember(false);
      fetchUsers();
      toast.success("Đã thêm hội viên mới thành công.");
    } catch (error: any) {
      setCreateError(error.message || "Lỗi kết nối đến máy chủ.");
    } finally {
      setIsCreatingMember(false);
    }
  };

  const tabs = [
    { label: "Thành viên", filter: (u: any) => u.roleName === "member" },
    { label: "Huấn luyện viên", filter: (u: any) => u.roleName === "coach" || u.roleName === "pt" },
    { label: "Nhân viên", filter: (u: any) => !["member", "coach", "pt"].includes(u.roleName) }
  ];

  const currentTabObj = tabs.find(t => t.label === activeTab) || tabs[0];
  const listForTab = allUsers.filter(currentTabObj.filter);

  const filtered = listForTab.filter(m => {
    const q = query.toLowerCase()
    return (`${m.name} ${m.id} ${m.phone}`).toLowerCase().includes(q)
      && (statusFilter === "Tất cả" || m.status === statusFilter)
  })

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paginatedList = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({length: totalPages}, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.warning("Không có dữ liệu để xuất!");
      return;
    }
    
    const headers = ["Mã HV", "Họ và tên", "Gói tập", "Số điện thoại", "Email", "Trạng thái", "Ngày đăng ký/Hết hạn"];
    const rows = filtered.map(m => [
      m.id,
      m.name,
      m.pkg,
      m.phone,
      m.email,
      m.status,
      m.expiry
    ]);
    
    // Add BOM for UTF-8 Excel support
    const csvContent = "\uFEFF" + 
      headers.join(",") + "\n" + 
      rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `danh_sach_hoi_vien_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <button onClick={handleExportCSV} className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
            <img src={iDownload} alt="" className="size-4" />
            <span className="font-semibold text-[#0f172a] text-sm">Xuất dữ liệu Excel</span>
          </button>
          <button onClick={() => { setCreateError(""); setShowCreateMember(true); }} className="bg-[#2563eb] flex gap-2 items-center px-4 py-2.5 rounded-lg">
            <span className="font-semibold text-white text-sm">+ Thêm hội viên mới</span>
          </button>
        </div>
      </div>

      {/* tabs */}
      <div className="border-b border-[#e2e8f0] flex gap-6">
        {tabs.map((t, i) => {
          const count = allUsers.filter(t.filter).length;
          const isActive = t.label === activeTab;
          return (
            <button 
              key={t.label} 
              onClick={() => setActiveTab(t.label)}
              className={`pb-3 text-sm transition-colors ${isActive ? "border-b-2 border-[#2563eb] font-bold text-[#2563eb]" : "font-medium text-[#64748b] hover:text-[#0f172a]"}`}
            >
              {t.label} ({count})
            </button>
          )
        })}
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="size-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[#64748b] text-sm font-medium">Đang tải danh sách hội viên...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-24 items-center justify-center">
            <p className="text-[#64748b] text-sm">Không tìm thấy hội viên phù hợp.</p>
          </div>
        ) : (
          paginatedList.map(m=>(
            <div key={m.id} className="border-b border-[#f1f5f9] flex h-16 items-center px-6">
              <div className="w-8"><input type="checkbox" /></div>
              <div className="flex gap-2.5 items-center flex-1">
                <UserAvatar src={m.avatar} name={m.name} className="rounded-full size-9 object-cover" />
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
                  aria-label={m.statusRaw ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                  className={`inline-flex min-w-[72px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer ${m.statusRaw
                    ? 'border-rose-200 bg-rose-50 text-rose-600 hover:border-rose-300 hover:bg-rose-100 focus:ring-rose-300'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 focus:ring-emerald-300'}`}
                >
                  {m.statusRaw ? <LockKeyhole size={14} strokeWidth={2.2} /> : <UnlockKeyhole size={14} strokeWidth={2.2} />}
                  <span>{m.statusRaw ? "Khóa" : "Mở khóa"}</span>
                </button>
                <button onClick={() => onEditMember(m)} title="Sửa thông tin" className="bg-white border border-[#e2e8f0] hover:bg-blue-50 flex items-center justify-center rounded-md size-8 cursor-pointer transition-colors">
                  <img src={iMore} alt="Edit" className="size-4" />
                </button>
              </div>
            </div>
          ))
        )}
        <div className="flex h-14 items-center justify-between px-6">
          <span className="text-[#64748b] text-sm">
            Hiển thị {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filtered.length)} trong tổng số {filtered.length} {currentTabObj.label.toLowerCase()}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-1.5 rounded-md text-[13px] ${currentPage === 1 ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-slate-50 transition-colors"}`}
            >
              ‹ Trước
            </button>
            {getPageNumbers().map((p, i) => (
              <button 
                key={i} 
                onClick={() => typeof p === 'number' && setCurrentPage(p)}
                disabled={p === '...'}
                className={`flex items-center px-3 py-1.5 rounded-md text-[13px] transition-colors ${p === currentPage ? "bg-[#2563eb] font-semibold text-white" : p === '...' ? "bg-transparent text-slate-400 cursor-default" : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-slate-50"}`}
              >
                {p}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-1.5 rounded-md text-[13px] ${currentPage === totalPages ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-slate-50 transition-colors"}`}
            >
              Sau ›
            </button>
          </div>
        </div>
      </div>
      {showCreateMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form onSubmit={handleCreateMember} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#0f172a]">Thêm hội viên mới</h2>
                <p className="mt-1 text-sm text-[#64748b]">Tài khoản sẽ được tạo với quyền hội viên.</p>
              </div>
              <button type="button" onClick={() => setShowCreateMember(false)} className="text-2xl text-slate-400 hover:text-slate-700">×</button>
            </div>
            {createError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{createError}</div>}
            <div className="grid grid-cols-2 gap-4">
              <label className="col-span-2 flex flex-col gap-1 text-sm font-semibold text-[#0f172a]">Họ và tên *<input name="fullName" required className="rounded-lg border border-[#cbd5e1] px-3 py-2.5 font-normal outline-none focus:border-blue-500" /></label>
              <label className="flex flex-col gap-1 text-sm font-semibold text-[#0f172a]">Email *<input name="email" type="email" required className="rounded-lg border border-[#cbd5e1] px-3 py-2.5 font-normal outline-none focus:border-blue-500" /></label>
              <label className="flex flex-col gap-1 text-sm font-semibold text-[#0f172a]">Số điện thoại *<input name="phoneNumber" required className="rounded-lg border border-[#cbd5e1] px-3 py-2.5 font-normal outline-none focus:border-blue-500" /></label>
              <label className="flex flex-col gap-1 text-sm font-semibold text-[#0f172a]">Mật khẩu tạm thời *<input name="password" type="password" minLength={6} required className="rounded-lg border border-[#cbd5e1] px-3 py-2.5 font-normal outline-none focus:border-blue-500" /></label>
              <label className="flex flex-col gap-1 text-sm font-semibold text-[#0f172a]">Ngày sinh<DateInput name="dateOfBirth" className="rounded-lg border border-[#cbd5e1] px-3 py-2.5 font-normal outline-none focus:border-blue-500" /></label>
              <label className="flex flex-col gap-1 text-sm font-semibold text-[#0f172a]">Giới tính<select name="gender" className="rounded-lg border border-[#cbd5e1] bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500"><option value="">Chưa cập nhật</option><option value="Nam">Nam</option><option value="Nữ">Nữ</option><option value="Khác">Khác</option></select></label>
              <label className="col-span-2 flex flex-col gap-1 text-sm font-semibold text-[#0f172a]">Liên hệ khẩn cấp<input name="emergencyContact" className="rounded-lg border border-[#cbd5e1] px-3 py-2.5 font-normal outline-none focus:border-blue-500" /></label>
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowCreateMember(false)} className="rounded-lg border border-[#cbd5e1] px-5 py-2.5 text-sm font-semibold text-slate-700">Hủy</button><button type="submit" disabled={isCreatingMember} className="rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{isCreatingMember ? "Đang tạo..." : "Tạo hội viên"}</button></div>
          </form>
        </div>
      )}
    </div>
  )
}

// ─── SETTINGS PAGE ─────────────────────────────────────────────────────────────
