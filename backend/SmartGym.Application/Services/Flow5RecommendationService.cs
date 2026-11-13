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

        Flow5AiRecommendationOutputDto? recommendation = null;
        string providerName = providerResponse.Provider;
        string modelName = providerResponse.Model;
        int? inputTokens = providerResponse.InputTokens;
        int? outputTokens = providerResponse.OutputTokens;

        if (providerResponse.IsSuccess && !string.IsNullOrWhiteSpace(providerResponse.Content))
        {
            var parsed = _parser.Parse(providerResponse.Content);
            if (parsed.IsSuccess && parsed.Recommendation is not null)
            {
                var recommendationValidation = _validator.ValidateRecommendation(
                    request,
                    context,
                    parsed.Recommendation);

                if (recommendationValidation.IsValid)
                {
                    recommendation = parsed.Recommendation;
                }
            }
        }

        // Fallback gracefully if AI provider is unreachable, quota exceeded, or returned invalid output
        if (recommendation is null)
        {
            recommendation = BuildFallbackRecommendation(request, context);
            providerName = "RuleBasedFallback";
            modelName = "sport-expert-v1";
        }

        var draftRequest = new CreateFlow5DraftRequest
        {
            PlanName = recommendation.PlanName,
            SportId = request.SportId,
            Description = recommendation.Description,
            Goal = recommendation.Goal ?? request.Goal,
            Level = recommendation.Level ?? request.Level,
            DurationMinutes = recommendation.DurationMinutes,
            Source = Flow5PlanSources.AiRecommendation,
            Target = request.Target,
            AiMetadata = new Flow5AiMetadataDto
            {
                Provider = providerName,
                Model = modelName,
                PromptVersion = PromptVersion,
                GeneratedAt = DateTimeOffset.UtcNow,
                InputTokens = inputTokens,
                OutputTokens = outputTokens
            },
            Exercises = recommendation.Exercises
        };

        return await _planService.CreateDraftAsync(coachId, draftRequest, cancellationToken);
    }

    private static Flow5AiRecommendationOutputDto BuildFallbackRecommendation(
        GenerateFlow5RecommendationRequest request,
        Flow5WorkoutContextDto context)
    {
        var sportName = !string.IsNullOrWhiteSpace(context.RequestedSport?.Name)
            ? context.RequestedSport.Name
            : "Thể hình & Thể thao";
        var planName = $"Giáo án {sportName} - {request.Goal}";
        if (planName.Length > 160) planName = planName[..160];

        var exercises = new List<Flow5ExerciseDto>();
        var sLower = sportName.ToLowerInvariant();

        if (sLower.Contains("boxing"))
        {
            exercises.Add(new Flow5ExerciseDto { Name = "Nhảy dây khởi động & Di chuyển bước chân (Footwork)", Sets = "3", Reps = "3 phút", Duration = "10 phút", Note = "Giữ nhịp thở đều, thả lỏng cổ chân", Order = 1 });
            exercises.Add(new Flow5ExerciseDto { Name = "Đấm bóng phản xạ / Shadow boxing (Jab - Cross - Hook)", Sets = "4", Reps = "3 phút", Duration = "12 phút", Note = "Siết cơ bụng, thu tay về thái dương sau mỗi cú đấm", Order = 2 });
            exercises.Add(new Flow5ExerciseDto { Name = "Tập đấm bao cát nặng kết hợp né đòn (Heavy bag combo)", Sets = "4", Reps = "15 lần/tổ hợp", Duration = "12 phút", Note = "Tạo lực từ hông và chân", Order = 3 });
            exercises.Add(new Flow5ExerciseDto { Name = "Hít đất kim cương & Plank tăng sức mạnh lõi", Sets = "3", Reps = "15 lần / 60s", Duration = "8 phút", Note = "Siết cơ trung tâm", Order = 4 });
            exercises.Add(new Flow5ExerciseDto { Name = "Giãn cơ vai, lưng xô & thả lỏng", Sets = "1", Reps = "1 lần", Duration = "5 phút", Note = "Thả lỏng hoàn toàn cơ bắp", Order = 5 });
        }
        else if (sLower.Contains("yoga"))
        {
            exercises.Add(new Flow5ExerciseDto { Name = "Thở Pranayama & Khởi động nhẹ khớp cổ, vai", Sets = "1", Reps = "5 phút", Duration = "5 phút", Note = "Hít sâu thở chậm bằng mũi", Order = 1 });
            exercises.Add(new Flow5ExerciseDto { Name = "Chuỗi Chào Mặt Trời (Surya Namaskar)", Sets = "5", Reps = "5 vòng", Duration = "10 phút", Note = "Chuyển động nhịp nhàng theo hơi thở", Order = 2 });
            exercises.Add(new Flow5ExerciseDto { Name = "Tư thế Chiến Binh II (Virabhadrasana II) & Tam Giác", Sets = "3", Reps = "5 nhịp thở/bên", Duration = "10 phút", Note = "Mở rộng lồng ngực, hạ thấp trọng tâm", Order = 3 });
            exercises.Add(new Flow5ExerciseDto { Name = "Tư thế Cây Cầu (Setu Bandhasana) & Vặn mình", Sets = "3", Reps = "30 giây", Duration = "10 phút", Note = "Bảo vệ thắt lưng, thư giãn cột sống", Order = 4 });
            exercises.Add(new Flow5ExerciseDto { Name = "Tư thế Xác Chết (Savasana) thư giãn sâu", Sets = "1", Reps = "1 lần", Duration = "10 phút", Note = "Tĩnh tâm và hồi phục hoàn toàn", Order = 5 });
        }
        else if (sLower.Contains("bóng đá") || sLower.Contains("football"))
        {
            exercises.Add(new Flow5ExerciseDto { Name = "Khởi động động & Chạy zíc zắc qua cọc (Agility ladder)", Sets = "3", Reps = "5 phút", Duration = "8 phút", Note = "Tăng tốc độ guồng chân và thăng bằng", Order = 1 });
            exercises.Add(new Flow5ExerciseDto { Name = "Dẫn bóng biến tốc & Chuyền ban bật 1 chạm (One-touch pass)", Sets = "4", Reps = "20 lần", Duration = "12 phút", Note = "Mắt quan sát rộng, tiếp xúc bóng bằng lòng bàn chân", Order = 2 });
            exercises.Add(new Flow5ExerciseDto { Name = "Tập dứt điểm cầu môn & Sút bóng sống sau đường chuyền", Sets = "4", Reps = "10 cú sút", Duration = "12 phút", Note = "Khóa cổ chân khi tiếp bóng", Order = 3 });
            exercises.Add(new Flow5ExerciseDto { Name = "Bật nhảy đánh đầu & Bứt tốc cự ly ngắn (Interval sprint)", Sets = "4", Reps = "6 lần", Duration = "8 phút", Note = "Rèn thể lực và sức bật", Order = 4 });
            exercises.Add(new Flow5ExerciseDto { Name = "Đi bộ thả lỏng & Căng cơ đùi trước, bắp chân", Sets = "1", Reps = "1 lần", Duration = "5 phút", Note = "Hạ nhịp tim từ từ", Order = 5 });
        }
        else
        {
            exercises.Add(new Flow5ExerciseDto { Name = "Khởi động xoay khớp & Đi bộ dốc trên máy chạy (Treadmill warm-up)", Sets = "1", Reps = "5-7 phút", Duration = "7 phút", Note = "Làm nóng cơ thể và tăng tuần hoàn máu", Order = 1 });
            exercises.Add(new Flow5ExerciseDto { Name = "Gánh tạ đòn (Barbell Squat) / Goblet Squat", Sets = "4", Reps = "10-12 lần", Duration = "12 phút", Note = "Giữ lưng thẳng, siết mông khi đứng lên", Order = 2 });
            exercises.Add(new Flow5ExerciseDto { Name = "Đẩy ngực tạ đòn trên ghế bằng (Barbell Bench Press)", Sets = "4", Reps = "10-12 lần", Duration = "12 phút", Note = "Hạ tạ có kiểm soát, thở ra khi đẩy", Order = 3 });
            exercises.Add(new Flow5ExerciseDto { Name = "Kéo lưng xô với cáp (Lat Pulldown) / Bent-over Row", Sets = "4", Reps = "12 lần", Duration = "10 phút", Note = "Ép chặt bả vai về sau", Order = 4 });
            exercises.Add(new Flow5ExerciseDto { Name = "Gập bụng (Cable Crunch) & Plank tĩnh", Sets = "3", Reps = "15 lần / 45s", Duration = "6 phút", Note = "Siết chặt cơ bụng", Order = 5 });
            exercises.Add(new Flow5ExerciseDto { Name = "Căng giãn cơ toàn thân & Hạ nhiệt", Sets = "1", Reps = "1 lần", Duration = "5 phút", Note = "Thư giãn các nhóm cơ chính", Order = 6 });
        }

        return new Flow5AiRecommendationOutputDto
        {
            PlanName = planName,
            Description = $"Kế hoạch huấn luyện chuyên sâu bộ môn {sportName}, được tối ưu hóa cho mục tiêu {request.Goal} ở cấp độ {request.Level}.",
            Goal = request.Goal,
            Level = request.Level,
            DurationMinutes = request.DurationMinutes,
            Exercises = exercises
        };
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
