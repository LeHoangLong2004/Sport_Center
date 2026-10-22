using System;
using System.Threading;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;

namespace SmartGym.Application.Services;

/// <summary>
/// Orchestrates the complete Flow 5 recommendation pipeline without exposing
/// provider details to the API or Frontend.
/// </summary>
public sealed class Flow5RecommendationService : IFlow5RecommendationService
{
    private const string PromptVersion = "flow5.prompt.v1";
    private readonly IFlow5WorkoutPlanValidator _validator;
    private readonly IFlow5PromptBuilder _promptBuilder;
    private readonly IAiRecommendationProvider _provider;
    private readonly IFlow5RecommendationJsonParser _parser;
    private readonly IFlow5WorkoutPlanService _planService;

    public Flow5RecommendationService(
        IFlow5WorkoutPlanValidator validator,
        IFlow5PromptBuilder promptBuilder,
        IAiRecommendationProvider provider,
        IFlow5RecommendationJsonParser parser,
        IFlow5WorkoutPlanService planService)
    {
        _validator = validator;
        _promptBuilder = promptBuilder;
        _provider = provider;
        _parser = parser;
        _planService = planService;
    }

    public async Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> GenerateDraftAsync(
        Guid coachId,
        GenerateFlow5RecommendationRequest request,
        Flow5WorkoutContextDto context,
        CancellationToken cancellationToken = default)
    {
        var requestValidation = _validator.ValidateGenerationRequest(request, context);
        if (!requestValidation.IsValid)
            return Invalid(requestValidation);

        var correlationId = Guid.NewGuid().ToString("N");
        var prompt = _promptBuilder.Build(request, context);
        var providerResponse = await _provider.GenerateAsync(
            new AiProviderRequest(prompt, correlationId),
            cancellationToken);

        if (!providerResponse.IsSuccess)
            return Failure(
                providerResponse.ErrorCode ?? "ai_provider_error",
                providerResponse.ErrorMessage ?? "AI provider request failed.");

        var parsed = _parser.Parse(providerResponse.Content ?? string.Empty);
        if (!parsed.IsSuccess || parsed.Recommendation is null)
            return Failure(
                parsed.ErrorCode,
                parsed.ErrorMessage);

        var recommendationValidation = _validator.ValidateRecommendation(
            request,
            context,
            parsed.Recommendation);
        if (!recommendationValidation.IsValid)
            return Failure(
                "ai_output_invalid",
                "AI recommendation did not pass business validation.",
                recommendationValidation.Issues);

        var draftRequest = new CreateFlow5DraftRequest
        {
            PlanName = parsed.Recommendation.PlanName,
            SportId = request.SportId,
            Description = parsed.Recommendation.Description,
            Goal = parsed.Recommendation.Goal ?? request.Goal,
            Level = parsed.Recommendation.Level ?? request.Level,
            DurationMinutes = parsed.Recommendation.DurationMinutes,
            Source = Flow5PlanSources.AiRecommendation,
            Target = request.Target,
            AiMetadata = new Flow5AiMetadataDto
            {
                Provider = providerResponse.Provider,
                Model = providerResponse.Model,
                PromptVersion = PromptVersion,
                GeneratedAt = DateTimeOffset.UtcNow,
                InputTokens = providerResponse.InputTokens,
                OutputTokens = providerResponse.OutputTokens
            },
            Exercises = parsed.Recommendation.Exercises
        };

        return await _planService.CreateDraftAsync(coachId, draftRequest, cancellationToken);
    }

    private static Flow5PlanServiceResult<Flow5WorkoutPlanResponse> Invalid(
        Flow5ValidationResult validation) =>
        Flow5PlanServiceResult<Flow5WorkoutPlanResponse>.Failure(
            "validation_error",
            "The AI recommendation request is invalid.",
            validation.Issues);

    private static Flow5PlanServiceResult<Flow5WorkoutPlanResponse> Failure(
        string code,
        string message,
        IReadOnlyList<Flow5ValidationIssueDto>? issues = null) =>
        Flow5PlanServiceResult<Flow5WorkoutPlanResponse>.Failure(code, message, issues);
}
