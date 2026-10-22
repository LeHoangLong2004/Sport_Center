using System;
using System.Threading;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.WorkoutPlans;

namespace SmartGym.Application.Interfaces;

public interface IFlow5RecommendationService
{
    Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> GenerateDraftAsync(
        Guid coachId,
        GenerateFlow5RecommendationRequest request,
        Flow5WorkoutContextDto context,
        CancellationToken cancellationToken = default);
}
