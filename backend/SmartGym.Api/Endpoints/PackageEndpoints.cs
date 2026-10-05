using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;

namespace SmartGym.Api.Endpoints;

public static class PackageEndpoints
{
    public static void MapPackageEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/packages");

        var managerAuth = new AuthorizeAttribute { Roles = "manager" };

        // Mọi người đều xem được danh sách gói
        group.MapGet("/", async (IPackageService packageService) =>
        {
            var packages = await packageService.GetAllPackagesAsync();
            return Results.Ok(packages);
        });

        // Mọi người đều xem được chi tiết gói
        group.MapGet("/{id}", async (string id, IPackageService packageService) =>
        {
            var package = await packageService.GetPackageByIdAsync(id);
            if (package == null) return Results.NotFound();
            return Results.Ok(package);
        });

        // CHỈ MANAGER mới được tạo gói tập mới
        group.MapPost("/", async ([FromBody] CreatePackageRequest request, IPackageService packageService) =>
        {
            var created = await packageService.CreatePackageAsync(request);
            return Results.Created($"/api/packages/{created.Id}", created);
        }).RequireAuthorization(managerAuth); 

        // CHỈ MANAGER mới được xóa gói tập
        group.MapDelete("/{id}", async (string id, IPackageService packageService) =>
        {
            var success = await packageService.DeletePackageAsync(id);
            if (!success) return Results.NotFound();
            return Results.NoContent();
        }).RequireAuthorization(managerAuth); 
    }
}
