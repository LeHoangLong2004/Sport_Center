export type PackageCategory = "membership" | "sport"

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
  packageId: string
  packageSnapshot: CatalogPackage
  durationMonths: PackagePeriod
  subtotal: number
  discountPct: number
  discountAmount: number
  total: number
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
}

const API_BASE_URL = `${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api`

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token")
  const headers = new Headers(options.headers)
  if (options.body !== undefined && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json")
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
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
    .sort(
      (a, b) =>
        b.startDate!.localeCompare(a.startDate!),
    )[0]

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

export const PackageAPI = {
  getPackages: () => request<CatalogPackage[]>("/package-catalog"),

  savePackage: (input: CatalogPackage, isNew: boolean) => {
    return request<CatalogPackage>(
      isNew ? "/package-catalog" : `/package-catalog/${encodeURIComponent(input.id)}`,
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

  confirmPayment: (orderId: string) =>
    request<PackageOrder>(`/package-orders/${encodeURIComponent(orderId)}/confirm-payment`, {
      method: "PUT",
    }),
}
