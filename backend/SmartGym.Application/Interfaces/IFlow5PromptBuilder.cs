using SmartGym.Application.DTOs.WorkoutPlans;

namespace SmartGym.Application.Interfaces;

public interface IFlow5PromptBuilder
{
    string Build(
        GenerateFlow5RecommendationRequest request,
        Flow5WorkoutContextDto context);
}
