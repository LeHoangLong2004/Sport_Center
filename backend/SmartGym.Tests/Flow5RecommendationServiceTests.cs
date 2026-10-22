using System;
using System.Threading;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;
using SmartGym.Application.Services;
using Xunit;

namespace SmartGym.Tests;

public sealed class Flow5RecommendationServiceTests
{
    [Fact]
    public async Task Generate_draft_runs_provider_pipeline_and_persists_ai_draft()
    {
        var sportId = Guid.NewGuid();
        var memberId = Guid.NewGuid();
        var request = new GenerateFlow5RecommendationRequest
        {
            Target = new Flow5TargetDto { Type = Flow5TargetTypes.Member, Id = memberId },
            SportId = sportId,
            Level = "basic",
            Goal = "Improve strength",
            DurationMinutes = 60,
            ExerciseCount = 1
        };
        var context = new Flow5WorkoutContextDto
        {
            Coach = new Flow5ContextCoachDto { CoachId = Guid.NewGuid() },
            RequestedSport = new Flow5SportContextDto { Id = sportId, Name = "Gym" },
            Target = request.Target,
            Member = new Flow5MemberContextDto { MemberId = memberId }
        };
        var provider = new FakeProvider("""
            {"planName":"Strength draft","description":"Safe draft","goal":"Improve strength","level":"basic","durationMinutes":60,"exercises":[{"name":"Squat","sets":"3","reps":"10","order":1}]}
            """);
        var plans = new CapturingPlanService();
        var service = new Flow5RecommendationService(
            new Flow5WorkoutPlanValidator(),
            new Flow5PromptBuilder(),
            provider,
            new Flow5RecommendationJsonParser(),
            plans);

        var result = await service.GenerateDraftAsync(Guid.NewGuid(), request, context);

        Assert.True(result.IsSuccess);
        Assert.True(provider.WasCalled);
        Assert.NotNull(plans.Request);
        Assert.Equal(Flow5PlanSources.AiRecommendation, plans.Request!.Source);
        Assert.Equal(request.Target.Id, plans.Request.Target!.Id);
        Assert.Equal("Strength draft", plans.Request.PlanName);
        Assert.Equal("gemini", plans.Request.AiMetadata!.Provider);
    }

    private sealed class FakeProvider : IAiRecommendationProvider
    {
        private readonly string _content;
        public bool WasCalled { get; private set; }

        public FakeProvider(string content) => _content = content;

        public Task<AiProviderResponse> GenerateAsync(
            AiProviderRequest request,
            CancellationToken cancellationToken = default)
        {
            WasCalled = true;
            return Task.FromResult(AiProviderResponse.Success("gemini", "test-model", _content));
        }
    }

    private sealed class CapturingPlanService : IFlow5WorkoutPlanService
    {
        public CreateFlow5DraftRequest? Request { get; private set; }

        public Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> CreateDraftAsync(
            Guid coachId,
            CreateFlow5DraftRequest request,
            CancellationToken cancellationToken = default)
        {
            Request = request;
            return Task.FromResult(Flow5PlanServiceResult<Flow5WorkoutPlanResponse>.Success(
                new Flow5WorkoutPlanResponse { PlanName = request.PlanName }));
        }

        public Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> UpdateDraftAsync(
            Guid coachId, Guid planId, UpdateFlow5DraftRequest request,
            CancellationToken cancellationToken = default) => NotImplemented();

        public Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> ApproveAsync(
            Guid coachId, Guid planId, ApproveFlow5PlanRequest request,
            CancellationToken cancellationToken = default) => NotImplemented();

        public Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> CloneAsync(
            Guid coachId, Guid planId, CloneFlow5PlanRequest request,
            CancellationToken cancellationToken = default) => NotImplemented();

        public Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> ArchiveAsync(
            Guid coachId, Guid planId, ApproveFlow5PlanRequest request,
            CancellationToken cancellationToken = default) => NotImplemented();

        public Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> GetAsync(
            Guid coachId, Guid planId,
            CancellationToken cancellationToken = default) => NotImplemented();

        private static Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> NotImplemented() =>
            Task.FromResult(Flow5PlanServiceResult<Flow5WorkoutPlanResponse>.Failure(
                "not_implemented", "Not used by this test."));
    }
}
