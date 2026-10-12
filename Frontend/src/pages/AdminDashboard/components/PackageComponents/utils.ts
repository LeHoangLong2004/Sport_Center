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
    benefits: [],
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
