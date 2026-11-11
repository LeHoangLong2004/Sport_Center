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
using Microsoft.Extensions.Options;
using SmartGym.Infrastructure.Services;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Phần mở rộng (partial) của PaymentEndpoints chuyên quản lý Hóa đơn, Hoàn tiền, Cổng VNPay và Gửi Email hóa đơn.
/// </summary>
public static partial class PaymentEndpoints
{
    /// <summary>
    /// Đăng ký các route xử lý hóa đơn, xuất file PDF, tích hợp VNPay và hoàn tiền.
    /// </summary>
    /// <param name="group">Nhóm route /api/payments</param>
    private static void MapInvoiceEndpoints(RouteGroupBuilder group)
    {
        // FLOW 3: HÓA ĐƠN, HOÀN TIỀN, THANH TOÁN TRỰC TUYẾN, EMAIL
        // --------------------------------------------------------

        /// <summary>
        /// GET /api/payments/{invoiceId}/export-pdf
        /// Xuất file PDF hóa đơn điện tử phục vụ in ấn hoặc tải về.
        /// </summary>
        group
            .MapGet(
                "/{invoiceId:guid}/export-pdf",
                async (Guid invoiceId, IPdfService pdfService) =>
                {
                    var pdfBytes = await pdfService.GenerateInvoicePdfAsync(invoiceId);
                    return Results.File(pdfBytes, "application/pdf", $"invoice_{invoiceId}.pdf");
                }
            )
            .Produces<byte[]>(StatusCodes.Status200OK, "application/pdf");

        /// <summary>
        /// GET /api/payments
        /// Lấy toàn bộ danh sách hóa đơn trong hệ thống.
        /// Quyền hạn yêu cầu: Manager, Admin hoặc Receptionist.
        /// </summary>
        group
            .MapGet(
                "/",
                async (IInvoiceRepository repo) =>
                    Results.Ok((await repo.GetAllAsync()).Select(ToInvoiceResponse))
            )
            .Produces<IEnumerable<InvoiceResponse>>(StatusCodes.Status200OK)
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "receptionist"));

        /// <summary>
        /// GET /api/payments/{invoiceId}
        /// Lấy chi tiết một hóa đơn cụ thể theo ID.
        /// </summary>
        group
            .MapGet(
                "/{invoiceId:guid}",
                async (Guid invoiceId, IInvoiceRepository repo) =>
                {
                    var invoice = await repo.GetByIdAsync(invoiceId);
                    return invoice != null
                        ? Results.Ok(ToInvoiceResponse(invoice))
                        : Results.NotFound();
                }
            )
            .Produces<InvoiceResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization();

        /// <summary>
        /// GET /api/payments/member/{memberId}
        /// Lấy danh sách lịch sử hóa đơn của một hội viên cụ thể.
        /// Quyền hạn yêu cầu: Manager, Admin hoặc Receptionist.
        /// </summary>
        group
            .MapGet(
                "/member/{memberId:guid}",
                async (Guid memberId, IInvoiceRepository repo) =>
                    Results.Ok((await repo.GetByUserIdAsync(memberId)).Select(ToInvoiceResponse))
            )
            .Produces<IEnumerable<InvoiceResponse>>(StatusCodes.Status200OK)
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "receptionist"));

        /// <summary>
        /// GET /api/payments/my
        /// Lấy danh sách hóa đơn thanh toán của hội viên đang đăng nhập.
        /// </summary>
        group
            .MapGet(
                "/my",
                async (IInvoiceRepository repo, HttpContext ctx) =>
                {
                    var userIdStr = ctx
                        .User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                        ?.Value;
                    if (Guid.TryParse(userIdStr, out var userId))
                        return Results.Ok(
                            (await repo.GetByUserIdAsync(userId)).Select(ToInvoiceResponse)
                        );
                    return Results.Unauthorized();
                }
            )
            .Produces<IEnumerable<InvoiceResponse>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .RequireAuthorization();

        /// <summary>
        /// POST /api/payments/{invoiceId}/refund
        /// Hoàn tiền giao dịch đã thanh toán. Hỗ trợ tham số lý do hoàn tiền và cờ ép buộc hoàn tiền (Force).
        /// Quyền hạn yêu cầu: Manager, Admin hoặc Receptionist.
        /// </summary>
        group
            .MapPost(
                "/{invoiceId:guid}/refund",
                async (
                    Guid invoiceId,
                    [FromBody] RefundPaymentRequest? req,
                    IPaymentService paymentService
                ) =>
                {
                    var result = await paymentService.RefundPaymentAsync(
                        invoiceId,
                        req?.Force ?? false,
                        req?.Reason
                    );
                    return result.Success
                        ? Results.Ok(new RefundResponse(true, result.Message, false))
                        : Results.BadRequest(
                            new RefundResponse(false, result.Message, result.RequiresConfirmation)
                        );
                }
            )
            .Produces<RefundResponse>(StatusCodes.Status200OK)
            .Produces<RefundResponse>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "receptionist"));

        /// <summary>
        /// POST /api/payments/{invoiceId}/pay-online
        /// Khởi tạo URL cổng thanh toán trực tuyến VNPay cho hóa đơn chỉ định.
        /// </summary>
        group
            .MapPost(
                "/{invoiceId:guid}/pay-online",
                async (Guid invoiceId, IPaymentService paymentService, HttpContext ctx) =>
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
                }
            )
            .Produces<OnlinePaymentResponse>(StatusCodes.Status200OK)
            .Produces<PaymentStatusResponse>(StatusCodes.Status400BadRequest);

        /// <summary>
        /// GET /api/payments/vnpay/return
        /// Xử lý callback chuyển hướng người dùng trở lại sau khi thanh toán trên VNPay.
        /// </summary>
        group
            .MapGet(
                "/vnpay/return",
                async (HttpContext ctx, IPaymentService paymentService, IOptions<VnPayOptions> options) =>
                {
                    _ = await paymentService.HandleVnPayCallbackAsync(ReadQuery(ctx));
                    return Results.Redirect(options.Value.FrontendReturnUrl);
                }
            )
            .Produces(StatusCodes.Status302Found);

        /// <summary>
        /// GET /api/payments/vnpay/ipn
        /// Webhook xác nhận ngầm (IPN) từ hệ thống VNPay khi giao dịch hoàn tất.
        /// </summary>
        group.MapGet(
            "/vnpay/ipn",
            async (HttpContext ctx, IPaymentService paymentService) =>
            {
                var result = await paymentService.HandleVnPayCallbackAsync(ReadQuery(ctx));
                return Results.Ok(
                    new
                    {
                        RspCode = result.Success ? "00" : "99",
                        Message = result.Success ? "Confirm Success" : result.Message,
                    }
                );
            }
        );

        /// <summary>
        /// POST /api/payments/vnpay/ipn
        /// Webhook xác nhận ngầm (IPN) từ hệ thống VNPay dạng HTTP POST.
        /// </summary>
        group.MapPost(
            "/vnpay/ipn",
            async (HttpContext ctx, IPaymentService paymentService) =>
            {
                var result = await paymentService.HandleVnPayCallbackAsync(ReadQuery(ctx));
                return Results.Ok(
                    new
                    {
                        RspCode = result.Success ? "00" : "99",
                        Message = result.Success ? "Confirm Success" : result.Message,
                    }
                );
            }
        );

        /// <summary>
        /// POST /api/payments/{invoiceId}/send-email
        /// Gửi thông tin biên lai / hóa đơn thanh toán tới email đã đăng ký của khách hàng.
        /// </summary>
        group
            .MapPost(
                "/{invoiceId:guid}/send-email",
                async (Guid invoiceId, IPaymentService paymentService) =>
                {
                    var result = await paymentService.SendInvoiceEmailAsync(invoiceId);
                    return result.Success
                        ? Results.Ok(new PaymentStatusResponse(true, result.Message))
                        : Results.BadRequest(new PaymentStatusResponse(false, result.Message));
                }
            )
            .Produces<PaymentStatusResponse>(StatusCodes.Status200OK)
            .Produces<PaymentStatusResponse>(StatusCodes.Status400BadRequest);

        /// <summary>
        /// POST /api/payments/{invoiceId}/record-cash
        /// Ghi nhận nhân viên lễ tân đã thu tiền mặt tại quầy và hoàn tất hóa đơn.
        /// Quyền hạn yêu cầu: Manager, Admin hoặc Receptionist.
        /// </summary>
        group
            .MapPost(
                "/{invoiceId:guid}/record-cash",
                async (Guid invoiceId, IPaymentService paymentService) =>
                {
                    var success = await paymentService.RecordCashPaymentAsync(invoiceId);
                    return success
                        ? Results.Ok(new PaymentStatusResponse(true, "Đã thu tiền mặt"))
                        : Results.BadRequest(new PaymentStatusResponse(false, "Lỗi thu tiền"));
                }
            )
            .Produces<PaymentStatusResponse>(StatusCodes.Status200OK)
            .Produces<PaymentStatusResponse>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "receptionist"));

        // --------------------------------------------------------
        // BÁO CÁO DOANH THU (FR-014, FR-028)
        // --------------------------------------------------------

    }
}
