using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.Reports;

namespace SmartGym.Application.Interfaces;

public interface IReportService
{
    /// <summary>
    /// Tính tổng doanh thu trong một khoảng thời gian
    /// </summary>
    Task<decimal> GetTotalRevenueAsync(DateTime? startDate, DateTime? endDate);

    /// <summary>
    /// Đếm số lượng hội viên mới đăng ký trong tháng
    /// </summary>
    Task<int> GetNewMembersCountAsync(DateTime month);

    /// <summary>
    /// Tính tỷ lệ lấp đầy lớp học trung bình trong tháng
    /// </summary>
    Task<double> GetAverageClassOccupancyAsync(DateTime month);

    Task<DashboardMetricsResponse> GetDashboardMetricsAsync();
    Task<IEnumerable<RevenueByPackageResponse>> GetRevenueByPackageAsync();
    Task<IEnumerable<RevenueByPaymentMethodResponse>> GetRevenueByPaymentMethodAsync();

    Task<IEnumerable<ExpiringMemberResponse>> GetExpiringMembersAsync();
    Task<MemberRetentionResponse> GetMemberRetentionRateAsync();
    Task<IEnumerable<AttendanceStatResponse>> GetAttendanceStatsAsync();
    Task<IEnumerable<TrainerPerformanceResponse>> GetTrainerPerformanceAsync();
    Task<IEnumerable<OutstandingInvoiceResponse>> GetOutstandingInvoicesAsync();

    /// <summary>Doanh thu theo tháng trong <paramref name="months"/> tháng gần nhất (FR-014).</summary>
    Task<IEnumerable<MonthlyRevenueResponse>> GetMonthlyRevenueAsync(int months);

    /// <summary>Tỷ lệ lấp đầy của từng lớp trong tháng (FR-014).</summary>
    Task<IEnumerable<ClassOccupancyResponse>> GetClassOccupancyByClassAsync(DateTime month);

    /// <summary>Xếp hạng lớp học được đăng ký nhiều nhất (FR-014).</summary>
    Task<IEnumerable<PopularClassResponse>> GetPopularClassesAsync(DateTime month, int top);

    Task<byte[]> ExportRevenueReportAsync(DateTime? startDate, DateTime? endDate);
}
