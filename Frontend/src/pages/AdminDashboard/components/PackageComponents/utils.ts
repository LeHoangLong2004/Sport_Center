import { CatalogPackage, PackagePeriod, SportFormat } from "../../../../services/packageApi";

export const periods: PackagePeriod[] = [1, 3, 6, 12];

export const formatLabels: Record<SportFormat, string> = {
  self: "Tự tập",
  group: "Lớp nhóm",
  coach: "Coach 1–1",
};

export const money = (amount: number) =>
  `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;

export const linesToText = (lines: string[]) => lines.join("\n");

export const textToLines = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export type Category = "membership" | "sport";
export type PackageDraft = CatalogPackage;

export function tierCodeFromName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

export function blankMembershipPackage(existing: CatalogPackage[]): PackageDraft {
  const legacyRanks: Record<string, number> = { basic: 0, plus: 1, premium: 2 };
  const nextRank = existing.reduce(
    (max, item) => Math.max(max, item.tierRank ?? legacyRanks[item.tier || ""] ?? -1),
    2,
  ) + 1;
  const draftId = `membership-new-${Date.now().toString(36)}`;
  return {
    id: draftId,
    category: "membership",
    tier: `new-${Date.now().toString(36)}`,
    tierRank: nextRank,
    name: "",
    description: "",
    isActive: true,
    prices: { 1: 0, 3: 0, 6: 0, 12: 0 },
    benefits: [""],
    terms: [],
    groupDiscountPct: 0,
    coachDiscountPct: 0,
    bookingAdvanceHours: 24,
    lockerTerms: "Sử dụng tủ theo quy định của trung tâm trong buổi tập hợp lệ.",
  };
}

export function blankPackage(category: Category): PackageDraft {
  if (category === "membership")
    throw new Error("Chỉ có thể chỉnh sửa ba hạng thành viên có sẵn.");

  return {
    id: `sport-${Date.now()}`,
    category,
    name: "",
    description: "",
    isActive: true,
    prices: { 1: 0, 3: 0, 6: 0, 12: 0 },
    benefits: ["Miễn phí 100% phí đặt ca / vào sân (0đ/buổi)"],
    terms: [],
    groupDiscountPct: 0,
    coachDiscountPct: 0,
    bookingAdvanceHours: 0,
    lockerTerms: "",
    sport: "",
    area: "",
    format: "self",
    sessionsPerMonth: 0,
    minutesPerSession: 0,
    maxClassSize: undefined,
    accessHours: "",
  };
}
