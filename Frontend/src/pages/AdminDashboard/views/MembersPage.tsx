import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { LockKeyhole, UnlockKeyhole, FileDown, X } from 'lucide-react';
import { iDownload } from '../shared';
import type { MemberItem, UserTabOption } from './members/MembersTypes';
import { MembersFilterBar } from './members/MembersFilterBar';
import { MembersTable } from './members/MembersTable';
import { CreateMemberModal } from './members/CreateMemberModal';
import { UserStatusConfirmModal } from './members/UserStatusConfirmModal';

export function MembersPage({ onEditMember }: { onEditMember: (member: any) => void }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [allUsers, setAllUsers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Thành viên");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateMember, setShowCreateMember] = useState(false);
  const [isCreatingMember, setIsCreatingMember] = useState(false);
  const [createError, setCreateError] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusModalState, setStatusModalState] = useState<{
    isOpen: boolean;
    targetStatus: boolean; // false = Khóa, true = Mở khóa
    member?: MemberItem | null;
    isBulk: boolean;
  }>({
    isOpen: false,
    targetStatus: false,
    member: null,
    isBulk: false,
  });

  const rowsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [query, statusFilter, activeTab]);

  const fetchUsers = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch("/api/users", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped: MemberItem[] = data.map((u: any) => ({
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
          }));
          setAllUsers(mapped);
        }
      })
      .catch((err) => console.error("Failed to fetch users:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRequestToggleStatus = (member: MemberItem) => {
    setStatusModalState({
      isOpen: true,
      targetStatus: !member.statusRaw,
      member,
      isBulk: false,
    });
  };

  const handleRequestBulkStatus = (targetStatus: boolean) => {
    if (selectedIds.length === 0) {
      toast.warning("Vui lòng tick chọn ít nhất một tài khoản!");
      return;
    }
    setStatusModalState({
      isOpen: true,
      targetStatus,
      member: null,
      isBulk: true,
    });
  };

  const handleConfirmStatusChange = async () => {
    const token = localStorage.getItem("token");
    setIsUpdatingStatus(true);
    try {
      if (statusModalState.isBulk) {
        // Cập nhật đồng loạt các tài khoản được tick chọn
        const results = await Promise.all(
          selectedIds.map((realId) =>
            fetch(`/api/users/${realId}/status`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ status: statusModalState.targetStatus })
            }).then((res) => res.ok)
          )
        );

        const successCount = results.filter(Boolean).length;
        if (successCount > 0) {
          toast.success(
            `Đã ${statusModalState.targetStatus ? "mở khóa" : "khóa"} thành công ${successCount}/${selectedIds.length} tài khoản!`
          );
        } else {
          toast.error("Không thể cập nhật trạng thái các tài khoản đã chọn.");
        }
        setSelectedIds([]);
      } else if (statusModalState.member) {
        // Cập nhật tài khoản đơn lẻ
        const res = await fetch(`/api/users/${statusModalState.member.realId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ status: statusModalState.targetStatus })
        });
        if (res.ok) {
          toast.success(
            `Đã ${statusModalState.targetStatus ? "mở khóa" : "khóa"} tài khoản ${statusModalState.member.name}!`
          );
        } else {
          toast.error("Cập nhật trạng thái thất bại.");
        }
      }
      setStatusModalState((prev) => ({ ...prev, isOpen: false }));
      fetchUsers();
    } catch {
      toast.error("Lỗi kết nối máy chủ.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleToggleSelect = (realId: string) => {
    setSelectedIds((prev) =>
      prev.includes(realId) ? prev.filter((id) => id !== realId) : [...prev, realId]
    );
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
          // Keep plain text
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

  const tabs: UserTabOption[] = [
    { label: "Thành viên", filter: (u) => u.roleName === "member" },
    { label: "Huấn luyện viên", filter: (u) => u.roleName === "coach" || u.roleName === "pt" },
    { label: "Nhân viên", filter: (u) => !["member", "coach", "pt"].includes(u.roleName) }
  ];

  const currentTabObj = tabs.find((t) => t.label === activeTab) || tabs[0];
  const listForTab = allUsers.filter(currentTabObj.filter);

  const filtered = listForTab.filter((m) => {
    const q = query.toLowerCase();
    return (`${m.name} ${m.id} ${m.phone}`).toLowerCase().includes(q)
      && (statusFilter === "Tất cả" || m.status === statusFilter);
  });

  const paginatedList = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleToggleSelectAll = () => {
    const currentPageIds = paginatedList.map((m) => m.realId);
    const isAllSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleExportSelectedCSV = () => {
    const selectedMembers = allUsers.filter((m) => selectedIds.includes(m.realId));
    if (selectedMembers.length === 0) {
      toast.warning("Không có hội viên nào được chọn!");
      return;
    }
    const headers = ["Mã HV", "Họ và tên", "Gói tập", "Số điện thoại", "Email", "Trạng thái", "Ngày đăng ký/Hết hạn"];
    const rows = selectedMembers.map((m) => [
      m.id,
      m.name,
      m.pkg,
      m.phone,
      m.email,
      m.status,
      m.expiry
    ]);
    const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.map((e) => e.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `danh_sach_hoi_vien_da_chon_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.warning("Không có dữ liệu để xuất!");
      return;
    }
    
    const headers = ["Mã HV", "Họ và tên", "Gói tập", "Số điện thoại", "Email", "Trạng thái", "Ngày đăng ký/Hết hạn"];
    const rows = filtered.map((m) => [
      m.id,
      m.name,
      m.pkg,
      m.phone,
      m.email,
      m.status,
      m.expiry
    ]);
    
    const csvContent = "\uFEFF" + 
      headers.join(",") + "\n" + 
      rows.map((e) => e.map((cell) => `"${cell}"`).join(",")).join("\n");
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `danh_sach_hoi_vien_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-[#0f172a] text-[28px]">Quản lý người dùng</p>
          <p className="text-[#64748b] text-sm mt-1">Hồ sơ đang được quản lý tập trung trên toàn hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <img src={iDownload} alt="" className="size-4" />
            <span className="font-semibold text-[#0f172a] text-sm">Xuất dữ liệu Excel</span>
          </button>
          <button
            onClick={() => { setCreateError(""); setShowCreateMember(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex gap-2 items-center px-4 py-2.5 rounded-xl cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <span className="font-semibold text-white text-sm">+ Thêm hội viên mới</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#e2e8f0] dark:border-slate-800 flex gap-6">
        {tabs.map((t) => {
          const count = allUsers.filter(t.filter).length;
          const isActive = t.label === activeTab;
          return (
            <button 
              key={t.label} 
              onClick={() => setActiveTab(t.label)}
              className={`pb-3 text-sm transition-colors cursor-pointer ${isActive ? "border-b-2 border-emerald-600 font-bold text-emerald-600 dark:text-emerald-400" : "font-medium text-[#64748b] dark:text-slate-400 hover:text-[#0f172a] dark:hover:text-white"}`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <MembersFilterBar
        query={query}
        onQueryChange={setQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
      />

      {/* Sleek Floating Bulk Action Dock (Bottom Center) */}
      {selectedIds.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full bg-slate-900/95 text-white px-5 py-2.5 shadow-2xl backdrop-blur-md border border-slate-700/80 animate-in slide-in-from-bottom-5 duration-200 select-none max-w-[calc(100vw-32px)]">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-700/80 shrink-0">
            <span className="flex size-5.5 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[11px] shadow-xs">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold text-slate-200 whitespace-nowrap">
              Đã chọn {selectedIds.length} {currentTabObj.label.toLowerCase()}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleRequestBulkStatus(false)}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-all shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <LockKeyhole className="size-3.5" />
              <span>Khóa hàng loạt</span>
            </button>

            <button
              onClick={() => handleRequestBulkStatus(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-all shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <UnlockKeyhole className="size-3.5" />
              <span>Mở khóa hàng loạt</span>
            </button>

            <button
              onClick={handleExportSelectedCSV}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-1.5 text-xs font-medium text-slate-200 transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <FileDown className="size-3.5" />
              <span>Xuất Excel ({selectedIds.length})</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer pl-2 border-l border-slate-700/80 whitespace-nowrap"
              title="Bỏ chọn tất cả"
            >
              <X className="size-3.5" />
              <span>Bỏ chọn</span>
            </button>
          </div>
        </div>
      )}

      {/* Table with Pagination */}
      <MembersTable
        loading={loading}
        members={paginatedList}
        totalFilteredCount={filtered.length}
        currentTabLabel={currentTabObj.label}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onToggleStatus={handleRequestToggleStatus}
        onEditMember={onEditMember}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
      />

      {/* Custom User Status Confirmation Modal (No browser alert) */}
      <UserStatusConfirmModal
        isOpen={statusModalState.isOpen}
        onClose={() => setStatusModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmStatusChange}
        isProcessing={isUpdatingStatus}
        targetStatus={statusModalState.targetStatus}
        member={statusModalState.member}
        bulkCount={statusModalState.isBulk ? selectedIds.length : undefined}
      />

      {/* Create Member Modal */}
      <CreateMemberModal
        isOpen={showCreateMember}
        onClose={() => setShowCreateMember(false)}
        isCreating={isCreatingMember}
        createError={createError}
        onSubmit={handleCreateMember}
      />
    </div>
  );
}

export default MembersPage;
