using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Services;

public class HomeworkProgressService : IHomeworkProgressService
{
    private readonly IHomeworkProgressRepository _repository;
    private readonly IWorkoutPlanRepository _planRepository;

    public HomeworkProgressService(IHomeworkProgressRepository repository, IWorkoutPlanRepository planRepository)
    {
        _repository = repository;
        _planRepository = planRepository;
    }

    public async Task<HomeworkProgressResponse> AssignHomeworkAsync(Guid coachId, AssignHomeworkRequest request)
    {
        var plan = await _planRepository.GetByIdAsync(request.PlanId);
        if (plan == null) throw new Exception("Workout plan not found");

        var progress = new HomeworkProgress
        {
            MemberId = request.MemberId,
            PlanId = request.PlanId,
            AssignedBy = coachId,
            Status = "assigned",
            ProgressPct = 0,
            AssignedDate = DateTime.UtcNow.Date,
            DueDate = request.DueDate,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.CreateAsync(progress);
        
        // Return full response with plan
        created.Plan = plan;
        return MapToResponse(created);
    }

    public async Task<IEnumerable<HomeworkProgressResponse>> GetMemberHomeworksAsync(Guid memberId)
    {
        var homeworks = await _repository.GetByMemberIdAsync(memberId);
        return homeworks.Select(MapToResponse);
    }

    public async Task<bool> UpdateProgressAsync(Guid memberId, Guid homeworkId, UpdateHomeworkProgressRequest request)
    {
        var homework = await _repository.GetByIdAsync(homeworkId);
        if (homework == null || homework.MemberId != memberId) return false;

        if (request.Status != null)
        {
            homework.Status = request.Status;
            if (request.Status == "completed")
            {
                homework.CompletedAt = DateTime.UtcNow;
                homework.ProgressPct = 100;
            }
        }

        if (request.ProgressPct.HasValue && request.Status != "completed")
        {
            homework.ProgressPct = request.ProgressPct.Value;
        }

        if (request.Notes != null)
        {
            homework.Notes = request.Notes;
        }

        return await _repository.UpdateAsync(homework);
    }

    private HomeworkProgressResponse MapToResponse(HomeworkProgress p)
    {
        return new HomeworkProgressResponse
        {
            Id = p.Id,
            MemberId = p.MemberId,
            PlanId = p.PlanId,
            AssignedBy = p.AssignedBy,
            Status = p.Status,
            ProgressPct = p.ProgressPct,
            AssignedDate = p.AssignedDate,
            DueDate = p.DueDate,
            CompletedAt = p.CompletedAt,
            Notes = p.Notes,
            CreatedAt = p.CreatedAt,
            Plan = p.Plan == null ? null : new WorkoutPlanResponse
            {
                Id = p.Plan.Id,
                PlanName = p.Plan.PlanName,
                Description = p.Plan.Description,
                Goal = p.Plan.Goal,
                Level = p.Plan.Level,
                DurationMinutes = p.Plan.DurationMinutes,
                Exercises = p.Plan.Exercises.Select(e => new ExerciseDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    Reps = e.Reps,
                    Rest = e.Rest,
                    Note = e.Note
                }).ToList()
            }
        };
    }
}
