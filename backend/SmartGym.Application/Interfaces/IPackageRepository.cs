using SmartGym.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartGym.Application.Interfaces;

public interface IPackageRepository
{
    Task<IEnumerable<Package>> GetAllAsync();
    Task<Package?> GetByIdAsync(string id);
    Task AddAsync(Package package);
    Task UpdateAsync(Package package);
    Task DeleteAsync(string id);
}
