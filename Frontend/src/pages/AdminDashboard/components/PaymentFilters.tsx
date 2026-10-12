import { iSearch2 } from "../shared";

interface PaymentFiltersProps {
  query: string;
  methods: string[];
  statuses: string[];
  methodFilter: string;
  statusFilter: string;
  count: number;
  onQueryChange: (value: string) => void;
  onMethodChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReload: () => void;
}

export function PaymentFilters({
  query,
  methods,
  statuses,
  methodFilter,
  statusFilter,
  count,
  onQueryChange,
  onMethodChange,
  onStatusChange,
  onReload,
}: PaymentFiltersProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-3 items-center">
        <div className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-3 py-2 rounded-lg w-[320px]">
          <img src={iSearch2} alt="" className="size-4 shrink-0" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Tìm theo mã hóa đơn, tên hội viên..."
            className="text-sm flex-1 outline-none placeholder:text-[#64748b]"
          />
        </div>
        <select
          value={methodFilter}
          onChange={(event) => onMethodChange(event.target.value)}
          className="bg-white border border-[#cbd5e1] font-medium px-3 py-2 rounded-lg text-[#0f172a] text-sm"
        >
          {methods.map((method) => (
            <option key={method} value={method}>
              {method === "Tất cả" ? "Phương thức: Tất cả" : method}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value)}
          className="bg-white border border-[#cbd5e1] font-medium px-3 py-2 rounded-lg text-[#0f172a] text-sm"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status === "Tất cả" ? "Trạng thái: Tất cả" : status}
            </option>
          ))}
        </select>
        <button
          onClick={onReload}
          className="bg-white border border-[#cbd5e1] font-medium px-3 py-2 rounded-lg text-[#0f172a] text-sm"
        >
          Làm mới
        </button>
      </div>
      <span className="font-medium text-[#64748b] text-sm whitespace-nowrap">
        Tổng số: {count} hóa đơn
      </span>
    </div>
  );
}
