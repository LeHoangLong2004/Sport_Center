using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Api.Endpoints;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/products").WithTags("Products");

        // GET /api/products — lấy tất cả sản phẩm đang active
        group.MapGet("", async (global::Supabase.Client supabase) =>
        {
            var response = await supabase
                .From<ProductModel>()
                .Where(p => p.Status == true)
                .Get();

            var products = response.Models.Select(p => new
            {
                id            = p.Id,
                name          = p.Name,
                category      = p.Category,
                price         = p.Price,
                stockQuantity = p.StockQuantity,
                imageUrl      = p.ImageUrl,
                status        = p.Status,
            });

            return Results.Ok(products);
        });

        // GET /api/products/{id}
        group.MapGet("{id:guid}", async (Guid id, global::Supabase.Client supabase) =>
        {
            var response = await supabase
                .From<ProductModel>()
                .Where(p => p.Id == id)
                .Single();

            if (response is null) return Results.NotFound();

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
    }
}
