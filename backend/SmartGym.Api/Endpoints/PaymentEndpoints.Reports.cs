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

public static partial class PaymentEndpoints
{
    private static void MapReportEndpoints(IEndpointRouteBuilder app)
    {
        var reportGroup = app.MapGroup("/api/reports")
            .WithTags("Reports")
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

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

        reportGroup
            .MapGet(
                "/revenue/monthly",
                async (int? months, IReportService reportService) =>
                    Results.Ok(await reportService.GetMonthlyRevenueAsync(months ?? 12))
            )
            .Produces<IEnumerable<MonthlyRevenueResponse>>(StatusCodes.Status200OK);

        reportGroup
            .MapGet(
                "/classes/occupancy",
                async (DateTime? month, IReportService reportService) =>
                    Results.Ok(
                        await reportService.GetClassOccupancyByClassAsync(month ?? DateTime.UtcNow)
                    )
            )
            .Produces<IEnumerable<ClassOccupancyResponse>>(StatusCodes.Status200OK);

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

        reportGroup
            .MapGet(
                "/dashboard",
                async (IReportService reportService) =>
                    Results.Ok(await reportService.GetDashboardMetricsAsync())
            )
            .Produces<DashboardMetricsResponse>(StatusCodes.Status200OK);

        reportGroup
            .MapGet(
                "/revenue/by-package",
                async (IReportService reportService) =>
                    Results.Ok(await reportService.GetRevenueByPackageAsync())
            )
            .Produces<IEnumerable<RevenueByPackageResponse>>(StatusCodes.Status200OK);

        reportGroup
            .MapGet(
                "/revenue/by-payment-method",
                async (IReportService reportService) =>
                    Results.Ok(await reportService.GetRevenueByPaymentMethodAsync())
            )
            .Produces<IEnumerable<RevenueByPaymentMethodResponse>>(StatusCodes.Status200OK);

        reportGroup
            .MapGet(
                "/members/expiring",
                async (IReportService reportService) =>
                    Results.Ok(await reportService.GetExpiringMembersAsync())
            )
            .Produces<IEnumerable<ExpiringMemberResponse>>(StatusCodes.Status200OK);

        reportGroup
            .MapGet(
                "/members/retention",
                async (IReportService reportService) =>
                    Results.Ok(await reportService.GetMemberRetentionRateAsync())
            )
            .Produces<MemberRetentionResponse>(StatusCodes.Status200OK);

        reportGroup
            .MapGet(
                "/attendance",
                async (IReportService reportService) =>
                    Results.Ok(await reportService.GetAttendanceStatsAsync())
            )
            .Produces<IEnumerable<AttendanceStatResponse>>(StatusCodes.Status200OK);

        reportGroup
            .MapGet(
                "/trainers/performance",
                async (IReportService reportService) =>
                    Results.Ok(await reportService.GetTrainerPerformanceAsync())
            )
            .Produces<IEnumerable<TrainerPerformanceResponse>>(StatusCodes.Status200OK);

        reportGroup
            .MapGet(
                "/outstanding-invoices",
                async (IReportService reportService) =>
                    Results.Ok(await reportService.GetOutstandingInvoicesAsync())
            )
            .Produces<IEnumerable<OutstandingInvoiceResponse>>(StatusCodes.Status200OK);

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
