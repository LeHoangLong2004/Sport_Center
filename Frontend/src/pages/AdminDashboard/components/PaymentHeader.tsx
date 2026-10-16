import { iDownload, iPlus } from "../shared";

interface PaymentHeaderProps {
  onExportCsv: () => void;
  onOpenCreate: () => void;
}

export function PaymentHeader({ onExportCsv, onOpenCreate }: PaymentHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-bold text-[#0f172a] text-[28px]">
          Thanh toán & Hóa đơn
        </p>
        <p className="text-[#64748b] text-sm mt-1">
          Giám sát lịch sử dòng tiền, đối soát giao dịch và xuất hóa đơn dịch vụ toàn trung tâm.
        </p>
      </div>
      <div className="flex gap-3 items-center shrink-0">
        <button
          onClick={onExportCsv}
          className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <img src={iDownload} alt="" className="size-4" />
          <span className="font-semibold text-[#0f172a] text-sm">
            Xuất dữ liệu CSV
          </span>
        </button>
        <button
          onClick={onOpenCreate}
          className="bg-[#2563eb] flex gap-2 items-center px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
        >
          <img src={iPlus} alt="" className="size-4" />
          <span className="font-semibold text-white text-sm">
            + Tạo giao dịch thu tiền
          </span>
        </button>
      </div>
    </div>
  );
}
