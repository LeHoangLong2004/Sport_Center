using SmartGym.Application.DTOs.WorkoutPlans;

namespace SmartGym.Application.Interfaces;

public sealed record Flow5ValidationResult(
    IReadOnlyList<Flow5ValidationIssueDto> Issues)
{
    public bool IsValid => Issues.Count == 0;

    public static Flow5ValidationResult Valid() => new(Array.Empty<Flow5ValidationIssueDto>());

    public static Flow5ValidationResult Invalid(
        IEnumerable<Flow5ValidationIssueDto> issues) => new(issues.ToArray());
}

public interface IFlow5WorkoutPlanValidator
{
    Flow5ValidationResult ValidateGenerationRequest(
        GenerateFlow5RecommendationRequest request,
        Flow5WorkoutContextDto context);

    Flow5ValidationResult ValidateRecommendation(
        GenerateFlow5RecommendationRequest request,
        Flow5WorkoutContextDto context,
        Flow5AiRecommendationOutputDto recommendation);

    Flow5ValidationResult ValidateDraft(
        CreateFlow5DraftRequest request,
        Flow5WorkoutContextDto? context = null);
}
