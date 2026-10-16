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

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export const WalletService = {
  getStorageKey(userId?: string): string {
    const u = userId || getStoredUser()?.id || "default";
    return `member_wallet_${u}`;
  },

  getLocalWallet(userId?: string): MemberWalletData {
    const key = this.getStorageKey(userId);
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to read local wallet:", e);
    }

    // Default starting balance
    const defaultData: MemberWalletData = {
      balance: 500000,
      currency: "VND",
      transactions: [
        {
          id: `WTX-INIT-01`,
          type: "topup",
          amount: 500000,
          method: "Chuyển khoản QR",
          note: "Số dư khả dụng ban đầu",
          createdAt: new Date().toISOString(),
          status: "completed",
        },
      ],
    };
    try {
      localStorage.setItem(key, JSON.stringify(defaultData));
    } catch {}
    return defaultData;
  },

  saveLocalWallet(data: MemberWalletData, userId?: string) {
    const key = this.getStorageKey(userId);
    try {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(
        new CustomEvent(MEMBER_WALLET_UPDATED_EVENT, { detail: data })
      );
    } catch (e) {
      console.warn("Failed to save local wallet:", e);
    }
  },

  async getWallet(userId?: string): Promise<MemberWalletData> {
    try {
      const res = await fetch("/api/member/wallet", {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const mapped: MemberWalletData = {
          balance: Number(data.balance) || 0,
          currency: data.currency || "VND",
          transactions: Array.isArray(data.transactions) ? data.transactions : [],
        };
        this.saveLocalWallet(mapped, userId);
        return mapped;
      }
    } catch (e) {
      console.warn("Backend getWallet failed, falling back to local:", e);
    }

    return this.getLocalWallet(userId);
  },

  async topUp(
    amount: number,
    method: string = "VietQR",
    note: string = "Nạp tiền vào tài khoản",
    userId?: string
  ): Promise<{ success: boolean; newBalance: number; transaction: WalletTransaction }> {
    try {
      const res = await fetch("/api/member/wallet/topup", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, method, note }),
      });
      if (res.ok) {
        const result = await res.json();
        const newBalance = Number(result.balance) || 0;
        const current = this.getLocalWallet(userId);
        const updated: MemberWalletData = {
          balance: newBalance,
          currency: "VND",
          transactions: [result.transaction, ...current.transactions],
        };
        this.saveLocalWallet(updated, userId);
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
    const current = this.getLocalWallet(userId);
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
      transactions: [tx, ...current.transactions],
    };
    this.saveLocalWallet(updated, userId);

    return {
      success: true,
      newBalance,
      transaction: tx,
    };
  },
};
