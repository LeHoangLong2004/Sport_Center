using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.DTOs.Payments;
using SmartGym.Application.DTOs.Reports;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Phần mở rộng (partial) của PaymentEndpoints chuyên cung cấp API Báo cáo & Thống kê tài chính, vận hành (BI & Analytics).
/// Toàn bộ route yêu cầu quyền: Manager hoặc Admin.
/// </summary>
public static partial class PaymentEndpoints
{
    /// <summary>
    /// Đăng ký các route báo cáo doanh thu, thành viên, tỷ lệ lấp đầy lớp học và xuất Excel.
    /// Nhóm route gốc: /api/reports
    /// </summary>
    /// <param name="app">Đối tượng IEndpointRouteBuilder</param>
    private static void MapReportEndpoints(IEndpointRouteBuilder app)
    {
        var reportGroup = app.MapGroup("/api/reports")
            .WithTags("Reports")
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        /// <summary>
        /// GET /api/reports/revenue
        /// Báo cáo tổng doanh thu trong một khoảng thời gian (startDate đến endDate).
        /// </summary>
        reportGroup
            .MapGet(
                "/revenue",
                async (DateTime? startDate, DateTime? endDate, IReportService reportService) =>
                {
                    var revenue = await reportService.GetTotalRevenueAsync(startDate, endDate);
                    var period =
                        $"{startDate?.ToString("yyyy-MM-dd") ?? "từ trước đến nay"} - {endDate?.ToString("yyyy-MM-dd") ?? DateTime.UtcNow.ToString("yyyy-MM-dd")}";
                    return Results.Ok(
                        new RevenueReportResponse(revenue, period, "Dữ liệu báo cáo doanh thu")
                    );
                }
            )
            .Produces<RevenueReportResponse>(StatusCodes.Status200OK);

        /// <summary>
        /// GET /api/reports/members
        /// Báo cáo số lượng hội viên mới đăng ký trong tháng chỉ định.
        /// </summary>
        reportGroup
            .MapGet(
                "/members",
                async (DateTime? month, IReportService reportService) =>
                {
                    var targetMonth = month ?? DateTime.UtcNow;
                    var newMembers = await reportService.GetNewMembersCountAsync(targetMonth);
                    return Results.Ok(
                        new MemberReportResponse(newMembers, targetMonth.ToString("yyyy-MM"))
                    );
                }
            )
            .Produces<MemberReportResponse>(StatusCodes.Status200OK);

        /// <summary>
        /// GET /api/reports/classes-occupancy
        /// Báo cáo tỷ lệ lấp đầy trung bình (%) của các lớp học trong tháng.
        /// </summary>
        reportGroup
            .MapGet(
                "/classes-occupancy",
                async (DateTime? month, IReportService reportService) =>
                {
                    var targetMonth = month ?? DateTime.UtcNow;
                    var occupancy = await reportService.GetAverageClassOccupancyAsync(targetMonth);
                    return Results.Ok(
                        new ClassOccupancyReportResponse(
                            $"{occupancy}%",
                            targetMonth.ToString("yyyy-MM")
                        )
                    );
                }
            )
            .Produces<ClassOccupancyReportResponse>(StatusCodes.Status200OK);

        /// <summary>
        /// GET /api/reports/revenue/monthly
        /// Báo cáo biểu đồ doanh thu theo từng tháng trong N tháng gần nhất (mặc định 12 tháng).
        /// </summary>
        reportGroup
            .MapGet(
                "/revenue/monthly",
                async (int? months, IReportService reportService) =>
                    Results.Ok(await reportService.GetMonthlyRevenueAsync(months ?? 12))
            )
            .Produces<IEnumerable<MonthlyRevenueResponse>>(StatusCodes.Status200OK);

        /// <summary>
        /// GET /api/reports/classes/occupancy
        /// Chi tiết tỷ lệ lấp đầy theo từng lớp học trong tháng.
        /// </summary>
        reportGroup
            .MapGet(
                "/classes/occupancy",
                async (DateTime? month, IReportService reportService) =>
                    Results.Ok(
                        await reportService.GetClassOccupancyByClassAsync(month ?? DateTime.UtcNow)
                    )
            )
            .Produces<IEnumerable<ClassOccupancyResponse>>(StatusCodes.Status200OK);

        /// <summary>
        /// GET /api/reports/classes/popular
        /// Top các lớp học được hội viên đặt chỗ nhiều nhất (Top popular classes).
        /// </summary>
        reportGroup
            .MapGet(
                "/classes/popular",
                async (DateTime? month, int? top, IReportService reportService) =>
                    Results.Ok(
                        await reportService.GetPopularClassesAsync(
                            month ?? DateTime.UtcNow,
                            top ?? 5
                        )
                    )
            )
            .Produces<IEnumerable<PopularClassResponse>>(StatusCodes.Status200OK);

        /// <summary>
        /// GET /api/reports/dashboard
        /// Tổng hợp toàn bộ chỉ số KPI quan trọng nhất cho trang Tổng quan Admin Dashboard.
        /// </summary>
        reportGroup
            .MapGet(
                "/dashboard",
                async (IReportService reportService) =>
                    Results.Ok(await reportService.GetDashboardMetricsAsync())
            )
            .Produces<DashboardMetricsResponse>(StatusCodes.Status200OK);

        /// <summary>
        /// GET /api/reports/revenue/by-package
        /// Cơ cấu doanh thu phân bổ theo từng loại gói tập.
        /// </summary>
        reportGroup
            .MapGet(
                "/revenue/by-package",
                async (IReportService reportService) =>
                    Results.Ok(await reportService.GetRevenueByPackageAsync())
            )
            .Produces<IEnumerable<RevenueByPackageResponse>>(StatusCodes.Status200OK);

        /// <summary>
        /// GET /api/reports/revenue/by-payment-method
        /// Thống kê doanh thu theo phương thức thanh toán (Tiền mặt, QR, Thẻ, VNPay...).
        /// </summary>
        reportGroup
            .MapGet(
                "/revenue/by-payment-method",
                async (IReportService reportService) =>
                    Results.Ok(await reportService.GetRevenueByPaymentMethodAsync())
            )
            .Produces<IEnumerable<RevenueByPaymentMethodResponse>>(StatusCodes.Status200OK);

        /// <summary>
        /// GET /api/reports/members/expiring
        /// Danh sách hội viên sắp hết hạn gói tập trong vòng 7 - 30 ngày tới cần nhắc nhở gia hạn.
        /// </summary>
        reportGroup
            .MapGet(
                "/members/expiring",
                async (IReportService reportService) =>
                    Results.Ok(await reportService.GetExpiringMembersAsync())
            )
            .Produces<IEnumerable<ExpiringMemberResponse>>(StatusCodes.Status200OK);

        /// <summary>
        /// GET /api/reports/members/retention
        /// Tỷ lệ giữ chân khách hàng (Retention Rate) và tỷ lệ rời bỏ (Churn Rate).
        /// </summary>
        reportGroup
            .MapGet(
                "/members/retention",
                async (IReportService reportService) =>
                    Results.Ok(await reportService.GetMemberRetentionRateAsync())
            )
            .Produces<MemberRetentionResponse>(StatusCodes.Status200OK);

        /// <summary>
        /// GET /api/reports/attendance
        /// Thống kê lượt điểm danh theo khung giờ trong ngày (giờ cao điểm / thấp điểm).
        /// </summary>
        reportGroup
            .MapGet(
                "/attendance",
                async (IReportService reportService) =>
                    Results.Ok(await reportService.GetAttendanceStatsAsync())
            )
            .Produces<IEnumerable<AttendanceStatResponse>>(StatusCodes.Status200OK);

        /// <summary>
        /// GET /api/reports/trainers/performance
        /// Đánh giá hiệu suất làm việc của HLV (số giờ dạy, số học viên, đánh giá trung bình).
        /// </summary>
        reportGroup
            .MapGet(
                "/trainers/performance",
                async (IReportService reportService) =>
                    Results.Ok(await reportService.GetTrainerPerformanceAsync())
            )
            .Produces<IEnumerable<TrainerPerformanceResponse>>(StatusCodes.Status200OK);

        /// <summary>
        /// GET /api/reports/outstanding-invoices
        /// Danh sách các hóa đơn chưa hoàn tất thanh toán / công nợ chưa thu.
        /// </summary>
        reportGroup
            .MapGet(
                "/outstanding-invoices",
                async (IReportService reportService) =>
                    Results.Ok(await reportService.GetOutstandingInvoicesAsync())
            )
            .Produces<IEnumerable<OutstandingInvoiceResponse>>(StatusCodes.Status200OK);

        /// <summary>
        /// GET /api/reports/revenue/export
        /// Xuất file Excel (.xlsx) báo cáo doanh thu chi tiết theo khoảng thời gian.
        /// </summary>
        reportGroup
            .MapGet(
                "/revenue/export",
                async (DateTime? startDate, DateTime? endDate, IReportService reportService) =>
                {
                    var excelBytes = await reportService.ExportRevenueReportAsync(
                        startDate,
                        endDate
                    );
                    return Results.File(
                        excelBytes,
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        $"revenue_report_{DateTime.UtcNow:yyyyMMddHHmm}.xlsx"
                    );
                }
            )
            .Produces<byte[]>(
                StatusCodes.Status200OK,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
    }
}
