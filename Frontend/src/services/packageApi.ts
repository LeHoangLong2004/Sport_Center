export type PackageCategory = "membership" | "sport" | "class"

export type MembershipTier = "basic" | "plus" | "premium"

export type SportFormat = "self" | "group" | "coach"

export type PackagePeriod = 1 | 3 | 6 | 12

export type PackagePaymentMethod = "qr" | "card" | "wallet" | "counter"

export type PackagePrices = Record<PackagePeriod, number>

export interface CatalogPackage {
  id: string
  category: PackageCategory
  tier?: MembershipTier
  name: string
  description: string
  isActive: boolean
  prices: PackagePrices
  benefits: string[]
  terms: string[]
  groupDiscountPct: number
  coachDiscountPct: number
  bookingAdvanceHours: number
  lockerTerms: string
  sport?: string
  area?: string
  format?: SportFormat
  sessionsPerMonth?: number
  minutesPerSession?: number
  maxClassSize?: number
  accessHours?: string
}

export interface PackageOrder {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone?: string
  packageId: string
  packageSnapshot: CatalogPackage
  durationMonths: number
  subtotal: number
  discountPct: number
  discountAmount: number
  total: number
  paymentMethod?: string
  status: "pending" | "paid" | "failed"
  createdAt: string
  paidAt?: string
  startDate?: string
  endDate?: string
}

export interface PackageCheckout {
  order: PackageOrder
  invoiceId: string
}

