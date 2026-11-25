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

    public Flow5RecommendationService(
        IFlow5WorkoutPlanValidator validator,
        IFlow5PromptBuilder promptBuilder,
        IAiRecommendationProvider provider,
        IFlow5RecommendationJsonParser parser)
    {
        _validator = validator;
        _promptBuilder = promptBuilder;
        _provider = provider;
        _parser = parser;
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

        // Generation is a preview operation. Persist only after the coach explicitly
        // saves the draft or approves it into the library.
        var now = DateTimeOffset.UtcNow;
        return Flow5PlanServiceResult<Flow5WorkoutPlanResponse>.Success(new Flow5WorkoutPlanResponse
        {
            Id = Guid.Empty,
            CoachId = coachId,
            SportId = draftRequest.SportId,
            PlanName = draftRequest.PlanName,
            Description = draftRequest.Description,
            Goal = draftRequest.Goal,
            Level = draftRequest.Level,
            DurationMinutes = draftRequest.DurationMinutes,
            Status = Flow5PlanStatuses.Draft,
            Source = draftRequest.Source,
            Version = 0,
            RecommendationTarget = draftRequest.Target,
            AiMetadata = draftRequest.AiMetadata,
            CreatedAt = now,
            UpdatedAt = now,
            Exercises = draftRequest.Exercises
        });
    }

