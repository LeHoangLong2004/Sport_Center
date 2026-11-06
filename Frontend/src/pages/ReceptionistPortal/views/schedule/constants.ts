import type { Member, ParsedCustomerInfo, ServicePreset } from "./types";

export const PRESET_SERVICES: ServicePreset[] = [
  { title: "Tập thử PT kèm riêng 1:1 - Kickfit & Thể lực", category: "Kickfit" },
  { title: "Tập PT kèm riêng 1:1 - Thể hình chuyên sâu", category: "Gym PT" },
  { title: "Đo chỉ số InBody & Đánh giá thể lực", category: "InBody" },
  { title: "Tư vấn kế hoạch giảm mỡ & Dinh dưỡng", category: "Dinh dưỡng" },
  { title: "Tập thử PT kèm riêng 1:1 - Pilates phục hồi", category: "Pilates" },
  { title: "Tư vấn gia hạn & Nâng cấp thẻ hội viên", category: "Tư vấn thẻ" },
];

export const TIME_SLOTS: string[] = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:30",
  "17:00",
  "18:30",
  "19:30",
];

export const getTodayIso = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export const getTomorrowIso = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const isSlotInPast = (slotTime: string, selectedDate: string): boolean => {
  if (selectedDate !== getTodayIso()) return false;
  const now = new Date();
  const parts = slotTime.split(":");
  if (parts.length < 2) return false;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const slotDate = new Date();
  slotDate.setHours(h, m, 0, 0);
  return slotDate < now;
};

export const parseCustomerInfo = (raw: string, members: Member[] = []): ParsedCustomerInfo => {
  if (!raw) return { name: "N/A", phone: "", isMember: false };
  let name = raw.trim();
  let phone = "";

  const matchParen = raw.match(/^(.*?)\s*\((0[0-9\s\.\-]{8,13})\)$/);
  if (matchParen) {
    name = matchParen[1].trim();
    phone = matchParen[2].replace(/[\s\.\-]/g, "");
  } else {
    const matchDash = raw.match(/^(.*?)\s*-\s*(0[0-9\s\.\-]{8,13})$/);
    if (matchDash) {
      name = matchDash[1].trim();
      phone = matchDash[2].replace(/[\s\.\-]/g, "");
    }
  }

  if (!phone && members.length > 0) {
    const matched = members.find(
      (m) =>
        (m.fullName && m.fullName.toLowerCase() === name.toLowerCase()) ||
        (m.name && m.name.toLowerCase() === name.toLowerCase())
    );
    if (matched?.phoneNumber) phone = matched.phoneNumber;
  }

  const isMember = members.some(
    (m) =>
      (m.fullName && m.fullName.toLowerCase() === name.toLowerCase()) ||
      (m.name && m.name.toLowerCase() === name.toLowerCase())
  );

  return { name, phone, isMember };
};

export const getServiceTag = (title: string): { label: string; bg: string } => {
  const lower = title.toLowerCase();
  if (lower.includes("inbody")) {
    return { label: "InBody", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  }
  if (lower.includes("kickfit")) {
    return { label: "Kickfit 1:1", bg: "bg-amber-50 text-amber-700 border-amber-200" };
  }
  if (lower.includes("dinh dưỡng") || lower.includes("giảm mỡ")) {
    return { label: "Dinh dưỡng", bg: "bg-rose-50 text-rose-700 border-rose-200" };
  }
  if (lower.includes("pilates")) {
    return { label: "Pilates 1:1", bg: "bg-purple-50 text-purple-700 border-purple-200" };
  }
  if (lower.includes("gia hạn") || lower.includes("gói")) {
    return { label: "Tư vấn gói", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" };
  }
  return { label: "PT Gym 1:1", bg: "bg-blue-50 text-blue-700 border-blue-200" };
};
