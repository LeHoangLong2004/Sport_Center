using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using SmartGym.Application.DTOs.Payments;
using SmartGym.Application.DTOs.Reports;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;

namespace SmartGym.Api.Endpoints;

public static class PaymentEndpoints
{
    public static void MapPaymentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/payments").WithTags("Payments");

        group.MapPost("/create", async (
            [FromBody] CreatePaymentRequest req,
            IPaymentService paymentService) =>
        {
            var result = await paymentService.CreatePaymentAsync(
                req.UserId,
                req.PackageId,
                req.Amount,
                req.ResolvedMethod,
                req.BillingPeriod,
                req.AutoRenew);

            var response = new CreatePaymentResponse(result.InvoiceId, result.Message, result.IsDuplicateSuspected);

            return result.Success
                ? Results.Ok(response)
                : Results.BadRequest(response);
        })
        .Produces<CreatePaymentResponse>(StatusCodes.Status200OK)
        .Produces<CreatePaymentResponse>(StatusCodes.Status400BadRequest);

        // Alias tương thích client cũ: POST /api/payments/process { invoiceId }
        group.MapPost("/process", async (
            [FromBody] ProcessPaymentRequest req,
            IPaymentService paymentService) =>
        {
            var success = await paymentService.ProcessPaymentAsync(req.InvoiceId);
            return success
                ? Results.Ok(new PaymentStatusResponse(true, "Thanh toán thành công"))
                : Results.BadRequest(new PaymentStatusResponse(false, "Xử lý thanh toán thất bại"));
        })
        .Produces<PaymentStatusResponse>(StatusCodes.Status200OK)
        .Produces<PaymentStatusResponse>(StatusCodes.Status400BadRequest);

        group.MapPost("/{invoiceId:guid}/process", async (
            Guid invoiceId,
            IPaymentService paymentService) =>
        {
            var success = await paymentService.ProcessPaymentAsync(invoiceId);
            return success 
                ? Results.Ok(new PaymentStatusResponse(true, "Thanh toán thành công")) 
                : Results.BadRequest(new PaymentStatusResponse(false, "Xử lý thanh toán thất bại"));
        })
        .Produces<PaymentStatusResponse>(StatusCodes.Status200OK)
        .Produces<PaymentStatusResponse>(StatusCodes.Status400BadRequest);

        group.MapPost("/{invoiceId:guid}/cancel", async (
            Guid invoiceId,
            IPaymentService paymentService) =>
        {
            var success = await paymentService.CancelPaymentAsync(invoiceId);
            return success 
                ? Results.Ok(new PaymentStatusResponse(true, "Đã hủy thanh toán")) 
                : Results.BadRequest(new PaymentStatusResponse(false, "Không thể hủy thanh toán"));
        })
        .Produces<PaymentStatusResponse>(StatusCodes.Status200OK)
        .Produces<PaymentStatusResponse>(StatusCodes.Status400BadRequest);

        // --------------------------------------------------------
        // FLOW 3: HÓA ĐƠN, HOÀN TIỀN, THANH TOÁN TRỰC TUYẾN, EMAIL
        // --------------------------------------------------------

        group.MapGet("/{invoiceId:guid}/export-pdf", async (Guid invoiceId, IPdfService pdfService) =>
        {
            var pdfBytes = await pdfService.GenerateInvoicePdfAsync(invoiceId);
            return Results.File(pdfBytes, "application/pdf", $"invoice_{invoiceId}.pdf");
        })
        .Produces<byte[]>(StatusCodes.Status200OK, "application/pdf");

