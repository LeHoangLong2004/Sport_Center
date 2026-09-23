using SmartGym.Domain.Entities;

namespace SmartGym.Application.Interfaces.Repositories;

public interface IUserRepository
{
    Task<AppUser?> FindByEmailAsync(string email);
    Task<AppUser?> FindByIdAsync(Guid id);
    Task UpdateAsync(AppUser user);
}
