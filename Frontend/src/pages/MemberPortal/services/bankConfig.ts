export interface BankConfig {
  bankBin: string; // 6-digit BIN code
  bankCode: string; // Short code e.g. "MB", "VCB"
  bankName: string; // Full bank name
  accountNumber: string; // Real account number
  accountName: string; // Account holder name
}

export const POPULAR_BANKS = [
  { bin: "971015", code: "VNPAY", name: "Ví điện tử VNPAY (Napas 247)" },
  { bin: "970422", code: "MB", name: "MB Bank (Ngân hàng Quân Đội)" },
  { bin: "970436", code: "VCB", name: "Vietcombank (Ngoại thương)" },
  { bin: "970407", code: "TCB", name: "Techcombank (Kỹ thương)" },
  { bin: "970415", code: "CTG", name: "VietinBank (Công thương)" },
  { bin: "970418", code: "BIDV", name: "BIDV (Đầu tư & Phát triển)" },
  { bin: "970432", code: "VPB", name: "VPBank (Việt Nam Thịnh Vượng)" },
  { bin: "970416", code: "ACB", name: "ACB (Á Châu)" },
  { bin: "970423", code: "TPB", name: "TPBank (Tiên Phong)" },
  { bin: "970403", code: "STB", name: "Sacombank (Sài Gòn Thương Tín)" },
  { bin: "970437", code: "HDB", name: "HDBank (Phát triển TP.HCM)" },
  { bin: "970441", code: "VIB", name: "VIB (Quốc tế)" },
  { bin: "970405", code: "VBA", name: "Agribank (Nông nghiệp)" },
];

export const DEFAULT_BANK_CONFIG: BankConfig = {
  bankBin: "971015",
  bankCode: "VNPAY",
  bankName: "Ví điện tử VNPAY (App VNPAY / Napas 247)",
  accountNumber: "0815353732",
  accountName: "Khách hàng 0815353732",
};

const STORAGE_KEY = "sport_center_bank_config";

export const BankConfigService = {
  getConfig(): BankConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.bankBin && parsed.accountNumber) {
          return { ...DEFAULT_BANK_CONFIG, ...parsed };
        }
      }
    } catch (e) {
      console.warn("Failed to read bank config:", e);
    }
    return DEFAULT_BANK_CONFIG;
  },

  saveConfig(config: BankConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn("Failed to save bank config:", e);
    }
  },

  getVietQrUrl(amount: number, memo: string, config?: BankConfig): string {
    const cfg = config || this.getConfig();
    if (cfg.bankCode === "VNPAY" || cfg.bankBin === "971015" || cfg.accountNumber === "0815353732") {
      return "/vnpay_qr.png";
    }
    const cleanAcc = (cfg.accountNumber || "").replace(/\s+/g, "");
    const encodedMemo = encodeURIComponent(memo || "NAPVI");
    const encodedName = encodeURIComponent(cfg.accountName || "Khách hàng 0815353732");

    return `https://api.vietqr.io/image/${cfg.bankBin}-${cleanAcc}-compact2.jpg?amount=${amount}&addInfo=${encodedMemo}&accountName=${encodedName}`;
  },
};
