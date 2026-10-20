import {
  type WalletTransaction,
  type MemberWalletData,
  MEMBER_WALLET_UPDATED_EVENT,
  getStoredUser,
  getAuthHeaders,
  sanitizeWalletData,
  cleanAllLocalWallets,
} from "./walletUtils";

export type { WalletTransaction, MemberWalletData };
export { MEMBER_WALLET_UPDATED_EVENT, sanitizeWalletData, cleanAllLocalWallets };

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
          balance: current.balance,
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
      balance: current.balance,
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