        group.MapGet("/", async (IInvoiceRepository repo) => 
            Results.Ok((await repo.GetAllAsync()).Select(ToInvoiceResponse)))
        .Produces<IEnumerable<InvoiceResponse>>(StatusCodes.Status200OK)
        .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "receptionist"));

        group.MapGet("/{invoiceId:guid}", async (Guid invoiceId, IInvoiceRepository repo) => 
        {
            var invoice = await repo.GetByIdAsync(invoiceId);
            return invoice != null ? Results.Ok(ToInvoiceResponse(invoice)) : Results.NotFound();
        })
        .Produces<InvoiceResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .RequireAuthorization();

        group.MapGet("/member/{memberId:guid}", async (Guid memberId, IInvoiceRepository repo) => 
            Results.Ok((await repo.GetByUserIdAsync(memberId)).Select(ToInvoiceResponse)))
        .Produces<IEnumerable<InvoiceResponse>>(StatusCodes.Status200OK)
        .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "receptionist"));

        group.MapGet("/my", async (IInvoiceRepository repo, HttpContext ctx) => 
        {
            var userIdStr = ctx.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdStr, out var userId))
                return Results.Ok((await repo.GetByUserIdAsync(userId)).Select(ToInvoiceResponse));
            return Results.Unauthorized();
        })
        .Produces<IEnumerable<InvoiceResponse>>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();

        group.MapPost("/{invoiceId:guid}/refund", async (
            Guid invoiceId,
            [FromBody] RefundPaymentRequest? req,
            IPaymentService paymentService) =>
        {
            var result = await paymentService.RefundPaymentAsync(invoiceId, req?.Force ?? false, req?.Reason);
            return result.Success
                ? Results.Ok(new RefundResponse(true, result.Message, false))
                : Results.BadRequest(new RefundResponse(false, result.Message, result.RequiresConfirmation));
        })
        .Produces<RefundResponse>(StatusCodes.Status200OK)
        .Produces<RefundResponse>(StatusCodes.Status400BadRequest)
        .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "receptionist"));

        group.MapPost("/{invoiceId:guid}/pay-online", async (
            Guid invoiceId,
            IPaymentService paymentService,
            HttpContext ctx) =>
        {
            try
            {
                var clientIp = ctx.Connection.RemoteIpAddress?.ToString();
                var url = await paymentService.GenerateVnPayUrlAsync(invoiceId, clientIp);
                return Results.Ok(new OnlinePaymentResponse(url));
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new PaymentStatusResponse(false, ex.Message));
            }
        })
        .Produces<OnlinePaymentResponse>(StatusCodes.Status200OK)
        .Produces<PaymentStatusResponse>(StatusCodes.Status400BadRequest);

        group.MapGet("/vnpay/return", async (HttpContext ctx, IPaymentService paymentService) =>
        {
            var result = await paymentService.HandleVnPayCallbackAsync(ReadQuery(ctx));
            return result.Success
                ? Results.Ok(new PaymentStatusResponse(true, result.Message))
                : Results.BadRequest(new PaymentStatusResponse(false, result.Message));
        })
        .Produces<PaymentStatusResponse>(StatusCodes.Status200OK)
        .Produces<PaymentStatusResponse>(StatusCodes.Status400BadRequest);

        group.MapGet("/vnpay/ipn", async (HttpContext ctx, IPaymentService paymentService) =>
        {
            var result = await paymentService.HandleVnPayCallbackAsync(ReadQuery(ctx));
            return Results.Ok(new
            {
                RspCode = result.Success ? "00" : "99",
                Message = result.Success ? "Confirm Success" : result.Message
            });
        });

        group.MapPost("/vnpay/ipn", async (HttpContext ctx, IPaymentService paymentService) =>
        {
            var result = await paymentService.HandleVnPayCallbackAsync(ReadQuery(ctx));
            return Results.Ok(new
            {
                RspCode = result.Success ? "00" : "99",
                Message = result.Success ? "Confirm Success" : result.Message
            });
        });

        group.MapPost("/{invoiceId:guid}/send-email", async (Guid invoiceId, IPaymentService paymentService) => 
        {
            var result = await paymentService.SendInvoiceEmailAsync(invoiceId);
            return result.Success
                ? Results.Ok(new PaymentStatusResponse(true, result.Message))
                : Results.BadRequest(new PaymentStatusResponse(false, result.Message));
        })
        .Produces<PaymentStatusResponse>(StatusCodes.Status200OK)
        .Produces<PaymentStatusResponse>(StatusCodes.Status400BadRequest);

        group.MapPost("/{invoiceId:guid}/record-cash", async (Guid invoiceId, IPaymentService paymentService) => 
        {
            var success = await paymentService.RecordCashPaymentAsync(invoiceId);
            return success
                ? Results.Ok(new PaymentStatusResponse(true, "Đã thu tiền mặt"))
                : Results.BadRequest(new PaymentStatusResponse(false, "Lỗi thu tiền"));
        })
        .Produces<PaymentStatusResponse>(StatusCodes.Status200OK)
        .Produces<PaymentStatusResponse>(StatusCodes.Status400BadRequest)
        .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "receptionist"));

        // --------------------------------------------------------
        // BÁO CÁO DOANH THU (FR-014, FR-028)
        // --------------------------------------------------------

        var reportGroup = app.MapGroup("/api/reports")
            .WithTags("Reports")
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        reportGroup.MapGet("/revenue", async (DateTime? startDate, DateTime? endDate, IReportService reportService) =>
        {
            var revenue = await reportService.GetTotalRevenueAsync(startDate, endDate);
            var period = $"{startDate?.ToString("yyyy-MM-dd") ?? "từ trước đến nay"} - {endDate?.ToString("yyyy-MM-dd") ?? DateTime.UtcNow.ToString("yyyy-MM-dd")}";
            return Results.Ok(new RevenueReportResponse(revenue, period, "Dữ liệu báo cáo doanh thu"));
        })
        .Produces<RevenueReportResponse>(StatusCodes.Status200OK);

        reportGroup.MapGet("/members", async (DateTime? month, IReportService reportService) =>
        {
            var targetMonth = month ?? DateTime.UtcNow;
            var newMembers = await reportService.GetNewMembersCountAsync(targetMonth);
            return Results.Ok(new MemberReportResponse(newMembers, targetMonth.ToString("yyyy-MM")));
        })
        .Produces<MemberReportResponse>(StatusCodes.Status200OK);

        reportGroup.MapGet("/classes-occupancy", async (DateTime? month, IReportService reportService) =>
        {
            var targetMonth = month ?? DateTime.UtcNow;
            var occupancy = await reportService.GetAverageClassOccupancyAsync(targetMonth);
            return Results.Ok(new ClassOccupancyReportResponse($"{occupancy}%", targetMonth.ToString("yyyy-MM")));
        })
        .Produces<ClassOccupancyReportResponse>(StatusCodes.Status200OK);

        reportGroup.MapGet("/revenue/monthly", async (int? months, IReportService reportService) =>
            Results.Ok(await reportService.GetMonthlyRevenueAsync(months ?? 12)))
        .Produces<IEnumerable<MonthlyRevenueResponse>>(StatusCodes.Status200OK);

        reportGroup.MapGet("/classes/occupancy", async (DateTime? month, IReportService reportService) =>
            Results.Ok(await reportService.GetClassOccupancyByClassAsync(month ?? DateTime.UtcNow)))
        .Produces<IEnumerable<ClassOccupancyResponse>>(StatusCodes.Status200OK);

        reportGroup.MapGet("/classes/popular", async (DateTime? month, int? top, IReportService reportService) =>
            Results.Ok(await reportService.GetPopularClassesAsync(month ?? DateTime.UtcNow, top ?? 5)))
        .Produces<IEnumerable<PopularClassResponse>>(StatusCodes.Status200OK);

        reportGroup.MapGet("/dashboard", async (IReportService reportService) =>
            Results.Ok(await reportService.GetDashboardMetricsAsync()))
        .Produces<DashboardMetricsResponse>(StatusCodes.Status200OK);

        reportGroup.MapGet("/revenue/by-package", async (IReportService reportService) =>
            Results.Ok(await reportService.GetRevenueByPackageAsync()))
        .Produces<IEnumerable<RevenueByPackageResponse>>(StatusCodes.Status200OK);

        reportGroup.MapGet("/revenue/by-payment-method", async (IReportService reportService) =>
            Results.Ok(await reportService.GetRevenueByPaymentMethodAsync()))
        .Produces<IEnumerable<RevenueByPaymentMethodResponse>>(StatusCodes.Status200OK);

        reportGroup.MapGet("/members/expiring", async (IReportService reportService) =>
            Results.Ok(await reportService.GetExpiringMembersAsync()))
        .Produces<IEnumerable<ExpiringMemberResponse>>(StatusCodes.Status200OK);

        reportGroup.MapGet("/members/retention", async (IReportService reportService) =>
            Results.Ok(await reportService.GetMemberRetentionRateAsync()))
        .Produces<MemberRetentionResponse>(StatusCodes.Status200OK);

        reportGroup.MapGet("/attendance", async (IReportService reportService) =>
            Results.Ok(await reportService.GetAttendanceStatsAsync()))
        .Produces<IEnumerable<AttendanceStatResponse>>(StatusCodes.Status200OK);

        reportGroup.MapGet("/trainers/performance", async (IReportService reportService) =>
            Results.Ok(await reportService.GetTrainerPerformanceAsync()))
        .Produces<IEnumerable<TrainerPerformanceResponse>>(StatusCodes.Status200OK);

        reportGroup.MapGet("/outstanding-invoices", async (IReportService reportService) =>
            Results.Ok(await reportService.GetOutstandingInvoicesAsync()))
        .Produces<IEnumerable<OutstandingInvoiceResponse>>(StatusCodes.Status200OK);

        reportGroup.MapGet("/revenue/export", async (DateTime? startDate, DateTime? endDate, IReportService reportService) =>
        {
            var excelBytes = await reportService.ExportRevenueReportAsync(startDate, endDate);
            return Results.File(
                excelBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"revenue_report_{DateTime.UtcNow:yyyyMMddHHmm}.xlsx");
        })
        .Produces<byte[]>(StatusCodes.Status200OK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    private static InvoiceResponse ToInvoiceResponse(Invoice invoice) => new(
        invoice.Id,
        invoice.InvoiceNumber,
        invoice.UserId,
        invoice.User?.FullName,
        invoice.TotalAmount,
        invoice.PaymentMethod.ToDbValue(),
        invoice.PaymentMethod.ToDisplayName(),
        invoice.Status.ToString().ToLowerInvariant(),
        invoice.Status.ToDisplayName(),
        invoice.CreatedAt,
        invoice.PaidAt);

    private static IReadOnlyDictionary<string, string> ReadQuery(HttpContext ctx)
    {
        var query = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var pair in ctx.Request.Query)
        {
            query[pair.Key] = pair.Value.ToString();
        }

        return query;
    }
}

