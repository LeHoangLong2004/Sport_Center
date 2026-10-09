using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartGym.Infrastructure.Persistence.EF.Repositories;

public class WorkoutPlanRepository : IWorkoutPlanRepository
{
    private readonly SmartGymDbContext _context;

    public WorkoutPlanRepository(SmartGymDbContext context)
    {
        _context = context;
    }

    public async Task<WorkoutPlan> CreateAsync(WorkoutPlan plan)
    {
        _context.WorkoutPlans.Add(plan);
        await _context.SaveChangesAsync();
        return plan;
    }

    public async Task<WorkoutPlan?> GetByIdAsync(Guid id)
    {
        return await _context.WorkoutPlans
            .Include(p => p.Exercises)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<WorkoutPlan>> GetByCoachIdAsync(Guid coachId)
    {
        return await _context.WorkoutPlans
            .Include(p => p.Exercises)
            .Where(p => p.CoachId == coachId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }
}
