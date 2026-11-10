using System;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Api.Endpoints;

public static partial class SportFacilityEndpoints
{
    /// <summary>
    /// Đăng ký các route CRUD cho bộ môn thể thao (/api/sports).
    /// </summary>
    private static void MapSportEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/sports").WithTags("Sports");

        /// <summary>
        /// GET /api/sports
        /// Lấy danh sách toàn bộ các môn thể thao tại trung tâm (Yoga, Gym, Boxing, Bơi lội...).
        /// Không yêu cầu đăng nhập.
        /// </summary>
        group.MapGet("", async (global::Supabase.Client client) =>
        {
            var response = await client.From<SportModel>().Get();
            return Results.Ok(response.Models.Select(s => new
            {
                id = s.Id,
                name = s.Name,
                imageUrl = s.ImageUrl,
                description = s.Description,
            }));
        });

        /// <summary>
        /// POST /api/sports
        /// Thêm mới một môn thể thao vào hệ thống.
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
        group.MapPost("", async (SportSaveRequest request, global::Supabase.Client client) =>
        {
            var model = new SportModel
            {
                Id = Guid.NewGuid(),
                Name = request.Name?.Trim() ?? string.Empty,
                ImageUrl = request.ImageUrl,
                Description = request.Description,
            };
            var insertResponse = await client.From<SportModel>().Insert(model);
            var created = insertResponse.Models.FirstOrDefault() ?? model;
            return Results.Ok(new
            {
                id = created.Id,
                name = created.Name,
                imageUrl = created.ImageUrl,
                description = created.Description,
            });
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        /// <summary>
        /// PUT /api/sports/{id}
        /// Cập nhật thông tin một môn thể thao (tên, ảnh, mô tả).
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
        group.MapPut("/{id:guid}", async (Guid id, SportSaveRequest request, global::Supabase.Client client) =>
        {
            var response = await client.From<SportModel>().Where(s => s.Id == id).Get();
            var existing = response.Models.FirstOrDefault();

            // Fallback cứu hộ: nếu không tìm thấy theo id (do lệch ID client vs DB), tìm theo tên bộ môn
            if (existing == null && !string.IsNullOrWhiteSpace(request.Name))
            {
                var nameResponse = await client.From<SportModel>().Where(s => s.Name == request.Name.Trim()).Get();
                existing = nameResponse.Models.FirstOrDefault();
            }

            if (existing == null)
                return Results.NotFound(new { message = "Không tìm thấy bộ môn." });

            if (!string.IsNullOrWhiteSpace(request.Name))
                existing.Name = request.Name.Trim();
            if (request.ImageUrl != null)
                existing.ImageUrl = request.ImageUrl;
            if (request.Description != null)
                existing.Description = request.Description;

            await client.From<SportModel>().Update(existing);
            return Results.Ok(new
            {
                id = existing.Id,
                name = existing.Name,
                imageUrl = existing.ImageUrl,
                description = existing.Description,
            });
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        /// <summary>
        /// DELETE /api/sports/{id}
        /// Xóa một môn thể thao khỏi hệ thống (kiểm tra ràng buộc không có lớp học nào đang dùng).
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
        group.MapDelete("/{id:guid}", async (Guid id, global::Supabase.Client client) =>
        {
            var classCheck = await client.From<GroupClassModel>().Where(c => c.SportId == id).Get();
            if (classCheck.Models.Any())
            {
                return Results.BadRequest(new { message = "Không thể xóa bộ môn này vì đang có lớp học thuộc bộ môn." });
            }

            try
            {
                await client.From<SportModel>().Where(s => s.Id == id).Delete();
                return Results.Ok(new { message = "Đã xóa bộ môn thành công." });
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { message = $"Không thể xóa bộ môn do ràng buộc dữ liệu: {ex.Message}" });
            }
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));
    }
}

public record SportSaveRequest(string Name, string? ImageUrl, string? Description);

