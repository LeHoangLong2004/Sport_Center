using System.Text.Json;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Services;
using Xunit;

namespace SmartGym.Tests;

public sealed class Flow5CoreTests
{
    [Theory]
    [InlineData("draft", "draft")]
    [InlineData("approved", "approved")]
    [InlineData("Đã duyệt", "approved")]
    [InlineData("archived", "archived")]
    public void Plan_status_normalization_is_backward_compatible(string status, string expected)
    {
        var normalized = Flow5PlanStatus.Normalize(status);

        Assert.Equal(expected, normalized);
    }

    [Fact]
    public void Recommendation_parser_extracts_json_from_markdown_fence()
    {
        var parser = new Flow5RecommendationJsonParser();
        var result = parser.Parse("```json\n{\"planName\":\"Mobility\",\"durationMinutes\":30,\"exercises\":[{\"name\":\"Squat\",\"reps\":\"10\"}]}\n```");

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Recommendation);
        Assert.Equal("Mobility", result.Recommendation!.PlanName);
        Assert.Equal(1, result.Recommendation.Exercises[0].Order);
    }

    [Fact]
    public void Recommendation_parser_rejects_missing_exercises()
    {
        var result = new Flow5RecommendationJsonParser()
            .Parse("{\"planName\":\"Incomplete\",\"durationMinutes\":30,\"exercises\":[]}");

        Assert.False(result.IsSuccess);
        Assert.Equal("ai_json_missing_exercises", result.ErrorCode);
    }

    [Fact]
    public void Validator_rejects_invalid_duration_and_dosage()
    {
        var request = new CreateFlow5DraftRequest
        {
            PlanName = "Invalid plan",
            SportId = Guid.NewGuid(),
            Level = "unknown",
            DurationMinutes = 300,
            Exercises = new() { new Flow5ExerciseDto { Name = "Squat", Order = 1 } }
        };

        var result = new Flow5WorkoutPlanValidator().ValidateDraft(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Issues, issue => issue.Code == "level_invalid");
        Assert.Contains(result.Issues, issue => issue.Code == "duration_range");
        Assert.Contains(result.Issues, issue => issue.Code == "dosage_required");
    }

    [Fact]
    public void Validator_accepts_a_valid_draft()
    {
        var request = new CreateFlow5DraftRequest
        {
            PlanName = "Strength basics",
            SportId = Guid.NewGuid(),
            Level = "basic",
            DurationMinutes = 60,
            Goal = "Improve strength",
            Exercises = new() { new Flow5ExerciseDto { Name = "Squat", Sets = "3", Reps = "10", Order = 1 } }
        };

        var result = new Flow5WorkoutPlanValidator().ValidateDraft(request);

        Assert.True(result.IsValid);
        Assert.Empty(result.Issues);
    }

    [Fact]
    public void Assignment_contract_serializes_target_and_version()
    {
        var request = new AssignFlow5PlanRequest
        {
            Target = new Flow5TargetDto { Type = Flow5TargetTypes.Class, Id = Guid.NewGuid() },
            ExpectedVersion = 3
        };
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        var json = JsonSerializer.Serialize(request, options);

        Assert.Contains("target", json);
        Assert.Contains("class", json);
        Assert.Contains("expectedVersion", json);
        Assert.Equal("/api/workout-plans/{id:guid}/assign", Flow5WorkoutPlanRoutes.Assign);
    }
}
