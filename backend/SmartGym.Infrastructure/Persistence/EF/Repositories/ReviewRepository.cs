using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartGym.Infrastructure.Persistence.EF.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly SmartGymDbContext _context;

    public ReviewRepository(SmartGymDbContext context)
    {
        _context = context;
    }

    public async Task<Review> CreateAsync(Review review)
    {
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        return review;
    }

    public async Task<IEnumerable<Review>> GetByCoachIdAsync(Guid coachId)
    {
        var targetIds = new HashSet<Guid> { coachId };
        try
        {
            var related = await _context.Database.SqlQueryRaw<Guid>(
                @"SELECT id AS ""Value"" FROM coaches WHERE id = {0} OR user_id = {0}
                  UNION
                  SELECT user_id AS ""Value"" FROM coaches WHERE (id = {0} OR user_id = {0}) AND user_id IS NOT NULL",
                coachId).ToListAsync();

            foreach (var id in related)
            {
                targetIds.Add(id);
            }
        }
        catch
        {
            // Fallback to coachId only
        }

        return await _context.Reviews
            .Include(r => r.Member)
            .Where(r => targetIds.Contains(r.CoachId))
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetByMemberIdAsync(Guid memberId)
    {
        return await _context.Reviews
            .Include(r => r.Member)
            .Where(r => r.MemberId == memberId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }
}
