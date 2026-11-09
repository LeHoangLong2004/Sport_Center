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

/// <summary>
/// Endpoint quản lý Bộ môn thể thao (Sports) và Cơ sở vật chất / Phòng tập (Facilities).
/// Hỗ trợ CRUD cho danh mục các môn thể thao, upload hình ảnh lên thư mục tĩnh, và quản lý các phòng/sân tập trong trung tâm.
/// </summary>
public static class SportFacilityEndpoints
{
    /// <summary>
    /// Đăng ký các route môn thể thao và cơ sở vật chất vào hệ thống.
    /// Nhóm route: /api/sports, /api/facilities, /api/upload/image
    /// </summary>
    /// <param name="app">Đối tượng IEndpointRouteBuilder</param>
    public static void MapSportFacilityEndpoints(this IEndpointRouteBuilder app)
    {
        // ── SPORTS ENDPOINTS ──────────────────────────────────────────────────
        /// <summary>
        /// GET /api/sports
        /// Lấy danh sách toàn bộ các môn thể thao tại trung tâm (Yoga, Gym, Boxing, Bơi lội...).
        /// Không yêu cầu đăng nhập.
        /// </summary>
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

        /// <summary>
        /// POST /api/sports
        /// Thêm mới một môn thể thao vào hệ thống.
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
        app.MapPost(
            "/api/sports",
            async (SportSaveRequest request, global::Supabase.Client client) =>
            {
                var model = new SportModel
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name?.Trim() ?? string.Empty,
                    ImageUrl = request.ImageUrl,
                    Description = request.Description,
                };
                await client.From<SportModel>().Insert(model);
                return Results.Ok(new
                {
                    id = model.Id,
                    name = model.Name,
                    imageUrl = model.ImageUrl,
                    description = model.Description,
                });
            }
        ).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        /// <summary>
        /// PUT /api/sports/{id}
        /// Cập nhật thông tin một môn thể thao (tên, ảnh, mô tả).
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
        app.MapPut(
            "/api/sports/{id:guid}",
            async (Guid id, SportSaveRequest request, global::Supabase.Client client) =>
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

        /// <summary>
        /// DELETE /api/sports/{id}
        /// Xóa một môn thể thao khỏi hệ thống (kiểm tra ràng buộc không có lớp học nào đang dùng).
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
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
        /// <summary>
        /// POST /api/upload/image
        /// Tải lên tệp hình ảnh (hỗ trợ lưu trữ Cloudinary hoặc Local Disk fallback).
        /// Nhận form-data có file và thư mục chỉ định (sports, facilities, products).
        /// </summary>
        app.MapPost(
            "/api/upload/image",
            async (HttpRequest request, SmartGym.Application.Interfaces.IPhotoService photoService) =>
            {
                if (!request.HasFormContentType)
                {
                    return Results.BadRequest(new { message = "Yêu cầu phải có định dạng multipart/form-data." });
                }

                var form = await request.ReadFormAsync();
                var file = form.Files.GetFile("file") ?? form.Files.FirstOrDefault();
                var requestedFolder = form["folder"].FirstOrDefault();
                var uploadFolder = requestedFolder is "sports" or "facilities" or "products" ? requestedFolder : "sports";

                if (file == null || file.Length == 0)
                {
                    return Results.BadRequest(new { message = "Vui lòng chọn file ảnh hợp lệ." });
                }

                if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                {
                    return Results.BadRequest(new { message = "Chỉ được phép tải lên tệp hình ảnh." });
                }

                if (file.Length > 10 * 1024 * 1024)
                {
                    return Results.BadRequest(new { message = "Kích thước ảnh không được vượt quá 10MB." });
                }

                await using var stream = file.OpenReadStream();
                var (success, url, errorMessage) = await photoService.UploadImageAsync(stream, file.FileName, uploadFolder);

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
        /// <summary>
        /// GET /api/facilities
        /// Lấy danh sách tất cả các phòng tập, sân tập (Cơ sở vật chất) của trung tâm.
        /// </summary>
        app.MapGet(
            "/api/facilities",
            async (global::Supabase.Client client) =>
            {
                var response = await client.From<FacilityModel>().Get();
                return Results.Ok(response.Models.Select(f => new
                {
                    id = f.Id,
                    name = f.Name,
                    imageUrl = f.ImageUrl,
                    address = f.Address,
                }));
            }
        );

        /// <summary>
        /// POST /api/facilities
        /// Thêm mới cơ sở vật chất / phòng tập.
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
        app.MapPost(
            "/api/facilities",
            async (FacilitySaveRequest request, global::Supabase.Client client) =>
            {
                var model = new FacilityModel
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name?.Trim() ?? string.Empty,
                    ImageUrl = request.ImageUrl,
                    Address = string.IsNullOrWhiteSpace(request.Address) ? "Chưa cập nhật" : request.Address.Trim(),
                };
                await client.From<FacilityModel>().Insert(model);
                return Results.Ok(new { id = model.Id, name = model.Name, imageUrl = model.ImageUrl, address = model.Address });
            }
        ).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        /// <summary>
        /// PUT /api/facilities/{id}
        /// Cập nhật thông tin phòng tập / cơ sở vật chất.
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
        app.MapPut(
            "/api/facilities/{id:guid}",
            async (Guid id, FacilitySaveRequest request, global::Supabase.Client client) =>
            {
                var response = await client.From<FacilityModel>().Where(f => f.Id == id).Get();
                var existing = response.Models.FirstOrDefault();
                if (existing == null)
                    return Results.NotFound(new { message = "Không tìm thấy phòng tập." });

                if (!string.IsNullOrWhiteSpace(request.Name))
                    existing.Name = request.Name.Trim();
                if (request.ImageUrl != null)
                    existing.ImageUrl = request.ImageUrl;
                if (!string.IsNullOrWhiteSpace(request.Address))
                    existing.Address = request.Address.Trim();

                await client.From<FacilityModel>().Update(existing);
                return Results.Ok(new { id = existing.Id, name = existing.Name, imageUrl = existing.ImageUrl, address = existing.Address });
            }
        ).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        /// <summary>
        /// DELETE /api/facilities/{id}
        /// Xóa phòng tập khỏi hệ thống (kiểm tra không có lớp học nào đang xếp lịch tại đây).
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
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

public record SportSaveRequest(string Name, string? ImageUrl, string? Description);
public record FacilitySaveRequest(string Name, string? ImageUrl, string? Address);
