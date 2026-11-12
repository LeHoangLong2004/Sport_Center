using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartGym.Api.Services;
using SmartGym.Application.DTOs;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Endpoint quản lý Danh mục gói tập mở rộng và Đơn đặt mua gói tập (Package Catalog & Order System).
/// Bao gồm: Cấu hình bảng giá theo kỳ hạn, đơn mua gói của hội viên, quy trình Checkout & thanh toán,
/// xác nhận thanh toán tại quầy và kiểm tra quyền vào tập (Access Control) theo môn thể thao.
/// </summary>
public static class PackageCatalogEndpoints
{
    private static readonly string[] ManagerRoles = ["manager", "CenterManager", "center_manager"];
    private static readonly string[] OrderManagementRoles = ["manager", "CenterManager", "center_manager", "receptionist", "Receptionist", "admin", "Admin"];
    private static readonly string[] MemberRoles = ["member", "Member", "admin", "Admin", "manager", "Manager"];

    /// <summary>
    /// Đăng ký các route Package Catalog và Package Orders vào hệ thống.
    /// Nhóm route: /api/package-catalog và /api/package-orders
    /// </summary>
    /// <param name="app">Đối tượng IEndpointRouteBuilder</param>
    public static void MapPackageCatalogEndpoints(this IEndpointRouteBuilder app)
    {
        var catalog = app.MapGroup("/api/package-catalog").WithTags("Package catalog");

        /// <summary>
        /// GET /api/package-catalog
        /// Lấy danh mục các gói tập (kèm theo kỳ hạn tháng, giảm giá, môn thể thao áp dụng).
        /// Nếu là Manager/Admin sẽ thấy cả gói đang tạm ngưng hoạt động.
        /// </summary>
        catalog.MapGet(
            "/",
            async (
                HttpContext context,
                PackageCatalogService service,
                CancellationToken cancellationToken
            ) =>
            {
                try
                {
                    var role = context.User.FindFirstValue(ClaimTypes.Role);
                    var includeInactive =
                        role is not null
                        && ManagerRoles.Contains(role, StringComparer.OrdinalIgnoreCase);
                    var packages = await service.GetCatalogAsync(includeInactive, cancellationToken);
                    return Results.Ok(packages);
                }
                catch (Exception ex)
                {
                    return Results.Problem(detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
                }
            }
        );

        /// <summary>
        /// POST /api/package-catalog
        /// Thêm mới một gói tập hoàn chỉnh vào Catalog (bao gồm cấu hình quyền thể thao, kỳ hạn).
        /// Quyền hạn yêu cầu: Manager.
        /// </summary>
        catalog
            .MapPost(
                "/",
                async (
                    [FromBody] CatalogPackageDto request,
                    PackageCatalogService service,
                    CancellationToken cancellationToken
                ) =>
                {
                    try
                    {
                        var created = await service.SaveCatalogPackageAsync(
                            request.Id,
                            request,
                            create: true,
                            cancellationToken
                        );
                        return Results.Created($"/api/package-catalog/{created.Id}", created);
                    }
                    catch (PackageCatalogException exception)
                    {
                        return Results.Json(
                            new { message = exception.Message },
                            statusCode: exception.StatusCode
                        );
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole(ManagerRoles));

        /// <summary>
        /// PUT /api/package-catalog/{id}
        /// Chỉnh sửa thông tin chi tiết gói tập trong Catalog.
        /// Quyền hạn yêu cầu: Manager.
        /// </summary>
        catalog
            .MapPut(
                "/{id}",
                async (
                    string id,
                    [FromBody] CatalogPackageDto request,
                    PackageCatalogService service,
                    CancellationToken cancellationToken
                ) =>
                {
                    try
                    {
                        var updated = await service.SaveCatalogPackageAsync(
                            id,
                            request,
                            create: false,
                            cancellationToken
                        );
                        return Results.Ok(updated);
                    }
                    catch (PackageCatalogException exception)
                    {
                        return Results.Json(
                            new { message = exception.Message },
                            statusCode: exception.StatusCode
                        );
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole(ManagerRoles));

        /// <summary>
        /// PATCH /api/package-catalog/{id}/status
        /// Bật/tắt trạng thái mở bán (IsActive) của gói tập.
        /// Quyền hạn yêu cầu: Manager.
        /// </summary>
        catalog
            .MapPatch(
                "/{id}/status",
                async (
                    string id,
                    [FromBody] SetPackageStatusRequest request,
                    PackageCatalogService service,
                    CancellationToken cancellationToken
                ) =>
                {
                    try
                    {
                        await service.SetPackageStatusAsync(
                            id,
                            request.IsActive,
                            cancellationToken
                        );
                        return Results.NoContent();
                    }
                    catch (PackageCatalogException exception)
                    {
                        return Results.Json(
                            new { message = exception.Message },
                            statusCode: exception.StatusCode
                        );
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole(ManagerRoles));

        var orders = app.MapGroup("/api/package-orders").WithTags("Package orders");

        /// <summary>
        /// GET /api/package-orders/me
        /// Lấy danh sách các đơn mua gói tập của hội viên hiện tại.
        /// </summary>
        orders
            .MapGet(
                "/me",
                async (
                    HttpContext context,
                    PackageCatalogService service,
                    CancellationToken cancellationToken
                ) =>
                {
                    if (!TryGetUserId(context, out var userId))
                        return Results.Unauthorized();
                    var result = await service.GetOrdersAsync(userId, cancellationToken);
                    return Results.Ok(result);
                }
            )
            .RequireAuthorization(policy => policy.RequireRole(MemberRoles));

        /// <summary>
        /// POST /api/package-orders
        /// Tạo đơn mua gói tập mới.
        /// </summary>
        orders
            .MapPost(
                "/",
                async (
                    HttpContext context,
                    [FromBody] CreatePackageOrderRequest request,
                    PackageCatalogService service,
                    CancellationToken cancellationToken
                ) =>
                {
                    if (!TryGetUserId(context, out var userId))
                        return Results.Unauthorized();
                    try
                    {
                        var order = await service.CreateOrderAsync(
                            userId,
                            request,
                            cancellationToken
                        );
                        return Results.Created($"/api/package-orders/{order.Id}", order);
                    }
                    catch (PackageCatalogException exception)
                    {
                        return Results.Json(
                            new { message = exception.Message },
                            statusCode: exception.StatusCode
                        );
                    }
                }
            )
            .RequireAuthorization();


        /// <summary>
        /// POST /api/package-orders/checkout
        /// Bắt đầu quy trình thanh toán cho gói tập (khởi tạo liên kết thanh toán, QR SePay).
        /// </summary>
        orders
            .MapPost(
                "/checkout",
                async (
                    HttpContext context,
                    [FromBody] CreatePackageCheckoutRequest request,
                    PackageCatalogService service,
                    CancellationToken cancellationToken
                ) =>
                {
                    if (!TryGetUserId(context, out var userId))
                        return Results.Unauthorized();
                    try
                    {
                        var result = await service.CheckoutAsync(
                            userId,
                            request,
                            cancellationToken
                        );
                        return Results.Ok(result);
                    }
                    catch (PackageCatalogException exception)
                    {
                        return Results.Json(
                            new { message = exception.Message },
                            statusCode: exception.StatusCode
                        );
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole(MemberRoles));

        /// <summary>
        /// GET /api/package-orders
        /// Lấy toàn bộ đơn mua gói tập trong hệ thống để quản lý.
        /// Quyền hạn yêu cầu: Manager, Receptionist hoặc Admin.
        /// </summary>
        orders
            .MapGet(
                "/",
                async (PackageCatalogService service, CancellationToken cancellationToken) =>
                {
                    var result = await service.GetOrdersAsync(null, cancellationToken);
                    return Results.Ok(result);
                }
            )
            .RequireAuthorization(policy => policy.RequireRole(OrderManagementRoles));

        /// <summary>
        /// PUT /api/package-orders/{id}/confirm-payment
        /// Xác nhận đơn hàng đã thanh toán (thường dùng khi khách trả tiền mặt tại quầy).
        /// Kích hoạt gói tập tương ứng cho hội viên.
        /// Quyền hạn yêu cầu: Manager, Receptionist hoặc Admin.
        /// </summary>
        orders
            .MapPut(
                "/{id:guid}/confirm-payment",
                async (
                    Guid id,
                    [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] ConfirmPaymentRequest? request,
                    PackageCatalogService service,
                    CancellationToken cancellationToken
                ) =>
                {
                    try
                    {
                        var order = await service.ConfirmPaymentAsync(id, request?.PaymentMethod, cancellationToken);
                        return Results.Ok(order);
                    }
                    catch (PackageCatalogException exception)
                    {
                        return Results.Json(
                            new { message = exception.Message },
                            statusCode: exception.StatusCode
                        );
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole(OrderManagementRoles));

        /// <summary>
        /// PUT /api/package-orders/{id}/cancel
        /// Hủy đơn mua gói tập.
        /// Quyền hạn yêu cầu: Manager, Receptionist hoặc Admin.
        /// </summary>
        orders
            .MapPut(
                "/{id:guid}/cancel",
                async (
                    Guid id,
                    PackageCatalogService service,
                    CancellationToken cancellationToken
                ) =>
                {
                    try
                    {
                        Console.WriteLine($"[CancelOrder] Request to cancel order ID: {id}");
                        var order = await service.CancelOrderAsync(id, cancellationToken);
                        Console.WriteLine($"[CancelOrder] Successfully cancelled order ID: {id}");
                        return Results.Ok(order);
                    }
                    catch (PackageCatalogException exception)
                    {
                        Console.WriteLine($"[CancelOrder Business Error] {exception.Message} ({exception.StatusCode})");
                        return Results.Json(
                            new { message = exception.Message },
                            statusCode: exception.StatusCode
                        );
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[CancelOrder Unexpected Error] {ex}");
                        return Results.BadRequest(new { message = $"Lỗi hủy đơn: {ex.Message}" });
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole(OrderManagementRoles));

        /// <summary>
        /// GET /api/package-orders/access/{sport}
        /// Kiểm tra xem hội viên hiện tại có gói tập còn hiệu lực cho môn thể thao cụ thể hay không (Access Check).
        /// </summary>
        orders
            .MapGet(
                "/access/{sport}",
                async (
                    string sport,
                    HttpContext context,
                    PackageCatalogService service,
                    CancellationToken cancellationToken
                ) =>
                {
                    if (!TryGetUserId(context, out var userId))
                        return Results.Unauthorized();
                    var hasAccess = await service.HasActiveSportAccessAsync(
                        userId,
                        sport,
                        cancellationToken
                    );
                    return Results.Ok(new { hasAccess });
                }
            )
            .RequireAuthorization(policy => policy.RequireRole(MemberRoles));

        /// <summary>
        /// POST /api/package-orders/{id}/report-proof
        /// Hội viên gửi thông tin đối soát / chứng từ thanh toán thủ công (chuyển khoản, tiền mặt tại quầy, quẹt thẻ).
        /// </summary>
        orders
            .MapPost(
                "/{id:guid}/report-proof",
                async (
                    Guid id,
                    [FromBody] ReportPaymentProofRequest request,
                    HttpContext context,
                    SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db,
                    CancellationToken cancellationToken
                ) =>
                {
                    if (!TryGetUserId(context, out var userId))
                        return Results.Unauthorized();

                    var orderIdStr = id.ToString();
                    var method = string.IsNullOrWhiteSpace(request.PaymentMethod) ? "Chuyển khoản" : request.PaymentMethod.Trim();
                    var refCode = string.IsNullOrWhiteSpace(request.ReferenceCode) ? $"MB-{DateTime.UtcNow:HHmmss}" : request.ReferenceCode.Trim();
                    var note = request.Note?.Trim() ?? string.Empty;
                    var amount = request.Amount ?? 0m;

                    try
                    {
                        await db.Database.ExecuteSqlRawAsync(
                            @"INSERT INTO payment_reports (id, user_id, order_id, amount, payment_method, reference_code, note, status, created_at)
                              VALUES (gen_random_uuid(), {0}, {1}, {2}, {3}, {4}, {5}, 'pending', now())",
                            userId, orderIdStr, amount, method, refCode, note);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[ReportProof Error] {ex.Message}");
                    }

                    return Results.Ok(new
                    {
                        success = true,
                        message = "Đã gửi thông tin thanh toán cho nhân viên lễ tân xác nhận đối soát!",
                        referenceCode = refCode,
                        reportedAt = DateTime.UtcNow
                    });
                }
            )
            .RequireAuthorization();
    }

    private static bool TryGetUserId(HttpContext context, out Guid userId) =>
        Guid.TryParse(context.User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);

    public sealed class ReportPaymentProofRequest
    {
        public string? PaymentMethod { get; set; }
        public string? ReferenceCode { get; set; }
        public string? Note { get; set; }
        public decimal? Amount { get; set; }
    }

    public sealed class SetPackageStatusRequest
    {
        public bool IsActive { get; set; }
    }
}
