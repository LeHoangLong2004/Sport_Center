using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces;
using System;

using Microsoft.AspNetCore.Authorization;

namespace SmartGym.Api.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        // Nhóm API quản lý tài khoản: CHỈ MANAGER MỚI CÓ QUYỀN TRUY CẬP
        var managerAuth = new AuthorizeAttribute { Roles = "manager" };

        var group = app.MapGroup("/api/users").RequireAuthorization(managerAuth);

        group.MapGet("/", async (IUserService userService) =>
        {
            var users = await userService.GetAllUsersAsync();
            return Results.Ok(users);
        });

        group.MapGet("/{id:guid}", async (Guid id, IUserService userService) =>
        {
            var user = await userService.GetUserByIdAsync(id);
            if (user == null) return Results.NotFound();
            return Results.Ok(user);
        });

        group.MapPut("/{id:guid}/role", async (Guid id, [FromBody] UpdateUserRoleRequest request, IUserService userService) =>
        {
            try
            {
                var success = await userService.UpdateUserRoleAsync(id, request.RoleId);
                if (!success) return Results.NotFound("User not found.");
                return Results.Ok("User role updated successfully.");
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ex.Message);
            }
        });

        group.MapPut("/{id:guid}/status", async (Guid id, [FromBody] UpdateUserStatusRequest request, IUserService userService) =>
        {
            var success = await userService.UpdateUserStatusAsync(id, request.Status);
            if (!success) return Results.NotFound("User not found.");
            return Results.Ok($"User status updated to {(request.Status ? "Active" : "Inactive")}.");
        });

        group.MapPut("/{id:guid}/profile", async (Guid id, [FromBody] UpdateUserProfileRequest request, IUserService userService) =>
        {
            var success = await userService.UpdateUserProfileAsync(id, request);
            if (!success) return Results.NotFound("User not found.");
            return Results.Ok("User profile updated successfully.");
        });

        var roleGroup = app.MapGroup("/api/roles").RequireAuthorization(managerAuth);

        roleGroup.MapGet("/", async (IUserService userService) =>
        {
            var roles = await userService.GetAllRolesAsync();
            return Results.Ok(roles);
        });
    }
}
