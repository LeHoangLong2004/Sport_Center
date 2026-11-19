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

    public async Task<WorkoutPlan> UpdateAsync(WorkoutPlan plan)
    {
        var existingExercises = await _context.WorkoutPlanExercises
            .Where(e => e.PlanId == plan.Id)
            .ToListAsync();

        if (plan.Exercises != null)
        {
            var desiredExercises = plan.Exercises.ToList();
            var desiredIds = desiredExercises
                .Where(e => e.Id != Guid.Empty)
                .Select(e => e.Id)
                .ToHashSet();

            // 1. Remove only exercises that were deleted (in DB but not in desired list)
            var toRemove = existingExercises
                .Where(e => !desiredIds.Contains(e.Id))
                .ToList();

            if (toRemove.Count > 0)
            {
                _context.WorkoutPlanExercises.RemoveRange(toRemove);
            }

            // 2. Update existing or insert new
            var existingDict = existingExercises.ToDictionary(e => e.Id);

            foreach (var desired in desiredExercises)
            {
                desired.PlanId = plan.Id;

                if (desired.Id != Guid.Empty && existingDict.TryGetValue(desired.Id, out var existing))
                {
                    existing.Name = desired.Name;
                    existing.Sets = desired.Sets;
                    existing.Reps = desired.Reps;
                    existing.Duration = desired.Duration;
                    existing.Rest = desired.Rest;
                    existing.Note = desired.Note;
                    existing.Order = desired.Order;
                }
                else
                {
                    if (desired.Id == Guid.Empty)
                    {
                        desired.Id = Guid.NewGuid();
                    }

                    var entry = _context.Entry(desired);
                    if (entry.State == EntityState.Detached)
                    {
                        _context.WorkoutPlanExercises.Add(desired);
                    }
                    else
                    {
                        entry.State = EntityState.Added;
                    }
                }
            }
        }

        var planEntry = _context.Entry(plan);
        if (planEntry.State == EntityState.Detached)
        {
            _context.WorkoutPlans.Update(plan);
        }
        else
        {
            planEntry.State = EntityState.Modified;
        }

        await _context.SaveChangesAsync();
        return await GetByIdAsync(plan.Id) ?? plan;
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
