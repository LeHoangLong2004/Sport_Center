export interface WalletTransaction {
  id: string;
  type: "topup" | "payment" | "refund";
  amount: number;
  method: string;
  note: string;
  createdAt: string;
  status: "completed" | "pending";
}

export interface MemberWalletData {
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
}

export const MEMBER_WALLET_UPDATED_EVENT = "member-wallet-updated";

function getAuthHeaders(userId?: string): Record<string, string> {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  const user = getStoredUser();
  const uid = userId || user?.id || user?.email;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(uid ? { "X-User-Id": String(uid) } : {}),
  };
}

function getStoredUser(): any | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isMockTransaction(tx: WalletTransaction): boolean {
  if (!tx) return true;
  if (tx.id === "WTX-INIT-01" || tx.id?.includes("INIT")) return true;
  if (/^WTX-\d{8}-001$/.test(tx.id) && tx.amount === 500000) return true;
  if (tx.note?.includes("khả dụng ban đầu")) return true;
  if (tx.amount === 500000 && tx.note === "Nạp tiền ví hội viên SportCenter") return true;
  return false;
}

export function sanitizeWalletData(raw: any): MemberWalletData {
  if (!raw || typeof raw !== "object") {
    return { balance: 0, currency: "VND", transactions: [] };
  }

  const rawTransactions: WalletTransaction[] = Array.isArray(raw.transactions) ? raw.transactions : [];
  // Loại bỏ toàn bộ giao dịch mẫu 500k ban đầu
  const cleanTransactions = rawTransactions.filter(tx => !isMockTransaction(tx));

  // Tính toán lại số dư thực tế dựa trên các giao dịch nạp/thanh toán thật (CHỈ tính completed, KHÔNG tính pending)
  let calculatedBalance = 0;
  for (const tx of cleanTransactions) {
    const amt = Number(tx.amount) || 0;
    const isCompleted = tx.status === "completed" || (!tx.status && tx.status !== "pending");
    if (isCompleted) {
      if (tx.type === "topup" || tx.type === "refund") {
        calculatedBalance += amt;
      } else if (tx.type === "payment") {
        calculatedBalance -= amt;
      }
    }
  }

  // Bắt buộc mặc định là 0 đ nếu người dùng chưa nạp tiền thực tế
  const finalBalance = cleanTransactions.length === 0 ? 0 : Math.max(0, calculatedBalance);

  return {
    balance: finalBalance,
    currency: raw.currency || "VND",
    transactions: cleanTransactions,
  };
}

// Tự động quét và dọn dẹp sạch toàn bộ key ví cũ trong localStorage của trình duyệt
export function cleanAllLocalWallets() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("member_wallet_")) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            const sanitized = sanitizeWalletData(parsed);
            localStorage.setItem(key, JSON.stringify(sanitized));
          } catch {}
        }
      }
    }
  } catch (e) {
    console.warn("Clean wallets failed:", e);
  }
}

// Chạy dọn dẹp ngay khi load file
cleanAllLocalWallets();

