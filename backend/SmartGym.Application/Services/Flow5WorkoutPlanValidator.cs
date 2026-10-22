using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;

namespace SmartGym.Application.Services;

/// <summary>
/// Shared business validation for AI requests, AI output and workout-plan drafts.
/// It validates existing DTO data only and does not read or write the database.
/// </summary>
public sealed class Flow5WorkoutPlanValidator : IFlow5WorkoutPlanValidator
{
    private static readonly HashSet<string> SupportedLevels = new(StringComparer.Ordinal)
    {
        "co ban", "basic", "beginner", "nguoi moi",
        "trung cap", "intermediate", "nang cao", "advanced"
    };

    private static readonly HashSet<string> SupportedEquipment = new(StringComparer.Ordinal)
    {
        "tham tap", "ta tay", "ho boi", "xa don", "day khang luc",
        "khong dung cu", "ta don", "may tap", "kettlebell", "ghe tap",
        "vo cau long", "vot cau long", "bong", "day nhay", "kickboard", "phao boi"
    };

    private static readonly Regex SetsPattern = new(
        @"^\s*\d+\s*(?:sets?|hiep)?\s*$|^\s*\d+\s*[x×]\s*\d+\s*$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

    private static readonly Regex RepsPattern = new(
        @"^\s*\d+(?:\s*[-–]\s*\d+)?\s*(?:lan|reps?|repetitions?|cai|m|met|km)?(?:\s*moi\s*ben)?\s*$|^\s*\d+\s*[x×]\s*\d+(?:\s*(?:lan|cai|m|met|km))?\s*$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

    private static readonly Regex TimePattern = new(
        @"^\s*(?=\d)(?:(?:\d+)\s*(?:h|hr|gio)\s*)?(?:(?:\d+)\s*(?:m|min|phut)\s*)?(?:(?:\d+)\s*(?:s|sec|giay)\s*)?$|^\s*\d{1,2}:\d{2}\s*$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

    public Flow5ValidationResult ValidateGenerationRequest(
        GenerateFlow5RecommendationRequest request,
        Flow5WorkoutContextDto context)
    {
        var issues = new List<Flow5ValidationIssueDto>();
        ValidateTarget(request.Target, context.Target, issues);
        ValidateSport(request.SportId, context.RequestedSport.Id, issues);
        ValidateContextSport(context, issues);
        ValidateLevel(request.Level, issues);
        ValidateGoal(request.Goal, issues);
        ValidateEquipment(request.Equipment, issues);
        ValidateDuration(request.DurationMinutes, "durationMinutes", issues);

        if (request.ExerciseCount is < 1 or > 20)
            Add(issues, "exercise_count_range", "ExerciseCount must be between 1 and 20.", "exerciseCount");

        return ToResult(issues);
    }

    public Flow5ValidationResult ValidateRecommendation(
        GenerateFlow5RecommendationRequest request,
        Flow5WorkoutContextDto context,
        Flow5AiRecommendationOutputDto recommendation)
    {
        var issues = new List<Flow5ValidationIssueDto>();
        issues.AddRange(ValidateGenerationRequest(request, context).Issues);

        if (string.IsNullOrWhiteSpace(recommendation.PlanName))
            Add(issues, "plan_name_required", "The recommendation must contain a plan name.", "planName");
        else if (recommendation.PlanName.Length > 160)
            Add(issues, "plan_name_too_long", "PlanName must not exceed 160 characters.", "planName");

        ValidateTextLength(recommendation.Description, 1000, "description", issues);
        ValidateGoal(recommendation.Goal, issues);
        ValidateLevel(recommendation.Level, issues, required: false);
        if (!string.IsNullOrWhiteSpace(recommendation.Level)
            && CanonicalLevel(recommendation.Level) != CanonicalLevel(request.Level))
            Add(issues, "level_mismatch", "AI level must match the requested level.", "level");

        ValidateDuration(recommendation.DurationMinutes, "durationMinutes", issues);
        if (recommendation.DurationMinutes != request.DurationMinutes)
            Add(issues, "duration_mismatch", "AI duration must match the requested duration.", "durationMinutes");

        var exercises = recommendation.Exercises ?? new List<Flow5ExerciseDto>();
        if (exercises.Count == 0 || exercises.Count > 20)
            Add(issues, "exercise_count_invalid", "The recommendation must contain between 1 and 20 exercises.", "exercises");
        else if (request.ExerciseCount.HasValue && exercises.Count != request.ExerciseCount.Value)
            Add(issues, "exercise_count_mismatch", "AI exercise count must match the requested count.", "exercises");

        ValidateExercises(exercises, issues);
        return ToResult(issues);
    }

    public Flow5ValidationResult ValidateDraft(
        CreateFlow5DraftRequest request,
        Flow5WorkoutContextDto? context = null)
    {
        var issues = new List<Flow5ValidationIssueDto>();
        if (string.IsNullOrWhiteSpace(request.PlanName))
            Add(issues, "plan_name_required", "PlanName is required.", "planName");
        else if (request.PlanName.Length > 160)
            Add(issues, "plan_name_too_long", "PlanName must not exceed 160 characters.", "planName");

        if (!request.SportId.HasValue || request.SportId == Guid.Empty)
            Add(issues, "sport_required", "SportId is required for a Flow 5 plan.", "sportId");
        else if (context is not null)
        {
            ValidateSport(request.SportId.Value, context.RequestedSport.Id, issues);
            ValidateContextSport(context, issues);
        }

        ValidateLevel(request.Level, issues, required: false);
        ValidateGoal(request.Goal, issues);
        if (request.DurationMinutes.HasValue)
            ValidateDuration(request.DurationMinutes.Value, "durationMinutes", issues);

        var exercises = request.Exercises ?? new List<Flow5ExerciseDto>();
        if (exercises.Count == 0 || exercises.Count > 20)
            Add(issues, "exercise_count_invalid", "A plan must contain between 1 and 20 exercises.", "exercises");
        else
            ValidateExercises(exercises, issues);

        return ToResult(issues);
    }

    private static void ValidateTarget(
        Flow5TargetDto requestTarget,
        Flow5TargetDto contextTarget,
        ICollection<Flow5ValidationIssueDto> issues)
    {
        if (requestTarget is null || requestTarget.Id == Guid.Empty)
            Add(issues, "target_required", "A valid target is required.", "target");
        else if (!IsTargetType(requestTarget.Type))
            Add(issues, "target_type_invalid", "Target type must be member or class.", "target.type");
        else if (contextTarget.Id != requestTarget.Id
            || !string.Equals(contextTarget.Type, requestTarget.Type, StringComparison.OrdinalIgnoreCase))
            Add(issues, "target_context_mismatch", "The target does not match the authorized context.", "target");
    }

    private static void ValidateSport(Guid requestSportId, Guid contextSportId, ICollection<Flow5ValidationIssueDto> issues)
    {
        if (requestSportId == Guid.Empty)
            Add(issues, "sport_required", "SportId is required.", "sportId");
        else if (contextSportId == Guid.Empty || requestSportId != contextSportId)
            Add(issues, "sport_context_mismatch", "SportId does not match the authorized context.", "sportId");
    }

    private static void ValidateContextSport(
        Flow5WorkoutContextDto context,
        ICollection<Flow5ValidationIssueDto> issues)
    {
        if (context.Class is not null
            && context.Class.SportId != Guid.Empty
            && context.Class.SportId != context.RequestedSport.Id)
            Add(issues, "class_sport_mismatch", "The selected class does not belong to the requested sport.", "sportId");
    }

    private static void ValidateLevel(string? level, ICollection<Flow5ValidationIssueDto> issues, bool required = true)
    {
        if (string.IsNullOrWhiteSpace(level))
        {
            if (required) Add(issues, "level_required", "Level is required.", "level");
            return;
        }

        if (!SupportedLevels.Contains(Normalize(level)))
            Add(issues, "level_invalid", "Level must be a supported training level.", "level");
    }

    private static string CanonicalLevel(string? level) => Normalize(level) switch
    {
        "co ban" or "basic" or "beginner" or "nguoi moi" => "beginner",
        "trung cap" or "intermediate" => "intermediate",
        "nang cao" or "advanced" => "advanced",
        _ => string.Empty
    };

    private static void ValidateGoal(string? goal, ICollection<Flow5ValidationIssueDto> issues)
    {
        if (goal?.Length > 500)
            Add(issues, "goal_too_long", "Goal must not exceed 500 characters.", "goal");
    }

    private static void ValidateEquipment(List<string>? equipment, ICollection<Flow5ValidationIssueDto> issues)
    {
        if (equipment is null)
        {
            Add(issues, "equipment_invalid", "Equipment must be a list.", "equipment");
            return;
        }

        if (equipment.Count > 20)
            Add(issues, "equipment_count_invalid", "Equipment cannot contain more than 20 items.", "equipment");

        var normalized = new HashSet<string>(StringComparer.Ordinal);
        foreach (var item in equipment)
        {
            var key = Normalize(item);
            if (string.IsNullOrWhiteSpace(item) || item.Length > 80)
                Add(issues, "equipment_item_invalid", "Each equipment item must contain 1 to 80 characters.", "equipment");
            else if (!normalized.Add(key))
                Add(issues, "equipment_duplicate", "Equipment items must be unique.", "equipment");
            else if (!SupportedEquipment.Contains(key))
                Add(issues, "equipment_unsupported", $"Unsupported equipment: {item}.", "equipment");
        }

        var noEquipment = normalized.Contains("khong dung cu");
        if (noEquipment && normalized.Count > 1)
            Add(issues, "equipment_conflict", "Khong dung cu cannot be combined with another equipment item.", "equipment");
    }

    private static void ValidateDuration(int duration, string field, ICollection<Flow5ValidationIssueDto> issues)
    {
        if (duration is < 5 or > 240)
            Add(issues, "duration_range", "Duration must be between 5 and 240 minutes.", field);
    }

    private static void ValidateExercises(
        IReadOnlyList<Flow5ExerciseDto> exercises,
        ICollection<Flow5ValidationIssueDto> issues)
    {
        var orders = new HashSet<int>();
        for (var index = 0; index < exercises.Count; index++)
        {
            var exercise = exercises[index];
            var prefix = $"exercises[{index}]";
            if (string.IsNullOrWhiteSpace(exercise.Name))
                Add(issues, "exercise_name_required", "Exercise name is required.", $"{prefix}.name");
            else if (exercise.Name.Length > 160)
                Add(issues, "exercise_name_too_long", "Exercise name must not exceed 160 characters.", $"{prefix}.name");

            if (exercise.Order < 1 || exercise.Order > exercises.Count || !orders.Add(exercise.Order))
                Add(issues, "exercise_order_invalid", "Exercise order must be unique and sequential.", $"{prefix}.order");

            ValidateTextLength(exercise.Sets, 80, $"{prefix}.sets", issues);
            ValidateTextLength(exercise.Reps, 80, $"{prefix}.reps", issues);
            ValidateTextLength(exercise.Duration, 80, $"{prefix}.duration", issues);
            ValidateTextLength(exercise.Rest, 80, $"{prefix}.rest", issues);
            ValidateTextLength(exercise.Note, 500, $"{prefix}.note", issues);

            if (string.IsNullOrWhiteSpace(exercise.Sets)
                && string.IsNullOrWhiteSpace(exercise.Reps)
                && string.IsNullOrWhiteSpace(exercise.Duration))
                Add(issues, "dosage_required", "Exercise must specify sets, reps or duration.", prefix);

            if (!string.IsNullOrWhiteSpace(exercise.Sets) && !SetsPattern.IsMatch(exercise.Sets))
                Add(issues, "sets_format_invalid", "Sets must be a positive count or a count x count format.", $"{prefix}.sets");
            if (!string.IsNullOrWhiteSpace(exercise.Reps) && !RepsPattern.IsMatch(exercise.Reps))
                Add(issues, "reps_format_invalid", "Reps must use a positive count and an optional supported unit.", $"{prefix}.reps");
            if (!string.IsNullOrWhiteSpace(exercise.Duration) && !TimePattern.IsMatch(exercise.Duration))
                Add(issues, "duration_unit_invalid", "Duration must use h, min/phut, s/sec/giay or mm:ss.", $"{prefix}.duration");
            if (!string.IsNullOrWhiteSpace(exercise.Rest) && !TimePattern.IsMatch(exercise.Rest))
                Add(issues, "rest_unit_invalid", "Rest must use h, min/phut, s/sec/giay or mm:ss.", $"{prefix}.rest");
        }
    }

    private static void ValidateTextLength(
        string? value,
        int maxLength,
        string field,
        ICollection<Flow5ValidationIssueDto> issues)
    {
        if (value?.Length > maxLength)
            Add(issues, "field_too_long", $"Value must not exceed {maxLength} characters.", field);
    }

    private static bool IsTargetType(string? type) =>
        string.Equals(type, Flow5TargetTypes.Member, StringComparison.OrdinalIgnoreCase)
        || string.Equals(type, Flow5TargetTypes.Class, StringComparison.OrdinalIgnoreCase);

    private static string Normalize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        var decomposed = value.Trim().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(decomposed.Length);
        foreach (var character in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
                builder.Append(char.ToLowerInvariant(character));
        }

        return builder.ToString().Normalize(NormalizationForm.FormC);
    }

    private static void Add(
        ICollection<Flow5ValidationIssueDto> issues,
        string code,
        string message,
        string? field) => issues.Add(new Flow5ValidationIssueDto
        {
            Code = code,
            Message = message,
            Field = field
        });

    private static Flow5ValidationResult ToResult(List<Flow5ValidationIssueDto> issues) =>
        issues.Count == 0 ? Flow5ValidationResult.Valid() : Flow5ValidationResult.Invalid(issues);
}
