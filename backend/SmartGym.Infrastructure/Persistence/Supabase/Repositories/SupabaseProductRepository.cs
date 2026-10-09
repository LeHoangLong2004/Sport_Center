using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Repositories;

public sealed class SupabaseProductRepository : IProductRepository
{
    private readonly global::Supabase.Client _client;

    public SupabaseProductRepository(global::Supabase.Client client)
    {
        _client = client;
    }

    public async Task<IReadOnlyList<ProductDto>> GetAllActiveProductsAsync()
    {
        var response = await _client.From<ProductModel>().Where(p => p.Status == true).Get();
        return response.Models.Select(m => new ProductDto
        {
            Id = m.Id,
            Name = m.Name,
            Category = m.Category,
            Price = m.Price,
            StockQuantity = m.StockQuantity,
            ImageUrl = m.ImageUrl,
            Status = m.Status
        }).ToList();
    }
}
