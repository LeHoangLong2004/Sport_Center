using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartGym.Infrastructure.Persistence.EF;

public class PackageRepository : IPackageRepository
{
    private readonly SmartGymDbContext _dbContext;

    public PackageRepository(SmartGymDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<Package>> GetAllAsync()
    {
        return await _dbContext.Packages
            .Include(p => p.Features)
            .Include(p => p.Benefits)
            .ToListAsync();
    }

    public async Task<Package?> GetByIdAsync(string id)
    {
        return await _dbContext.Packages
            .Include(p => p.Features)
            .Include(p => p.Benefits)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task AddAsync(Package package)
    {
        await _dbContext.Packages.AddAsync(package);
        await _dbContext.SaveChangesAsync();
    }

    public async Task UpdateAsync(Package package)
    {
        _dbContext.Packages.Update(package);
        await _dbContext.SaveChangesAsync();
    }

    public async Task DeleteAsync(string id)
    {
        var package = await _dbContext.Packages.FindAsync(id);
        if (package != null)
        {
            _dbContext.Packages.Remove(package);
            await _dbContext.SaveChangesAsync();
        }
    }
}
