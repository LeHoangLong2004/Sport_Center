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

export function getUserIdFromToken(): string | null {
  try {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("token") || localStorage.getItem("accessToken")
      : null;
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    return (
      payload.nameid ||
      payload.sub ||
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      payload.id ||
      payload.userId ||
      null
    );
  } catch {
    return null;
  }
}

export function getStoredUser(): any | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  let user: any = null;
  if (raw) {
    try {
      user = JSON.parse(raw);
    } catch {
      user = null;
    }
  }
  const tokenUid = getUserIdFromToken();
  if (!user && tokenUid) {
    return { id: tokenUid };
  }
  if (user && !user.id && !user.userId && tokenUid) {
    user.id = tokenUid;
  }
  return user;
}

export function getAuthHeaders(userId?: string): Record<string, string> {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("token") || localStorage.getItem("accessToken")
    : null;
  const user = getStoredUser();
  const tokenUid = getUserIdFromToken();
  const uid = userId || user?.id || user?.userId || user?.memberId || user?.email || tokenUid;
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
  // Loại bỏ các giao dịch nạp nhầm từ luồng đặt lịch lớp học (DATLOP)
  if (tx.type === "topup" && tx.note?.includes("DATLOP")) return true;
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

  // Nếu có giao dịch rác/nạp nhầm bị lọc bỏ (như DATLOP), đồng bộ lại balance theo transactions hợp lệ
  const hasRemovedTx = rawTransactions.length !== cleanTransactions.length;
  const rawBal = typeof raw.balance === "number" ? raw.balance : Number(raw.balance);
  let finalBalance: number;

  if (!hasRemovedTx && !isNaN(rawBal) && rawBal >= 0 && raw.balance !== undefined && raw.balance !== null) {
    finalBalance = rawBal;
  } else {
    finalBalance = cleanTransactions.length === 0 ? 0 : Math.max(0, calculatedBalance);
  }

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
