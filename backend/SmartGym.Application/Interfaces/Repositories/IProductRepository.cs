using SmartGym.Application.DTOs;

namespace SmartGym.Application.Interfaces.Repositories;

public interface IProductRepository
{
    Task<IReadOnlyList<ProductDto>> GetAllActiveProductsAsync();
}
