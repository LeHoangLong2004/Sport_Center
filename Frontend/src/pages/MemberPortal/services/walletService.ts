import {
  type WalletTransaction,
  type MemberWalletData,
  MEMBER_WALLET_UPDATED_EVENT,
  getStoredUser,
  getAuthHeaders,
  getUserIdFromToken,
  sanitizeWalletData,
  cleanAllLocalWallets,
} from "./walletUtils";
import { BankConfigService } from "./bankConfig";

export type { WalletTransaction, MemberWalletData };
export { MEMBER_WALLET_UPDATED_EVENT, sanitizeWalletData, cleanAllLocalWallets, getUserIdFromToken };

// Chạy dọn dẹp ngay khi load file
cleanAllLocalWallets();

export const WalletService = {
  getStorageKey(userId?: string): string {
    const user = getStoredUser();
    const tokenUid = getUserIdFromToken();
    const u = userId || user?.id || user?.userId || user?.memberId || user?.email || tokenUid || "default";
    return `member_wallet_${u}`;
  },

  getLocalWallet(userId?: string): MemberWalletData {
    const user = getStoredUser();
    const tokenUid = getUserIdFromToken();
    const targetUserId = userId || user?.id || user?.userId || user?.memberId || user?.email || tokenUid;
    const key = this.getStorageKey(targetUserId);
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
    const user = getStoredUser();
    const tokenUid = getUserIdFromToken();
    const targetUserId = userId || user?.id || user?.userId || user?.memberId || user?.email || tokenUid;
    const key = this.getStorageKey(targetUserId);
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

  async getWallet(userId?: string, forceRefresh: boolean = false): Promise<MemberWalletData> {
    const user = getStoredUser();
    const tokenUid = getUserIdFromToken();
    const targetUserId = userId || user?.id || user?.userId || user?.memberId || user?.email || tokenUid;
    try {
      const params = [
        targetUserId ? `userId=${encodeURIComponent(targetUserId)}` : "",
        forceRefresh ? `_t=${Date.now()}` : "",
      ].filter(Boolean).join("&");
      const res = await fetch(`/api/member/wallet${params ? `?${params}` : ""}`, {
        headers: getAuthHeaders(targetUserId),
        cache: forceRefresh ? "no-store" : "default",
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
    userId?: string,
    txId?: string
  ): Promise<{ success: boolean; newBalance: number; transaction: WalletTransaction }> {
    const user = getStoredUser();
    const targetUserId = userId || user?.id || user?.email;
    try {
      const queryParam = targetUserId ? `?userId=${encodeURIComponent(targetUserId)}` : "";
      const res = await fetch(`/api/member/wallet/topup${queryParam}`, {
        method: "POST",
        headers: getAuthHeaders(targetUserId),
        body: JSON.stringify({ amount, method, note, ...(txId ? { id: txId } : {}) }),
      });
      if (res.ok) {
        const result = await res.json();
        const newBalance = Number(result.balance) || 0;
        if (result.duplicate) {
          // Giao dịch đã được cộng trước đó: chỉ đồng bộ số dư, không thêm giao dịch mới
          const cur = this.getLocalWallet(targetUserId);
          this.saveLocalWallet({ ...cur, balance: newBalance }, targetUserId);
          return { success: true, newBalance, transaction: result.transaction };
        }
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
    } catch (e: any) {
      console.error("Backend topup failed:", e);
      throw new Error(e?.message || "Không thể nạp tiền vào ví. Vui lòng thử lại sau.");
    }
    throw new Error("Nạp tiền thất bại từ máy chủ.");
  },

  /**
   * Kiểm tra giao dịch chuyển khoản thanh toán dịch vụ / đặt lịch lớp học (KHÔNG nạp vào ví).
   * Dùng cho các đơn đặt lịch, mua vé lớp, mua gói tập,...
   */
  async checkServicePayment(
    memo: string,
    amount?: number
  ): Promise<{ received: boolean; amount?: number; message?: string }> {
    try {
      const cleanMemo = (memo || "").trim();
      // 1. Kiểm tra trực tiếp qua sepay-check-memo
      const checkUrl = `/api/payments/sepay-check-memo?memo=${encodeURIComponent(cleanMemo)}&amount=${encodeURIComponent(amount || 0)}`;
      const resMemo = await fetch(checkUrl, { cache: "no-store" });
      if (resMemo.ok) {
        const dataMemo = await resMemo.json();
        if (dataMemo.received) {
          return {
            received: true,
            amount: Number(dataMemo.amount || amount || 0),
            message: dataMemo.message || "Đã nhận được tiền chuyển khoản thành công từ ngân hàng!",
          };
        }
      }

      // 2. Thử kiểm tra qua danh sách giao dịch SePay gần nhất (in-memory log)
      const resTx = await fetch(`/api/payments/sepay-transactions`, { cache: "no-store" });
      if (resTx.ok) {
        const dataTx = await resTx.json();
        const txs: any[] = dataTx?.transactions || [];
        const normMemo = cleanMemo.toUpperCase().replace(/\s+/g, "");
        const matched = txs.find((t: any) => {
          const content = String(t.content || "").toUpperCase().replace(/\s+/g, "");
          const tAmount = Number(t.amount || 0);
          const amountMatches = !amount || amount <= 0 || Math.abs(tAmount - amount) < 1;
          const memoMatches = normMemo.length >= 4 && content.includes(normMemo);
          return amountMatches && memoMatches;
        });
        if (matched) {
          return {
            received: true,
            amount: Number(matched.amount || amount || 0),
            message: "Đã nhận được tiền chuyển khoản thành công từ Sacombank qua SePay!",
          };
        }
      }
    } catch (err) {
      console.warn("checkServicePayment warning:", err);
    }
    return { received: false };
  },

  async checkTransfer(
    memo: string,
    amount?: number,
    userId?: string,
    confirm: boolean = false
  ): Promise<{ received: boolean; newBalance?: number; transaction?: WalletTransaction; message?: string }> {
    const user = getStoredUser();
    const targetUserId = userId || user?.id || user?.email;
    const cleanMemo = (memo || "").trim();
    // BẢO VỆ AN TOÀN: Chỉ nạp tiền vào ví nếu đúng là cú pháp nạp ví (NAPVI...)
    const isTopUpMemo = cleanMemo.toUpperCase().includes("NAP");

    try {
      // 1. Kiểm tra trực tiếp giao dịch SePay Webhook đã nhận từ Ngrok
      try {
        const checkUrl = `/api/payments/sepay-check-memo?memo=${encodeURIComponent(cleanMemo)}&amount=${encodeURIComponent(amount || 0)}`;
        const resMemo = await fetch(checkUrl, { cache: "no-store" });
        if (resMemo.ok) {
          const dataMemo = await resMemo.json();
          if (dataMemo.received) {
            // Nếu không phải cú pháp nạp ví (ví dụ DATLOP, GYM...), KHÔNG nạp vào ví!
            if (!isTopUpMemo) {
              return {
                received: true,
                message: dataMemo.message || "Đã nhận được thanh toán thành công!",
              };
            }

            // Đã nhận được tiền qua webhook! Chỉ cộng đúng số tiền thực nhận, và phải khớp số tiền đã chọn
            const topUpAmount = Number(dataMemo.amount || 0);
            if (!(topUpAmount > 0)) {
              return { received: false, message: "Chưa xác định được số tiền thực nhận từ ngân hàng." };
            }
            if (amount && amount > 0 && Math.abs(topUpAmount - amount) >= 1) {
              return {
                received: false,
                message: `Ngân hàng ghi nhận ${topUpAmount.toLocaleString("vi-VN")} đ nhưng bạn đang nạp ${amount.toLocaleString("vi-VN")} đ. Vui lòng chuyển đúng số tiền hiển thị trên mã QR.`,
              };
            }
            const sepayTxId = dataMemo.transactionId ? `SEPAY-${dataMemo.transactionId}` : undefined;
            const topUpRes = await this.topUp(
              topUpAmount,
              "Chuyển khoản SePay",
              `Nạp tiền qua SePay: ${cleanMemo}`,
              targetUserId,
              sepayTxId
            );
            return {
              received: true,
              newBalance: topUpRes.newBalance,
              transaction: topUpRes.transaction,
              message: dataMemo.message || "Đã nhận được tiền chuyển khoản thành công qua SePay Webhook!",
            };
          }
        }
      } catch (err) {
        console.warn("SePay memo check warning:", err);
      }

      // 2. Kiểm tra ví thành viên nếu có
      if (isTopUpMemo) {
        const bankConfig = BankConfigService.getConfig();
        const qToken = bankConfig.sepayApiToken ? `&sepayToken=${encodeURIComponent(bankConfig.sepayApiToken)}` : "";
        const qAmount = amount ? `&amount=${encodeURIComponent(amount)}` : "";
        const qUser = targetUserId ? `&userId=${encodeURIComponent(targetUserId)}` : "";
        const qConfirm = confirm ? `&confirm=true` : "";
        const res = await fetch(`/api/member/wallet/check-transfer?memo=${encodeURIComponent(cleanMemo)}${qAmount}${qUser}${qToken}${qConfirm}`, {
          headers: getAuthHeaders(targetUserId),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.received && typeof data.balance === "number") {
            const current = this.getLocalWallet(targetUserId);
            const updated: MemberWalletData = {
              balance: data.balance,
              currency: "VND",
              transactions: data.transaction ? [data.transaction, ...(current.transactions || [])] : current.transactions,
            };
            this.saveLocalWallet(updated, targetUserId);
            return {
              received: true,
              newBalance: data.balance,
              transaction: data.transaction,
              message: data.message,
            };
          }
          return { received: false, message: data.message };
        }
      }
    } catch (e) {
      console.warn("checkTransfer failed:", e);
    }
    return { received: false };
  },

  async simulateWebhook(
    amount: number,
    note: string,
    userId?: string
  ): Promise<{ success: boolean; newBalance: number; transaction: WalletTransaction }> {
    const user = getStoredUser();
    const targetUserId = userId || user?.id || user?.email;
    try {
      const qUser = targetUserId ? `?userId=${encodeURIComponent(targetUserId)}` : "";
      const res = await fetch(`/api/member/wallet/simulate-webhook${qUser}`, {
        method: "POST",
        headers: getAuthHeaders(targetUserId),
        body: JSON.stringify({ amount, note }),
      });
      if (res.ok) {
        const data = await res.json();
        const current = this.getLocalWallet(targetUserId);
        const updated: MemberWalletData = {
          balance: data.balance,
          currency: "VND",
          transactions: [data.transaction, ...(current.transactions || [])],
        };
        this.saveLocalWallet(updated, targetUserId);
        return {
          success: true,
          newBalance: data.balance,
          transaction: data.transaction,
        };
      }
    } catch (e) {
      console.warn("simulateWebhook failed:", e);
    }
    // Fallback nếu offline
    return this.topUp(amount, "SePay Webhook", `[Webhook] ${note}`, targetUserId);
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
    } catch (e: any) {
      console.error("Backend confirmPendingTopUp failed:", e);
      throw new Error(e?.message || "Không thể xác nhận giao dịch nạp tiền.");
    }
    throw new Error("Không thể xác nhận giao dịch nạp tiền.");
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
    } catch (e: any) {
      console.error("Backend pay failed:", e);
      return { success: false, newBalance: 0, message: e?.message || "Không thể kết nối đến máy chủ thanh toán ví." };
    }
    return { success: false, newBalance: 0, message: "Thanh toán ví không thành công." };
  },

  /**
   * Đặt lại hoặc cân chỉnh số dư ví hội viên (Hỗ trợ demo/đối soát)
   */
  async resetBalance(newBalance: number = 0, userId?: string): Promise<{ success: boolean; balance: number }> {
    const user = getStoredUser();
    const tokenUid = getUserIdFromToken();
    const targetUserId = userId || user?.id || user?.userId || user?.memberId || user?.email || tokenUid;
    try {
      const qUser = targetUserId ? `userId=${encodeURIComponent(targetUserId)}` : "";
      const qBal = `newBalance=${encodeURIComponent(newBalance)}`;
      const query = [qUser, qBal].filter(Boolean).join("&");
      const res = await fetch(`/api/member/wallet/reset?${query}`, {
        method: "POST",
        headers: getAuthHeaders(targetUserId),
      });
      if (res.ok) {
        const data = await res.json();
        const current = this.getLocalWallet(targetUserId);
        const updated: MemberWalletData = {
          balance: Number(data.balance) || 0,
          currency: "VND",
          transactions: current.transactions,
        };
        this.saveLocalWallet(updated, targetUserId);
        return { success: true, balance: updated.balance };
      }
    } catch (e: any) {
      console.error("Backend reset failed:", e);
      throw new Error(e?.message || "Không thể cập nhật số dư ví.");
    }
    throw new Error("Không thể cập nhật số dư ví từ máy chủ.");
  },
};
