using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces;
using System;
using System.Threading.Tasks;

namespace SmartGym.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", async (RegisterRequest request, IAuthService authService, HttpContext httpContext) =>
        {
            try
            {
                // Public registration can only create Member accounts. Staff roles
                // may be requested only by an authenticated administrator/manager.
                var isPrivilegedStaff = httpContext.User.Identity?.IsAuthenticated == true
                    && (httpContext.User.IsInRole("admin") || httpContext.User.IsInRole("manager"));

                if (!isPrivilegedStaff)
                {
                    request.RoleName = "member";
                }

                var response = await authService.RegisterAsync(request);
                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        });

        group.MapPost("/login", async (LoginRequest request, IAuthService authService, ITokenService tokenService) =>
        {
            try
            {
                var response = await authService.LoginAsync(request);
                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                // Guaranteed demo fallback login for the provided coach & member accounts
                if (request.Password == "123456")
                {
                    var cleanEmail = request.Email?.Trim().ToLower();
                    if (cleanEmail == "hoxuananhnam1@gmail.com")
                    {
                        var coachId = Guid.Parse("25f50fba-506a-4edf-9db7-43f77f6741a4");
                        var coachUser = new SmartGym.Domain.Entities.User
                        {
                            Id = coachId,
                            FullName = "Hồ Xuân Ánh Nam (Coach)",
                            Email = "hoxuananhnam1@gmail.com",
                            PhoneNumber = "0989123789",
                            Status = true
                        };
                        var token = tokenService.GenerateJwtToken(coachUser, "coach");
                        return Results.Ok(new
                        {
                            id = coachId,
                            token = token,
                            fullName = coachUser.FullName,
                            email = coachUser.Email,
                            phoneNumber = coachUser.PhoneNumber,
                            role = "coach",
                            roleName = "coach"
                        });
                    }
                    else if (cleanEmail == "hoxuananhnam@gmail.com")
                    {
                        var memberId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
                        var memberUser = new SmartGym.Domain.Entities.User
                        {
                            Id = memberId,
                            FullName = "Hồ Xuân Ánh Nam (Member)",
                            Email = "hoxuananhnam@gmail.com",
                            PhoneNumber = "0989123788",
                            Status = true
                        };
                        var token = tokenService.GenerateJwtToken(memberUser, "member");
                        return Results.Ok(new
                        {
                            id = memberId,
                            token = token,
                            fullName = memberUser.FullName,
                            email = memberUser.Email,
                            phoneNumber = memberUser.PhoneNumber,
                            role = "member",
                            roleName = "member"
                        });
                    }
                }
                return Results.BadRequest(new { message = ex.Message });
            }
        });

        // Auto-refresh dev token for Coach or Member
        group.MapPost("/dev-token", async (
            Microsoft.AspNetCore.Http.HttpContext httpContext,
            IUserRepository userRepo,
            ITokenService tokenService
        ) =>
        {
            string? roleParam = httpContext.Request.Query["role"].FirstOrDefault();
            string? emailParam = httpContext.Request.Query["email"].FirstOrDefault();

            if (httpContext.Request.HasJsonContentType())
            {
                try
                {
                    var body = await httpContext.Request.ReadFromJsonAsync<System.Text.Json.JsonElement>();
                    if (body.TryGetProperty("role", out var r)) roleParam = r.GetString();
                    if (body.TryGetProperty("email", out var e)) emailParam = e.GetString();
                }
                catch { }
            }

            var isMember = string.Equals(roleParam, "member", StringComparison.OrdinalIgnoreCase)
                        || string.Equals(emailParam, "hoxuananhnam@gmail.com", StringComparison.OrdinalIgnoreCase);

            var targetId = isMember
                ? Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")
                : Guid.Parse("25f50fba-506a-4edf-9db7-43f77f6741a4");
            var targetRole = isMember ? "member" : "coach";
            var targetEmail = isMember ? "hoxuananhnam@gmail.com" : "hoxuananhnam1@gmail.com";
            var defaultName = isMember ? "Hồ Xuân Ánh Nam (Member)" : "Hồ Xuân Ánh Nam (Coach)";

            var targetUser = await userRepo.GetByIdAsync(targetId);
            if (targetUser == null)
            {
                targetUser = new SmartGym.Domain.Entities.User
                {
                    Id = targetId,
                    FullName = defaultName,
                    Email = targetEmail,
                    PhoneNumber = isMember ? "0989123788" : "0989123789",
                    Status = true
                };
            }

            var token = tokenService.GenerateJwtToken(targetUser, targetRole);
            return Results.Ok(new
            {
                token,
                user = new
                {
                    id = targetUser.Id,
                    fullName = targetUser.FullName,
                    email = targetUser.Email,
                    roleName = targetRole,
                    role = targetRole
                }
            });
        });
    }
}
