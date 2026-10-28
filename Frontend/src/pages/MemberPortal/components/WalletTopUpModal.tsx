import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Wallet, X } from "lucide-react";
import { WalletService } from "../services/walletService";
import { BankConfigService, BankConfig } from "../services/bankConfig";
import { TopUpSuccessView } from "./walletTopUp/TopUpSuccessView";
import { TopUpBalanceBanner } from "./walletTopUp/TopUpBalanceBanner";
import { TopUpMethodTabs } from "./walletTopUp/TopUpMethodTabs";
import { TopUpAmountSelector } from "./walletTopUp/TopUpAmountSelector";
import { TopUpQrSection } from "./walletTopUp/TopUpQrSection";
import { TopUpCardSection } from "./walletTopUp/TopUpCardSection";
import { TopUpCounterSection } from "./walletTopUp/TopUpCounterSection";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  userName?: string;
  phone?: string;
  onSuccess?: (newBalance: number) => void;
}

export default function WalletTopUpModal({
  isOpen,
  onClose,
  currentBalance,
  userName = "Hội viên",
  phone = "0901234567",
  onSuccess,
}: Props) {
  const [selectedAmount, setSelectedAmount] = useState(100000);
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState<"qr" | "card" | "counter">("qr");
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Bank config & Card form
  const [bankConfig, setBankConfig] = useState<BankConfig>(() => BankConfigService.getConfig());
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvv: "" });
  const [successResult, setSuccessResult] = useState<{ amount: number; newBalance: number } | null>(null);
  const [checkStatusText, setCheckStatusText] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const cfg = BankConfigService.getConfig();
    setBankConfig(cfg);
    setCheckStatusText(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSuccessResult(null);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const [sessionCode, setSessionCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const actualAmount = customAmount ? Number(customAmount.replace(/\D/g, "")) : selectedAmount;
  const transferMemo = `NAPVI ${sessionCode}`.toUpperCase();

  useEffect(() => {
    if (isOpen) {
      setSessionCode(Math.floor(1000 + Math.random() * 9000).toString());
      setSuccessResult(null);
      setCheckStatusText(null);
    }
  }, [isOpen]);

  // Auto-polling biến động số dư Vietcombank khi mở tab QR
  useEffect(() => {
    if (!isOpen || method !== "qr" || successResult) return;
    let isCancelled = false;

    const interval = setInterval(async () => {
      try {
        const res = await WalletService.checkTransfer(transferMemo, actualAmount);
        if (!isCancelled && res.received && typeof res.newBalance === "number") {
          clearInterval(interval);
          setSuccessResult({ amount: actualAmount, newBalance: res.newBalance });
          onSuccess?.(res.newBalance);
        }
      } catch {}
    }, 2500);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [isOpen, method, transferMemo, actualAmount, successResult, onSuccess]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCheckTransfer = async () => {
    if (actualAmount <= 0) return;
    setLoading(true);
    setCheckStatusText("Đang kiểm tra biến động số dư Vietcombank...");
    try {
      const res = await WalletService.checkTransfer(transferMemo, actualAmount, undefined, false);
      if (res.received && typeof res.newBalance === "number") {
        setSuccessResult({ amount: actualAmount, newBalance: res.newBalance });
        onSuccess?.(res.newBalance);
      } else {
        setCheckStatusText(
          res.message ||
            `Chưa phát hiện giao dịch ${actualAmount.toLocaleString("vi-VN")} đ với nội dung "${transferMemo}" trên tài khoản Vietcombank. Vui lòng quét mã QR và hoàn tất chuyển tiền trước khi bấm kiểm tra!`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateWebhook = async () => {
    if (actualAmount <= 0) return;
    setIsSimulating(true);
    try {
      const res = await WalletService.simulateWebhook(actualAmount, transferMemo);
      if (res.success) {
        setSuccessResult({ amount: actualAmount, newBalance: res.newBalance });
        onSuccess?.(res.newBalance);
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const handleConfirmCard = async () => {
    if (actualAmount <= 0) return;
    if (!card.number || card.number.length < 10) {
      alert("Vui lòng nhập số thẻ hợp lệ.");
      return;
    }
    setLoading(true);
    try {
      const res = await WalletService.topUp(actualAmount, "Thẻ ATM / Visa", `Nạp ví qua thẻ (${card.number.slice(-4)})`);
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
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {successResult ? (
            <TopUpSuccessView successResult={successResult} onClose={handleClose} />
          ) : (
            <>
              {/* BALANCE BANNER */}
              <TopUpBalanceBanner currentBalance={currentBalance} userName={userName} />

              {/* PAYMENT METHOD TABS */}
              <TopUpMethodTabs method={method} setMethod={setMethod} />

              {/* AMOUNT SELECTOR (Only for QR and Card) */}
              {method !== "counter" && (
                <TopUpAmountSelector
                  selectedAmount={selectedAmount}
                  setSelectedAmount={setSelectedAmount}
                  customAmount={customAmount}
                  setCustomAmount={setCustomAmount}
                />
              )}

              {/* METHOD DETAILS */}
              {method === "qr" && (
                <TopUpQrSection
                  bankConfig={bankConfig}
                  actualAmount={actualAmount}
                  transferMemo={transferMemo}
                  copiedKey={copiedKey}
                  onCopy={handleCopy}
                  checkStatusText={checkStatusText}
                  loading={loading}
                  onCheckTransfer={handleCheckTransfer}
                  isSimulating={isSimulating}
                  onSimulateWebhook={handleSimulateWebhook}
                />
              )}

              {method === "card" && (
                <TopUpCardSection
                  card={card}
                  setCard={setCard}
                  loading={loading}
                  actualAmount={actualAmount}
                  onConfirmCard={handleConfirmCard}
                />
              )}

              {method === "counter" && (
                <TopUpCounterSection
                  userName={userName}
                  phone={phone}
                  onClose={handleClose}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
