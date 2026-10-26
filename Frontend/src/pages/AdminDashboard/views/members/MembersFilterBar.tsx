import React from 'react';
import { Search } from 'lucide-react';

interface MembersFilterBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  selectedCount?: number;
}

export function MembersFilterBar({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  selectedCount = 0,
}: MembersFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-3 py-2 rounded-lg flex-1 max-w-[320px]">
        <Search className="size-4 text-slate-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Tìm theo tên, mã hội viên, số điện thoại..."
          className="flex-1 text-sm outline-none bg-transparent"
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="bg-white border border-[#cbd5e1] font-medium px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
      >
        <option value="Tất cả">Trạng thái: Tất cả</option>
        <option value="Đang hoạt động">Đang hoạt động</option>
        <option value="Sắp hết hạn">Sắp hết hạn</option>
        <option value="Tạm khóa">Tạm khóa</option>
      </select>

      <select className="bg-white border border-[#cbd5e1] font-medium px-3 py-2 rounded-lg text-sm outline-none cursor-pointer">
        <option>Gói tập: Tất cả</option>
        <option>Premium 12 tháng</option>
        <option>Fitness 6 tháng</option>
      </select>

      <span className="ml-auto text-[#64748b] text-sm">Đã chọn {selectedCount} mục</span>
    </div>
  );
}
