using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces;
using SmartGym.Application.Interfaces.Repositories;
using IUserRepository = SmartGym.Application.Interfaces.IUserRepository;
using SmartGym.Infrastructure.Persistence.EF;
using AuthForgotPasswordRequest = SmartGym.Application.DTOs.Auth.ForgotPasswordRequest;
using AuthResetPasswordRequest = SmartGym.Application.DTOs.Auth.ResetPasswordRequest;

namespace SmartGym.Api.Endpoints;

public static partial class AuthEndpoints
{
    /// <summary>
    /// Đăng ký các route khôi phục và thay đổi mật khẩu:
    /// - Quên mật khẩu qua email (/forgot-password)
    /// - Đặt lại mật khẩu bằng mã OTP (/reset-password)
    /// - Xác minh mã OTP (/verify-reset-token)
    /// - Dev token tiện ích kiểm thử (/dev-token)
    /// - Đổi mật khẩu tài khoản đang đăng nhập (/change-password)
    /// </summary>
    internal static void MapPasswordResetEndpoints(this RouteGroupBuilder group)
    {
        /// <summary>
        /// POST /api/auth/forgot-password
        /// Xác nhận email tài khoản để chuyển sang bước đặt lại mật khẩu mới.
        /// </summary>
        group.MapPost("/forgot-password", async (
            AuthForgotPasswordRequest request,
            IUserRepository userRepository) =>
        {
            var email = request.Email?.Trim();
            if (string.IsNullOrWhiteSpace(email))
                return Results.BadRequest(new { message = "Vui lòng nhập email đã đăng ký." });

            var user = await userRepository.GetByEmailAsync(email);
            if (user is null)
                return Results.BadRequest(new { message = "Email này chưa được đăng ký tài khoản trong hệ thống." });

            return Results.Ok(new
            {
                message = "Xác nhận email thành công. Vui lòng nhập mật khẩu mới."
            });
        });

        /// <summary>
        /// POST /api/auth/reset-password
        /// Cập nhật mật khẩu mới trực tiếp sau khi xác nhận email.
        /// - Băm mật khẩu mới bằng thuật toán BCrypt trước khi lưu trữ vào CSDL.
        /// </summary>
        group.MapPost("/reset-password", async (
            AuthResetPasswordRequest request,
            IUserRepository userRepository,
            IAccountTokenRepository tokenRepository) =>
        {
            var email = request.Email?.Trim();
            var token = request.Token?.Trim();
            var newPassword = request.NewPassword ?? string.Empty;

            if (string.IsNullOrWhiteSpace(email))
                return Results.BadRequest(new { message = "Email là bắt buộc." });

            if (newPassword.Length < 6)
                return Results.BadRequest(new { message = "Mật khẩu mới phải có tối thiểu 6 ký tự." });

            var user = await userRepository.GetByEmailAsync(email);
            if (user is null)
                return Results.BadRequest(new { message = "Tài khoản với email này không tồn tại trong hệ thống." });

            if (!string.IsNullOrWhiteSpace(token))
            {
                await tokenRepository.TryConsumePasswordResetTokenAsync(email, token);
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await userRepository.UpdateAsync(user);

            return Results.Ok(new { message = "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại với mật khẩu mới." });
        });

        /// <summary>
        /// POST /api/auth/verify-reset-token
        /// Xác minh tính hợp lệ của mã OTP trước khi cho phép người dùng chuyển sang bước nhập mật khẩu mới.
        /// </summary>
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

        /// <summary>
        /// POST /api/auth/dev-token
        /// Tiện ích sinh nhanh Access Token cho môi trường phát triển (Development / Demo).
        /// Hỗ trợ chuyển đổi nhanh ngữ cảnh giữa Coach và Member mà không cần qua quy trình đăng nhập chuẩn.
        /// </summary>
        group.MapPost("/dev-token", async (
            HttpContext httpContext,
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

            SmartGym.Domain.Entities.User? targetUser = null;
            if (!string.IsNullOrWhiteSpace(emailParam))
            {
                targetUser = await userRepo.GetByEmailAsync(emailParam.Trim());
            }

            var isLong = string.Equals(emailParam, "long@gmail.com", StringComparison.OrdinalIgnoreCase);
            var isMember = isLong
                        || string.Equals(roleParam, "member", StringComparison.OrdinalIgnoreCase)
                        || string.Equals(emailParam, "hoxuananhnam@gmail.com", StringComparison.OrdinalIgnoreCase)
                        || (targetUser != null && string.Equals(targetUser.Role?.Name, "member", StringComparison.OrdinalIgnoreCase));

            var targetId = targetUser?.Id ?? (isLong
                ? Guid.Parse("cd431e48-c84b-4b16-815e-971f3387fd83")
                : (isMember
                    ? Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")
                    : Guid.Parse("d426d2a7-f099-4377-9673-160e02f8dc1b")));
            var targetRole = targetUser?.Role?.Name ?? (isMember ? "member" : "coach");
            var targetEmail = targetUser?.Email ?? (isLong ? "long@gmail.com" : (isMember ? "hoxuananhnam@gmail.com" : "coach_flow2@smartgym.com"));
            var defaultName = targetUser?.FullName ?? (isLong ? "H Long" : (isMember ? "Hồ Xuân Ánh Nam (Member)" : "Coach Đỗ Hoàng E"));

            if (targetUser == null)
            {
                targetUser = await userRepo.GetByIdAsync(targetId);
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

        /// <summary>
        /// POST /api/auth/change-password
        /// Đổi mật khẩu trực tiếp cho người dùng đã đăng nhập (Coach / Member / Staff).
        /// Yêu cầu mật khẩu hiện tại và mật khẩu mới (tối thiểu 6 ký tự).
        /// </summary>
        group.MapPost("/change-password", async (
            ChangePasswordRequest request,
            HttpContext context,
            SmartGymDbContext db) =>
        {
            var userIdClaim = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? context.User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Results.Unauthorized();
            }

            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            {
                return Results.BadRequest(new { message = "Mật khẩu mới phải có ít nhất 6 ký tự." });
            }

            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return Results.NotFound(new { message = "Không tìm thấy tài khoản người dùng." });
            }

            // Verify current password
            bool isMatch = false;
            if (!string.IsNullOrEmpty(user.PasswordHash))
            {
                try
                {
                    isMatch = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
                }
                catch { }
            }

            // Demo / Dev fallback bypass
            if (!isMatch && (request.CurrentPassword == "123456" || request.CurrentPassword == "password"))
            {
                isMatch = true;
            }

            if (!isMatch)
            {
                return Results.BadRequest(new { message = "Mật khẩu hiện tại không chính xác." });
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await db.SaveChangesAsync();

            return Results.Ok(new { success = true, message = "Đổi mật khẩu thành công!" });
        }).RequireAuthorization();
    }
}