private static int[] AllocateDurations(int totalMinutes, int count)
    {
        if (count <= 0) return Array.Empty<int>();
        if (count == 1) return new[] { totalMinutes };

        var durations = new int[count];
        int warmup = Math.Clamp(totalMinutes * 15 / 100, 3, 10);
        int cooldown = Math.Clamp(totalMinutes * 15 / 100, 3, 10);
        durations[0] = warmup;
        durations[count - 1] = cooldown;

        int remaining = totalMinutes - warmup - cooldown;
        int mainCount = count - 2;
        if (mainCount > 0)
        {
            int baseMins = remaining / mainCount;
            int rem = remaining % mainCount;
            for (int i = 1; i <= mainCount; i++)
            {
                durations[i] = baseMins + (i <= rem ? 1 : 0);
            }
        }
        else
        {
            durations[0] = totalMinutes / 2;
            durations[1] = totalMinutes - durations[0];
        }
        return durations;
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
            : "Tăng cường thể lực & Kỹ thuật";

        var planName = $"Giáo án {sportName} - {effectiveGoal}";
        if (planName.Length > 160) planName = planName[..160];

        var sLower = sportName.ToLowerInvariant();
        var gLower = effectiveGoal.ToLowerInvariant();
        var level = !string.IsNullOrWhiteSpace(request.Level) ? request.Level.ToLowerInvariant() : "cơ bản";
        var isAdvanced = level.Contains("nâng cao") || level.Contains("advanced");
        var isIntermediate = level.Contains("trung cấp") || level.Contains("intermediate");

        // Equipment analysis
        var eqList = request.Equipment ?? new List<string>();
        var hasRacket = eqList.Any(e => e.Contains("vợt", StringComparison.OrdinalIgnoreCase) || e.Contains("racket", StringComparison.OrdinalIgnoreCase));
        var hasMat = eqList.Any(e => e.Contains("thảm", StringComparison.OrdinalIgnoreCase) || e.Contains("mat", StringComparison.OrdinalIgnoreCase));
        var hasBand = eqList.Any(e => e.Contains("kháng lực", StringComparison.OrdinalIgnoreCase) || e.Contains("band", StringComparison.OrdinalIgnoreCase));
        var hasDumbbells = eqList.Any(e => e.Contains("tạ tay", StringComparison.OrdinalIgnoreCase) || e.Contains("dumbbell", StringComparison.OrdinalIgnoreCase));

        // Class / Target context
        var isClass = context.Class is not null || string.Equals(request.Target.Type, "class", StringComparison.OrdinalIgnoreCase);
        var className = context.Class?.ClassName ?? "Lớp nhóm";
        var targetDesc = isClass ? $"lớp {className}" : "học viên";

        // Level parameters
        string defaultSets = isAdvanced ? "4-5" : (isIntermediate ? "4" : "3");
        string defaultRest = isAdvanced ? "30s" : (isIntermediate ? "45s" : "60s");

        var warmups = new List<Flow5ExerciseDto>();
        var mains = new List<Flow5ExerciseDto>();
        var cooldowns = new List<Flow5ExerciseDto>();

        var rng = new Random();

        if (sLower.Contains("cầu lông") || sLower.Contains("badminton"))
        {
            warmups.Add(new Flow5ExerciseDto
            {
                Name = "Khởi động cổ chân, khớp gối & Bước di chuyển bộ pháp 6 góc sân (Footwork drill)",
                Sets = "3",
                Reps = isAdvanced ? "20 lan" : "15 lan",
                Rest = defaultRest,
                Note = isClass
                    ? $"Học viên {className} chia cặp di chuyển luân phiên 6 góc sân, hạ thấp trọng tâm và giữ vững thăng bằng."
                    : "Hạ thấp trọng tâm, di chuyển bước chéo và bước đuổi linh hoạt nhịp nhàng theo góc sân."
            });
            warmups.Add(new Flow5ExerciseDto
            {
                Name = "Nhảy dây tốc độ cao & Khởi động khớp cổ tay toàn diện",
                Sets = "3",
                Reps = "50 lan",
                Rest = "45s",
                Note = "Bật nhảy bằng mũi bàn chân, xoay cổ tay đều đặn tăng độ linh hoạt khi vung vợt."
            });

            mains.Add(new Flow5ExerciseDto
            {
                Name = "Tập đập cầu cắm sân & Bật nhảy Smash liên hoàn (Jump Smash & Recovery)",
                Sets = defaultSets,
                Reps = isAdvanced ? "20 lan" : "12-15 lan",
                Rest = defaultRest,
                Note = isClass
                    ? $"Học viên A phát cầu bổng cuối sân, học viên B bật nhảy đập cầu cắm sân rồi đổi vai sau mỗi hiệp trong {className}."
                    : (hasRacket ? "Cầm vợt đúng kỹ thuật V-grip, xoay vai phát lực từ lườn và cổ tay, tiếp đất êm ái." : "Bật nhảy vung tay mô phỏng động tác smash, tiếp đất an toàn trên mũi chân.")
            });

            mains.Add(new Flow5ExerciseDto
            {
                Name = "Tập phông cầu cao sâu cuối sân & Ve cầu trái tay (Clear & Backhand shot)",
                Sets = defaultSets,
                Reps = isAdvanced ? "20 lan" : "15 lan",
                Rest = defaultRest,
                Note = isClass
                    ? "Đánh đôi công qua lại cuối sân: Duy trì đường cầu bổng sâu sát vạch giới hạn cuối sân đối phương."
                    : "Cầm vợt lỏng tay, siết lực dứt khoát vào thời điểm mặt vợt chạm cầu để cầu bay bổng sâu."
            });

            mains.Add(new Flow5ExerciseDto
            {
                Name = "Tập phản tạt cầu ngang mặt lưới đôi công tốc độ cao (Drive & Net kill drill)",
                Sets = defaultSets,
                Reps = isAdvanced ? "25 lan" : "15-20 lan",
                Rest = defaultRest,
                Note = "Giữ mặt vợt luôn ở tư thế sẵn sàng trước ngực, khóa cổ tay nhanh để phản xạ những pha cầu nhanh."
            });

            mains.Add(new Flow5ExerciseDto
            {
                Name = "Tập bỏ nhỏ sát lưới & Kéo lưới đánh lừa đối thủ (Drop shot & Net tumble)",
                Sets = defaultSets,
                Reps = "12-15 lan",
                Rest = defaultRest,
                Note = "Cảm giác chạm cầu tinh tế, thả lỏng cổ tay điều hướng cầu bay sát mép trên của lưới."
            });

            mains.Add(new Flow5ExerciseDto
            {
                Name = "Di chuyển con thoi nhặt cầu tăng tốc độ bứt phá & Sức bền thể lực (Shuttle run agility)",
                Sets = defaultSets,
                Reps = isAdvanced ? "10 lan" : "6-8 lan",
                Rest = defaultRest,
                Note = "Bứt tốc ngắn sang 2 biên và lùi sâu về góc sân, rèn luyện sức bền anaerobic tối đa cho thi đấu."
            });

            mains.Add(new Flow5ExerciseDto
            {
                Name = "Phòng thủ đập cầu 2 bên nách & Đẩy cầu sâu phản công (Smash defense & Lift drill)",
                Sets = defaultSets,
                Reps = "15 lan",
                Rest = defaultRest,
                Note = "Hạ thấp trọng tâm, mở mặt vợt đón đường đập cầu của đối phương và hất sâu về cuối sân."
            });

            cooldowns.Add(new Flow5ExerciseDto
            {
                Name = "Giãn cơ bả vai, cẳng tay, gân gót Achilles & Thả lỏng hạ nhiệt",
                Sets = "1",
                Reps = "1 lan",
                Rest = "30s",
                Note = "Kéo giãn chậm các nhóm cơ chịu tải cao khi vung vợt và bật nhảy, điều hòa nhịp thở sâu."
            });
            cooldowns.Add(new Flow5ExerciseDto
            {
                Name = "Thả lỏng khớp gối, căng cơ đùi trước và cơ lưng hông",
                Sets = "1",
                Reps = "1 lan",
                Rest = "30s",
                Note = "Hạ nhịp tim dần dần, đào thải axit lactic và thư giãn hoàn toàn hệ thần kinh vận động."
            });
        }
        else if (sLower.Contains("bơi") || sLower.Contains("swim"))
        {
            warmups.Add(new Flow5ExerciseDto
            {
                Name = "Khởi động xoay khớp vai trên cạn & Thở bong bóng dưới nước",
                Sets = "1",
                Reps = "1 lan",
                Rest = "30s",
                Note = "Hít sâu bằng miệng trên mặt nước và thở ra từ từ bằng mũi dưới nước."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Đập chân sải với phao bơi (Kickboard flutter kick)",
                Sets = defaultSets,
                Reps = isAdvanced ? "50m" : "25m",
                Rest = defaultRest,
                Note = "Phát lực đập chân từ khớp hông, gối hơi cong nhẹ, mũi chân duỗi thẳng."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Kỹ thuật quạt tay bơi sải & Bắt nước (Freestyle catch & pull drill)",
                Sets = defaultSets,
                Reps = isAdvanced ? "50m" : "25m",
                Rest = defaultRest,
                Note = "Cùi chỏ đặt cao khi ôm nước, đẩy nước dứt khoát về phía sau đùi."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Bơi ếch phối hợp thở nhịp nhàng (Breaststroke coordination)",
                Sets = defaultSets,
                Reps = isAdvanced ? "50m" : "25m",
                Rest = defaultRest,
                Note = "Quy trình chuẩn: Quạt tay ngóc đầu thở - Thu chân đạp nước - Lướt nước thư giãn."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Bơi bứt tốc 25m cường độ cao tăng sức bền tim mạch",
                Sets = defaultSets,
                Reps = isAdvanced ? "4 lan" : "2 lan",
                Rest = "60s",
                Note = "Huy động tối đa công suất quạt tay và đạp chân trong cự ly ngắn."
            });
            cooldowns.Add(new Flow5ExerciseDto
            {
                Name = "Bơi thả lỏng nổi ngửa & Giãn cơ toàn thân trong nước",
                Sets = "1",
                Reps = "1 lan",
                Rest = "30s",
                Note = "Thả lỏng toàn bộ cơ bắp, điều hòa nhịp thở và nhịp tim về trạng thái bình thường."
            });
        }
        else if (sLower.Contains("pilates"))
        {
            warmups.Add(new Flow5ExerciseDto
            {
                Name = "Thở lồng ngực Pilates & Khởi động vùng xương chậu (Pelvic Clock)",
                Sets = "1",
                Reps = "1 lan",
                Rest = "30s",
                Note = "Hít sâu mở rộng khung sườn 2 bên, thở ra siết chặt cơ sàn chậu và cơ bụng sâu."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Chuỗi động tác The Hundred (100 nhịp thở siết cơ lõi)",
                Sets = defaultSets,
                Reps = "100 lan",
                Rest = defaultRest,
                Note = "Nâng đầu cổ vai cách sàn, đập tay nhịp nhàng 5 nhịp hít - 5 nhịp thở, siết chặt rốn về cột sống."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Single Leg Stretch & Criss Cross thắt eo con kiến",
                Sets = defaultSets,
                Reps = isAdvanced ? "20 lan" : "12 lan",
                Rest = defaultRest,
                Note = "Xoay lồng ngực hướng nách về phía đầu gối đối diện, giữ xương chậu cố định trên thảm."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Roll Up & Roll Over kéo giãn từng đốt sống lưng",
                Sets = defaultSets,
                Reps = "10 lan",
                Rest = defaultRest,
                Note = "Cuộn từng đốt sống lưng lên và xuống có kiểm soát, không dùng lực quán tính của vai."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Teaser thăng bằng trên xương ngồi & Giữ vững cơ bụng",
                Sets = defaultSets,
                Reps = isAdvanced ? "10 lan" : "6-8 lan",
                Rest = defaultRest,
                Note = "Nâng thân trên và chân tạo thành hình chữ V, mở rộng ngực và giữ lưng thẳng."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Side Kick Series định hình cơ đùi ngoài và cơ mông",
                Sets = defaultSets,
                Reps = "15 lan moi ben",
                Rest = defaultRest,
                Note = "Đá chân trước sau với biên độ ổn định, giữ cơ thể không bị đung đưa."
            });
            cooldowns.Add(new Flow5ExerciseDto
            {
                Name = "Tư thế Đứa Trẻ (Child's Pose) & Kéo giãn cột sống sâu",
                Sets = "1",
                Reps = "1 lan",
                Rest = "30s",
                Note = "Thả lỏng toàn bộ cơ lưng, vai và mông đùi, hít thở sâu thư thái."
            });
        }
        else if (sLower.Contains("zumba"))
        {
            warmups.Add(new Flow5ExerciseDto
            {
                Name = "Warm-up Salsa & Merengue nhịp điệu Latin sôi động",
                Sets = "1",
                Reps = "1 lan",
                Rest = "30s",
                Note = "Làm nóng toàn thân, xoay khớp hông và hòa nhịp theo từng tiết tấu âm nhạc sôi động."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Cumbia chuyển động hông & Bước trượt uyển chuyển",
                Sets = defaultSets,
                Reps = "20 lan",
                Rest = defaultRest,
                Note = "Đánh hông dứt khoát theo nhịp chẵn lẻ, tay vung nhịp nhàng tạo đường cong cơ thể."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Reggaeton bật nhảy đốt mỡ cường độ cao (Cardio Peak)",
                Sets = defaultSets,
                Reps = "25 lan",
                Rest = defaultRest,
                Note = "Hạ thấp trọng tâm squat bật nhảy, kích hoạt nhóm cơ đùi mông và đốt calo tối đa."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Bachata bước cơ bản kết hợp sóng thân người quyến rũ",
                Sets = defaultSets,
                Reps = "20 lan",
                Rest = defaultRest,
                Note = "Bước ngang 3 nhịp và nhấn hông ở nhịp thứ 4, thả lỏng toàn bộ khớp vai và cổ."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Tổ hợp vũ đạo Latin Pop nhịp điệu nhanh toàn thân",
                Sets = defaultSets,
                Reps = "30 lan",
                Rest = defaultRest,
                Note = "Phối hợp toàn diện tay chân theo bài nhảy, duy trì nụ cười và năng lượng tích cực."
            });
            cooldowns.Add(new Flow5ExerciseDto
            {
                Name = "Cool-down giãn cơ theo giai điệu Acoustic êm dịu",
                Sets = "1",
                Reps = "1 lan",
                Rest = "30s",
                Note = "Kéo giãn cơ bắp chân, cơ đùi và cơ liên sườn, hạ nhịp tim từ từ về trạng thái thư giãn."
            });
        }
        else if (sLower.Contains("boxing"))
        {
            warmups.Add(new Flow5ExerciseDto
            {
                Name = "Nhảy dây tốc độ & Di chuyển bộ pháp (Footwork)",
                Sets = "3",
                Reps = "50 lan",
                Rest = "60s",
                Note = "Duy trì nhịp thở đều, chuyển trọng tâm linh hoạt trên mũi chân."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Shadow boxing tổ hợp đòn (Jab - Cross - Hook - Uppercut)",
                Sets = defaultSets,
                Reps = isAdvanced ? "25 lan" : "20 lan",
                Rest = defaultRest,
                Note = "Siết chặt cơ lõi, xoay hông phát lực và thu tay che hàm sau mỗi đòn đánh."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Tập đấm bao cát nặng phát lực (Heavy bag power punches)",
                Sets = defaultSets,
                Reps = isAdvanced ? "20 lan" : "15 lan",
                Rest = defaultRest,
                Note = "Phát lực xoay từ khớp hông và mũi chân, khóa cổ tay chắc chắn khi va chạm."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Tập phản xạ luồn lách né đòn (Slip & Duck drill)",
                Sets = defaultSets,
                Reps = "20 lan",
                Rest = defaultRest,
                Note = "Hạ thấp gối, giữ thắt lưng thẳng và mắt luôn nhìn thẳng vào đối thủ."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Hít đất kim cương & Plank tăng lực cổ tay",
                Sets = defaultSets,
                Reps = "15 lan",
                Rest = defaultRest,
                Note = "Tăng sức chịu đựng của khớp tay và bả vai khi tung đòn đấm."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Bài tập tốc độ đấm bóng dây phản xạ (Speed ball drill)",
                Sets = defaultSets,
                Reps = "30 lan",
                Rest = defaultRest,
                Note = "Rèn luyện khả năng quan sát và phản xạ nhấp đấm chuẩn xác theo nhịp bóng nảy."
            });
            cooldowns.Add(new Flow5ExerciseDto
            {
                Name = "Giãn cơ vai, cẳng tay & xả cơ lưng xô",
                Sets = "1",
                Reps = "1 lan",
                Rest = "30s",
                Note = "Thư giãn hoàn toàn hệ thần kinh và xoa bóp nhẹ các khớp cơ."
            });
        }
        else if (sLower.Contains("bóng đá") || sLower.Contains("football") || sLower.Contains("futsal"))
        {
            warmups.Add(new Flow5ExerciseDto
            {
                Name = "Khởi động động & Chạy thang dây phối hợp (Agility ladder)",
                Sets = "3",
                Reps = "6 lan",
                Rest = "60s",
                Note = "Tăng guồng chân nhanh và khả năng đổi hướng tức thì trong không gian hẹp."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Dẫn bóng zíc zắc qua cọc & Chuyền bật tường 1 chạm",
                Sets = defaultSets,
                Reps = "20 lan",
                Rest = defaultRest,
                Note = "Mắt quan sát bao quát, tiếp xúc bóng êm bằng lòng trong và mu bàn chân."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Tập sút bóng sống mu chính diện & Khống chế bước một",
                Sets = defaultSets,
                Reps = "12 lan",
                Rest = defaultRest,
                Note = "Khóa cổ chân chắc chắn, vung chân theo đà hướng bóng vào góc hiểm."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Bật nhảy tranh chấp bóng bổng & Bứt tốc đoạn ngắn 10m",
                Sets = defaultSets,
                Reps = "8 lan",
                Rest = defaultRest,
                Note = "Rèn sức bật cổ chân và phản xạ bứt tốc tức thì tranh cướp bóng."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Tập chuyền dài vượt tuyến & Chuyển trạng thái tấn công",
                Sets = defaultSets,
                Reps = "12 lan",
                Rest = defaultRest,
                Note = "Ước lượng quỹ đạo bóng và điểm rơi chuẩn xác cho đồng đội băng lên."
            });
            cooldowns.Add(new Flow5ExerciseDto
            {
                Name = "Đi bộ thả lỏng & Căng cơ đùi trước, gân kheo",
                Sets = "1",
                Reps = "1 lan",
                Rest = "30s",
                Note = "Hạ nhịp tim dần dần, đào thải axit lactic tích tụ sau buổi vận động mạnh."
            });
        }
        else if (sLower.Contains("yoga"))
        {
            warmups.Add(new Flow5ExerciseDto
            {
                Name = "Thở Pranayama & Khởi động nhẹ khớp cổ, vai",
                Sets = "1",
                Reps = "1 lan",
                Rest = "30s",
                Note = "Hít sâu thở chậm bằng mũi, tập trung tâm trí vào từng hơi thở."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Chuỗi Chào Mặt Trời (Surya Namaskar)",
                Sets = defaultSets,
                Reps = "6 lan",
                Rest = defaultRest,
                Note = "Chuyển động nhịp nhàng theo từng nhịp hít thở, kéo giãn toàn bộ cơ thể."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Tư thế Chiến Binh II (Virabhadrasana II) & Tam Giác",
                Sets = defaultSets,
                Reps = "6 lan",
                Rest = defaultRest,
                Note = "Mở rộng lồng ngực, hạ thấp trọng tâm vững chãi, siết chặt cơ đùi."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Tư thế Cây Cầu (Setu Bandhasana) & Vặn mình",
                Sets = defaultSets,
                Reps = "6 lan",
                Rest = defaultRest,
                Note = "Bảo vệ thắt lưng, thư giãn cột sống sâu và mở rộng khớp hông."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Tư thế Rắn Hổ Mang (Bhujangasana) mở ngực",
                Sets = defaultSets,
                Reps = "6 lan",
                Rest = defaultRest,
                Note = "Kéo giãn cột sống lưng an toàn và giải tỏa căng thẳng vùng vai gáy."
            });
            cooldowns.Add(new Flow5ExerciseDto
            {
                Name = "Tư thế Xác Chết (Savasana) thư giãn sâu",
                Sets = "1",
                Reps = "1 lan",
                Rest = "30s",
                Note = "Tĩnh tâm, thả lỏng trọn vẹn từng thớ cơ và hồi phục hoàn toàn năng lượng."
            });
        }
        else
        {
            // Gym / Fitness
            warmups.Add(new Flow5ExerciseDto
            {
                Name = "Khởi động xoay khớp & Đi bộ dốc trên máy chạy (Treadmill warm-up)",
                Sets = "1",
                Reps = "1 lan",
                Rest = "30s",
                Note = "Làm nóng cơ thể và tăng tuần hoàn máu toàn thân trước khi vào bài tập chính."
            });
            warmups.Add(new Flow5ExerciseDto
            {
                Name = "Khởi động nhảy dây & Xoay khớp vai toàn diện",
                Sets = "1",
                Reps = "1 lan",
                Rest = "30s",
                Note = "Kích hoạt hệ thần kinh vận động và nhịp tim ổn định."
            });

            mains.Add(new Flow5ExerciseDto
            {
                Name = "Gánh tạ đòn trên vai (Barbell Back Squat)",
                Sets = defaultSets,
                Reps = isAdvanced ? "12-15 lan" : "10-12 lan",
                Rest = defaultRest,
                Note = "Giữ thẳng lưng, siết cơ bụng và phát lực từ gót chân lên."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Đẩy ngực tạ đòn trên ghế bằng (Barbell Bench Press)",
                Sets = defaultSets,
                Reps = "10-12 lan",
                Rest = defaultRest,
                Note = "Ép bả vai, hạ tạ có kiểm soát và thở ra dứt khoát khi đẩy tạ lên."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Kéo lưng xô với cáp rộng tay (Lat Pulldown)",
                Sets = defaultSets,
                Reps = "12 lan",
                Rest = defaultRest,
                Note = "Kéo thanh đòn về phía xương ức, ép chặt cơ lưng xô."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Đẩy tạ đơn qua đầu phát triển cơ vai (Dumbbell Shoulder Press)",
                Sets = defaultSets,
                Reps = "10-12 lan",
                Rest = defaultRest,
                Note = "Không khóa thẳng khớp cùi chỏ ở điểm cao nhất, bảo vệ khớp vai."
            });
            mains.Add(new Flow5ExerciseDto
            {
                Name = "Plank tĩnh chuẩn form & Xoay hông củng cố cơ lõi",
                Sets = defaultSets,
                Reps = "1 lan",
                Rest = defaultRest,
                Note = "Giữ thân người thẳng như một tấm ván, siết chặt cơ mông và cơ bụng."
            });

            cooldowns.Add(new Flow5ExerciseDto
            {
                Name = "Căng giãn cơ toàn thân trên thảm & Hạ nhiệt",
                Sets = "1",
                Reps = "1 lan",
                Rest = "30s",
                Note = "Thư giãn các nhóm cơ chính, hỗ trợ phục hồi cơ bắp nhanh chóng sau buổi tập."
            });
        }

        // Combine candidates: 1 warmup, (targetCount - 2) mains, 1 cooldown
        var targetCount = Math.Clamp(request.ExerciseCount ?? 5, 1, 20);
        var finalExercises = new List<Flow5ExerciseDto>();

        // Pick 1 warmup
        var pickedWarmup = warmups[rng.Next(warmups.Count)];
        finalExercises.Add(pickedWarmup);

        int mainSlots = Math.Max(0, targetCount - (targetCount >= 2 ? 2 : 1));
        var shuffledMains = mains.OrderBy(_ => rng.Next()).ToList();
        for (int i = 0; i < mainSlots; i++)
        {
            var template = shuffledMains[i % shuffledMains.Count];
            finalExercises.Add(new Flow5ExerciseDto
            {
                Name = i >= shuffledMains.Count ? $"{template.Name} (Biến thể {i + 1})" : template.Name,
                Sets = template.Sets,
                Reps = template.Reps,
                Rest = template.Rest,
                Note = template.Note
            });
        }

        // Pick cooldown if targetCount >= 2
        if (targetCount >= 2)
        {
            var pickedCooldown = cooldowns[rng.Next(cooldowns.Count)];
            finalExercises.Add(pickedCooldown);
        }

        // Allocate exact duration in minutes for each exercise
        var allocatedDurations = AllocateDurations(request.DurationMinutes, finalExercises.Count);
        for (int i = 0; i < finalExercises.Count; i++)
        {
            finalExercises[i].Order = i + 1;
            finalExercises[i].Duration = $"{allocatedDurations[i]} min";
        }

        return new Flow5AiRecommendationOutputDto
        {
            PlanName = planName,
            Description = $"Kế hoạch huấn luyện chuyên sâu bộ môn {sportName} dành cho {targetDesc}, được tối ưu hóa cho mục tiêu {effectiveGoal} ở cấp độ {request.Level}. Bài tập tập trung phát triển kỹ năng cốt lõi và thể lực chuyên biệt với tổng thời lượng {request.DurationMinutes} phút.",
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
