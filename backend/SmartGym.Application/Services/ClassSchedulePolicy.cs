using SmartGym.Application.DTOs.ClassScheduling;

namespace SmartGym.Application.Services;

public sealed class ClassSchedulePolicy
{
    private static readonly TimeSpan VietnamOffset = TimeSpan.FromHours(7);
    private static readonly TimeOnly OpeningTime = new(6, 0);
    private static readonly TimeOnly ClosingTime = new(22, 0);

    public SchedulePreviewResult Preview(SchedulePreviewRequest request, DateTimeOffset nowUtc)
    {
        var errors = ValidateBaseRequest(request, nowUtc);
        if (errors.Count > 0)
            return Invalid(errors);

        var scheduleType = request.ScheduleType.Trim().ToUpperInvariant();
        if (scheduleType == "ONE_TIME")
        {
            var session = CreateSession(1, request.StartDate, request.StartTime, request.DurationMinutes);
            return new SchedulePreviewResult(true, [], [session], request.StartDate, 1);
        }

        errors.AddRange(ValidateRecurringRequest(request));
        if (errors.Count > 0)
            return Invalid(errors);

        var selectedDays = request.DaysOfWeek!.ToHashSet();
        if (!selectedDays.Contains(request.StartDate.DayOfWeek))
        {
            errors.Add("start_date phải là ngày diễn ra Buổi 1 và thuộc days_of_week.");
            return Invalid(errors);
        }

        var sessions = GenerateRecurringSessions(request, selectedDays);
        if (sessions.Count == 0)
            return Invalid(["Không thể sinh buổi học nào từ lịch đã chọn."]);

        return new SchedulePreviewResult(
            true,
            [],
            sessions,
            DateOnly.FromDateTime(sessions[^1].StartAt.Date),
            sessions.Count);
    }

    private static List<string> ValidateBaseRequest(SchedulePreviewRequest request, DateTimeOffset nowUtc)
    {
        var errors = new List<string>();
        var scheduleType = request.ScheduleType?.Trim().ToUpperInvariant();
        if (scheduleType is not ("ONE_TIME" or "RECURRING"))
            errors.Add("schedule_type chỉ nhận ONE_TIME hoặc RECURRING.");

        if (request.DurationMinutes is < 30 or > 180)
            errors.Add("duration_minutes phải trong khoảng 30 đến 180 phút.");

        if (request.StartTime < OpeningTime || request.StartTime.AddMinutes(request.DurationMinutes) > ClosingTime)
            errors.Add("Toàn bộ buổi học phải nằm trong khung 06:00 đến 22:00.");

        if (request.StartDate == default || request.StartTime == default)
            errors.Add("start_date và start_time là bắt buộc.");

        if (errors.Count > 0)
            return errors;

        var firstStart = CreateSession(1, request.StartDate, request.StartTime, request.DurationMinutes).StartAt;
        if (firstStart < nowUtc.AddHours(24))
            errors.Add("Buổi 1 phải bắt đầu sau thời điểm tạo ít nhất 24 giờ.");

        return errors;
    }

    private static List<string> ValidateRecurringRequest(SchedulePreviewRequest request)
    {
        var errors = new List<string>();
        if (request.DaysOfWeek == null || request.DaysOfWeek.Count == 0)
            errors.Add("days_of_week là bắt buộc cho lịch RECURRING.");

        if (!request.Weeks.HasValue)
        {
            errors.Add("weeks là bắt buộc cho lịch RECURRING.");
        }
        else if (request.Weeks is < 1 or > 24)
        {
            errors.Add("weeks phải trong khoảng 1 đến 24.");
        }

        if (!string.IsNullOrWhiteSpace(request.EndMode) &&
            !string.Equals(request.EndMode, "BY_WEEKS", StringComparison.OrdinalIgnoreCase))
        {
            errors.Add("Hệ thống chỉ hỗ trợ sinh lịch theo tuần (BY_WEEKS).");
        }

        return errors;
    }

    private static List<ScheduledSessionPreview> GenerateRecurringSessions(
        SchedulePreviewRequest request,
        HashSet<DayOfWeek> selectedDays)
    {
        var result = new List<ScheduledSessionPreview>();
        var finalDate = request.StartDate.AddDays(request.Weeks!.Value * 7 - 1);

        for (var date = request.StartDate; date <= finalDate; date = date.AddDays(1))
        {
            if (selectedDays.Contains(date.DayOfWeek))
                result.Add(CreateSession(result.Count + 1, date, request.StartTime, request.DurationMinutes));
        }

        return result;
    }

    private static ScheduledSessionPreview CreateSession(int number, DateOnly date, TimeOnly time, int durationMinutes)
    {
        var localStart = date.ToDateTime(time, DateTimeKind.Unspecified);
        var startAt = new DateTimeOffset(localStart, VietnamOffset);
        return new ScheduledSessionPreview(number, startAt, startAt.AddMinutes(durationMinutes));
    }

    private static SchedulePreviewResult Invalid(IReadOnlyList<string> errors) =>
        new(false, errors, [], null, 0);
}
