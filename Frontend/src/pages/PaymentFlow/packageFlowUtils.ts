import type { CatalogPackage, PackageOrder, PackagePeriod } from "../../services/packageApi";
import type { FlowPackage } from "./shared";

export function toFlowPackage(
  item: CatalogPackage,
  duration: PackagePeriod,
  discountPct: number,
  order?: PackageOrder,
  selectionQuote = false,
): FlowPackage {
  const listPrice = item.prices[duration]
  const discount = Math.round((listPrice * discountPct) / 100)
  const details = [
    { label: "Loáº¡i gÃ³i", value: item.category === "membership" ? "GÃ³i thÃ nh viÃªn" : "GÃ³i mÃ´n táº­p" },
    { label: "Thá»i háº¡n", value: `${order?.durationMonths ?? duration} thÃ¡ng` },
    ...(item.tier ? [{ label: "Háº¡ng", value: item.tier }] : []),
    ...(item.sport ? [{ label: "MÃ´n táº­p", value: item.sport }] : []),
    ...(item.area ? [{ label: "Khu vá»±c", value: item.area }] : []),
    ...(item.format ? [{ label: "HÃ¬nh thá»©c", value: ({ self: "Tá»± táº­p", group: "Lá»›p nhÃ³m", coach: "Coach 1â€“1" } as const)[item.format] }] : []),
    ...(item.sessionsPerMonth ? [{ label: "Sá»‘ buá»•i", value: `${item.sessionsPerMonth} buá»•i/thÃ¡ng` }] : []),
    ...(item.minutesPerSession ? [{ label: "Thá»i lÆ°á»£ng", value: `${item.minutesPerSession} phÃºt/buá»•i` }] : []),
    ...(item.maxClassSize ? [{ label: "SÄ© sá»‘ tá»‘i Ä‘a", value: `${item.maxClassSize} ngÆ°á»i` }] : []),
    ...(item.accessHours ? [{ label: "Khung giá»", value: item.accessHours }] : []),
    ...(item.bookingAdvanceHours ? [{ label: "Äáº·t lá»›p trÆ°á»›c", value: `${item.bookingAdvanceHours} giá»` }] : []),
    ...(item.lockerTerms ? [{ label: "Äiá»u kiá»‡n tá»§ Ä‘á»“", value: item.lockerTerms }] : []),
    ...(order?.startDate ? [{ label: "NgÃ y báº¯t Ä‘áº§u", value: new Date(order.startDate).toLocaleDateString("vi-VN") }] : []),
    ...(order?.endDate ? [{ label: "NgÃ y káº¿t thÃºc", value: new Date(order.endDate).toLocaleDateString("vi-VN") }] : []),
  ]

  return {
    id: item.id,
    category: item.category,
    name: item.name,
    tagline: item.category === "membership"
      ? `GÃ³i thÃ nh viÃªn${item.tier ? ` Â· ${item.tier}` : ""}`
      : `GÃ³i mÃ´n táº­p${item.sport ? ` Â· ${item.sport}` : ""}`,
    monthly: order?.total ?? item.prices[1],
    yearly: order?.total ?? item.prices[12],
    features: item.benefits,
    description: item.description,
    details,
    terms: item.terms,
    orderId: order?.id,
    orderStatus: order?.status,
    startDate: order?.startDate,
    checkoutTotal: order?.total ?? (selectionQuote ? listPrice - discount : undefined),
    checkoutListPrice: order?.subtotal ?? (selectionQuote ? listPrice : undefined),
    checkoutDiscount: order?.discountAmount ?? (selectionQuote ? discount : undefined),
    periodLabel: order ? `${order.durationMonths} thÃ¡ng` : selectionQuote ? `${duration} thÃ¡ng` : undefined,
  }
}

