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

/// <summary>
/// Endpoint quản lý Người dùng và Phân quyền (User & Role Management).
/// Hỗ trợ các chức năng: Xem danh sách người dùng, tạo hội viên mới, tra cứu nhanh hội viên,
/// xem chi tiết hồ sơ, cập nhật vai trò (Role), thay đổi trạng thái kích hoạt, cập nhật thông tin cá nhân và tải ảnh đại diện (Avatar).
/// </summary>
public static class UserEndpoints
{
    /// <summary>
    /// Đăng ký các route quản lý người dùng vào hệ thống.
    /// Nhóm route gốc: /api/users và /api/roles
    /// Yêu cầu xác thực JWT (RequireAuthorization).
    /// </summary>
    /// <param name="app">Đối tượng IEndpointRouteBuilder để định tuyến</param>
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var managerAuth = new AuthorizeAttribute { Roles = "manager,receptionist" };

        var group = app.MapGroup("/api/users").RequireAuthorization();

        /// <summary>
        /// GET /api/users
        /// Lấy toàn bộ danh sách người dùng trong hệ thống (kèm theo môn thể thao phụ trách nếu là HLV).
        /// Quyền hạn yêu cầu: Manager hoặc Receptionist.
        /// </summary>
        group
            .MapGet(
                "/",
                async (IUserService userService, SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db) =>
                {
                    var users = (await userService.GetAllUsersAsync()).ToList();

                    try
                    {
                        await db.Database.OpenConnectionAsync();
                        await using var cmd = db.Database.GetDbConnection().CreateCommand();
                        cmd.CommandText = @"
                            SELECT cs.coach_id, s.name, c.user_id
                            FROM coach_sports cs
                            JOIN sports s ON cs.sport_id = s.id
                            LEFT JOIN coaches c ON cs.coach_id = c.id";

                        var coachSportsMap = new Dictionary<Guid, List<string>>();
                        using var reader = await cmd.ExecuteReaderAsync();
                        while (await reader.ReadAsync())
                        {
                            var coachId = reader.GetGuid(0);
                            var sportName = reader.GetString(1);
                            var userId = reader.IsDBNull(2) ? (Guid?)null : reader.GetGuid(2);

                            if (!coachSportsMap.ContainsKey(coachId))
                                coachSportsMap[coachId] = new List<string>();
                            coachSportsMap[coachId].Add(sportName);

                            if (userId.HasValue)
                            {
                                if (!coachSportsMap.ContainsKey(userId.Value))
                                    coachSportsMap[userId.Value] = new List<string>();
                                coachSportsMap[userId.Value].Add(sportName);
                            }
                        }

                        foreach (var u in users)
                        {
                            if (string.Equals(u.RoleName, "coach", StringComparison.OrdinalIgnoreCase))
                            {
                                if (coachSportsMap.TryGetValue(u.Id, out var sports))
                                {
                                    u.AssignedSports = sports.Distinct().ToList();
                                }
                                else
                                {
                                    u.AssignedSports = new List<string>();
                                }
                            }
                        }
                    }
                    catch { }

                    return Results.Ok(users);
                }
            )
            .RequireAuthorization(managerAuth);

        /// <summary>
        /// POST /api/users/members
        /// Tạo mới hồ sơ hội viên tại quầy.
        /// Quyền hạn yêu cầu: Manager hoặc Receptionist.
        /// </summary>
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

        /// <summary>
        /// GET /api/users/members-lookup
        /// Tra cứu nhanh danh sách hội viên (ID, họ tên, email, SĐT) phục vụ việc tìm kiếm và chọn lựa.
        /// </summary>
        group.MapGet(
            "/members-lookup",
            async (SmartGym.Application.Interfaces.IUserRepository userRepo) =>
            {
                var members = await userRepo.GetMembersLookupAsync();
                return Results.Ok(members);
            }
        );

        /// <summary>
        /// GET /api/users/{id}
        /// Lấy chi tiết thông tin một người dùng theo ID.
        /// Quyền hạn: Chính chủ sở hữu tài khoản, hoặc Manager/Admin/Receptionist.
        /// </summary>
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

        /// <summary>
        /// PUT /api/users/{id}/role
        /// Phân quyền lại hoặc thay đổi vai trò (Role) của một người dùng.
        /// Quyền hạn yêu cầu: Manager hoặc Receptionist.
        /// </summary>
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

        /// <summary>
        /// PUT /api/users/{id}/status
        /// Cập nhật trạng thái kích hoạt/vô hiệu hóa tài khoản (Active/Inactive).
        /// Quyền hạn yêu cầu: Manager hoặc Receptionist.
        /// </summary>
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

        /// <summary>
        /// PUT /api/users/{id}/profile
        /// Cập nhật thông tin hồ sơ người dùng (họ tên, số điện thoại, ngày sinh, địa chỉ...).
        /// Quyền hạn: Chính chủ sở hữu tài khoản, hoặc Manager/Admin.
        /// </summary>
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

        /// <summary>
        /// POST /api/users/{id}/avatar
        /// Tải lên và cập nhật ảnh đại diện (Avatar) cho tài khoản.
        /// Quyền hạn: Chính chủ sở hữu tài khoản, hoặc Manager/Admin.
        /// </summary>
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

        /// <summary>
        /// GET /api/roles
        /// Lấy danh sách tất cả các vai trò (Roles) trong hệ thống.
        /// Quyền hạn yêu cầu: Manager hoặc Receptionist.
        /// </summary>
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
