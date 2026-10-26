import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Wallet, X, CheckCircle2, QrCode, CreditCard, Building, ArrowRight,
  ShieldCheck, Sparkles, Copy, Check, AlertCircle,
} from "lucide-react";
import { WalletService } from "../services/walletService";
import { BankConfigService, BankConfig } from "../services/bankConfig";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  userName?: string;
  phone?: string;
  onSuccess?: (newBalance: number) => void;
}

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000];

export default function WalletTopUpModal({
  isOpen, onClose, currentBalance, userName = "Hội viên", phone = "0901234567", onSuccess,
}: Props) {
  const [selectedAmount, setSelectedAmount] = useState(100000);
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState<"qr" | "card" | "counter">("qr");
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Bank config & Card form
  const [bankConfig] = useState<BankConfig>(() => BankConfigService.getConfig());
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvv: "" });
  const [successResult, setSuccessResult] = useState<{ amount: number; newBalance: number } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSuccessResult(null);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actualAmount = customAmount ? Number(customAmount.replace(/\D/g, "")) : selectedAmount;
  const phoneDigits = phone ? phone.replace(/\D/g, "").slice(-4) : "8888";
  const transferMemo = `NAPVI ${phoneDigits}`.toUpperCase();
  const vietQrUrl = BankConfigService.getVietQrUrl(actualAmount, transferMemo, bankConfig);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConfirmQrOrCard = async () => {
    if (actualAmount <= 0) return;
    setLoading(true);
    try {
      const methodName = method === "qr" ? "Chuyển khoản VietQR" : "Thẻ ATM / Visa";
      const res = await WalletService.topUp(actualAmount, methodName, `Nạp ví hội viên (${transferMemo})`);
      if (res.success) {
        setSuccessResult({ amount: actualAmount, newBalance: res.newBalance });
        onSuccess?.(res.newBalance);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessResult(null);
    onClose();
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button type="button" onClick={() => handleCopy(text, id)} className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer" title="Sao chép">
      {copiedKey === id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Ví & Số dư tài khoản</h3>
              <p className="text-xs text-slate-500">Kiểm tra số dư và nạp thêm tiền vào ví hội viên</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {successResult ? (
            /* SUCCESS VIEW */
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">Nạp tiền vào tài khoản thành công!</h4>
                <p className="text-xs text-slate-500 mt-1">Đã nạp <strong className="text-emerald-600 font-bold">{successResult.amount.toLocaleString("vi-VN")} đ</strong> vào ví</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg space-y-1">
                <span className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">Số dư tài khoản mới</span>
                <div className="text-2xl font-black">{successResult.newBalance.toLocaleString("vi-VN")} đ</div>
                <div className="text-[11px] text-emerald-100/90 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /><span>Sẵn sàng sử dụng thanh toán gói tập & tiện ích</span>
                </div>
              </div>
              <button type="button" onClick={handleClose} className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md cursor-pointer">
                Hoàn tất & Đóng
              </button>
            </div>
          ) : (
            /* MAIN FORM VIEW */
            <>
              {/* BALANCE BANNER */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-md flex items-center justify-between border border-slate-700/50">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-emerald-400" /> Số dư khả dụng
                  </span>
                  <div className="text-xl font-black text-white mt-0.5">
                    {currentBalance.toLocaleString("vi-VN")} <span className="text-xs font-semibold text-emerald-400">đ</span>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> <span>{userName}</span>
                </div>
              </div>

              {/* PAYMENT METHOD TABS */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Hình thức thanh toán</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "qr" as const, label: "Mã VNPAY", icon: QrCode, color: "text-red-600" },
                    { id: "card" as const, label: "Thẻ ATM / Visa", icon: CreditCard, color: "text-blue-600" },
                    { id: "counter" as const, label: "Tại quầy", icon: Building, color: "text-amber-600" },
                  ].map((m) => (
                    <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 cursor-pointer transition-all ${method === m.id ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20" : "bg-white dark:bg-slate-800 border-slate-200 text-slate-600 dark:text-slate-400 hover:border-slate-300"}`}>
                      <m.icon className={`w-4 h-4 ${m.color}`} />
                      <span className="text-[11px] font-bold">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AMOUNT SELECTOR (Only for QR and Card) */}
              {method !== "counter" && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Chọn số tiền nạp</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_AMOUNTS.map((amt) => (
                      <button key={amt} type="button" onClick={() => { setCustomAmount(""); setSelectedAmount(amt); }}
                        className={`py-2 px-2.5 rounded-xl font-bold text-xs border text-center transition-all ${!customAmount && selectedAmount === amt ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20" : "bg-white dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-300"}`}>
                        {amt.toLocaleString("vi-VN")} đ
                      </button>
                    ))}
                  </div>
                  <div className="relative mt-1.5">
                    <input type="text" value={customAmount} onChange={(e) => { const d = e.target.value.replace(/\D/g, ""); setCustomAmount(d ? Number(d).toLocaleString("vi-VN") : ""); }} placeholder="Nhập số tiền khác..." className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500" />
                    {customAmount && <span className="absolute right-3 top-2 text-xs font-bold text-emerald-600">đ</span>}
                  </div>
                </div>
              )}

              {/* METHOD DETAILS */}
              {method === "qr" && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700 text-xs">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Ví VNPAY • 0815353732</span>
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800">VNPAY APP / Napas 247</span>
                  </div>

                  <div className="text-center space-y-1">
                    <img src="/vnpay_qr.png" alt="Mã QR VNPAY" className="w-36 h-auto object-contain mx-auto rounded-xl bg-white p-1.5 border border-slate-200 shadow-xs" />
                    <p className="text-[10px] text-slate-500">Mở App VNPAY hoặc bất kỳ App Ngân hàng nào để quét mã</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                    <div className="flex justify-between"><span className="text-slate-500">Số ví / Tài khoản:</span><span className="font-mono font-bold flex items-center gap-1">0815353732 <CopyBtn text="0815353732" id="acc" /></span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Tên người nhận:</span><span className="font-bold">Khách hàng 0815353732</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Số tiền:</span><span className="font-bold text-emerald-600 flex items-center gap-1">{actualAmount.toLocaleString("vi-VN")} đ <CopyBtn text={actualAmount.toString()} id="amt" /></span></div>
                    <div className="flex justify-between border-t pt-1"><span className="text-slate-500">Nội dung:</span><span className="font-mono font-bold text-emerald-700 flex items-center gap-1">{transferMemo} <CopyBtn text={transferMemo} id="memo" /></span></div>
                  </div>
                </div>
              )}

              {method === "card" && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-blue-600" /> Thẻ ATM / Visa / Master</span>
                  <input type="text" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="9704 •••• •••• ••••" className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono" />
                  <input type="text" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })} placeholder="TEN CHU THE (IN HOA)" className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 uppercase" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} placeholder="MM/YY" className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono" />
                    <input type="password" maxLength={4} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} placeholder="CVV" className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono" />
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Bảo mật 3D Secure 256-bit SSL</div>
                </div>
              )}

              {method === "counter" && (
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3 text-xs animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 dark:text-amber-200 text-xs uppercase tracking-wide">Nạp tiền tại quầy Lễ tân</h4>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300">Quầy Thu ngân SportCenter • Tầng 1 (06:00 - 22:00)</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-amber-200/60 space-y-3 text-slate-700 dark:text-slate-300 text-xs">
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Hội viên</span>
                        <strong className="text-slate-900 dark:text-white font-bold text-xs">{userName}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Số điện thoại</span>
                        <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs">{phone}</strong>
                      </div>
                    </div>

                    <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <p><strong>Đến quầy Thu ngân (Tầng 1):</strong> Đọc số điện thoại của bạn cho nhân viên.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <p><strong>Thanh toán linh hoạt:</strong> Hỗ trợ tiền mặt hoặc quẹt thẻ POS theo số tiền bạn muốn nạp.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <p><strong>Cộng ví tức thì:</strong> Tiền sẽ được nạp trực tiếp vào ví hội viên ngay khi thanh toán.</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>Không cần thao tác gì thêm, thu ngân tại quầy sẽ hỗ trợ bạn trực tiếp!</span>
                  </div>
                </div>
              )}

              {/* ACTION BUTTON */}
              {method === "counter" ? (
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer bg-slate-900 hover:bg-slate-800 text-white"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tôi đã hiểu & Đóng</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading || actualAmount <= 0}
                  onClick={handleConfirmQrOrCard}
                  className="w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-white bg-emerald-600 hover:bg-emerald-500"
                >
                  {loading ? (
                    <span>Đang xử lý...</span>
                  ) : (
                    <>
                      <span>Xác nhận nạp {actualAmount.toLocaleString("vi-VN")} đ</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
