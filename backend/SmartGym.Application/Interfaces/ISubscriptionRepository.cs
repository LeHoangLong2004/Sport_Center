using SmartGym.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartGym.Application.Interfaces;

public interface ISubscriptionRepository
{
    Task<IEnumerable<Subscription>> GetByUserIdAsync(Guid userId);
    Task<Subscription?> GetByIdAsync(Guid id);
    Task AddAsync(Subscription subscription);
    Task UpdateAsync(Subscription subscription);
}
