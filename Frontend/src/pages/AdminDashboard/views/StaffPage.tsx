import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { iSearch2 } from '../shared';
import { UserAvatar } from '../../../components/UserAvatar';
import { LockKeyhole, UnlockKeyhole, Dumbbell } from 'lucide-react';
import { AddStaffModal } from './staff/AddStaffModal';
import { StatusConfirmationModal } from './staff/StatusConfirmationModal';
import { AssignCoachSportsModal } from './staff/AssignCoachSportsModal';

export function StaffPage() {
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("Tất cả")
  const [staffList, setStaffList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  const [availableSports, setAvailableSports] = useState<{ id: string; name: string }[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [statusConfirmation, setStatusConfirmation] = useState<{ realId: string; currentStatus: boolean } | null>(null)
  const [assigningCoach, setAssigningCoach] = useState<{ realId: string; name: string } | null>(null)
  const [coachSelectedSportIds, setCoachSelectedSportIds] = useState<string[]>([])
  const [loadingCoachSports, setLoadingCoachSports] = useState(false)
  const [savingCoachSports, setSavingCoachSports] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    roleName: "receptionist",
    sportIds: [] as string[]
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [query, roleFilter])

  // Khóa cuộn trang nền khi mở modal để UI hoàn toàn cố định vào khung nhìn
  useEffect(() => {
    if (!showAddModal && !statusConfirmation && !assigningCoach) return;
    const origBody = document.body.style.overflow;
    const origHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const scrollContainers = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.manager-page-content, .portal-page-enter, [class*="overflow-y-auto"]'
      )
    );
    const origOverflows = scrollContainers.map((el) => ({ el, overflow: el.style.overflow }));
    scrollContainers.forEach((el) => {
      el.style.overflow = 'hidden';
    });

    return () => {
      document.body.style.overflow = origBody;
      document.documentElement.style.overflow = origHtml;
      origOverflows.forEach(({ el, overflow }) => {
        el.style.overflow = overflow;
      });
    };
  }, [showAddModal, statusConfirmation, assigningCoach]);

  useEffect(() => {
    fetch('/api/sports')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableSports(data);
      })
      .catch(() => {});
  }, []);

  const fetchStaff = () => {
    setLoading(true);
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("auth_token");
    fetch("/api/users", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        const mapped = data
          .filter((u: any) => u.roleName && u.roleName.toLowerCase() !== "member")
          .map((u: any) => {
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
              avatar: u.avatarUrl || null,
              assignedSports: Array.isArray(u.assignedSports) ? u.assignedSports : [],
            };
          });
        setStaffList(mapped);
      }
    })
    .catch(err => console.error("Failed to fetch staff:", err))
    .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    fetchStaff();
  }, []);

  const handleToggleStatus = (realId: string, currentStatus: boolean) => {
    setStatusConfirmation({ realId, currentStatus })
  }

  const confirmToggleStatus = async () => {
    if (!statusConfirmation) return
    const { realId, currentStatus } = statusConfirmation
    setStatusConfirmation(null)
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
        toast.success("Đã cập nhật trạng thái nhân sự!");
      } else {
        toast.error("Cập nhật trạng thái thất bại.");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ.");
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.roleName === "coach" && (!formData.sportIds || formData.sportIds.length === 0)) {
      toast.error("Vui lòng chọn ít nhất 1 bộ môn mà Huấn luyện viên sẽ phụ trách.");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ fullName: "", email: "", phoneNumber: "", password: "", roleName: "receptionist", sportIds: [] });
        fetchStaff();
        toast.success("Đã thêm nhân sự mới thành công!");
      } else {
        toast.error("Lỗi: " + (data.message || "Không thể tạo nhân sự"));
      }
    } catch (err) {
      toast.error("Lỗi kết nối khi tạo nhân sự.");
    }
  }

  const handleOpenAssignSports = async (staff: any) => {
    setAssigningCoach({ realId: staff.realId, name: staff.name });
    setLoadingCoachSports(true);
    setCoachSelectedSportIds([]);
    try {
      const res = await fetch(`/api/coaches/${staff.realId}/sports`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCoachSelectedSportIds(data.map((s: any) => s.id));
        }
      }
    } catch {
      toast.error("Không thể tải danh sách môn của HLV.");
    } finally {
      setLoadingCoachSports(false);
    }
  };

  const handleSaveCoachSports = async () => {
    if (!assigningCoach) return;
    setSavingCoachSports(true);
    try {
      const res = await fetch(`/api/coaches/${assigningCoach.realId}/sports`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(coachSelectedSportIds)
      });
      if (res.ok) {
        toast.success(`Đã cập nhật bộ môn phụ trách cho HLV ${assigningCoach.name}!`);
        setAssigningCoach(null);
        fetchStaff();
      } else {
        const err = await res.json().catch(() => null);
        toast.error("Lỗi: " + (err?.message || "Không thể cập nhật bộ môn"));
      }
    } catch {
      toast.error("Lỗi kết nối khi cập nhật bộ môn.");
    } finally {
      setSavingCoachSports(false);
    }
  };

  const filtered = staffList.filter(m => {
    const q = query.toLowerCase()
    return (`${m.name} ${m.id} ${m.phone}`).toLowerCase().includes(q)
      && (roleFilter === "Tất cả" || String(m.role).toLowerCase() === roleFilter.toLowerCase())
  })

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paginatedList = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.warning("Không có dữ liệu để xuất!");
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
    "Đang hoạt động": "bg-emerald-50 text-emerald-700",
    "Tạm khóa":       "bg-[#fee2e2] text-[#b91c1c]",
  }

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto relative">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-[#0f172a] dark:text-white text-[28px]">Quản lý nhân sự</p>
          <p className="text-[#64748b] dark:text-slate-400 text-sm mt-1">Danh sách ban quản lý, lễ tân và huấn luyện viên toàn hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="bg-white dark:bg-slate-800 border border-[#cbd5e1] dark:border-slate-700 flex gap-2 items-center px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs cursor-pointer">
            <span className="font-semibold text-[#0f172a] dark:text-white text-sm">Xuất dữ liệu</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white flex gap-2 items-center px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer">
            <span className="font-semibold text-white text-sm">+ Thêm nhân sự mới</span>
          </button>
        </div>
      </div>

      {/* Modals extracted into dedicated components */}
      <AddStaffModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddStaff}
        formData={formData}
        setFormData={setFormData}
        availableSports={availableSports}
      />

      <StatusConfirmationModal
        confirmation={statusConfirmation}
        onClose={() => setStatusConfirmation(null)}
        onConfirm={confirmToggleStatus}
      />

      <AssignCoachSportsModal
        assigningCoach={assigningCoach}
        onClose={() => setAssigningCoach(null)}
        onSave={handleSaveCoachSports}
        availableSports={availableSports}
        coachSelectedSportIds={coachSelectedSportIds}
        setCoachSelectedSportIds={setCoachSelectedSportIds}
        loadingCoachSports={loadingCoachSports}
        savingCoachSports={savingCoachSports}
      />

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
        <span className="ml-auto text-[#64748b] text-sm">Tổng cộng: {filtered.length} nhân sự</span>
      </div>

      {/* table */}
      <div className="bg-white border border-[#e2e8f0] overflow-hidden rounded-xl shadow-xs">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="bg-[#f8fafc] border-b border-[#e2e8f0] flex font-semibold items-center px-6 text-[#475569] text-[12px] whitespace-nowrap select-none">
              <div className="py-3.5 flex-1 min-w-[200px] shrink-0">NHÂN VIÊN</div>
              <div className="py-3.5 w-[200px] shrink-0">VAI TRÒ / BỘ MÔN</div>
              <div className="py-3.5 w-[200px] shrink-0">LIÊN HỆ</div>
              <div className="py-3.5 w-[140px] shrink-0">TRẠNG THÁI</div>
              <div className="py-3.5 w-[130px] shrink-0">NGÀY THAM GIA</div>
              <div className="py-3.5 w-[180px] shrink-0 text-right">THAO TÁC</div>
            </div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="size-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[#64748b] text-sm font-medium">Đang tải danh sách nhân sự...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-28 items-center justify-center">
                <p className="text-[#64748b] text-sm">Không tìm thấy nhân sự phù hợp.</p>
              </div>
            ) : (
              paginatedList.map(m => (
                <div key={m.id} className="border-b border-[#f1f5f9] flex h-16 items-center px-6 hover:bg-slate-50/70 transition-colors">
                  <div className="flex gap-3 items-center flex-1 min-w-[220px] shrink-0 pr-4">
                    <UserAvatar src={m.avatar} name={m.name} className="rounded-full size-9.5 object-cover shrink-0 ring-1 ring-slate-200" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0f172a] text-sm truncate" title={m.name}>{m.name}</p>
                      <p className="text-[#64748b] text-[12px] ">{m.id}</p>
                    </div>
                  </div>
                  <div className="w-[200px] shrink-0 flex flex-col justify-center gap-1 pr-2">
                    <span className="text-[#0f172a] text-sm font-medium">{m.role}</span>
                    {String(m.role).toLowerCase().includes("coach") && m.assignedSports && m.assignedSports.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {m.assignedSports.map((sportName: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium text-[10px] ring-1 ring-emerald-200"
                          >
                            {sportName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="w-[200px] shrink-0 pr-3">
                    <p className="text-[#0f172a] text-sm">{m.phone}</p>
                    <p className="text-[#64748b] text-[12px] truncate" title={m.email}>{m.email}</p>
                  </div>
                  <div className="w-[140px] shrink-0 whitespace-nowrap">
                    <span className={`inline-flex items-center font-semibold px-2.5 py-1 rounded-full text-[12px] whitespace-nowrap ${statusStyle[m.status] || "bg-slate-100 text-slate-700"}`}>
                      {m.status}
                    </span>
                  </div>
                  <div className="w-[130px] shrink-0 whitespace-nowrap">
                    <p className="text-[#0f172a] text-sm">{m.joined}</p>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 w-[180px] shrink-0">
                    {String(m.role).toLowerCase().includes("coach") && (
                      <button
                        onClick={() => handleOpenAssignSports(m)}
                        title="Phân công bộ môn cho HLV"
                        className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-all cursor-pointer active:scale-95"
                      >
                        <Dumbbell size={13} strokeWidth={2.2} />
                        <span>Bộ môn</span>
                      </button>
                    )}
                    <button 
                      onClick={() => handleToggleStatus(m.realId, m.statusRaw)} 
                      title={m.statusRaw ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                      aria-label={m.statusRaw ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                      className={`inline-flex min-w-[76px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-xs font-semibold shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer active:scale-95 ${m.statusRaw
                        ? 'border-rose-200 bg-rose-50 text-rose-600 hover:border-rose-300 hover:bg-rose-100 focus:ring-rose-300'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 focus:ring-emerald-300'}`}
                    >
                      {m.statusRaw ? <LockKeyhole size={13} strokeWidth={2.2} /> : <UnlockKeyhole size={13} strokeWidth={2.2} />}
                      <span>{m.statusRaw ? "Khóa" : "Mở khóa"}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="flex h-14 items-center justify-between px-6 border-t border-[#f1f5f9]">
          <span className="text-[#64748b] text-sm">
            Hiển thị {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filtered.length)} trong tổng số {filtered.length} nhân sự
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-1.5 rounded-md text-[13px] ${currentPage === 1 ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-slate-50 transition-colors cursor-pointer"}`}
            >
              ‹ Trước
            </button>
            {getPageNumbers().map((p, i) => (
              <button 
                key={i} 
                onClick={() => typeof p === 'number' && setCurrentPage(p)}
                disabled={p === '...'}
                className={`flex items-center px-3 py-1.5 rounded-md text-[13px] transition-colors ${p === currentPage ? "bg-emerald-600 font-semibold text-white shadow-xs shadow-emerald-600/20" : p === '...' ? "bg-transparent text-slate-400 cursor-default" : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-slate-50 cursor-pointer"}`}
              >
                {p}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-1.5 rounded-md text-[13px] ${currentPage === totalPages ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-slate-50 transition-colors cursor-pointer"}`}
            >
              Sau ›
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
