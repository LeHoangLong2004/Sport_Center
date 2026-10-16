import React from "react";
import { A, BillingPeriod, FlowPackage, getPaymentSummary, PaymentMethodId, Stepper } from "./shared";

export function PaymentMethodScreen({
  pkg,
  period,
  method,
  setMethod,
  formData,
  onNext,
  onBack,
  availableMethods,
}: {
  pkg: FlowPackage
  period: BillingPeriod
  method: PaymentMethodId
  setMethod: (m: PaymentMethodId) => void
  formData: any
  onNext: () => void
  onBack: () => void
  availableMethods?: PaymentMethodId[]
}) {
  const { listPrice, discount, total, periodLabel } = getPaymentSummary(pkg, period)
  const fmt = (n: number) => n.toLocaleString("vi-VN") + " đ"

  const phoneDigits = formData?.phone ? formData.phone.replace(/\D/g, '').slice(-4) : 'GYM';
  const pkgCode = (pkg.id || 'PKG').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
  const transferMemo = `SC ${phoneDigits} ${pkgCode}`.toUpperCase();
  const vietQrUrl = `https://api.vietqr.io/image/970436-1234567890123-compact2.jpg?amount=${total}&addInfo=${encodeURIComponent(transferMemo)}&accountName=SPORTCENTER%20VIET%20NAM`;

  const methods: { id: PaymentMethodId; icon: string; label: string; sub: string }[] = [
    { id: "qr", icon: `${A}/66769.svg`, label: "Chuyển khoản QR (Vietcombank)", sub: "Quét mã QR ngân hàng — Nhận ngay xác nhận" },
    { id: "card", icon: `${A}/b41b0.svg`, label: "Thẻ tín dụng / ghi nợ", sub: "Visa, MasterCard, JCB — Thanh toán nhanh 3D Secure" },
    { id: "wallet", icon: `${A}/d8a69.svg`, label: "Ví điện tử (MoMo / ZaloPay)", sub: "Liên kết ví điện tử — Ưu đãi hoàn tiền 5%" },
    { id: "counter", icon: `${A}/a4eee.svg`, label: "Thanh toán tại quầy", sub: "Đến trực tiếp trung tâm trong 24 giờ" },
  ]

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Stepper active={3} />

      <div className="flex items-start justify-center pb-20 pt-4 px-20 w-full">
        <div className="flex gap-8 items-start w-[1280px]">
          <div className="flex flex-1 flex-col gap-6 items-start min-w-0">
            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start p-[24px] rounded-[16px] w-full shadow-sm">
              <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[18px]">Chọn phương thức thanh toán</p>
              <div className="flex flex-col gap-3 w-full">
                {methods.filter((m) => !availableMethods || availableMethods.includes(m.id)).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`flex gap-4 items-center p-4 rounded-[12px] w-full text-left transition-all ${
                      method === m.id
                        ? "bg-teal-50 border-2 border-teal-500"
                        : "bg-white border border-[#e2e8f0] hover:border-teal-300"
                    }`}
                  >
                    <div className={`flex items-center justify-center rounded-full size-5 shrink-0 ${
                      method === m.id
                        ? "bg-teal-500"
                        : "border-2 border-[#cbd5e1]"
                    }`}>
                      {method === m.id && <div className="bg-white rounded-full size-2" />}
                    </div>
                    <img src={m.icon} className="size-8 shrink-0" alt="" />
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="font-['Inter:Semi_Bold'] font-semibold text-[#0f172a] text-sm">{m.label}</span>
                      <span className="font-['Inter:Regular'] font-normal text-[#64748b] text-xs">{m.sub}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {method === "qr" && (
              <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[20px] items-start p-[24px] rounded-[16px] w-full shadow-sm">
                <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[18px]">Thông tin chuyển khoản</p>
                <div className="flex flex-col md:flex-row gap-8 items-start w-full">
                  <div className="flex flex-col gap-4 flex-1 min-w-0 w-full">
                    <div className="bg-[#f8fafc] rounded-[12px] p-5 flex flex-col gap-3">
                      {[
                        ["Ngân hàng", "Vietcombank (VCB)"],
                        ["Số tài khoản", "1234567890123"],
                        ["Chủ tài khoản", "SPORTCENTER VIET NAM"],
                        ["Chi nhánh", "Hồ Chí Minh"],
                      ].map(([label, val]) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="font-['Inter:Regular'] font-normal text-[#64748b] text-sm">{label}</span>
                          <span className="font-['Inter:Semi_Bold'] font-semibold text-[#0f172a] text-sm">{val}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between">
                        <span className="font-['Inter:Regular'] font-normal text-[#64748b] text-sm">Nội dung chuyển khoản</span>
                        <span className="font-['Inter:Bold'] font-bold text-teal-600 text-sm font-mono">{transferMemo}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-['Inter:Regular'] font-normal text-[#64748b] text-sm">Số tiền</span>
                        <span className="font-['Inter:Extra_Bold'] font-extrabold text-teal-600 text-base">{fmt(total)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 items-center shrink-0 self-center md:self-start">
                    <div className="bg-[#f8fafc] border border-[#cbd5e1] flex items-center justify-center rounded-[12px] size-[200px] overflow-hidden p-2">
                      <img
                        src={vietQrUrl}
                        onError={(e) => { (e.target as HTMLImageElement).src = `${A}/cfa8b.svg`; }}
                        className="size-[180px] object-contain rounded-lg"
                        alt="QR Code"
                      />
                    </div>
                    <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[11px] text-center w-[200px]">
                      Quét mã QR bằng app ngân hàng để chuyển tiền tự động
                    </p>
                  </div>
                </div>
              </div>
            )}

            {method === "card" && (
              <div className="bg-white border border-[#e2e8f0] flex flex-col gap-4 p-6 rounded-[16px] w-full shadow-sm">
                <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-lg">Cổng thanh toán thẻ (Visa / Master / ATM)</p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-600 flex flex-col gap-2">
                  <p>Hệ thống tự động liên kết đến cổng thanh toán trực tuyến bảo mật 3D-Secure.</p>
                  <p className="font-semibold text-slate-800">Số tiền thanh toán: <span className="text-teal-600 font-bold">{fmt(total)}</span></p>
                  <p className="text-xs text-slate-400">Bấm nút "Xác nhận thanh toán" bên dưới để hoàn tất giao dịch.</p>
                </div>
              </div>
            )}

            {method === "wallet" && (
              <div className="bg-white border border-[#e2e8f0] flex flex-col gap-4 p-6 rounded-[16px] w-full shadow-sm">
                <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-lg">Ví điện tử (MoMo / ZaloPay)</p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-600 flex flex-col gap-2">
                  <p>Thanh toán bảo mật tức thì qua ứng dụng ví điện tử MoMo hoặc ZaloPay.</p>
                  <p className="font-semibold text-slate-800">Số tiền: <span className="text-teal-600 font-bold">{fmt(total)}</span></p>
                  <p className="text-xs text-slate-400">Ưu đãi hoàn tiền (nếu có) sẽ được áp dụng trực tiếp trong ứng dụng ví.</p>
                </div>
              </div>
            )}

            {method === "counter" && (
              <div className="bg-white border border-[#e2e8f0] flex flex-col gap-4 p-6 rounded-[16px] w-full shadow-sm">
                <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-lg">Thanh toán trực tiếp tại quầy lễ tân</p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-600 flex flex-col gap-2.5">
                  <p>Bạn đã chọn thanh toán trực tiếp tại cơ sở: <strong className="text-slate-800">{formData.branch}</strong>.</p>
                  <p>Số tiền cần thanh toán tại quầy: <strong className="text-teal-600 font-bold">{fmt(total)}</strong>.</p>
                  <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    Đơn hàng sẽ được lưu tạm ở trạng thái chờ thanh toán trong <strong>24 giờ</strong>. Lễ tân sẽ kích hoạt ngay khi nhận thanh toán tại quầy.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-[#fffbeb] border border-[#fcd34d] flex gap-3 items-start p-4 rounded-[12px] w-full shadow-sm">
              <span className="text-[#d97706] text-lg">⏳</span>
              <p className="font-['Inter:Medium'] font-medium text-[#92400e] text-sm leading-[20px] flex-1">
                <strong>Lưu ý:</strong> Thông tin thanh toán có hiệu lực trong <strong>15 phút</strong>. Vui lòng hoàn tất giao dịch trước khi hết hạn.
              </p>
            </div>

            <div className="flex items-start w-full gap-3">
              <button
                type="button"
                onClick={onBack}
                className="bg-white border-[1.5px] border-[#64748b] flex items-center px-[24px] py-[12px] rounded-[12px] font-['Inter:Bold'] font-bold text-[#64748b] text-sm hover:bg-[#f8fafc] transition-colors"
              >
                ← Quay lại
              </button>
            </div>
          </div>

          <div className="flex flex-col items-start w-[416px] shrink-0">
            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-4 items-start p-6 rounded-[16px] w-full shadow-lg shadow-blue-900/5">
              <div className="flex items-center justify-between gap-3 w-full">
                <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px]">Tóm tắt đơn hàng</p>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Chi tiết</span>
              </div>
              <div className="flex items-start justify-between gap-3 w-full bg-[#f8fafc] p-4 rounded-[12px] border border-[#e2e8f0]">
                <div className="min-w-0 flex-1">
                  <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[18px]">{pkg.name}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{pkg.tagline}</p>
                </div>
                <div className="bg-teal-50 flex items-start px-3 py-1 rounded-full border border-teal-200 shrink-0">
                  <p className="font-['Inter:Bold'] font-bold text-teal-600 text-xs">{periodLabel}</p>
                </div>
              </div>
              {pkg.description && <p className="w-full text-[13px] leading-5 text-slate-600">{pkg.description}</p>}
              {pkg.details && pkg.details.length > 0 && (
                <dl className="grid w-full grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-slate-50 p-4 text-[13px]">
                  {pkg.details.map(({ label, value }) => (
                    <div key={label} className="flex min-w-0 flex-col gap-0.5">
                      <dt className="text-xs text-slate-500">{label}</dt>
                      <dd className="break-words font-semibold leading-5 text-slate-800">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {pkg.features.length > 0 && (
                <div className="w-full rounded-xl border border-slate-100 bg-white p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Quyền lợi</p>
                  <ul className="space-y-2 text-[13px] leading-5 text-slate-700">
                    {pkg.features.map((feature, index) => (
                      <li key={`${feature}-${index}`} className="flex items-start gap-2">
                        <span className="mt-0.5 text-teal-600">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {pkg.terms && pkg.terms.length > 0 && (
                <div className="w-full border-t border-slate-200 pt-3">
                  <p className="mb-1.5 text-xs font-semibold text-slate-500">Lưu ý gói tập</p>
                  <ul className="w-full list-disc space-y-1 pl-5 text-xs leading-5 text-slate-500">
                    {pkg.terms.map((term, index) => <li key={`${term}-${index}`}>{term}</li>)}
                  </ul>
                </div>
              )}
              <div className="w-full rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 text-[13px]">
                  {[
                    ["Hội viên:", formData.fullName || "Khách hàng mới"],
                    ["Cơ sở chính:", formData.branch],
                    ["Ngày kích hoạt:", formData.startDate ? formData.startDate.split('-').reverse().join('/') : '...'],
                  ].map(([label, val]) => (
                    <div key={label} className="grid grid-cols-[100px_minmax(0,1fr)] items-start gap-3">
                      <span className="font-['Inter:Medium'] font-medium text-[#64748b]">{label}</span>
                      <span className="break-words text-right font-['Inter:Semi_Bold'] font-semibold leading-5 text-[#0f172a]">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full border-t border-dashed border-slate-200 pt-4">
                <div className="flex flex-col gap-2.5 w-full text-[13px]">
                  <div className="flex items-start justify-between gap-3 w-full">
                    <span className="font-['Inter:Medium'] font-medium text-[#64748b]">Giá niêm yết</span>
                    <span className="font-['Inter:Semi_Bold'] font-semibold text-right text-[#0f172a]">{fmt(listPrice)}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3 w-full">
                    <span className="font-['Inter:Medium'] font-medium text-[#64748b]">Ưu đãi thanh toán</span>
                    <span className="font-['Inter:Bold'] font-bold text-right text-[#10b981]">-{fmt(discount)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between gap-3 w-full border-t border-slate-200 pt-4">
                <div>
                  <span className="block font-['Inter:Semi_Bold'] font-semibold text-[#0f172a] text-base">Tổng thanh toán</span>
                  <span className="mt-1 block text-[11px] text-slate-400">Đã bao gồm ưu đãi</span>
                </div>
                <span className="font-['Inter:Extra_Bold'] font-extrabold text-teal-600 text-[28px] tracking-tight">{fmt(total)}</span>
              </div>
              <div className="bg-[#fffbeb] border border-[#fcd34d] flex gap-2 items-start p-3 rounded-[8px] w-full shadow-sm">
                <span className="text-[#d97706] text-sm shrink-0">⏰</span>
                <p className="font-['Inter:Medium'] font-medium text-[#92400e] text-[12px] flex-1 leading-[16px]">
                  Hoàn tất trước <strong>15:00 hôm nay</strong> để nhận kích hoạt ngay
                </p>
              </div>
              <button
                type="button"
                onClick={onNext}
                className="bg-teal-500 flex items-center justify-center py-[15px] rounded-[12px] w-full font-['Inter:Bold'] font-bold text-white text-[16px] hover:bg-teal-600 transition-colors cursor-pointer"
              >
                {method === "counter" ? "Xác nhận đăng ký tại quầy →" : "Tiến hành thanh toán →"}
              </button>
              <div className="flex gap-[8px] items-center justify-center w-full">
                <img src={`${A}/ce483.svg`} className="size-3 mt-0.5 shrink-0" alt="" />
                <span className="font-['Inter:Medium'] font-medium text-[#64748b] text-[12px]">Giao dịch được bảo mật SSL 256-bit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
