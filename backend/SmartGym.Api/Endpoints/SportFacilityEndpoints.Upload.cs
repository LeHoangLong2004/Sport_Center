using System;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.Interfaces;

namespace SmartGym.Api.Endpoints;

public static partial class SportFacilityEndpoints
{
    /// <summary>
    /// Đăng ký endpoint upload hình ảnh (/api/upload/image).
    /// </summary>
    private static void MapUploadEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/upload").WithTags("Upload");

        /// <summary>
        /// POST /api/upload/image
        /// Tải lên tệp hình ảnh (hỗ trợ lưu trữ Cloudinary hoặc Local Disk fallback).
        /// Nhận form-data có file và thư mục chỉ định (sports, facilities, products).
        /// </summary>
        group.MapPost("/image", async (HttpRequest request, IPhotoService photoService) =>
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
        })
        .RequireAuthorization(policy => policy.RequireRole("manager", "admin"))
        .DisableAntiforgery();
    }
}

