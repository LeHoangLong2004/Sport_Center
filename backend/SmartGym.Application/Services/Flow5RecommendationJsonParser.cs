using System;
using System.Text.Json;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;

namespace SmartGym.Application.Services;

/// <summary>
/// Parses the provider envelope content into the Flow 5 DTO. Business dosage and
/// sport validation are deliberately deferred to the next validation step.
/// </summary>
public sealed class Flow5RecommendationJsonParser : IFlow5RecommendationJsonParser
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public Flow5JsonParseResult Parse(string rawContent)
    {
        if (string.IsNullOrWhiteSpace(rawContent))
        {
            return Flow5JsonParseResult.Failure(
                "ai_response_empty",
                "AI không trả về nội dung.");
        }

        var json = ExtractJsonObject(rawContent);
        if (json is null)
        {
            return Flow5JsonParseResult.Failure(
                "ai_json_not_found",
                "Không tìm thấy JSON object trong response của AI.");
        }

        try
        {
            var recommendation = JsonSerializer.Deserialize<Flow5AiRecommendationOutputDto>(
                json,
                JsonOptions);
            if (recommendation is null)
            {
                return Flow5JsonParseResult.Failure(
                    "ai_json_empty",
                    "JSON response của AI không tạo được recommendation.");
            }

            if (string.IsNullOrWhiteSpace(recommendation.PlanName))
            {
                return Flow5JsonParseResult.Failure(
                    "ai_json_missing_plan_name",
                    "Recommendation thiếu planName.");
            }

            if (recommendation.Exercises is null || recommendation.Exercises.Count == 0)
            {
                return Flow5JsonParseResult.Failure(
                    "ai_json_missing_exercises",
                    "Recommendation phải có ít nhất một bài tập.");
            }

            for (var index = 0; index < recommendation.Exercises.Count; index++)
            {
                var exercise = recommendation.Exercises[index];
                if (string.IsNullOrWhiteSpace(exercise.Name))
                {
                    return Flow5JsonParseResult.Failure(
                        "ai_json_invalid_exercise",
                        $"Bài tập thứ {index + 1} thiếu tên.");
                }

                if (exercise.Order <= 0)
                    exercise.Order = index + 1;
            }

            return Flow5JsonParseResult.Success(recommendation);
        }
        catch (JsonException)
        {
            return Flow5JsonParseResult.Failure(
                "ai_json_invalid",
                "AI trả về JSON không hợp lệ.");
        }
    }

    private static string? ExtractJsonObject(string content)
    {
        var normalized = content.Trim();
        if (normalized.StartsWith("```", StringComparison.Ordinal))
        {
            var firstLineEnd = normalized.IndexOf('\n');
            if (firstLineEnd >= 0)
                normalized = normalized[(firstLineEnd + 1)..].Trim();

            if (normalized.EndsWith("```", StringComparison.Ordinal))
                normalized = normalized[..^3].Trim();
        }

        var start = normalized.IndexOf('{');
        var end = normalized.LastIndexOf('}');
        return start >= 0 && end > start
            ? normalized[start..(end + 1)]
            : null;
    }
}
