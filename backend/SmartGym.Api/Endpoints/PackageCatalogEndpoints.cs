using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using SmartGym.Api.Services;
using SmartGym.Application.DTOs;

namespace SmartGym.Api.Endpoints;

public static class PackageCatalogEndpoints
{
    private static readonly string[] ManagerRoles = ["manager", "CenterManager", "center_manager"];
    private static readonly string[] MemberRoles = ["member", "Member"];

    public static void MapPackageCatalogEndpoints(this IEndpointRouteBuilder app)
    {
        var catalog = app.MapGroup("/api/package-catalog").WithTags("Package catalog");

        catalog.MapGet("/", async (HttpContext context, PackageCatalogService service, CancellationToken cancellationToken) =>
        {
            var role = context.User.FindFirstValue(ClaimTypes.Role);
            var includeInactive = role is not null && ManagerRoles.Contains(role, StringComparer.OrdinalIgnoreCase);
            var packages = await service.GetCatalogAsync(includeInactive, cancellationToken);
            return Results.Ok(packages);
        });

        catalog.MapPost("/", async (
            [FromBody] CatalogPackageDto request,
            PackageCatalogService service,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var created = await service.SaveCatalogPackageAsync(request.Id, request, create: true, cancellationToken);
                return Results.Created($"/api/package-catalog/{created.Id}", created);
            }
            catch (PackageCatalogException exception)
            {
                return Results.Json(new { message = exception.Message }, statusCode: exception.StatusCode);
            }
        }).RequireAuthorization(policy => policy.RequireRole(ManagerRoles));

        catalog.MapPut("/{id}", async (
            string id,
            [FromBody] CatalogPackageDto request,
            PackageCatalogService service,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var updated = await service.SaveCatalogPackageAsync(id, request, create: false, cancellationToken);
                return Results.Ok(updated);
            }
            catch (PackageCatalogException exception)
            {
                return Results.Json(new { message = exception.Message }, statusCode: exception.StatusCode);
            }
        }).RequireAuthorization(policy => policy.RequireRole(ManagerRoles));

        catalog.MapPatch("/{id}/status", async (
            string id,
            [FromBody] SetPackageStatusRequest request,
            PackageCatalogService service,
            CancellationToken cancellationToken) =>
        {
            try
            {
                await service.SetPackageStatusAsync(id, request.IsActive, cancellationToken);
                return Results.NoContent();
            }
            catch (PackageCatalogException exception)
            {
                return Results.Json(new { message = exception.Message }, statusCode: exception.StatusCode);
            }
        }).RequireAuthorization(policy => policy.RequireRole(ManagerRoles));

        var orders = app.MapGroup("/api/package-orders").WithTags("Package orders");

        orders.MapGet("/me", async (
            HttpContext context,
            PackageCatalogService service,
            CancellationToken cancellationToken) =>
        {
            if (!TryGetUserId(context, out var userId))
                return Results.Unauthorized();
            var result = await service.GetOrdersAsync(userId, cancellationToken);
            return Results.Ok(result);
        }).RequireAuthorization(policy => policy.RequireRole(MemberRoles));

        orders.MapPost("/", async (
            HttpContext context,
            [FromBody] CreatePackageOrderRequest request,
            PackageCatalogService service,
            CancellationToken cancellationToken) =>
        {
            if (!TryGetUserId(context, out var userId))
                return Results.Unauthorized();
            try
            {
                var order = await service.CreateOrderAsync(userId, request, cancellationToken);
                return Results.Created($"/api/package-orders/{order.Id}", order);
            }
            catch (PackageCatalogException exception)
            {
                return Results.Json(new { message = exception.Message }, statusCode: exception.StatusCode);
            }
        }).RequireAuthorization(policy => policy.RequireRole(MemberRoles));

        orders.MapGet("/", async (
            PackageCatalogService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.GetOrdersAsync(null, cancellationToken);
            return Results.Ok(result);
        }).RequireAuthorization(policy => policy.RequireRole(ManagerRoles));

        orders.MapPut("/{id:guid}/confirm-payment", async (
            Guid id,
            PackageCatalogService service,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var order = await service.ConfirmPaymentAsync(id, cancellationToken);
                return Results.Ok(order);
            }
            catch (PackageCatalogException exception)
            {
                return Results.Json(new { message = exception.Message }, statusCode: exception.StatusCode);
            }
        }).RequireAuthorization(policy => policy.RequireRole(ManagerRoles));

        orders.MapGet("/access/{sport}", async (
            string sport,
            HttpContext context,
            PackageCatalogService service,
            CancellationToken cancellationToken) =>
        {
            if (!TryGetUserId(context, out var userId))
                return Results.Unauthorized();
            var hasAccess = await service.HasActiveSportAccessAsync(userId, sport, cancellationToken);
            return Results.Ok(new { hasAccess });
        }).RequireAuthorization(policy => policy.RequireRole(MemberRoles));
    }

    private static bool TryGetUserId(HttpContext context, out Guid userId) =>
        Guid.TryParse(context.User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);

    public sealed class SetPackageStatusRequest
    {
        public bool IsActive { get; set; }
    }
}
