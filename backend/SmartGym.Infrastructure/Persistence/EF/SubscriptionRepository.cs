using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartGym.Infrastructure.Persistence.EF;

public class SubscriptionRepository : ISubscriptionRepository
{
    private readonly SmartGymDbContext _dbContext;

    public SubscriptionRepository(SmartGymDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<Subscription>> GetByUserIdAsync(Guid userId)
    {
        return await _dbContext.Subscriptions
            .Include(s => s.Package)
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task<Subscription?> GetByIdAsync(Guid id)
    {
        return await _dbContext.Subscriptions
            .Include(s => s.Package)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task AddAsync(Subscription subscription)
    {
        await _dbContext.Subscriptions.AddAsync(subscription);
        await _dbContext.SaveChangesAsync();
    }

    public async Task UpdateAsync(Subscription subscription)
    {
        _dbContext.Subscriptions.Update(subscription);
        await _dbContext.SaveChangesAsync();
    }
}
