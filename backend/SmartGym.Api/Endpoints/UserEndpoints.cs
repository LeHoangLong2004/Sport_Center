using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces;

namespace SmartGym.Api.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var managerAuth = new AuthorizeAttribute { Roles = "manager,receptionist" };

        var group = app.MapGroup("/api/users").RequireAuthorization();

        group
            .MapGet(
                "/",
                async (IUserService userService) =>
                {
                    var users = await userService.GetAllUsersAsync();
                    return Results.Ok(users);
                }
            )
            .RequireAuthorization(managerAuth);

        group
            .MapPost(
                "/members",
                async ([FromBody] CreateMemberRequest request, IUserService userService) =>
                {
                    try
                    {
                        var member = await userService.CreateMemberAsync(request);
                        return Results.Created($"/api/users/{member.Id}", member);
                    }
                    catch (ArgumentException ex)
                    {
                        return Results.BadRequest(new { message = ex.Message });
                    }
                    catch (InvalidOperationException ex)
                    {
                        return Results.Conflict(new { message = ex.Message });
                    }
                }
            )
            .RequireAuthorization(managerAuth);

        group.MapGet(
            "/members-lookup",
            async (SmartGym.Application.Interfaces.IUserRepository userRepo) =>
            {
                var members = await userRepo.GetMembersLookupAsync();
                return Results.Ok(members);
            }
        );
        group.MapGet(
            "/{id:guid}",
            async (Guid id, HttpContext context, IUserService userService) =>
            {
                var role = context.User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value
                           ?? context.User.FindFirst("role")?.Value;
                var userId = context
                    .User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                    ?.Value
                    ?? context.User.FindFirst("sub")?.Value;

                var isManager = string.Equals(role, "manager", StringComparison.OrdinalIgnoreCase)
                              || string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase)
                              || string.Equals(role, "receptionist", StringComparison.OrdinalIgnoreCase);
                var isSelf = string.Equals(userId, id.ToString(), StringComparison.OrdinalIgnoreCase);

                if (!isManager && !isSelf && !string.IsNullOrEmpty(userId))
                {
                    return Results.Forbid();
                }

                var user = await userService.GetUserByIdAsync(id);
                if (user == null)
                    return Results.NotFound();
                return Results.Ok(user);
            }
        );

        group
            .MapPut(
                "/{id:guid}/role",
                async (
                    Guid id,
                    [FromBody] UpdateUserRoleRequest request,
                    IUserService userService
                ) =>
                {
                    try
                    {
                        var success = await userService.UpdateUserRoleAsync(id, request.RoleId);
                        if (!success)
                            return Results.NotFound("User not found.");
                        return Results.Ok("User role updated successfully.");
                    }
                    catch (Exception ex)
                    {
                        return Results.BadRequest(ex.Message);
                    }
                }
            )
            .RequireAuthorization(managerAuth);

        group
            .MapPut(
                "/{id:guid}/status",
                async (
                    Guid id,
                    [FromBody] UpdateUserStatusRequest request,
                    IUserService userService
                ) =>
                {
                    var success = await userService.UpdateUserStatusAsync(id, request.Status);
                    if (!success)
                        return Results.NotFound("User not found.");
                    return Results.Ok(
                        $"User status updated to {(request.Status ? "Active" : "Inactive")}."
                    );
                }
            )
            .RequireAuthorization(managerAuth);

        group.MapPut(
            "/{id:guid}/profile",
            async (
                Guid id,
                HttpContext context,
                [FromBody] UpdateUserProfileRequest request,
                IUserService userService
            ) =>
            {
                var role = context.User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value
                           ?? context.User.FindFirst("role")?.Value;
                var userId = context
                    .User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                    ?.Value
                    ?? context.User.FindFirst("sub")?.Value;

                var isManager = string.Equals(role, "manager", StringComparison.OrdinalIgnoreCase)
                             || string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase);
                var isSelf = string.Equals(userId, id.ToString(), StringComparison.OrdinalIgnoreCase);

                if (!isManager && !isSelf && !string.IsNullOrEmpty(userId))
                {
                    return Results.Forbid();
                }

                try
                {
                    var success = await userService.UpdateUserProfileAsync(id, request);
                    if (!success)
                        return Results.NotFound("User not found.");
                    return Results.Ok(new { message = "User profile updated successfully." });
                }
                catch (InvalidOperationException ex)
                {
                    return Results.Conflict(new { message = ex.Message });
                }
                catch (DbUpdateException)
                {
                    return Results.Conflict(new { message = "Email hoặc số điện thoại đã được sử dụng bởi tài khoản khác." });
                }
            }
        );

        group.MapPost(
            "/{id:guid}/avatar",
            async (
                Guid id,
                HttpContext context,
                IFormFile file,
                IUserService userService,
                IPhotoService photoService
            ) =>
            {
                var role = context.User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value
                           ?? context.User.FindFirst("role")?.Value;
                var userId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                           ?? context.User.FindFirst("sub")?.Value;
                var isManager = string.Equals(role, "manager", StringComparison.OrdinalIgnoreCase)
                             || string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase);
                var isSelf = string.Equals(userId, id.ToString(), StringComparison.OrdinalIgnoreCase);

                if (!isManager && !isSelf)
                    return Results.Forbid();

                if (file == null || file.Length == 0)
                    return Results.BadRequest(new { message = "Vui lòng chọn ảnh đại diện." });
                if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                    return Results.BadRequest(new { message = "Chỉ được tải lên file hình ảnh." });
                if (file.Length > 5 * 1024 * 1024)
                    return Results.BadRequest(new { message = "Ảnh đại diện không được vượt quá 5MB." });

                await using var stream = file.OpenReadStream();
                var (success, url, errorMessage) = await photoService.UploadImageAsync(
                    stream,
                    file.FileName,
                    "avatars"
                );
                if (!success || string.IsNullOrWhiteSpace(url))
                    return Results.BadRequest(new { message = errorMessage ?? "Tải ảnh đại diện thất bại." });

                var publicUrl = Uri.TryCreate(url, UriKind.Absolute, out _)
                    ? url
                    : $"{context.Request.Scheme}://{context.Request.Host}/{url.TrimStart('/')}";

                var updated = await userService.UpdateUserProfileAsync(id, new UpdateUserProfileRequest
                {
                    AvatarUrl = publicUrl,
                });
                if (!updated)
                    return Results.NotFound(new { message = "Không tìm thấy tài khoản." });

                return Results.Ok(new { url = publicUrl });
            }
        ).DisableAntiforgery();

        var roleGroup = app.MapGroup("/api/roles").RequireAuthorization(managerAuth);

        roleGroup.MapGet(
            "/",
            async (IUserService userService) =>
            {
                var roles = await userService.GetAllRolesAsync();
                return Results.Ok(roles);
            }
        );
    }
}
