using System;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Api.Endpoints;

public static class SportFacilityEndpoints
{
    public static void MapSportFacilityEndpoints(this IEndpointRouteBuilder app)
    {
        // ── SPORTS ENDPOINTS ──────────────────────────────────────────────────
        app.MapGet(
            "/api/sports",
            async (global::Supabase.Client client) =>
            {
                var response = await client.From<SportModel>().Get();
                return Results.Ok(response.Models.Select(s => new
                {
                    id = s.Id,
                    name = s.Name,
                    imageUrl = s.ImageUrl,
                    description = s.Description,
                }));
            }
        );

        app.MapPost(
            "/api/sports",
            async (SportModel request, global::Supabase.Client client) =>
            {
                request.Id = Guid.NewGuid();
                await client.From<SportModel>().Insert(request);
                return Results.Ok(new
                {
                    id = request.Id,
                    name = request.Name,
                    imageUrl = request.ImageUrl,
                    description = request.Description,
                });
            }
        ).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        app.MapPut(
            "/api/sports/{id:guid}",
            async (Guid id, SportModel request, global::Supabase.Client client) =>
            {
                var response = await client.From<SportModel>().Where(s => s.Id == id).Get();
                var existing = response.Models.FirstOrDefault();
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
            }
        ).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        app.MapDelete(
            "/api/sports/{id:guid}",
            async (Guid id, global::Supabase.Client client) =>
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
            }
        ).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        // ── IMAGE UPLOAD (CLOUDINARY / LOCAL FALLBACK) ────────────────────────
        app.MapPost(
            "/api/upload/image",
            async (IFormFile file, SmartGym.Application.Interfaces.IPhotoService photoService) =>
            {
                if (file == null || file.Length == 0)
                    return Results.BadRequest("Vui lòng chọn file ảnh hợp lệ.");

                using var stream = file.OpenReadStream();
                var (success, url, errorMessage) = await photoService.UploadImageAsync(stream, file.FileName, "sports");

                if (!success || string.IsNullOrEmpty(url))
                {
                    return Results.BadRequest(new { message = errorMessage ?? "Tải ảnh thất bại." });
                }

                return Results.Ok(new { url });
            }
        )
        .RequireAuthorization(policy => policy.RequireRole("manager", "admin"))
        .DisableAntiforgery();

        // ── FACILITIES ENDPOINTS ──────────────────────────────────────────────
        app.MapGet(
            "/api/facilities",
            async (global::Supabase.Client client) =>
            {
                var response = await client.From<FacilityModel>().Get();
                return Results.Ok(response.Models.Select(f => new
                {
                    id = f.Id,
                    name = f.Name,
                    address = f.Address,
                }));
            }
        );

        app.MapPost(
            "/api/facilities",
            async (FacilityModel request, global::Supabase.Client client) =>
            {
                request.Id = Guid.NewGuid();
                await client.From<FacilityModel>().Insert(request);
                return Results.Ok(new { id = request.Id, name = request.Name, address = request.Address });
            }
        ).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        app.MapPut(
            "/api/facilities/{id:guid}",
            async (Guid id, FacilityModel request, global::Supabase.Client client) =>
            {
                var response = await client.From<FacilityModel>().Where(f => f.Id == id).Get();
                var existing = response.Models.FirstOrDefault();
                if (existing == null)
                    return Results.NotFound(new { message = "Không tìm thấy phòng tập." });

                if (!string.IsNullOrWhiteSpace(request.Name))
                    existing.Name = request.Name.Trim();
                if (!string.IsNullOrWhiteSpace(request.Address))
                    existing.Address = request.Address.Trim();

                await client.From<FacilityModel>().Update(existing);
                return Results.Ok(new { id = existing.Id, name = existing.Name, address = existing.Address });
            }
        ).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        app.MapDelete(
            "/api/facilities/{id:guid}",
            async (Guid id, global::Supabase.Client client) =>
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
            }
        ).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));
    }
}
