using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.WorkoutPlans;

namespace SmartGym.Application.Interfaces;

public interface IWorkoutPlanService
{
    Task<WorkoutPlanResponse> CreatePlanAsync(Guid coachId, CreateWorkoutPlanRequest request);
    Task<WorkoutPlanResponse?> GetPlanByIdAsync(Guid id);
    Task<IEnumerable<WorkoutPlanResponse>> GetPlansByCoachIdAsync(Guid coachId);
}
