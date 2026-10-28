export interface Appointment {
  id: string;
  date?: string;
  time: string;
  title: string;
  customerName: string;
  coachName: string | null;
  status: string;
}

export interface Coach {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  specialty?: string;
  experienceYears?: number;
}

export interface Member {
  id: string;
  fullName?: string;
  name?: string;
  phoneNumber?: string;
  memberCode?: string;
  avatarUrl?: string;
}

export interface ServicePreset {
  title: string;
  category: string;
}

export interface ParsedCustomerInfo {
  name: string;
  phone: string;
  isMember: boolean;
}

export interface ScheduleStats {
  total: number;
  completed: number;
  waiting: number;
  cancelled: number;
}

export type StatusFilterType = "all" | "Đang chờ khách" | "Đã hoàn tất" | "Đã hủy";
export type DateFilterType = "all" | "today" | "tomorrow";
export type CustomerModeType = "member" | "guest";
export type DateQuickChoiceType = "today" | "tomorrow" | "custom";
