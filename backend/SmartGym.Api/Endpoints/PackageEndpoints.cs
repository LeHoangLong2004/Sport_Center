using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Endpoint quản lý Gói tập (Gym & Fitness Packages CRUD).
/// Hỗ trợ: Xem danh sách gói tập, xem chi tiết gói tập, tạo gói mới (Manager), cập nhật và vô hiệu hóa gói tập.
/// </summary>
public static class PackageEndpoints
{
    /// <summary>
    /// Đăng ký các route quản lý gói tập vào hệ thống định tuyến.
    /// Nhóm route gốc: /api/packages
    /// </summary>
    /// <param name="app">Đối tượng IEndpointRouteBuilder</param>
    public static void MapPackageEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/packages");

        var managerAuth = new AuthorizeAttribute { Roles = "manager" };

        /// <summary>
        /// GET /api/packages
        /// Lấy toàn bộ danh sách gói tập trong hệ thống.
        /// Không yêu cầu đăng nhập.
        /// </summary>
        group.MapGet(
            "/",
            async (IPackageService packageService) =>
            {
                var packages = await packageService.GetAllPackagesAsync();
                return Results.Ok(packages);
            }
        );

        /// <summary>
        /// GET /api/packages/{id}
        /// Lấy thông tin chi tiết một gói tập theo ID.
        /// Không yêu cầu đăng nhập.
        /// </summary>
        group.MapGet(
            "/{id}",
            async (string id, IPackageService packageService) =>
            {
                var package = await packageService.GetPackageByIdAsync(id);
                if (package == null)
                    return Results.NotFound();
                return Results.Ok(package);
            }
        );

        /// <summary>
        /// POST /api/packages
        /// Tạo mới một gói tập (tên gói, giá tháng, số buổi, quyền truy cập).
        /// Quyền hạn yêu cầu: Manager.
        /// </summary>
        group
            .MapPost(
                "/",
                async ([FromBody] CreatePackageRequest request, IPackageService packageService) =>
                {
                    var created = await packageService.CreatePackageAsync(request);
                    return Results.Created($"/api/packages/{created.Id}", created);
                }
            )
            .RequireAuthorization(managerAuth);

        /// <summary>
        /// PUT /api/packages/{id}
        /// Cập nhật thông tin gói tập hiện có.
        /// Quyền hạn yêu cầu: Manager.
        /// </summary>
        group
            .MapPut(
                "/{id}",
                async (
                    string id,
                    [FromBody] CreatePackageRequest request,
                    IPackageService packageService
                ) =>
                {
                    var updated = await packageService.UpdatePackageAsync(id, request);
                    if (updated == null)
                        return Results.NotFound();
                    return Results.Ok(updated);
                }
            )
            .RequireAuthorization(managerAuth);

        /// <summary>
        /// DELETE /api/packages/{id}
        /// Khóa hoặc xóa mềm gói tập khỏi hệ thống.
        /// Quyền hạn yêu cầu: Manager.
        /// </summary>
        group
            .MapDelete(
                "/{id}",
                async (string id, IPackageService packageService) =>
                {
                    var success = await packageService.DeletePackageAsync(id);
                    if (!success)
                        return Results.NotFound();
                    return Results.NoContent();
                }
            )
            .RequireAuthorization(managerAuth);
    }
}
