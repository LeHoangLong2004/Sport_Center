import { apiGet } from "./apiClient";

// ── Kiểu dữ liệu trả về từ Backend (Flow 3: Thanh toán & Báo cáo) ──

export interface InvoiceResponse {
  id: string;
  invoiceNumber: string;
  userId: string;
  memberName: string | null;
  totalAmount: number;
  paymentMethod: string;
  paymentMethodName: string;
  status: string;
  statusName: string;
  createdAt: string;
  paidAt: string | null;
}

export interface DashboardMetricsResponse {
  todayRevenue: number;
  monthRevenue: number;
  newMembersThisMonth: number;
  totalMembers: number;
  activeSubscriptions: number;
  pendingInvoiceCount: number;
  pendingAmount: number;
  upcomingClasses: number;
  classOccupancyRate: string;
  generatedAt: string;
}

export interface RevenueByPackageResponse {
  packageId: string;
  packageName: string;
  revenue: number;
  subscriptions: number;
}

export interface RevenueByPaymentMethodResponse {
  method: string;
  methodName: string;
  revenue: number;
  invoices: number;
}

export interface ExpiringMemberResponse {
  subscriptionId: string;
  memberId: string;
  memberName: string | null;
  memberEmail: string | null;
  packageId: string | null;
  packageName: string | null;
  expireDate: string;
  daysLeft: number;
  autoRenew: boolean;
}

export interface MemberRetentionResponse {
  periodStart: string;
  periodEnd: string;
  expiringMembers: number;
  renewedMembers: number;
  retentionRate: string;
  retentionRateValue: number;
}

export interface AttendanceStatResponse {
  hour: string;
  checkins: number;
}

export interface TrainerPerformanceResponse {
  coachId: string;
  coachName: string;
  sessions: number;
  members: number;
  upcomingSessions: number;
  fillRate: string;
}

export interface OutstandingInvoiceResponse {
  invoiceId: string;
  invoiceNumber: string;
  memberId: string;
  memberName: string | null;
  amount: number;
  method: string;
  createdAt: string;
  overdueDays: number;
}

export interface RevenueReportResponse {
  totalRevenue: number;
  period: string;
  message: string;
}

export interface MonthlyRevenueResponse {
  month: string;
  revenue: number;
  invoices: number;
}

export interface ClassOccupancyResponse {
  classId: string;
  className: string;
  sportName: string | null;
  capacity: number;
  enrolled: number;
  fillRate: string;
}

export interface PopularClassResponse {
  rank: number;
  classId: string;
  className: string;
  coachName: string | null;
  sportName: string | null;
  capacity: number;
  enrolled: number;
  fillRate: string;
}

// ── Endpoint của Flow 3 ──

function dateRangeQuery(startDate?: string, endDate?: string): string {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const paymentApi = {
  listInvoices: () => apiGet<InvoiceResponse[]>("/api/payments"),
  getInvoice: (invoiceId: string) => apiGet<InvoiceResponse>(`/api/payments/${invoiceId}`),
  myInvoices: () => apiGet<InvoiceResponse[]>("/api/payments/my"),
  memberInvoices: (memberId: string) => apiGet<InvoiceResponse[]>(`/api/payments/member/${memberId}`),
};

export const reportApi = {
  dashboard: () => apiGet<DashboardMetricsResponse>("/api/reports/dashboard"),
  revenue: (startDate?: string, endDate?: string) =>
    apiGet<RevenueReportResponse>(`/api/reports/revenue${dateRangeQuery(startDate, endDate)}`),
  revenueByPackage: () => apiGet<RevenueByPackageResponse[]>("/api/reports/revenue/by-package"),
  revenueByPaymentMethod: () =>
    apiGet<RevenueByPaymentMethodResponse[]>("/api/reports/revenue/by-payment-method"),
    monthlyRevenue: (months = 12) => apiGet<MonthlyRevenueResponse[]>(`/api/reports/revenue/monthly?months=${months}`),
    classOccupancyByClass: () => apiGet<ClassOccupancyResponse[]>("/api/reports/classes/occupancy"),
    popularClasses: (top = 5) => apiGet<PopularClassResponse[]>(`/api/reports/classes/popular?top=${top}`),
  newMembers: (month: string) => apiGet<{ newMembers: number; month: string }>(`/api/reports/members?month=${month}`),
  classOccupancy: (month: string) =>
    apiGet<{ averageOccupancyRate: string; month: string }>(`/api/reports/classes-occupancy?month=${month}`),
  expiringMembers: () => apiGet<ExpiringMemberResponse[]>("/api/reports/members/expiring"),
  retention: () => apiGet<MemberRetentionResponse>("/api/reports/members/retention"),
  attendance: () => apiGet<AttendanceStatResponse[]>("/api/reports/attendance"),
  trainerPerformance: () => apiGet<TrainerPerformanceResponse[]>("/api/reports/trainers/performance"),
  outstandingInvoices: () => apiGet<OutstandingInvoiceResponse[]>("/api/reports/outstanding-invoices"),
  revenueExportUrl: (startDate?: string, endDate?: string) =>
    `/api/reports/revenue/export${dateRangeQuery(startDate, endDate)}`,
};