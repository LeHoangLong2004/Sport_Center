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
    /// Đăng ký các route CRUD cho cơ sở vật chất / phòng tập (/api/facilities).
    /// </summary>
    private static void MapFacilityEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/facilities").WithTags("Facilities");

        /// <summary>
        /// GET /api/facilities
        /// Lấy danh sách tất cả các phòng tập, sân tập (Cơ sở vật chất) của trung tâm.
        /// </summary>
        group.MapGet("", async (global::Supabase.Client client) =>
        {
            var response = await client.From<FacilityModel>().Get();
            return Results.Ok(response.Models.Select(f => new
            {
                id = f.Id,
                name = f.Name,
                imageUrl = f.ImageUrl,
                address = f.Address,
            }));
        });

        /// <summary>
        /// POST /api/facilities
        /// Thêm mới cơ sở vật chất / phòng tập.
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
        group.MapPost("", async (FacilitySaveRequest request, global::Supabase.Client client) =>
        {
            var model = new FacilityModel
            {
                Id = Guid.NewGuid(),
                Name = request.Name?.Trim() ?? string.Empty,
                ImageUrl = request.ImageUrl,
                Address = string.IsNullOrWhiteSpace(request.Address) ? "Chưa cập nhật" : request.Address.Trim(),
            };
            var insertResponse = await client.From<FacilityModel>().Insert(model);
            var created = insertResponse.Models.FirstOrDefault() ?? model;
            return Results.Ok(new
            {
                id = created.Id,
                name = created.Name,
                imageUrl = created.ImageUrl,
                address = created.Address,
            });
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        /// <summary>
        /// PUT /api/facilities/{id}
        /// Cập nhật thông tin phòng tập / cơ sở vật chất.
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
        group.MapPut("/{id:guid}", async (Guid id, FacilitySaveRequest request, global::Supabase.Client client) =>
        {
            var response = await client.From<FacilityModel>().Where(f => f.Id == id).Get();
            var existing = response.Models.FirstOrDefault();

            // Fallback nếu lệch ID client vs DB, tìm theo tên phòng
            if (existing == null && !string.IsNullOrWhiteSpace(request.Name))
            {
                var nameResponse = await client.From<FacilityModel>().Where(f => f.Name == request.Name.Trim()).Get();
                existing = nameResponse.Models.FirstOrDefault();
            }

            if (existing == null)
                return Results.NotFound(new { message = "Không tìm thấy phòng tập." });

            if (!string.IsNullOrWhiteSpace(request.Name))
                existing.Name = request.Name.Trim();
            if (request.ImageUrl != null)
                existing.ImageUrl = request.ImageUrl;
            if (!string.IsNullOrWhiteSpace(request.Address))
                existing.Address = request.Address.Trim();

            await client.From<FacilityModel>().Update(existing);
            return Results.Ok(new
            {
                id = existing.Id,
                name = existing.Name,
                imageUrl = existing.ImageUrl,
                address = existing.Address,
            });
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        /// <summary>
        /// DELETE /api/facilities/{id}
        /// Xóa phòng tập khỏi hệ thống (kiểm tra không có lớp học nào đang xếp lịch tại đây).
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
        group.MapDelete("/{id:guid}", async (Guid id, global::Supabase.Client client) =>
        {
            var classCheck = await client.From<GroupClassModel>().Where(c => c.FacilityId == id).Get();
            if (classCheck.Models.Any())
            {
                return Results.BadRequest(new { message = "Không thể xóa phòng tập này vì đang có lớp học được xếp lịch tại đây." });
            }

            try
            {
                await client.From<FacilityModel>().Where(f => f.Id == id).Delete();
                return Results.Ok(new { message = "Đã xóa phòng tập thành công." });
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { message = $"Không thể xóa phòng tập do ràng buộc dữ liệu: {ex.Message}" });
            }
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));
    }
}

public record FacilitySaveRequest(string Name, string? ImageUrl, string? Address);

