import React, { useState } from "react";
import { A, PaymentMethodId } from "../shared";
import { BankConfigService } from "../../MemberPortal/services/bankConfig";

interface PaymentMethodDetailsPanelProps {
  method: PaymentMethodId;
  finalTotal: number;
  formData: any;
  copiedField: string | null;
  onCopy: (text: string, fieldName: string) => void;
  transferMemo: string;
  fmt: (n: number) => string;
  autoPaid?: boolean;
  autoPaidMessage?: string | null;
}

export function PaymentMethodDetailsPanel({
  method,
  finalTotal,
  formData,
  copiedField,
  onCopy,
  transferMemo,
  fmt,
  autoPaid,
  autoPaidMessage,
}: PaymentMethodDetailsPanelProps) {
  const bankConfig = BankConfigService.getConfig();
  const qrUrl = BankConfigService.getVietQrUrl(finalTotal, transferMemo, bankConfig);
  const [showZoomModal, setShowZoomModal] = useState(false);

  if (method === "qr") {
    return (
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 px-4 w-full shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-xs md:text-sm flex items-center gap-1.5">
              <span>Quét mã VietQR Chuyển khoản 24/7</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.2 rounded border border-emerald-200">NAPAS 247</span>
            </h3>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Tự động điền số tiền & cú pháp</span>
        </div>

        <div className="flex flex-col md:flex-row gap-3.5 items-center pt-2.5 w-full">
          {/* Left: Bank details with 1-click copy */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0 w-full">
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80 flex flex-col gap-1.5 text-xs">
              
              {/* Bank Name */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Ngân hàng nhận</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-xs">{bankConfig.bankName}</span>
                </div>
              </div>

              {/* Account Number */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Số tài khoản</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-900 text-xs">{bankConfig.accountNumber}</span>
                  <button
                    type="button"
                    onClick={() => onCopy(bankConfig.accountNumber, "account")}
                    className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-semibold text-teal-700 transition-all cursor-pointer"
                  >
                    {copiedField === "account" ? "✓ Đã chép!" : "Sao chép"}
                  </button>
                </div>
              </div>

              {/* Account Owner */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Chủ tài khoản</span>
                <span className="font-bold text-slate-900 text-xs">{bankConfig.accountName}</span>
              </div>

              {/* Transfer Amount */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Số tiền thanh toán</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-teal-700 text-sm">{fmt(finalTotal)}</span>
                  <button
                    type="button"
                    onClick={() => onCopy(String(finalTotal), "amount")}
                    className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-semibold text-teal-700 transition-all cursor-pointer"
                  >
                    {copiedField === "amount" ? "✓ Đã chép!" : "Sao chép"}
                  </button>
                </div>
              </div>

              {/* Transfer Memo */}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200">
                <span className="text-slate-600 font-semibold text-[11px]">Nội dung chuyển khoản (bắt buộc)</span>
                <div className="flex items-center gap-1.5">
                  <span className="bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-mono font-black text-teal-800 text-xs tracking-wider">
                    {transferMemo}
                  </span>
                  <button
                    type="button"
                    onClick={() => onCopy(transferMemo, "memo")}
                    className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    {copiedField === "memo" ? "✓ Đã chép!" : "Sao chép"}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-3.5">
              💡 <strong>Mẹo:</strong> Mở <strong>App MB Bank</strong> hoặc bất kỳ App Ngân hàng nào (MB, VCB, Techcom, BIDV, MoMo...) quét mã QR để chuyển khoản trực tiếp tự động điền tiền.
            </p>
          </div>

          {/* Right: Dynamic VietQR Code Box */}
          <div className="flex flex-col gap-1 items-center shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <div
              onClick={() => setShowZoomModal(true)}
              className="group relative bg-white border border-slate-200 rounded-lg w-[155px] p-1.5 flex items-center justify-center shadow-2xs overflow-hidden cursor-pointer hover:border-teal-500 transition-all"
              title="Nhấn để phóng to mã QR"
            >
              <img
                src={qrUrl}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://api.vietqr.io/img/vietqr_net.png";
                }}
                className="w-full h-auto object-contain rounded transition-transform group-hover:scale-[1.02]"
                alt={`Mã VietQR ${bankConfig.bankName}`}
              />
              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                <span className="bg-white/95 text-slate-800 text-[10px] font-bold px-2 py-1 rounded-full shadow-xs">
                  🔍 Phóng to
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between w-full px-1 text-[10px] font-medium text-slate-500 text-center">
              <span>📱 Quét bằng bất kỳ App Ngân hàng nào</span>
            </div>
          </div>
        </div>

        {/* Khối trạng thái Webhook tự động */}
        <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
          autoPaid 
            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-md animate-pulse" 
            : "bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200"
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${autoPaid ? "bg-white" : "bg-emerald-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${autoPaid ? "bg-white" : "bg-emerald-500"}`}></span>
            </span>
            <div className="text-left">
              <div className={`text-xs font-bold flex items-center gap-1.5 ${autoPaid ? "text-white" : "text-emerald-950"}`}>
                {autoPaid ? "🎉 Đã nhận thanh toán thành công từ MB Bank qua SePay!" : "Đang chờ chuyển khoản theo thời gian thực (MB Bank)..."}
              </div>
              <div className={`text-[10px] ${autoPaid ? "text-emerald-100" : "text-emerald-700"}`}>
                {autoPaid ? (autoPaidMessage || "Hệ thống đang tự động hoàn tất và kích hoạt ngay...") : "Chuyển tiền xong, hệ thống tự động phát hiện và hoàn tất đơn hàng ngay lập tức (không cần bấm nút)!"}
              </div>
            </div>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border shadow-2xs shrink-0 ${
            autoPaid ? "bg-white text-emerald-700 border-white" : "text-emerald-700 bg-white border-emerald-200"
          }`}>
            {autoPaid ? "Thành công ✓" : "Trực tiếp 24/7 ⚡"}
          </span>
        </div>

        {/* Zoom Lightbox Modal */}
        {showZoomModal && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setShowZoomModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-5 max-w-sm w-full flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between w-full border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-sm text-slate-800">Mã QR Thanh Toán</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowZoomModal(false)}
                  className="size-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl w-full flex items-center justify-center">
                <img
                  src={qrUrl}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://api.vietqr.io/img/vietqr_net.png";
                  }}
                  alt={`Mã VietQR ${bankConfig.bankName} phóng to`}
                  className="w-full max-h-[380px] object-contain rounded-lg shadow-xs"
                />
              </div>

              <div className="w-full bg-slate-50 rounded-xl p-2.5 text-xs flex flex-col gap-1 border border-slate-200/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Số tiền:</span>
                  <span className="font-bold text-teal-700">{fmt(finalTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nội dung CK:</span>
                  <span className="font-mono font-bold text-slate-800">{transferMemo}</span>
                </div>
              </div>

              <div className="flex gap-2 w-full pt-1">
                <a
                  href={qrUrl}
                  target="_blank"
                  rel="noreferrer"
                  download="vietqr_sportcenter.jpg"
                  className="flex-1 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs text-center border border-teal-200 transition-colors"
                >
                  📥 Tải ảnh về máy
                </a>
                <button
                  type="button"
                  onClick={() => setShowZoomModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (method === "card") {
    return (
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 px-4 w-full shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-xs md:text-sm">
            Thanh toán thẻ tín dụng & ghi nợ quốc tế
          </h3>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            PCI-DSS Level 1
          </span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-2 text-xs text-slate-600 flex flex-col gap-2">
          <p className="leading-relaxed text-[11px]">
            SportCenter hỗ trợ thanh toán trực tuyến qua <strong>Visa, MasterCard, JCB</strong> và <strong>thẻ ATM Napas</strong>. Mọi giao dịch được mã hóa và xác thực an toàn qua 3D Secure.
          </p>
          <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 text-xs">
            <span className="font-medium text-slate-600">Số tiền cần thanh toán:</span>
            <strong className="text-teal-700 font-bold">{fmt(finalTotal)}</strong>
          </div>
        </div>
      </div>
    );
  }

  if (method === "wallet") {
    return (
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 px-4 w-full shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-xs md:text-sm">
            Ví điện tử MoMo & ZaloPay
          </h3>
          <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
            Ưu đãi hoàn 5%
          </span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-2 text-xs text-slate-600 flex flex-col gap-2">
          <p className="leading-relaxed text-[11px]">
            Sau khi nhấn xác nhận, bạn sẽ được liên kết trực tiếp tới ứng dụng <strong>MoMo</strong> hoặc <strong>ZaloPay</strong> để hoàn tất thanh toán trong 1 chạm.
          </p>
          <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 text-xs">
            <span className="font-medium text-slate-600">Số tiền giao dịch:</span>
            <strong className="text-teal-700 font-bold">{fmt(finalTotal)}</strong>
          </div>
        </div>
      </div>
    );
  }

  if (method === "counter") {
    return (
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 px-4 w-full shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-xs md:text-sm">
            Thanh toán trực tiếp tại quầy lễ tân
          </h3>
          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Giữ chỗ 24 giờ
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mt-2 text-xs text-slate-700 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-teal-600 font-bold shrink-0">🏢 Cơ sở tiếp nhận:</span>
            <span className="text-slate-900 font-semibold">{formData?.branch || "Chi nhánh Quận 1 - Flagship Center"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-teal-600 font-bold shrink-0">💵 Số tiền cần thanh toán:</span>
            <strong className="text-teal-700 font-extrabold">{fmt(finalTotal)}</strong>
          </div>
          <div className="p-2 rounded bg-amber-50/80 border border-amber-200/80 text-amber-900 text-[10px] leading-relaxed">
            💡 <strong>Lưu ý:</strong> Đơn đăng ký giữ chỗ có hiệu lực trong <strong>24 giờ</strong>. Khi đến quầy, bạn chỉ cần đọc Số điện thoại <span className="font-bold">{formData?.phone || "đăng ký"}</span> để Lễ tân xuất hóa đơn và bàn giao thẻ hội viên ngay.
          </div>
        </div>
      </div>
    );
  }

  return null;
}
export default PaymentMethodDetailsPanel;
