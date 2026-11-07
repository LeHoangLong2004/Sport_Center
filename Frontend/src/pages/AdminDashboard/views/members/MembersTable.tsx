import React from 'react';
import { LockKeyhole, UnlockKeyhole } from 'lucide-react';
import { UserAvatar } from '../../../../components/UserAvatar';
import { iMore } from '../../shared';
import type { MemberItem } from './MembersTypes';

interface MembersTableProps {
  loading: boolean;
  members: MemberItem[];
  totalFilteredCount: number;
  currentTabLabel: string;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onToggleStatus: (member: MemberItem) => void;
  onEditMember: (member: MemberItem) => void;
  selectedIds?: string[];
  onToggleSelect?: (realId: string) => void;
  onToggleSelectAll?: () => void;
}

const statusStyle: Record<string, string> = {
  "Đang hoạt động": "bg-emerald-50 text-emerald-700",
  "Sắp hết hạn":    "bg-slate-100 text-slate-700",
  "Tạm khóa":       "bg-[#fee2e2] text-[#b91c1c]",
};

export function MembersTable({
  loading,
  members,
  totalFilteredCount,
  currentTabLabel,
  currentPage,
  rowsPerPage,
  onPageChange,
  onToggleStatus,
  onEditMember,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
}: MembersTableProps) {
  const totalPages = Math.ceil(totalFilteredCount / rowsPerPage) || 1;

  const isAllCurrentPageSelected =
    members.length > 0 && members.every((m) => selectedIds.includes(m.realId));
  const isSomeCurrentPageSelected =
    members.some((m) => selectedIds.includes(m.realId)) && !isAllCurrentPageSelected;

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="bg-white border border-[#e2e8f0] overflow-hidden rounded-xl shadow-xs">
      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          {/* Header */}
          <div className="bg-[#f8fafc] border-b border-[#e2e8f0] flex font-semibold items-center px-6 text-[#475569] text-[12px] whitespace-nowrap select-none">
            <div className="py-3.5 w-10 shrink-0 flex items-center">
              <input
                type="checkbox"
                checked={isAllCurrentPageSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isSomeCurrentPageSelected;
                }}
                onChange={onToggleSelectAll}
                aria-label="Chọn tất cả hội viên trên trang này"
                className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
            <div className="py-3.5 flex-1 min-w-[220px] shrink-0">HỘI VIÊN</div>
            <div className="py-3.5 w-[160px] shrink-0">GÓI HIỆN TẠI</div>
            <div className="py-3.5 w-[210px] shrink-0">LIÊN HỆ</div>
            <div className="py-3.5 w-[150px] shrink-0">TRẠNG THÁI</div>
            <div className="py-3.5 w-[130px] shrink-0">NGÀY HẾT HẠN</div>
            <div className="py-3.5 w-[130px] shrink-0 text-right">THAO TÁC</div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="size-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-[#64748b] text-sm font-medium">Đang tải danh sách...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="flex h-28 items-center justify-center">
              <p className="text-[#64748b] text-sm">Không tìm thấy dữ liệu phù hợp.</p>
            </div>
          ) : (
            members.map((m) => {
              const isSelected = selectedIds.includes(m.realId);
              return (
                <div
                  key={m.id}
                  className={`border-b border-[#f1f5f9] flex h-16 items-center px-6 transition-colors ${
                    isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="w-10 shrink-0 flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect && onToggleSelect(m.realId)}
                      aria-label={`Chọn hội viên ${m.name}`}
                      className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-3 items-center flex-1 min-w-[220px] shrink-0 pr-4">
                    <UserAvatar src={m.avatar} name={m.name} className="rounded-full size-9.5 object-cover shrink-0 ring-1 ring-slate-200" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0f172a] text-sm truncate" title={m.name}>{m.name}</p>
                      <p className="text-[#64748b] text-[12px] ">{m.id}</p>
                    </div>
                  </div>
                  <div className="w-[160px] shrink-0 whitespace-nowrap">
                    <span className="text-[#0f172a] text-sm font-medium">{m.pkg}</span>
                    {m.vip && <span className="bg-slate-100 font-bold ml-1.5 px-1.5 py-0.5 rounded text-slate-700 text-[10px]">VIP</span>}
                  </div>
                  <div className="w-[210px] shrink-0 pr-3">
                    <p className="text-[#0f172a] text-sm">{m.phone}</p>
                    <p className="text-[#64748b] text-[12px] truncate" title={m.email}>{m.email}</p>
                  </div>
                  <div className="w-[150px] shrink-0 whitespace-nowrap">
                    <span className={`inline-flex items-center font-semibold px-2.5 py-1 rounded-full text-[12px] whitespace-nowrap ${statusStyle[m.status] || "bg-slate-100 text-slate-700"}`}>
                      {m.status}
                    </span>
                  </div>
                  <div className="w-[130px] shrink-0 whitespace-nowrap">
                    <p className="text-[#0f172a] text-sm">{m.expiry}</p>
                  </div>
                  <div className="flex gap-2 items-center justify-end w-[130px] shrink-0">
                    <button 
                      onClick={() => onToggleStatus(m)} 
                      title={m.statusRaw ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                      aria-label={m.statusRaw ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                      className={`inline-flex min-w-[76px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-xs font-semibold shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer active:scale-95 ${m.statusRaw
                        ? 'border-rose-200 bg-rose-50 text-rose-600 hover:border-rose-300 hover:bg-rose-100 focus:ring-rose-300'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 focus:ring-emerald-300'}`}
                    >
                      {m.statusRaw ? <LockKeyhole size={13} strokeWidth={2.2} /> : <UnlockKeyhole size={13} strokeWidth={2.2} />}
                      <span>{m.statusRaw ? "Khóa" : "Mở khóa"}</span>
                    </button>
                    <button
                      onClick={() => onEditMember(m)}
                      title="Sửa thông tin"
                      className="bg-white border border-[#e2e8f0] hover:bg-slate-100 flex items-center justify-center rounded-md size-8 cursor-pointer transition-colors"
                    >
                      <img src={iMore} alt="Edit" className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex h-14 items-center justify-between px-6">
        <span className="text-[#64748b] text-sm">
          Hiển thị {totalFilteredCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, totalFilteredCount)} trong tổng số {totalFilteredCount} {currentTabLabel.toLowerCase()}
        </span>
        <div className="flex gap-2">
          <button 
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`flex items-center px-3 py-1.5 rounded-md text-[13px] ${currentPage === 1 ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-slate-50 transition-colors cursor-pointer"}`}
          >
            ‹ Trước
          </button>
          {getPageNumbers().map((p, i) => (
            <button 
              key={i} 
              onClick={() => typeof p === 'number' && onPageChange(p)}
              disabled={p === '...'}
              className={`flex items-center px-3 py-1.5 rounded-md text-[13px] transition-colors ${p === currentPage ? "bg-emerald-600 font-semibold text-white shadow-xs shadow-emerald-600/20" : p === '...' ? "bg-transparent text-slate-400 cursor-default" : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-slate-50 cursor-pointer"}`}
            >
              {p}
            </button>
          ))}
          <button 
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`flex items-center px-3 py-1.5 rounded-md text-[13px] ${currentPage === totalPages ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-slate-50 transition-colors cursor-pointer"}`}
          >
            Sau ›
          </button>
        </div>
      </div>
    </div>
  );
}
