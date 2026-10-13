import type {
  CatalogPackage,
  PackagePeriod,
  PackageOrder,
} from "../../services/packageApi";
import type { FlowPackage } from "./shared";

export function toFlowPackage(
  item: CatalogPackage,
  duration: PackagePeriod,
  discountPct: number,
  order?: PackageOrder,
  selectionQuote = false,
): FlowPackage {
  const listPrice = item.prices[duration];
  const discount = Math.round((listPrice * discountPct) / 100);
  const details = [
    { label: "Loại gói", value: item.category === "membership" ? "Gói thành viên" : "Gói môn tập" },
    { label: "Thời hạn", value: `${order?.durationMonths ?? duration} tháng` },
    ...(item.tier ? [{ label: "Hạng", value: item.tier }] : []),
    ...(item.sport ? [{ label: "Môn tập", value: item.sport }] : []),
    ...(item.area ? [{ label: "Khu vực", value: item.area }] : []),
    ...(item.format ? [{ label: "Hình thức", value: ({ self: "Tự tập", group: "Lớp nhóm", coach: "Coach 1–1" } as const)[item.format] }] : []),
    ...(item.sessionsPerMonth ? [{ label: "Số buổi", value: `${item.sessionsPerMonth} buổi/tháng` }] : []),
    ...(item.minutesPerSession ? [{ label: "Thời lượng", value: `${item.minutesPerSession} phút/buổi` }] : []),
    ...(item.maxClassSize ? [{ label: "Sĩ số tối đa", value: `${item.maxClassSize} người` }] : []),
    ...(item.accessHours ? [{ label: "Khung giờ", value: item.accessHours }] : []),
    ...(item.bookingAdvanceHours ? [{ label: "Đặt lớp trước", value: `${item.bookingAdvanceHours} giờ` }] : []),
    ...(item.lockerTerms ? [{ label: "Điều kiện tủ đồ", value: item.lockerTerms }] : []),
    ...(order?.startDate ? [{ label: "Ngày bắt đầu", value: new Date(order.startDate).toLocaleDateString("vi-VN") }] : []),
    ...(order?.endDate ? [{ label: "Ngày kết thúc", value: new Date(order.endDate).toLocaleDateString("vi-VN") }] : []),
  ];

  return {
    id: item.id,
    category: item.category,
    name: item.name,
    tagline: item.category === "membership"
      ? `Gói thành viên${item.tier ? ` · ${item.tier}` : ""}`
      : `Gói môn tập${item.sport ? ` · ${item.sport}` : ""}`,
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
    periodLabel: order ? `${order.durationMonths} tháng` : selectionQuote ? `${duration} tháng` : undefined,
  };
}