export const WalletService = {
  getStorageKey(userId?: string): string {
    const user = getStoredUser();
    const u = userId || user?.id || user?.email || "default";
    return `member_wallet_${u}`;
  },

  getLocalWallet(userId?: string): MemberWalletData {
    const key = this.getStorageKey(userId);
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        const sanitized = sanitizeWalletData(parsed);
        // Lưu lại dữ liệu chuẩn hóa 0 đ nếu trước đó có chứa số dư ảo 500k
        if (
          sanitized.balance !== parsed.balance ||
          sanitized.transactions.length !== (parsed.transactions?.length || 0)
        ) {
          localStorage.setItem(key, JSON.stringify(sanitized));
        }
        return sanitized;
      }
    } catch (e) {
      console.warn("Failed to read local wallet:", e);
    }

    // Mặc định tài khoản mới tạo là 0 VND và không có giao dịch ảo
    const defaultData: MemberWalletData = {
      balance: 0,
      currency: "VND",
      transactions: [],
    };
    try {
      localStorage.setItem(key, JSON.stringify(defaultData));
    } catch {}
    return defaultData;
  },

  saveLocalWallet(data: MemberWalletData, userId?: string) {
    const key = this.getStorageKey(userId);
    const sanitized = sanitizeWalletData(data);
    try {
      localStorage.setItem(key, JSON.stringify(sanitized));
      window.dispatchEvent(
        new CustomEvent(MEMBER_WALLET_UPDATED_EVENT, { detail: sanitized })
      );
    } catch (e) {
      console.warn("Failed to save local wallet:", e);
    }
  },

  async getWallet(userId?: string): Promise<MemberWalletData> {
    const user = getStoredUser();
    const targetUserId = userId || user?.id || user?.email;
    try {
      const queryParam = targetUserId ? `?userId=${encodeURIComponent(targetUserId)}` : "";
      const res = await fetch(`/api/member/wallet${queryParam}`, {
        headers: getAuthHeaders(targetUserId),
      });
      if (res.ok) {
        const data = await res.json();
        const sanitized = sanitizeWalletData(data);
        this.saveLocalWallet(sanitized, targetUserId);
        return sanitized;
      }
    } catch (e) {
      console.warn("Backend getWallet failed, falling back to local:", e);
    }

    return this.getLocalWallet(targetUserId);
  },

  async topUp(
    amount: number,
    method: string = "VietQR",
    note: string = "Nạp tiền vào tài khoản",
    userId?: string
  ): Promise<{ success: boolean; newBalance: number; transaction: WalletTransaction }> {
    const user = getStoredUser();
    const targetUserId = userId || user?.id || user?.email;
    try {
      const queryParam = targetUserId ? `?userId=${encodeURIComponent(targetUserId)}` : "";
      const res = await fetch(`/api/member/wallet/topup${queryParam}`, {
        method: "POST",
        headers: getAuthHeaders(targetUserId),
        body: JSON.stringify({ amount, method, note }),
      });
      if (res.ok) {
        const result = await res.json();
        const newBalance = Number(result.balance) || 0;
        const current = this.getLocalWallet(targetUserId);
        const updated: MemberWalletData = {
          balance: newBalance,
          currency: "VND",
          transactions: [result.transaction, ...(current.transactions || [])],
        };
        this.saveLocalWallet(updated, targetUserId);
        return {
          success: true,
          newBalance,
          transaction: result.transaction,
        };
      }
    } catch (e) {
      console.warn("Backend topup failed, using offline store:", e);
    }

    // Local fallback
    const current = this.getLocalWallet(targetUserId);
    const newBalance = current.balance + amount;
    const tx: WalletTransaction = {
      id: `WTX-${Date.now()}`,
      type: "topup",
      amount,
      method,
      note,
      createdAt: new Date().toISOString(),
      status: "completed",
    };
    const updated: MemberWalletData = {
      balance: newBalance,
      currency: "VND",
      transactions: [tx, ...(current.transactions || [])],
    };
    this.saveLocalWallet(updated, targetUserId);

    return {
      success: true,
      newBalance,
      transaction: tx,
    };
  },

  async createPendingTopUp(
    amount: number,
    method: string = "Tiền mặt tại quầy",
    note: string = "Phiếu nạp tiền tại quầy",
    ticketCode?: string,
    userId?: string
  ): Promise<{ success: boolean; transaction: WalletTransaction }> {
    const user = getStoredUser();
    const targetUserId = userId || user?.id || user?.email;
    const txId = ticketCode || `TOPUP-Q${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const queryParam = targetUserId ? `?userId=${encodeURIComponent(targetUserId)}` : "";
      const res = await fetch(`/api/member/wallet/topup${queryParam}`, {
        method: "POST",
        headers: getAuthHeaders(targetUserId),
        body: JSON.stringify({ amount, method, note, status: "pending", id: txId }),
      });
      if (res.ok) {
        const result = await res.json();
        const current = this.getLocalWallet(targetUserId);
        const updated: MemberWalletData = {
          balance: current.balance, // Số dư không tăng khi đang pending
          currency: "VND",
          transactions: [result.transaction, ...(current.transactions || [])],
        };
        this.saveLocalWallet(updated, targetUserId);
        return { success: true, transaction: result.transaction };
      }
    } catch (e) {
      console.warn("Backend createPendingTopUp failed, saving locally:", e);
    }

    const current = this.getLocalWallet(targetUserId);
    const tx: WalletTransaction = {
      id: txId,
      type: "topup",
      amount,
      method,
      note,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    const updated: MemberWalletData = {
      balance: current.balance, // Số dư giữ nguyên
      currency: "VND",
      transactions: [tx, ...(current.transactions || [])],
    };
    this.saveLocalWallet(updated, targetUserId);
    return { success: true, transaction: tx };
  },

  async confirmPendingTopUp(
    txId: string,
    userId?: string
  ): Promise<{ success: boolean; newBalance: number; transaction?: WalletTransaction }> {
    const user = getStoredUser();
    const targetUserId = userId || user?.id || user?.email;

    try {
      const queryParam = targetUserId ? `?userId=${encodeURIComponent(targetUserId)}` : "";
      const res = await fetch(`/api/member/wallet/confirm-pending/${encodeURIComponent(txId)}${queryParam}`, {
        method: "POST",
        headers: getAuthHeaders(targetUserId),
      });
      if (res.ok) {
        const result = await res.json();
        const current = this.getLocalWallet(targetUserId);
        const updatedTransactions = (current.transactions || []).map((t) =>
          t.id === txId ? { ...t, status: "completed" as const } : t
        );
        const updated: MemberWalletData = {
          balance: Number(result.balance) || current.balance + (result.transaction?.amount || 0),
          currency: "VND",
          transactions: updatedTransactions,
        };
        this.saveLocalWallet(updated, targetUserId);
        return {
          success: true,
          newBalance: updated.balance,
          transaction: result.transaction,
        };
      }
    } catch (e) {
      console.warn("Backend confirmPendingTopUp failed, updating local:", e);
    }

    // Local fallback
    const current = this.getLocalWallet(targetUserId);
    let targetAmount = 0;
    let foundTx: WalletTransaction | undefined;

    const updatedTransactions = (current.transactions || []).map((t) => {
      if (t.id === txId && t.status === "pending") {
        targetAmount = t.amount;
        foundTx = { ...t, status: "completed" as const };
        return foundTx;
      }
      return t;
    });

    const newBalance = current.balance + targetAmount;
    const updated: MemberWalletData = {
      balance: newBalance,
      currency: "VND",
      transactions: updatedTransactions,
    };
    this.saveLocalWallet(updated, targetUserId);
    return {
      success: true,
      newBalance,
      transaction: foundTx,
    };
  },

  async pay(
    amount: number,
    note: string = "Thanh toán dịch vụ",
    method: string = "Ví điện tử",
    userId?: string
  ): Promise<{ success: boolean; newBalance: number; message?: string }> {
    const user = getStoredUser();
    const targetUserId = userId || user?.id || user?.email;
    try {
      const queryParam = targetUserId ? `?userId=${encodeURIComponent(targetUserId)}` : "";
      const res = await fetch(`/api/member/wallet/pay${queryParam}`, {
        method: "POST",
        headers: getAuthHeaders(targetUserId),
        body: JSON.stringify({ amount, method, note }),
      });
      if (res.ok) {
        const result = await res.json();
        const newBalance = Number(result.balance) || 0;
        const current = this.getLocalWallet(targetUserId);
        const updated: MemberWalletData = {
          balance: newBalance,
          currency: "VND",
          transactions: [result.transaction, ...(current.transactions || [])],
        };
        this.saveLocalWallet(updated, targetUserId);
        return { success: true, newBalance };
      } else {
        const err = await res.json().catch(() => ({}));
        return { success: false, newBalance: 0, message: err.message || "Thanh toán thất bại" };
      }
    } catch (e) {
      console.warn("Backend pay failed, falling back to local:", e);
    }

    const current = this.getLocalWallet(targetUserId);
    if (current.balance < amount) {
      return { success: false, newBalance: current.balance, message: "Số dư ví không đủ" };
    }

    const newBalance = current.balance - amount;
    const tx: WalletTransaction = {
      id: `WTX-${Date.now()}`,
      type: "payment",
      amount,
      method,
      note,
      createdAt: new Date().toISOString(),
      status: "completed",
    };
    const updated: MemberWalletData = {
      balance: newBalance,
      currency: "VND",
      transactions: [tx, ...(current.transactions || [])],
    };
    this.saveLocalWallet(updated, targetUserId);
    return { success: true, newBalance };
  },
};
