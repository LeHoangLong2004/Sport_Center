namespace SmartGym.Application.DTOs.Reports;

/// <summary>Số liệu tổng quan cho dashboard của Center Manager (FR-014).</summary>
public record DashboardMetricsResponse(
    decimal TodayRevenue,
    decimal MonthRevenue,
    int NewMembersThisMonth,
    int TotalMembers,
    int ActiveSubscriptions,
    int PendingInvoiceCount,
    decimal PendingAmount,
    int UpcomingClasses,
    string ClassOccupancyRate,
    DateTime GeneratedAt);

public record RevenueByPackageResponse(
    string PackageId,
    string PackageName,
    decimal Revenue,
    int Subscriptions);

public record RevenueByPaymentMethodResponse(
    string Method,
    string MethodName,
    decimal Revenue,
    int Invoices);

public record ExpiringMemberResponse(
    Guid SubscriptionId,
    Guid MemberId,
    string? MemberName,
    string? MemberEmail,
    string? PackageId,
    string? PackageName,
    string ExpireDate,
    int DaysLeft,
    bool AutoRenew);

public record MemberRetentionResponse(
    string PeriodStart,
    string PeriodEnd,
    int ExpiringMembers,
    int RenewedMembers,
    string RetentionRate,
    double RetentionRateValue);

public record AttendanceStatResponse(
    string Hour,
    int Checkins);

public record TrainerPerformanceResponse(
    Guid CoachId,
    string CoachName,
    int Sessions,
    int Members,
    int UpcomingSessions,
    string FillRate);

public record OutstandingInvoiceResponse(
    Guid InvoiceId,
    string InvoiceNumber,
    Guid MemberId,
    string? MemberName,
    decimal Amount,
    string Method,
    DateTime CreatedAt,
    int OverdueDays);

/// <summary>Doanh thu theo tháng — biểu đồ 12 tháng gần nhất (FR-014).</summary>
public record MonthlyRevenueResponse(
    string Month,
    decimal Revenue,
    int Invoices);

/// <summary>Tỷ lệ lấp đầy của từng lớp trong tháng (FR-014).</summary>
public record ClassOccupancyResponse(
    Guid ClassId,
    string ClassName,
    string? SportName,
    int Capacity,
    int Enrolled,
    string FillRate);

/// <summary>Xếp hạng lớp học được đăng ký nhiều nhất (FR-014).</summary>
public record PopularClassResponse(
    int Rank,
    Guid ClassId,
    string ClassName,
    string? CoachName,
    string? SportName,
    int Capacity,
    int Enrolled,
    string FillRate);