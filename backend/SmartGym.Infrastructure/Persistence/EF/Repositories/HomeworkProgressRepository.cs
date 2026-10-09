using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartGym.Infrastructure.Persistence.EF.Repositories;

public class HomeworkProgressRepository : IHomeworkProgressRepository
{
    private readonly SmartGymDbContext _context;

    public HomeworkProgressRepository(SmartGymDbContext context)
    {
        _context = context;
    }

    public async Task<HomeworkProgress> CreateAsync(HomeworkProgress progress)
    {
        _context.HomeworkProgresses.Add(progress);
        await _context.SaveChangesAsync();
        return progress;
    }

    public async Task<HomeworkProgress?> GetByIdAsync(Guid id)
    {
        return await _context.HomeworkProgresses
            .Include(p => p.Plan)
                .ThenInclude(p => p != null ? p.Exercises : null)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<HomeworkProgress>> GetByMemberIdAsync(Guid memberId)
    {
        return await _context.HomeworkProgresses
            .Include(p => p.Plan)
                .ThenInclude(p => p != null ? p.Exercises : null)
            .Where(p => p.MemberId == memberId)
            .OrderByDescending(p => p.AssignedDate)
            .ToListAsync();
    }

    public async Task<bool> UpdateAsync(HomeworkProgress progress)
    {
        _context.HomeworkProgresses.Update(progress);
        var updated = await _context.SaveChangesAsync();
        return updated > 0;
    }
}
