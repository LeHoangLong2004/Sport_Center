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

        var effectiveGoal = !string.IsNullOrWhiteSpace(request.Goal)
            ? request.Goal.Trim()
            : "Tăng cường thể lực & Sức khỏe";

        var planName = $"Giáo án {sportName} - {effectiveGoal}";
        if (planName.Length > 160) planName = planName[..160];

        var sLower = sportName.ToLowerInvariant();
        var gLower = effectiveGoal.ToLowerInvariant();
        var candidates = new List<Flow5ExerciseDto>();

        var rng = new Random();

        if (sLower.Contains("boxing"))
        {
            candidates.Add(new Flow5ExerciseDto { Name = "Nhảy dây tốc độ & Di chuyển bộ pháp (Footwork)", Sets = "3", Reps = "50 lan", Duration = "5 min", Rest = "60s", Note = "Duy trì nhịp thở đều, chuyển trọng tâm linh hoạt" });
            candidates.Add(new Flow5ExerciseDto { Name = "Shadow boxing tổ hợp đòn (Jab - Cross - Hook - Uppercut)", Sets = "4", Reps = "20 lan", Duration = "10 min", Rest = "60s", Note = "Siết chặt cơ lõi, thu tay che hàm sau mỗi đòn đánh" });
            candidates.Add(new Flow5ExerciseDto { Name = "Tập đấm bao cát nặng phát lực (Heavy bag power punches)", Sets = "4", Reps = "15 lan", Duration = "10 min", Rest = "60s", Note = "Phát lực xoay từ khớp hông và mũi chân" });
            candidates.Add(new Flow5ExerciseDto { Name = "Tập phản xạ luồn lách né đòn (Slip & Duck drill)", Sets = "4", Reps = "20 lan", Duration = "8 min", Rest = "60s", Note = "Hạ thấp gối, giữ thắt lưng thẳng" });
            candidates.Add(new Flow5ExerciseDto { Name = "Hít đất kim cương & Plank tăng lực cổ tay", Sets = "3", Reps = "15 lan", Duration = "8 min", Rest = "60s", Note = "Tăng sức chịu đựng của khớp tay khi va chạm" });
            candidates.Add(new Flow5ExerciseDto { Name = "Bài tập tốc độ đấm bóng dây phản xạ (Speed ball drill)", Sets = "3", Reps = "30 lan", Duration = "6 min", Rest = "45s", Note = "Rèn luyện khả năng quan sát và phản xạ nhanh" });
            candidates.Add(new Flow5ExerciseDto { Name = "Burpees bật nhảy kết hợp đấm thẳng", Sets = "3", Reps = "12 lan", Duration = "6 min", Rest = "60s", Note = "Đốt mỡ tối đa và tăng cường sức bền tim mạch" });
            candidates.Add(new Flow5ExerciseDto { Name = "Giãn cơ vai, cẳng tay & xả cơ lưng xô", Sets = "1", Reps = "1 lan", Duration = "5 min", Rest = "30s", Note = "Thư giãn hoàn toàn hệ thần kinh và cơ bắp" });
        }
        else if (sLower.Contains("yoga"))
        {
            candidates.Add(new Flow5ExerciseDto { Name = "Thở Pranayama & Khởi động nhẹ khớp cổ, vai", Sets = "1", Reps = "1 lan", Duration = "5 min", Rest = "30s", Note = "Hít sâu thở chậm bằng mũi, tập trung tâm trí" });
            candidates.Add(new Flow5ExerciseDto { Name = "Chuỗi Chào Mặt Trời (Surya Namaskar)", Sets = "5", Reps = "5 lan", Duration = "10 min", Rest = "60s", Note = "Chuyển động nhịp nhàng theo từng nhịp hít thở" });
            candidates.Add(new Flow5ExerciseDto { Name = "Tư thế Chiến Binh II (Virabhadrasana II) & Tam Giác", Sets = "3", Reps = "5 lan", Duration = "10 min", Rest = "60s", Note = "Mở rộng lồng ngực, hạ thấp trọng tâm vững chãi" });
            candidates.Add(new Flow5ExerciseDto { Name = "Tư thế Cây Cầu (Setu Bandhasana) & Vặn mình", Sets = "3", Reps = "5 lan", Duration = "8 min", Rest = "60s", Note = "Bảo vệ thắt lưng, thư giãn cột sống sâu" });
            candidates.Add(new Flow5ExerciseDto { Name = "Tư thế Rắn Hổ Mang (Bhujangasana) mở ngực", Sets = "3", Reps = "5 lan", Duration = "6 min", Rest = "60s", Note = "Kéo giãn cột sống lưng an toàn và giải tỏa căng thẳng" });
            candidates.Add(new Flow5ExerciseDto { Name = "Tư thế Cánh Bướm (Baddha Konasana) mở khớp háng", Sets = "3", Reps = "8 lan", Duration = "6 min", Rest = "45s", Note = "Giải phóng áp lực vùng xương chậu" });
            candidates.Add(new Flow5ExerciseDto { Name = "Tư thế Đứa Trẻ (Balasana) phục hồi", Sets = "2", Reps = "1 lan", Duration = "5 min", Rest = "30s", Note = "Thả lỏng toàn bộ cơ lưng và vai" });
            candidates.Add(new Flow5ExerciseDto { Name = "Tư thế Xác Chết (Savasana) thư giãn sâu", Sets = "1", Reps = "1 lan", Duration = "6 min", Rest = "30s", Note = "Tĩnh tâm và hồi phục hoàn toàn năng lượng" });
        }
        else if (sLower.Contains("bóng đá") || sLower.Contains("football"))
        {
            candidates.Add(new Flow5ExerciseDto { Name = "Khởi động động & Chạy thang dây phối hợp (Agility ladder)", Sets = "3", Reps = "6 lan", Duration = "8 min", Rest = "60s", Note = "Tăng guồng chân nhanh và khả năng đổi hướng tức thì" });
            candidates.Add(new Flow5ExerciseDto { Name = "Dẫn bóng zíc zắc qua cọc & Chuyền bật tường 1 chạm", Sets = "4", Reps = "20 lan", Duration = "12 min", Rest = "60s", Note = "Mắt quan sát bao quát, tiếp xúc bóng êm bằng lòng trong" });
            candidates.Add(new Flow5ExerciseDto { Name = "Tập sút bóng sống mu chính diện & Khống chế bước một", Sets = "4", Reps = "10 lan", Duration = "10 min", Rest = "60s", Note = "Khóa cổ chân chắc chắn, vung chân theo đà" });
            candidates.Add(new Flow5ExerciseDto { Name = "Bật nhảy tranh chấp bóng bổng & Bứt tốc đoạn ngắn", Sets = "4", Reps = "6 lan", Duration = "8 min", Rest = "60s", Note = "Rèn sức bật cổ chân và phản xạ bứt tốc trong cự ly 10m" });
            candidates.Add(new Flow5ExerciseDto { Name = "Tập chuyền dài vượt tuyến & Chuyển trạng thái tấn công", Sets = "3", Reps = "12 lan", Duration = "8 min", Rest = "60s", Note = "Ước lượng quỹ đạo bóng và điểm rơi chuẩn xác" });
            candidates.Add(new Flow5ExerciseDto { Name = "Di chuyển phòng ngự 1 kèm 1 & Tì đè tranh chấp", Sets = "3", Reps = "8 lan", Duration = "8 min", Rest = "60s", Note = "Hạ thấp trọng tâm, không lao người cản phá mù quáng" });
            candidates.Add(new Flow5ExerciseDto { Name = "Đi bộ thả lỏng & Căng cơ đùi trước, gân kheo", Sets = "1", Reps = "1 lan", Duration = "5 min", Rest = "30s", Note = "Hạ nhịp tim dần dần, đào thải axit lactic tích tụ" });
        }
        else
        {
            // Rich Gym Exercise Pool categorized by body target & goals
            var warmups = new[]
            {
                new Flow5ExerciseDto { Name = "Khởi động xoay khớp & Đi bộ dốc trên máy chạy (Treadmill warm-up)", Sets = "1", Reps = "1 lan", Duration = "7 min", Rest = "30s", Note = "Làm nóng cơ thể và tăng tuần hoàn máu toàn thân" },
                new Flow5ExerciseDto { Name = "Khởi động nhảy dây & Xoay khớp vai toàn diện", Sets = "1", Reps = "1 lan", Duration = "6 min", Rest = "30s", Note = "Kích hoạt hệ thần kinh vận động và nhịp tim ổn định" },
                new Flow5ExerciseDto { Name = "Đạp xe biến tốc nhẹ nhàng (Air Bike Warm-up)", Sets = "1", Reps = "1 lan", Duration = "6 min", Rest = "30s", Note = "Làm ấm khớp gối, cổ chân và kích hoạt cơ mông đùi" }
            };

            var mainLifts = new[]
            {
                new Flow5ExerciseDto { Name = "Gánh tạ đòn trên vai (Barbell Back Squat)", Sets = "4", Reps = "10-12", Duration = "12 min", Rest = "90s", Note = "Giữ thẳng lưng, siết cơ bụng và phát lực từ gót chân" },
                new Flow5ExerciseDto { Name = "Đẩy ngực tạ đòn trên ghế bằng (Barbell Bench Press)", Sets = "4", Reps = "10-12", Duration = "12 min", Rest = "90s", Note = "Ép bả vai, hạ tạ có kiểm soát và thở ra dứt khoát khi đẩy" },
                new Flow5ExerciseDto { Name = "Kéo lưng xô với cáp rộng tay (Lat Pulldown)", Sets = "4", Reps = "12 lan", Duration = "10 min", Rest = "60s", Note = "Kéo thanh đòn về phía xương ức, ép chặt cơ lưng xô" },
                new Flow5ExerciseDto { Name = "Đẩy ngực tạ đơn trên ghế nghiêng dốc lên (Incline Dumbbell Press)", Sets = "4", Reps = "10-12", Duration = "10 min", Rest = "75s", Note = "Phát triển phần ngực trên, duỗi ngực hết biên độ" },
                new Flow5ExerciseDto { Name = "Kéo tạ đòn gập người (Barbell Bent-over Row)", Sets = "4", Reps = "10-12", Duration = "10 min", Rest = "75s", Note = "Khóa chặt sống lưng, kéo tạ chạm rốn" },
                new Flow5ExerciseDto { Name = "Đẩy tạ đơn qua đầu phát triển cơ vai (Dumbbell Shoulder Press)", Sets = "4", Reps = "10-12", Duration = "10 min", Rest = "60s", Note = "Không khóa thẳng khớp cùi chỏ ở điểm cao nhất" },
                new Flow5ExerciseDto { Name = "Nâng đùi đẩy máy tạ (Leg Press 45 độ)", Sets = "4", Reps = "12-15", Duration = "10 min", Rest = "90s", Note = "Bàn chân đặt rộng bằng vai, hạ sâu có kiểm soát" },
                new Flow5ExerciseDto { Name = "Deadlift với tạ đòn (Romanian Deadlift)", Sets = "4", Reps = "10-12", Duration = "12 min", Rest = "90s", Note = "Đẩy hông về phía sau, cảm nhận căng cơ đùi sau và mông" },
                new Flow5ExerciseDto { Name = "Bung ngực với máy ép cáp (Cable Flyes)", Sets = "3", Reps = "15 lan", Duration = "8 min", Rest = "60s", Note = "Tập trung cảm giác ép cơ ngực giữa" },
                new Flow5ExerciseDto { Name = "Cuốn tạ đòn tập cơ tay trước (Barbell Bicep Curl)", Sets = "3", Reps = "12 lan", Duration = "8 min", Rest = "60s", Note = "Giữ cố định cánh tay, không đung đưa thân người" },
                new Flow5ExerciseDto { Name = "Kéo cáp qua đầu tập cơ tay sau (Tricep Rope Pushdown)", Sets = "3", Reps = "15 lan", Duration = "8 min", Rest = "60s", Note = "Tách dây cáp ở điểm cuối để kích hoạt trọn vẹn tay sau" }
            };

            var coreAndCoolDown = new[]
            {
                new Flow5ExerciseDto { Name = "Gập bụng trên máy kéo cáp (Cable Crunch)", Sets = "3", Reps = "15 lan", Duration = "6 min", Rest = "60s", Note = "Cuộn tròn cột sống, siết chặt cơ bụng 6 múi" },
                new Flow5ExerciseDto { Name = "Treo người nâng gối trên xà đơn (Hanging Knee Raise)", Sets = "3", Reps = "12-15", Duration = "6 min", Rest = "60s", Note = "Tập trung siết cơ bụng dưới, không dùng lực quán tính" },
                new Flow5ExerciseDto { Name = "Plank tĩnh chuẩn form & Xoay hông", Sets = "3", Reps = "1 lan", Duration = "5 min", Rest = "45s", Note = "Giữ thân người thẳng như một tấm ván, siết mông bụng" },
                new Flow5ExerciseDto { Name = "Con lăn tập bụng (Ab Roller Wheel)", Sets = "3", Reps = "10-12", Duration = "6 min", Rest = "60s", Note = "Kiểm soát độ gồng cơ lõi khi đẩy con lăn ra xa" },
                new Flow5ExerciseDto { Name = "Căng giãn cơ toàn thân trên thảm & Hạ nhiệt", Sets = "1", Reps = "1 lan", Duration = "5 min", Rest = "30s", Note = "Thư giãn các nhóm cơ chính, hỗ trợ phục hồi cơ bắp nhanh chóng" },
                new Flow5ExerciseDto { Name = "Dãn cơ lưng dưới, gân kheo và bắp chân", Sets = "1", Reps = "1 lan", Duration = "5 min", Rest = "30s", Note = "Kéo giãn chậm rãi, giữ nhịp thở sâu" }
            };

            // Mix: 1 warmup + randomized main lifts + core/cooldown
            var pickedWarmup = warmups[rng.Next(warmups.Length)];
            candidates.Add(pickedWarmup);

            // Shuffle main lifts
            var shuffledLifts = mainLifts.OrderBy(_ => rng.Next()).ToList();
            candidates.AddRange(shuffledLifts);

            // Add core & cooldowns
            var shuffledCore = coreAndCoolDown.OrderBy(_ => rng.Next()).ToList();
            candidates.AddRange(shuffledCore);
        }

        // Shuffle candidate pool if not gym (gym is already structured)
        if (sLower.Contains("boxing") || sLower.Contains("yoga") || sLower.Contains("bóng đá"))
        {
            var first = candidates.First();
            var last = candidates.Last();
            var middle = candidates.Skip(1).Take(candidates.Count - 2).OrderBy(_ => rng.Next()).ToList();
            candidates = new List<Flow5ExerciseDto> { first };
            candidates.AddRange(middle);
            candidates.Add(last);
        }

        // Must match request.ExerciseCount exactly if provided, otherwise default to 5
        var targetCount = Math.Clamp(request.ExerciseCount ?? 5, 1, 20);
        var finalExercises = new List<Flow5ExerciseDto>();
        for (var i = 0; i < targetCount; i++)
        {
            var template = candidates[i % candidates.Count];
            finalExercises.Add(new Flow5ExerciseDto
            {
                Name = i >= candidates.Count ? $"{template.Name} (Nâng cao {i + 1})" : template.Name,
                Sets = template.Sets,
                Reps = template.Reps,
                Duration = template.Duration,
                Rest = template.Rest,
                Note = template.Note,
                Order = i + 1
            });
        }

        return new Flow5AiRecommendationOutputDto
        {
            PlanName = planName,
            Description = $"Kế hoạch huấn luyện chuyên sâu bộ môn {sportName}, được tối ưu hóa cho mục tiêu {effectiveGoal} ở cấp độ {request.Level}.",
            Goal = request.Goal,
            Level = request.Level,
            DurationMinutes = request.DurationMinutes,
            Exercises = finalExercises
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
