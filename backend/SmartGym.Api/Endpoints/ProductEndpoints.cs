using System;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Endpoint quản lý Sản phẩm & Cửa hàng phụ kiện thể thao (Product & Merchandise Management).
/// Hỗ trợ CRUD: Tra cứu sản phẩm trong shop, xem chi tiết, thêm mới, sửa đổi tồn kho/giá bán và xóa sản phẩm.
/// </summary>
public static class ProductEndpoints
{
    /// <summary>
    /// Đăng ký các route sản phẩm vào hệ thống.
    /// Nhóm route gốc: /api/products
    /// </summary>
    /// <param name="app">Đối tượng WebApplication</param>
    public static void MapProductEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/products").WithTags("Products");

        /// <summary>
        /// GET /api/products
        /// Lấy danh sách sản phẩm (nước uống, thực phẩm bổ sung, găng tay, phụ kiện gym...).
        /// Tham số `includeInactive=true` để lấy cả sản phẩm tạm ẩn (dành cho quản lý).
        /// </summary>
        group.MapGet("", async (bool? includeInactive, global::Supabase.Client supabase) =>
        {
            var response = await supabase.From<ProductModel>().Get();
            var items = response.Models.AsEnumerable();
            if (includeInactive != true)
            {
                items = items.Where(p => p.Status);
            }

            var products = items.Select(p => new
            {
                id            = p.Id,
                name          = p.Name,
                category      = p.Category,
                price         = p.Price,
                stockQuantity = p.StockQuantity,
                imageUrl      = p.ImageUrl,
                status        = p.Status,
            }).OrderBy(p => p.category).ThenBy(p => p.name);

            return Results.Ok(products);
        });

        /// <summary>
        /// GET /api/products/{id}
        /// Lấy chi tiết thông tin một sản phẩm theo ID.
        /// </summary>
        group.MapGet("{id:guid}", async (Guid id, global::Supabase.Client supabase) =>
        {
            var response = await supabase
                .From<ProductModel>()
                .Where(p => p.Id == id)
                .Single();

            if (response is null) return Results.NotFound(new { message = "Không tìm thấy sản phẩm." });

            return Results.Ok(new
            {
                id            = response.Id,
                name          = response.Name,
                category      = response.Category,
                price         = response.Price,
                stockQuantity = response.StockQuantity,
                imageUrl      = response.ImageUrl,
                status        = response.Status,
            });
        });

        /// <summary>
        /// POST /api/products
        /// Thêm sản phẩm mới vào kho hàng trung tâm.
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
        group.MapPost("", async (ProductSaveRequest request, global::Supabase.Client supabase) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest(new { message = "Tên sản phẩm không được để trống." });

            if (request.Price < 0)
                return Results.BadRequest(new { message = "Giá sản phẩm không hợp lệ." });

            if (request.StockQuantity < 0)
                return Results.BadRequest(new { message = "Số lượng tồn kho không được âm." });

            var model = new ProductModel
            {
                Id            = Guid.NewGuid(),
                Name          = request.Name.Trim(),
                Category      = string.IsNullOrWhiteSpace(request.Category) ? "Khác" : request.Category.Trim(),
                Price         = request.Price,
                StockQuantity = request.StockQuantity,
                ImageUrl      = request.ImageUrl,
                Status        = request.Status,
            };

            await supabase.From<ProductModel>().Insert(model);

            return Results.Ok(new
            {
                id            = model.Id,
                name          = model.Name,
                category      = model.Category,
                price         = model.Price,
                stockQuantity = model.StockQuantity,
                imageUrl      = model.ImageUrl,
                status        = model.Status,
            });
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        /// <summary>
        /// PUT /api/products/{id}
        /// Cập nhật thông tin sản phẩm (giá bán, số lượng tồn kho, danh mục, hình ảnh).
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
        group.MapPut("{id:guid}", async (Guid id, ProductSaveRequest request, global::Supabase.Client supabase) =>
        {
            var response = await supabase.From<ProductModel>().Where(p => p.Id == id).Get();
            var existing = response.Models.FirstOrDefault();
            if (existing == null)
                return Results.NotFound(new { message = "Không tìm thấy sản phẩm." });

            if (!string.IsNullOrWhiteSpace(request.Name))
                existing.Name = request.Name.Trim();

            if (!string.IsNullOrWhiteSpace(request.Category))
                existing.Category = request.Category.Trim();

            if (request.Price >= 0)
                existing.Price = request.Price;

            if (request.StockQuantity >= 0)
                existing.StockQuantity = request.StockQuantity;

            if (request.ImageUrl != null)
                existing.ImageUrl = request.ImageUrl;

            existing.Status = request.Status;

            await supabase.From<ProductModel>().Update(existing);

            return Results.Ok(new
            {
                id            = existing.Id,
                name          = existing.Name,
                category      = existing.Category,
                price         = existing.Price,
                stockQuantity = existing.StockQuantity,
                imageUrl      = existing.ImageUrl,
                status        = existing.Status,
            });
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        /// <summary>
        /// DELETE /api/products/{id}
        /// Xóa sản phẩm khỏi danh mục bán hàng.
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
        group.MapDelete("{id:guid}", async (Guid id, global::Supabase.Client supabase) =>
        {
            var response = await supabase.From<ProductModel>().Where(p => p.Id == id).Get();
            var existing = response.Models.FirstOrDefault();
            if (existing == null)
                return Results.NotFound(new { message = "Không tìm thấy sản phẩm." });

            await supabase.From<ProductModel>().Where(p => p.Id == id).Delete();
            return Results.Ok(new { message = "Đã xóa sản phẩm thành công." });
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));
    }
}

public record ProductSaveRequest(
    string Name,
    string? Category,
    decimal Price,
    int StockQuantity,
    string? ImageUrl,
    bool Status = true
);

