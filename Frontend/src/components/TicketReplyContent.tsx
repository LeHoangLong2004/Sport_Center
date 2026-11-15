import React, { useState } from "react";
import { QrCode, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Props {
  content: string;
}

export function parseVietQrPaymentTag(text: string) {
  const match = text.match(/\[VIETQR_PAYMENT:(.*?)\]/);
  if (!match) return null;

  const rawParams = match[1];
  const params = new URLSearchParams(rawParams);

  return {
    packageName: params.get("package") || "Gói tập SportCenter",
    amount: Number(params.get("amount")) || 500000,
    duration: params.get("duration") || "1",
    account: params.get("account") || "0335889765",
    bank: params.get("bank") || "MBBank",
    transferContent: params.get("content") || "GIAHAN TCK",
    cleanText: text.replace(/\[VIETQR_PAYMENT:.*?\]/, "").trim(),
  };
}

export function TicketReplyContent({ content }: Props) {
  const [copied, setCopied] = useState(false);
  const paymentData = parseVietQrPaymentTag(content);

  if (!paymentData) {
    return <p className="whitespace-pre-line leading-relaxed">{content}</p>;
  }

  const { packageName, amount, duration, account, bank, transferContent, cleanText } = paymentData;
  const qrUrl = `https://img.vietqr.io/image/${bank}-${account}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=SPORT%20CENTER`;

  const handleCopyContent = () => {
    navigator.clipboard.writeText(transferContent);
    setCopied(true);
    toast.success("Đã sao chép cú pháp chuyển khoản!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Text reply */}
      <p className="whitespace-pre-line leading-relaxed">{cleanText}</p>

      {/* VietQR Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-sm space-y-3 not-prose">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <QrCode className="w-4 h-4" />
            </span>
            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
              Mã VietQR thanh toán ({packageName} - {duration} tháng)
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Khớp lệnh tự động
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* QR Image */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs shrink-0">
            <img
              src={qrUrl}
              alt="Mã VietQR"
              className="w-36 h-36 rounded-lg object-contain block"
            />
          </div>

          {/* Details */}
          <div className="flex-1 w-full space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 text-[11px]">Ngân hàng:</span>
              <strong className="text-slate-900 dark:text-white">{bank} (Quân Đội)</strong>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 text-[11px]">Số tài khoản:</span>
              <strong className="font-mono text-slate-900 dark:text-white">{account}</strong>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 text-[11px]">Chủ tài khoản:</span>
              <strong className="text-slate-900 dark:text-white">SPORT CENTER</strong>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 text-[11px]">Số tiền cần thanh toán:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                {amount.toLocaleString("vi-VN")} đ
              </strong>
            </div>
            <div className="pt-1">
              <span className="text-[11px] text-slate-500 block mb-1">Cú pháp chuyển khoản bắt buộc:</span>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 font-mono font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                <span>{transferContent}</span>
                <button
                  type="button"
                  onClick={handleCopyContent}
                  className="p-1 text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 hover:bg-emerald-200/50 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                  title="Sao chép cú pháp"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Đã chép" : "Sao chép"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
          <span>💡 <em>Học viên mở App ngân hàng quét mã để chuyển khoản. Lễ tân sẽ xác nhận & kích hoạt gói ngay sau khi nhận tiền.</em></span>
          <a
            href={qrUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline shrink-0 flex items-center gap-1 ml-2"
          >
            Mở ảnh to <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

