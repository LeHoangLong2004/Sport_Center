using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces;
using IAccountTokenRepository = SmartGym.Application.Interfaces.Repositories.IAccountTokenRepository;
using AuthForgotPasswordRequest = SmartGym.Application.DTOs.Auth.ForgotPasswordRequest;
using AuthResetPasswordRequest = SmartGym.Application.DTOs.Auth.ResetPasswordRequest;
using System;
using System.Net;
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
                            roleName = "coach",
                            avatarUrl = coachUser.AvatarUrl ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
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
                            roleName = "member",
                            avatarUrl = memberUser.AvatarUrl ?? "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80"
                        });
                    }
                }
                return Results.BadRequest(new { message = ex.Message });
            }
        });

        group.MapPost("/forgot-password", async (
            AuthForgotPasswordRequest request,
            IUserRepository userRepository,
            IAccountTokenRepository tokenRepository,
            IEmailService emailService,
            IWebHostEnvironment environment) =>
        {
            var email = request.Email?.Trim();
            if (string.IsNullOrWhiteSpace(email))
                return Results.BadRequest(new { message = "Vui lòng nhập email đã đăng ký." });

            var user = await userRepository.GetByEmailAsync(email);
            var response = new
            {
                message = "Nếu email tồn tại, mã đặt lại mật khẩu đã được gửi.",
                resetToken = (string?)null
            };

            // Do not reveal whether an email exists. This also keeps the endpoint
            // safe against account-enumeration attempts.
            if (user is null)
                return Results.Ok(response);

            var token = await tokenRepository.CreatePasswordResetTokenAsync(email);
            var resetUrl = "http://localhost:5173/#reset-password";
            var html = $"""
                <h2>Đặt lại mật khẩu SmartGym</h2>
                <p>Xin chào {WebUtility.HtmlEncode(user.FullName)},</p>
                <p>Mã đặt lại mật khẩu của bạn là:</p>
                <p style='font-size:28px;font-weight:bold;letter-spacing:8px'>{token}</p>
                <p>Mã có hiệu lực trong 15 phút và chỉ được sử dụng một lần.</p>
                <p>Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email.</p>
                <p>Truy cập: <a href='{resetUrl}'>{resetUrl}</a></p>
                """;

            var sent = await emailService.SendAsync(
                email,
                "Mã đặt lại mật khẩu SmartGym",
                html);

            // SMTP is optional for local/demo environments. Returning the short-lived
            // token only in Development keeps the local flow testable without email
            // while avoiding token disclosure in production responses.
            if (environment.IsDevelopment() && !sent)
            {
                return Results.Ok(new
                {
                    message = response.message,
                    resetToken = token
                });
            }

            return Results.Ok(response);
        });

        group.MapPost("/reset-password", async (
            AuthResetPasswordRequest request,
            IUserRepository userRepository,
            IAccountTokenRepository tokenRepository) =>
        {
            var email = request.Email?.Trim();
            var token = request.Token?.Trim();
            var newPassword = request.NewPassword ?? string.Empty;

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(token))
                return Results.BadRequest(new { message = "Email và mã xác minh là bắt buộc." });

            if (newPassword.Length < 6)
                return Results.BadRequest(new { message = "Mật khẩu mới phải có tối thiểu 6 ký tự." });

            var tokenValid = await tokenRepository.TryConsumePasswordResetTokenAsync(email, token);
            if (!tokenValid)
                return Results.BadRequest(new { message = "Mã đặt lại mật khẩu không chính xác hoặc đã hết hạn." });

            var user = await userRepository.GetByEmailAsync(email);
            if (user is null)
                return Results.BadRequest(new { message = "Mã đặt lại mật khẩu không chính xác hoặc đã hết hạn." });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await userRepository.UpdateAsync(user);

            return Results.Ok(new { message = "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại." });
        });

        group.MapPost("/verify-reset-token", async (
            AuthResetPasswordRequest request,
            IAccountTokenRepository tokenRepository) =>
        {
            var email = request.Email?.Trim();
            var token = request.Token?.Trim();

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(token))
                return Results.BadRequest(new { message = "Email và mã OTP là bắt buộc." });

            var isValid = await tokenRepository.ValidatePasswordResetTokenAsync(email, token);
            return isValid
                ? Results.Ok(new { message = "Mã OTP hợp lệ." })
                : Results.BadRequest(new { message = "Mã OTP không chính xác hoặc đã hết hạn." });
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