export interface MembershipStatus {
  tier: MembershipTier
  name: string
  startDate?: string
  endDate?: string
  benefits: string[]
  groupDiscountPct: number
  coachDiscountPct: number
  bookingAdvanceHours: number
  lockerTerms: string
  pricePaid?: number
  packageId?: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api"

async function request<T>(path: string, options: RequestInit = {}, retried = false): Promise<T> {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token")
  const headers = new Headers(options.headers)
  if (options.body !== undefined && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json")
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    // Tự động hồi phục nếu phiên làm việc tại quầy lễ tân bị 401 hoặc 403 do giữ nhầm token của vai trò khác
    if (!retried && (response.status === 403 || response.status === 401) && window.location.hash.startsWith("#receptionist")) {
      try {
        const tokenRes = await fetch("/api/auth/token/receptionist")
        if (tokenRes.ok) {
          const authData = await tokenRes.json()
          if (authData?.token) {
            localStorage.setItem("token", authData.token)
            localStorage.setItem("accessToken", authData.token)
            localStorage.setItem("user", JSON.stringify(authData))
            window.dispatchEvent(new Event("local-storage-update"))
            return request<T>(path, options, true)
          }
        }
      } catch { /* tiếp tục báo lỗi nếu không lấy được token */ }
    }

    let message = `Yêu cầu thất bại (${response.status}).`
    try {
      const body = (await response.json()) as {
        message?: string
        title?: string
        detail?: string
      }
      message = body.message || body.detail || body.title || message
    } catch {
      // Non-JSON error bodies use the status-based message above.
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export function getMembershipStatus(
  orders: PackageOrder[],
  catalog: CatalogPackage[],
): MembershipStatus | null {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  const active = orders
    .filter(
      (order) =>
        order.status === "paid" &&
        order.packageSnapshot.category === "membership" &&
        order.startDate &&
        order.endDate &&
        order.startDate.slice(0, 10) <= today &&
        order.endDate.slice(0, 10) >= today,
    )
    .sort((a, b) => b.startDate!.localeCompare(a.startDate!))[0]

  if (active) {
    const membership = active.packageSnapshot
    return {
      tier: membership.tier || "basic",
      name: membership.name,
      startDate: active.startDate,
      endDate: active.endDate,
      benefits: membership.benefits,
      groupDiscountPct: membership.groupDiscountPct,
      coachDiscountPct: membership.coachDiscountPct,
      bookingAdvanceHours: membership.bookingAdvanceHours,
      lockerTerms: membership.lockerTerms,
      pricePaid: active.total,
      packageId: active.packageSnapshot.id,
    }
  }

  const basic = catalog.find((item) => item.tier === "basic")
  if (!basic) return null
  return {
    tier: "basic",
    name: basic.name,
    benefits: basic.benefits,
    groupDiscountPct: 0,
    coachDiscountPct: 0,
    bookingAdvanceHours: basic.bookingAdvanceHours,
    lockerTerms: basic.lockerTerms,
  }
}

/**
 * Tính toán chi phí nâng cấp hạng gói thành viên theo cơ chế Prorated Billing:
 * Khấu trừ giá trị những ngày chưa sử dụng của gói cũ vào giá gói mới.
 */
export function calculateMembershipUpgrade(
  membershipStatus: MembershipStatus | null,
  targetPackage: CatalogPackage,
  selectedDuration: PackagePeriod = 1
): {
  isUpgrade: boolean
  originalPrice: number
  remainingDays: number
  totalDays: number
  dailyRate: number
  remainingCredit: number
  finalPrice: number
  currentTierName?: string
} {
  const targetPrice = targetPackage.prices[selectedDuration] || targetPackage.prices[1] || 0

  if (
    !membershipStatus ||
    membershipStatus.tier === "basic" ||
    targetPackage.category !== "membership" ||
    !membershipStatus.startDate ||
    !membershipStatus.endDate
  ) {
    return {
      isUpgrade: false,
      originalPrice: targetPrice,
      remainingDays: 0,
      totalDays: 0,
      dailyRate: 0,
      remainingCredit: 0,
      finalPrice: targetPrice,
    }
  }

  const tierRank: Record<string, number> = { basic: 0, plus: 1, premium: 2 }
  const currentRank = tierRank[membershipStatus.tier] ?? 0
  const targetRank = tierRank[targetPackage.tier || ""] ?? (targetPrice > (membershipStatus.pricePaid || 0) ? 99 : 0)

  // Chỉ áp dụng tính năng nâng cấp nếu gói mục tiêu có thứ hạng cao hơn hoặc giá cao hơn
  if (targetRank <= currentRank) {
    return {
      isUpgrade: false,
      originalPrice: targetPrice,
      remainingDays: 0,
      totalDays: 0,
      dailyRate: 0,
      remainingCredit: 0,
      finalPrice: targetPrice,
    }
  }

  const startMs = new Date(membershipStatus.startDate).getTime()
  const endMs = new Date(membershipStatus.endDate).getTime()
  const nowMs = Date.now()

  // Tổng số ngày của gói thành viên hiện tại
  const totalDays = Math.max(1, Math.round((endMs - startMs) / (24 * 3600 * 1000)))
  // Số ngày còn lại chưa sử dụng
  const remainingDays = Math.max(0, Math.ceil((endMs - nowMs) / (24 * 3600 * 1000)))

  const paidAmount = membershipStatus.pricePaid && membershipStatus.pricePaid > 0
    ? membershipStatus.pricePaid
    : (membershipStatus.tier === "plus" ? 149000 : 0)

  const dailyRate = paidAmount / totalDays
  const rawRemainingCredit = dailyRate * remainingDays
  // Làm tròn giá trị khấu trừ đến hàng nghìn đồng
  const remainingCredit = Math.min(targetPrice, Math.round(rawRemainingCredit / 1000) * 1000)
  const finalPrice = Math.max(0, targetPrice - remainingCredit)

  return {
    isUpgrade: true,
    originalPrice: targetPrice,
    remainingDays,
    totalDays,
    dailyRate,
    remainingCredit,
    finalPrice,
    currentTierName: membershipStatus.name || (membershipStatus.tier === "plus" ? "Plus" : "Cơ bản"),
  }
}

export const PackageAPI = {
  getPackages: () => request<CatalogPackage[]>("/package-catalog"),

  savePackage: (input: CatalogPackage, isNew: boolean) => {
    return request<CatalogPackage>(
      isNew
        ? "/package-catalog"
        : `/package-catalog/${encodeURIComponent(input.id)}`,
      {
        method: isNew ? "POST" : "PUT",
        body: JSON.stringify(input),
      },
    )
  },

  setPackageActive: (id: string, isActive: boolean) =>
    request<void>(`/package-catalog/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    }),

  getOrders: () => request<PackageOrder[]>("/package-orders"),

  getMyOrders: () => request<PackageOrder[]>("/package-orders/me"),

  hasActiveSportAccess: async (sport: string) => {
    if (!sport.trim()) return false
    const response = await request<{ hasAccess: boolean }>(
      `/package-orders/access/${encodeURIComponent(sport)}`,
    )
    return response.hasAccess
  },

  createOrder: (packageId: string, durationMonths: PackagePeriod) =>
    request<PackageOrder>("/package-orders", {
      method: "POST",
      body: JSON.stringify({ packageId, durationMonths }),
    }),

  checkout: (
    packageId: string,
    durationMonths: PackagePeriod,
    paymentMethod: PackagePaymentMethod,
    startDate?: string,
  ) =>
    request<PackageCheckout>("/package-orders/checkout", {
      method: "POST",
      body: JSON.stringify({ packageId, durationMonths, paymentMethod, startDate }),
    }),

  confirmPayment: (orderId: string, paymentMethod?: string) =>
    request<PackageOrder>(
      `/package-orders/${encodeURIComponent(orderId)}/confirm-payment`,
      {
        method: "PUT",
        body: JSON.stringify({ paymentMethod }),
      },
    ),

  cancelOrder: (orderId: string) =>
    request<PackageOrder>(
      `/package-orders/${encodeURIComponent(orderId)}/cancel`,
      {
        method: "PUT",
      },
    ),
}
