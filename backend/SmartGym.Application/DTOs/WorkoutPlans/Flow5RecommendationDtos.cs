using System.Collections.Generic;

namespace SmartGym.Application.DTOs.WorkoutPlans;

public sealed class Flow5AiRecommendationOutputDto
{
    public string PlanName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Goal { get; set; }
    public string? Level { get; set; }
    public int DurationMinutes { get; set; }
    public List<Flow5ExerciseDto> Exercises { get; set; } = new();
}

public sealed record Flow5JsonParseResult(
    bool IsSuccess,
    string ErrorCode,
    string ErrorMessage,
    Flow5AiRecommendationOutputDto? Recommendation = null)
{
    public static Flow5JsonParseResult Success(Flow5AiRecommendationOutputDto recommendation) => new(
        true,
        string.Empty,
        string.Empty,
        recommendation);

    public static Flow5JsonParseResult Failure(string code, string message) => new(
        false,
        code,
        message);
}