public class CreatePaymentRequest
{
    public Guid UserId { get; set; }
    public string PackageId { get; set; } = string.Empty;
    public decimal Amount { get; set; }

    /// <summary>Tên trường theo tài liệu API.</summary>
    public PaymentMethod? Method { get; set; }

    /// <summary>Tên trường mà frontend đang gửi lên.</summary>
    public PaymentMethod? PaymentMethod { get; set; }

    /// <summary>'monthly' hoặc 'yearly'.</summary>
    public string? BillingPeriod { get; set; }

    /// <summary>Đăng ký tự động gia hạn khi hết hạn (FR-012).</summary>
    public bool AutoRenew { get; set; }

    /// <summary>Hình thức thanh toán sau khi hợp nhất hai tên trường tương thích.</summary>
    [System.Text.Json.Serialization.JsonIgnore]
    public PaymentMethod ResolvedMethod => Method ?? PaymentMethod ?? Domain.Enums.PaymentMethod.QRCode;
}

public class ProcessPaymentRequest
{
    public Guid InvoiceId { get; set; }
}

public class RefundPaymentRequest
{
    public bool Force { get; set; }
    public string? Reason { get; set; }
}

public record CreatePaymentResponse(Guid InvoiceId, string Message, bool IsDuplicateSuspected = false);
public record PaymentStatusResponse(bool Success, string Message);
public record RefundResponse(bool Success, string Message, bool RequiresConfirmation);
public record OnlinePaymentResponse(string PaymentUrl);
public record RevenueReportResponse(decimal TotalRevenue, string Period, string Message);
public record MemberReportResponse(int NewMembers, string Month);
public record ClassOccupancyReportResponse(string AverageOccupancyRate, string Month);
