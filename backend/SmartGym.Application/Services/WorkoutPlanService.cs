using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Services;

public class WorkoutPlanService : IWorkoutPlanService
{
    private readonly IWorkoutPlanRepository _repository;
    private readonly IUserRepository _userRepository;

    public WorkoutPlanService(IWorkoutPlanRepository repository, IUserRepository userRepository)
    {
        _repository = repository;
        _userRepository = userRepository;
    }

    public async Task<WorkoutPlanResponse> CreatePlanAsync(Guid coachId, CreateWorkoutPlanRequest request)
    {
        var plan = new WorkoutPlan
        {
            CoachId = coachId,
            SportId = request.SportId,
            PlanName = request.PlanName,
            Description = request.Description,
            Goal = request.Goal,
            Level = request.Level,
            DurationMinutes = request.DurationMinutes,
            Status = string.IsNullOrWhiteSpace(request.Status)
                ? Flow5PlanStatuses.Approved
                : Flow5PlanStatus.Normalize(request.Status),
            Version = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Exercises = request.Exercises.Select(e => new WorkoutPlanExercise
            {
                Name = e.Name,
                Reps = e.Reps,
                Rest = e.Rest,
                Note = e.Note
            }).ToList()
        };

        var created = await _repository.CreateAsync(plan);
        return MapToResponse(created);
    }

    public async Task<WorkoutPlanResponse?> UpdatePlanAsync(
        Guid coachId,
        Guid planId,
        CreateWorkoutPlanRequest request
    )
    {
        var plan = await _repository.GetByIdAsync(planId);
        if (plan == null || plan.CoachId != coachId)
            return null;

        plan.PlanName = request.PlanName;
        plan.SportId = request.SportId;
        plan.Description = request.Description;
        plan.Goal = request.Goal;
        plan.Level = request.Level;
        plan.DurationMinutes = request.DurationMinutes;
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            var normalized = Flow5PlanStatus.Normalize(request.Status);
            plan.Status = normalized;
            if (Flow5PlanStatus.IsApproved(normalized))
            {
                plan.ApprovedAt = DateTime.UtcNow;
                plan.ApprovedBy = coachId;
            }
        }
        plan.UpdatedAt = DateTime.UtcNow;
        plan.Exercises = request.Exercises.Select(e => new WorkoutPlanExercise
        {
            PlanId = plan.Id,
            Name = e.Name,
            Reps = e.Reps,
            Rest = e.Rest,
            Note = e.Note
        }).ToList();

        var updated = await _repository.UpdateAsync(plan);
        return MapToResponse(updated);
    }

    public async Task<WorkoutPlanResponse?> GetPlanByIdAsync(Guid id)
    {
        var plan = await _repository.GetByIdAsync(id);
        if (plan == null) return null;
        return MapToResponse(plan);
    }

    public async Task<IEnumerable<WorkoutPlanResponse>> GetPlansByCoachIdAsync(Guid coachId)
    {
        var plans = await _repository.GetByCoachIdAsync(coachId);
        return plans.Select(MapToResponse);
    }

    private WorkoutPlanResponse MapToResponse(WorkoutPlan p)
    {
        return new WorkoutPlanResponse
        {
            Id = p.Id,
            CoachId = p.CoachId,
            SportId = p.SportId,
            PlanName = p.PlanName,
            Description = p.Description,
            Goal = p.Goal,
            Level = p.Level,
            DurationMinutes = p.DurationMinutes,
            Status = p.Status,
            Version = p.Version,
            RecommendationTargetType = p.RecommendationTargetType,
            RecommendationTargetId = p.RecommendationTargetId,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
            Exercises = p.Exercises?.Select(e => new ExerciseDto
            {
                Id = e.Id,
                Name = e.Name,
                Reps = e.Reps,
                Rest = e.Rest,
                Note = e.Note
            }).ToList() ?? new List<ExerciseDto>()
        };
    }
}
