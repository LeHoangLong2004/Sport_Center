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

export function getStoredUser(): any | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getAuthHeaders(userId?: string): Record<string, string> {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  const user = getStoredUser();
  const uid = userId || user?.id || user?.email;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(uid ? { "X-User-Id": String(uid) } : {}),
  };
}

export function isMockTransaction(tx: WalletTransaction): boolean {
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
  const cleanTransactions = rawTransactions.filter(tx => !isMockTransaction(tx));

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

  const finalBalance = cleanTransactions.length === 0 ? 0 : Math.max(0, calculatedBalance);

  return {
    balance: finalBalance,
    currency: raw.currency || "VND",
    transactions: cleanTransactions,
  };
}

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
