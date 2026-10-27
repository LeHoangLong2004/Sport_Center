export interface BankConfig {
  bankBin: string; // 6-digit BIN code
  bankCode: string; // Short code e.g. "MB", "VCB"
  bankName: string; // Full bank name
  accountNumber: string; // Real account number
  accountName: string; // Account holder name
  qrImage?: string; // Static image file path in /public
  sepayApiToken?: string; // Mã API Token từ my.sepay.vn để đọc biến động số dư Vietcombank thực tế
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
  bankBin: "970422",
  bankCode: "MB",
  bankName: "MB Bank (Ngân hàng Quân Đội)",
  accountNumber: "980979977428",
  accountName: "PHAM DUC THANH PHUONG",
  sepayApiToken: "smartgym_sepay_secret_2026",
};

const STORAGE_KEY = "sport_center_bank_config";

export const BankConfigService = {
  getConfig(): BankConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.bankBin &&
          parsed.accountNumber &&
          parsed.bankBin !== "971015" &&
          parsed.accountNumber !== "1030183675" &&
          parsed.accountNumber !== "090388886868" &&
          !parsed.accountNumber.includes("YOUR_")
        ) {
          return {
            ...DEFAULT_BANK_CONFIG,
            ...parsed,
          };
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

  getVietQrUrl(amount?: number, memo?: string, config?: BankConfig): string {
    const cfg = config || this.getConfig();
    // Ưu tiên hiển thị chính xác ảnh QR Vietcombank thật từ thư mục public của dự án
    if (cfg.qrImage) {
      return cfg.qrImage;
    }
    const cleanAcc = (cfg.accountNumber || "").replace(/\s+/g, "");
    const encodedMemo = encodeURIComponent(memo || "THANHTOAN");
    const encodedName = encodeURIComponent(cfg.accountName || "CHU TAI KHOAN");

    return `https://img.vietqr.io/image/${cfg.bankBin}-${cleanAcc}-compact2.jpg?amount=${amount || 0}&addInfo=${encodedMemo}&accountName=${encodedName}`;
  },
};
