using System.Threading;
using SmartGym.Application.DTOs.WorkoutPlans;

namespace SmartGym.Application.Interfaces;

public interface IFlow5AssignmentService
{
    Task<Flow5PlanServiceResult<AssignFlow5PlanResponse>> AssignAsync(
        Guid coachId,
        Guid planId,
        AssignFlow5PlanRequest request,
        CancellationToken cancellationToken = default);
}
