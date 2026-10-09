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
        return await _context.Reviews
            .Include(r => r.Member)
            .Where(r => r.CoachId == coachId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }
}
