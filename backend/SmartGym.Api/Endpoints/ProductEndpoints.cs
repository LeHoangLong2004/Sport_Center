using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.Interfaces.Repositories;

namespace SmartGym.Api.Endpoints;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this WebApplication app)
    {
        var products = app.MapGroup("/api/products").WithTags("Products");

        products.MapGet("/", async (IProductRepository productRepo) =>
        {
            var data = await productRepo.GetAllActiveProductsAsync();
            return Results.Ok(data);
        });
    }
}
