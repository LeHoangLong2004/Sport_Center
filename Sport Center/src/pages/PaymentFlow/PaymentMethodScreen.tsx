import React from "react";
import { A, BillingPeriod, PackageId, packages, PaymentMethodId, Header, Stepper } from "./shared";

export function PaymentMethodScreen({
  pkg,
  period,
  method,
  setMethod,
  onNext,
  onBack,
}: {
  pkg: PackageId
  period: BillingPeriod
  method: PaymentMethodId
  setMethod: (m: PaymentMethodId) => void
  onNext: () => void
  onBack: () => void
}) {
  const methods: { id: PaymentMethodId; icon: string; label: string; sub: string }[] = [
    { id: "qr", icon: `${A}/66769.svg`, label: "Chuyển khoản QR (Vietcombank)", sub: "Quét mã QR ngân hàng — Nhận ngay xác nhận" },
    { id: "card", icon: `${A}/b41b0.svg`, label: "Thẻ tín dụng / ghi nợ", sub: "Visa, MasterCard, JCB — Thanh toán nhanh 3D Secure" },
    { id: "wallet", icon: `${A}/d8a69.svg`, label: "Ví điện tử (MoMo / ZaloPay)", sub: "Liên kết ví điện tử — Ưu đãi hoàn tiền 5%" },
    { id: "counter", icon: `${A}/a4eee.svg`, label: "Thanh toán tại quầy", sub: "Đến trực tiếp trung tâm trong 24 giờ" },
  ]

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Header />
      <Stepper active={3} />

      <div className="flex items-start justify-center pb-20 pt-4 px-20 w-full">
        <div className="flex gap-8 items-start w-[1280px]">
          <div className="flex flex-1 flex-col gap-6 items-start min-w-0">
            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-4 items-start p-6 rounded-[16px] w-full">
              <p className="font-['Inter'] font-bold text-[#0f172a] text-lg">Chọn phương thức thanh toán</p>
              <div className="flex flex-col gap-3 w-full">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`flex gap-4 items-center p-4 rounded-[12px] w-full text-left transition-all ${
                      method === m.id
                        ? "bg-[#eff6ff] border-2 border-[#2563eb]"
                        : "bg-white border border-[#e2e8f0] hover:border-[#93c5fd]"
                    }`}
                  >
                    <div className={`flex items-center justify-center rounded-full size-5 shrink-0 ${
                      method === m.id
                        ? "bg-[#2563eb]"
                        : "border-2 border-[#cbd5e1]"
                    }`}>
                      {method === m.id && <div className="bg-white rounded-full size-2" />}
                    </div>
                    <img src={m.icon} className="size-8 shrink-0" alt="" />
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="font-['Inter'] font-semibold text-[#0f172a] text-sm">{m.label}</span>
                      <span className="font-['Inter'] font-normal text-[#64748b] text-xs">{m.sub}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {method === "qr" && (
              <div className="bg-white border border-[#e2e8f0] flex flex-col gap-5 items-start p-6 rounded-[16px] w-full">
                <p className="font-['Inter'] font-bold text-[#0f172a] text-lg">Thông tin chuyển khoản</p>
                <div className="flex gap-8 items-start w-full">
                  <div className="flex flex-col gap-4 flex-1 min-w-0">
                    <div className="bg-[#f8fafc] rounded-[12px] p-5 flex flex-col gap-3">
                      {[
                        ["Ngân hàng", "Vietcombank (VCB)"],
                        ["Số tài khoản", "1234567890123"],
                        ["Chủ tài khoản", "SPORTCENTER VIET NAM"],
                        ["Chi nhánh", "Hồ Chí Minh"],
                      ].map(([label, val]) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="font-['Inter'] font-normal text-[#64748b] text-sm">{label}</span>
                          <span className="font-['Inter'] font-semibold text-[#0f172a] text-sm">{val}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between">
                        <span className="font-['Inter'] font-normal text-[#64748b] text-sm">Nội dung chuyển khoản</span>
                        <span className="font-['Inter'] font-bold text-[#2563eb] text-sm">SC LA 2026 FIT6</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-['Inter'] font-normal text-[#64748b] text-sm">Số tiền</span>
                        <span className="font-['Inter'] font-extrabold text-[#2563eb] text-base">10.900.000 đ</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 items-center shrink-0">
                    <div className="bg-[#f8fafc] border border-[#cbd5e1] flex items-center justify-center rounded-[12px] size-[200px]">
                      <img src={`${A}/cfa8b.svg`} className="size-[160px]" alt="QR Code" />
                    </div>
                    <p className="font-['Inter'] font-normal text-[#64748b] text-[11px] text-center w-[200px]">
                      Quét mã QR bằng app ngân hàng để chuyển tiền tự động
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#fffbeb] border border-[#fcd34d] flex gap-3 items-start p-4 rounded-[12px] w-full">
              <span className="text-[#d97706] text-lg">⏳</span>
              <p className="font-['Inter'] font-medium text-[#92400e] text-sm leading-[20px] flex-1">
                <strong>Lưu ý:</strong> Mã QR và thông tin thanh toán có hiệu lực trong <strong>15 phút</strong>. Vui lòng hoàn tất giao dịch trước khi hết hạn.
              </p>
            </div>

            <div className="flex items-start w-full gap-3">
              <button
                type="button"
                onClick={onBack}
                className="bg-white border-[1.5px] border-[#64748b] flex items-center px-6 py-3 rounded-[8px] font-['Inter'] font-bold text-[#64748b] text-sm hover:bg-[#f8fafc] transition-colors"
              >
                ← Quay lại
              </button>
            </div>
          </div>

          <div className="flex flex-col items-start w-[416px] shrink-0">
            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-5 items-start p-6 rounded-[16px] w-full">
              <p className="font-['Inter'] font-bold text-[#0f172a] text-lg w-full">Tóm tắt đơn hàng</p>
              <div className="flex items-center justify-between w-full">
                <p className="font-['Inter'] font-extrabold text-[#0f172a] text-xl">{packages[pkg].name}</p>
                <div className="bg-[#eff6ff] flex items-start px-3 py-1 rounded-[12px]">
                  <p className="font-['Inter'] font-bold text-[#2563eb] text-xs">Gói 6 tháng</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full text-[13px]">
                {[
                  ["Hội viên:", "Nguyễn Lan Anh"],
                  ["Cơ sở chính:", "Chi nhánh Q.1 - Flagship Center"],
                  ["Thời hạn tập:", "21/09/2026 → 21/03/2027"],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-start justify-between w-full">
                    <span className="font-['Inter'] font-normal text-[#64748b]">{label}</span>
                    <span className="font-['Inter'] font-semibold text-[#0f172a]">{val}</span>
                  </div>
                ))}
              </div>
              <div className="h-0 w-full relative">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img src={`${A}/d2600.svg`} className="block w-full" alt="" />
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full text-sm">
                <div className="flex items-start justify-between w-full">
                  <span className="font-['Inter'] font-normal text-[#64748b]">Giá niêm yết</span>
                  <span className="font-['Inter'] font-semibold text-[#0f172a]">12.000.000 đ</span>
                </div>
                <div className="flex items-start justify-between w-full">
                  <span className="font-['Inter'] font-normal text-[#64748b]">Ưu đãi gói theo năm (-20%)</span>
                  <span className="font-['Inter'] font-bold text-[#16a34a]">-1.100.000 đ</span>
                </div>
              </div>
              <div className="h-0 w-full relative">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img src={`${A}/d2600.svg`} className="block w-full" alt="" />
                </div>
              </div>
              <div className="flex items-baseline justify-between w-full">
                <span className="font-['Inter'] font-semibold text-[#0f172a] text-base">Tổng thanh toán</span>
                <span className="font-['Inter'] font-extrabold text-[#2563eb] text-2xl">10.900.000 đ</span>
              </div>
              <div className="bg-[#fffbeb] border border-[#fcd34d] flex gap-2 items-center p-3 rounded-[8px] w-full">
                <span className="text-[#d97706] text-sm">⏰</span>
                <p className="font-['Inter'] font-medium text-[#92400e] text-[12px] flex-1 leading-[16px]">
                  Hoàn tất trước <strong>15:00 hôm nay</strong> để nhận kích hoạt ngay
                </p>
              </div>
              <button
                type="button"
                onClick={onNext}
                className="bg-[#2563eb] flex items-center justify-center py-[14px] rounded-[8px] w-full font-['Inter'] font-bold text-white text-[15px] hover:bg-[#1d4ed8] transition-colors"
              >
                Xác nhận thanh toán →
              </button>
              <div className="flex gap-1.5 items-start justify-center w-full">
                <img src={`${A}/ce483.svg`} className="size-3 mt-0.5 shrink-0" alt="" />
                <span className="font-['Inter'] font-normal text-[#64748b] text-[11px]">Giao dịch được bảo mật SSL 256-bit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}