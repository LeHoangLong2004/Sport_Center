import { iDownload, iPlus, iSearch2 } from "../shared";

export function PaymentHeader({ exportUrl }: { exportUrl: string }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 items-center text-sm">
          <span className="text-[#64748b]">Quản lý</span>
          <span className="text-[#64748b]">/</span>
          <span className="font-medium text-[#0f172a]">
            Thanh toán & Hóa đơn
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-white border border-[#e2e8f0] flex gap-2 items-center px-3 py-2 rounded-lg w-[240px]">
            <img src={iSearch2} alt="" className="size-4 shrink-0" />
            <span className="text-[#64748b] text-sm flex-1">Tìm kiếm...</span>
          </div>
          <div className="bg-[#e2e8f0] flex items-center justify-center rounded-full size-9">
            <span className="font-bold text-[#0f172a] text-[13px]">MA</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-[#0f172a] text-[28px]">
            Thanh toán & Hóa đơn
          </p>
          <p className="text-[#64748b] text-sm mt-1">
            Giám sát lịch sử dòng tiền, đối soát giao dịch và xuất hóa đơn dịch
            vụ toàn trung tâm.
          </p>
        </div>
        <div className="flex gap-3 items-center shrink-0">
          <button
            onClick={() => window.open(exportUrl, "_blank")}
            className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-4 py-2.5 rounded-lg"
          >
            <img src={iDownload} alt="" className="size-4" />
            <span className="font-semibold text-[#0f172a] text-sm">
              Xuất báo cáo Excel
            </span>
          </button>
          <button className="bg-[#2563eb] flex gap-2 items-center px-4 py-2.5 rounded-lg">
            <img src={iPlus} alt="" className="size-4" />
            <span className="font-semibold text-white text-sm">
              Tạo giao dịch thu tiền
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
