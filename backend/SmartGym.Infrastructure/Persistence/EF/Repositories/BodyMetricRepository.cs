using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartGym.Infrastructure.Persistence.EF.Repositories;

public class BodyMetricRepository : IBodyMetricRepository
{
    private readonly SmartGymDbContext _context;

    public BodyMetricRepository(SmartGymDbContext context)
    {
        _context = context;
    }

    public async Task<BodyMetric> AddAsync(BodyMetric bodyMetric)
    {
        _context.BodyMetrics.Add(bodyMetric);
        await _context.SaveChangesAsync();
        return bodyMetric;
    }

    public async Task<IEnumerable<BodyMetric>> GetByUserIdAsync(Guid userId)
    {
        return await _context.BodyMetrics
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.RecordedAt)
            .ToListAsync();
    }
}
