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
    private static void MapInvoiceEndpoints(RouteGroupBuilder group)
    {
        // FLOW 3: HÓA ĐƠN, HOÀN TIỀN, THANH TOÁN TRỰC TUYẾN, EMAIL
        // --------------------------------------------------------

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

        group
            .MapGet(
                "/",
                async (IInvoiceRepository repo) =>
                    Results.Ok((await repo.GetAllAsync()).Select(ToInvoiceResponse))
            )
            .Produces<IEnumerable<InvoiceResponse>>(StatusCodes.Status200OK)
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "receptionist"));

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

        group
            .MapGet(
                "/member/{memberId:guid}",
                async (Guid memberId, IInvoiceRepository repo) =>
                    Results.Ok((await repo.GetByUserIdAsync(memberId)).Select(ToInvoiceResponse))
            )
            .Produces<IEnumerable<InvoiceResponse>>(StatusCodes.Status200OK)
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "receptionist"));

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

        group
            .MapGet(
                "/vnpay/return",
                async (HttpContext ctx, IPaymentService paymentService) =>
                {
                    var result = await paymentService.HandleVnPayCallbackAsync(ReadQuery(ctx));
                    return result.Success
                        ? Results.Ok(new PaymentStatusResponse(true, result.Message))
                        : Results.BadRequest(new PaymentStatusResponse(false, result.Message));
                }
            )
            .Produces<PaymentStatusResponse>(StatusCodes.Status200OK)
            .Produces<PaymentStatusResponse>(StatusCodes.Status400BadRequest);

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
