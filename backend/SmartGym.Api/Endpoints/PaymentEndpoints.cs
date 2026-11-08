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
/// Endpoint quản lý Thanh toán & Giao dịch (Payment Processing).
/// Cung cấp: Khởi tạo đơn thanh toán gói tập, xử lý kết quả thanh toán, hủy giao dịch,
/// liên kết tới module Hóa đơn (Invoices) và Báo cáo tài chính (Financial Reports).
/// </summary>
public static partial class PaymentEndpoints
{
    /// <summary>
    /// Đăng ký các route thanh toán vào hệ thống.
    /// Nhóm route gốc: /api/payments
    /// </summary>
    /// <param name="app">Đối tượng IEndpointRouteBuilder</param>
    public static void MapPaymentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/payments").WithTags("Payments");

        /// <summary>
        /// POST /api/payments/create
        /// Tạo giao dịch thanh toán gói tập mới và phát hành hóa đơn (Invoice) ở trạng thái chờ.
        /// Kiểm tra chống tạo đơn trùng lặp (Duplicate Detection).
        /// </summary>
        group
            .MapPost(
                "/create",
                async ([FromBody] CreatePaymentRequest req, IPaymentService paymentService) =>
                {
                    var result = await paymentService.CreatePaymentAsync(
                        req.UserId,
                        req.PackageId,
                        req.Amount,
                        req.ResolvedMethod,
                        req.BillingPeriod,
                        req.AutoRenew,
                        req.StartDate
                    );

                    var response = new CreatePaymentResponse(
                        result.InvoiceId,
                        result.Message,
                        result.IsDuplicateSuspected
                    );

                    return result.Success ? Results.Ok(response) : Results.BadRequest(response);
                }
            )
            .Produces<CreatePaymentResponse>(StatusCodes.Status200OK)
            .Produces<CreatePaymentResponse>(StatusCodes.Status400BadRequest);

        // Alias tương thích client cũ: POST /api/payments/process { invoiceId }
        /// <summary>
        /// POST /api/payments/process
        /// Xử lý thanh toán thành công cho một hóa đơn (hỗ trợ client cũ truyền JSON body).
        /// </summary>
        group
            .MapPost(
                "/process",
                async ([FromBody] ProcessPaymentRequest req, IPaymentService paymentService) =>
                {
                    var success = await paymentService.ProcessPaymentAsync(req.InvoiceId);
                    return success
                        ? Results.Ok(new PaymentStatusResponse(true, "Thanh toán thành công"))
                        : Results.BadRequest(
                            new PaymentStatusResponse(false, "Xử lý thanh toán thất bại")
                        );
                }
            )
            .Produces<PaymentStatusResponse>(StatusCodes.Status200OK)
            .Produces<PaymentStatusResponse>(StatusCodes.Status400BadRequest);

        /// <summary>
        /// POST /api/payments/{invoiceId}/process
        /// Xác nhận thanh toán thành công theo mã Invoice ID trên URL.
        /// Kích hoạt gói tập tương ứng cho hội viên.
        /// </summary>
        group
            .MapPost(
                "/{invoiceId:guid}/process",
                async (Guid invoiceId, IPaymentService paymentService) =>
                {
                    var success = await paymentService.ProcessPaymentAsync(invoiceId);
                    return success
                        ? Results.Ok(new PaymentStatusResponse(true, "Thanh toán thành công"))
                        : Results.BadRequest(
                            new PaymentStatusResponse(false, "Xử lý thanh toán thất bại")
                        );
                }
            )
            .Produces<PaymentStatusResponse>(StatusCodes.Status200OK)
            .Produces<PaymentStatusResponse>(StatusCodes.Status400BadRequest);

        /// <summary>
        /// POST /api/payments/{invoiceId}/cancel
        /// Hủy đơn thanh toán và đánh dấu hóa đơn là Cancelled.
        /// </summary>
        group
            .MapPost(
                "/{invoiceId:guid}/cancel",
                async (Guid invoiceId, IPaymentService paymentService) =>
                {
                    var success = await paymentService.CancelPaymentAsync(invoiceId);
                    return success
                        ? Results.Ok(new PaymentStatusResponse(true, "Đã hủy thanh toán"))
                        : Results.BadRequest(
                            new PaymentStatusResponse(false, "Không thể hủy thanh toán")
                        );
                }
            )
            .Produces<PaymentStatusResponse>(StatusCodes.Status200OK)
            .Produces<PaymentStatusResponse>(StatusCodes.Status400BadRequest);

        // --------------------------------------------------------
        MapInvoiceEndpoints(group);

        MapReportEndpoints(app);
    }

    private static InvoiceResponse ToInvoiceResponse(Invoice invoice) =>
        new(
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
            invoice.PaidAt
        );

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

    /// <summary>Ngày bắt đầu do user chọn (nếu có)</summary>
    public DateTime? StartDate { get; set; }

    /// <summary>Hình thức thanh toán sau khi hợp nhất hai tên trường tương thích.</summary>
    [System.Text.Json.Serialization.JsonIgnore]
    public PaymentMethod ResolvedMethod =>
        Method ?? PaymentMethod ?? Domain.Enums.PaymentMethod.QRCode;
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

public record CreatePaymentResponse(
    Guid InvoiceId,
    string Message,
    bool IsDuplicateSuspected = false
);

public record PaymentStatusResponse(bool Success, string Message);

public record RefundResponse(bool Success, string Message, bool RequiresConfirmation);

public record OnlinePaymentResponse(string PaymentUrl);

public record RevenueReportResponse(decimal TotalRevenue, string Period, string Message);

public record MemberReportResponse(int NewMembers, string Month);

public record ClassOccupancyReportResponse(string AverageOccupancyRate, string Month);
