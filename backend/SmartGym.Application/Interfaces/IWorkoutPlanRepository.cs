using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Interfaces;

public interface IWorkoutPlanRepository
{
    Task<WorkoutPlan> CreateAsync(WorkoutPlan plan);
    Task<WorkoutPlan?> GetByIdAsync(Guid id);
    Task<IEnumerable<WorkoutPlan>> GetByCoachIdAsync(Guid coachId);
}
