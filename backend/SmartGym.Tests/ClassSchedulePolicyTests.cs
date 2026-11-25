using SmartGym.Application.DTOs.ClassScheduling;
using SmartGym.Application.Services;
using Xunit;

namespace SmartGym.Tests;

public sealed class ClassSchedulePolicyTests
{
    private readonly ClassSchedulePolicy _policy = new();
    private static readonly DateTimeOffset Now = new(2026, 11, 1, 0, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Recurring_by_weeks_generates_every_selected_day()
    {
        var result = _policy.Preview(new SchedulePreviewRequest
        {
            ScheduleType = "RECURRING",
            StartDate = new DateOnly(2026, 11, 2),
            StartTime = new TimeOnly(8, 0),
            DurationMinutes = 60,
            DaysOfWeek = [DayOfWeek.Monday, DayOfWeek.Thursday],
            EndMode = "BY_WEEKS",
            Weeks = 4,
        }, Now);

        Assert.True(result.IsValid);
        Assert.Equal(8, result.TotalSessions);
        Assert.Equal(new DateOnly(2026, 11, 26), result.CalculatedEndDate);
        Assert.All(result.Sessions, session => Assert.Equal(TimeSpan.FromHours(7), session.StartAt.Offset));
    }

    [Fact]
    public void Recurring_missing_weeks_is_rejected()
    {
        var result = _policy.Preview(new SchedulePreviewRequest
        {
            ScheduleType = "RECURRING",
            StartDate = new DateOnly(2026, 11, 2),
            StartTime = new TimeOnly(8, 0),
            DurationMinutes = 60,
            DaysOfWeek = [DayOfWeek.Monday, DayOfWeek.Thursday],
            EndMode = "BY_WEEKS",
        }, Now);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.Contains("weeks là bắt buộc"));
    }

    [Fact]
    public void Recurring_rejects_unsupported_end_mode()
    {
        var result = _policy.Preview(new SchedulePreviewRequest
        {
            ScheduleType = "RECURRING",
            StartDate = new DateOnly(2026, 11, 2),
            StartTime = new TimeOnly(8, 0),
            DurationMinutes = 60,
            DaysOfWeek = [DayOfWeek.Monday, DayOfWeek.Thursday],
            EndMode = "BY_END_DATE",
            Weeks = 4,
        }, Now);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.Contains("chỉ hỗ trợ sinh lịch theo tuần"));
    }

    [Fact]
    public void One_time_schedule_generates_exactly_one_session()
    {
        var result = _policy.Preview(new SchedulePreviewRequest
        {
            ScheduleType = "ONE_TIME",
            StartDate = new DateOnly(2026, 11, 2),
            StartTime = new TimeOnly(8, 0),
            DurationMinutes = 60,
        }, Now);

        Assert.True(result.IsValid);
        Assert.Single(result.Sessions);
        Assert.Equal(1, result.TotalSessions);
    }

    [Fact]
    public void First_session_exactly_24_hours_ahead_is_allowed()
    {
        var result = _policy.Preview(new SchedulePreviewRequest
        {
            ScheduleType = "ONE_TIME",
            StartDate = new DateOnly(2026, 11, 2),
            StartTime = new TimeOnly(7, 0),
            DurationMinutes = 60,
        }, Now);

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(25)]
    public void Recurring_rejects_weeks_out_of_range(int invalidWeeks)
    {
        var result = _policy.Preview(new SchedulePreviewRequest
        {
            ScheduleType = "RECURRING",
            StartDate = new DateOnly(2026, 11, 2),
            StartTime = new TimeOnly(8, 0),
            DurationMinutes = 60,
            DaysOfWeek = [DayOfWeek.Monday],
            EndMode = "BY_WEEKS",
            Weeks = invalidWeeks,
        }, Now);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.Contains("weeks phải trong khoảng 1 đến 24"));
    }

    [Fact]
    public void Recurring_rejects_start_date_outside_selected_days()
    {
        var result = _policy.Preview(new SchedulePreviewRequest
        {
            ScheduleType = "RECURRING",
            StartDate = new DateOnly(2026, 11, 3),
            StartTime = new TimeOnly(8, 0),
            DurationMinutes = 60,
            DaysOfWeek = [DayOfWeek.Monday],
            EndMode = "BY_WEEKS",
            Weeks = 2,
        }, Now);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.Contains("Buổi 1"));
    }

    [Theory]
    [InlineData(5, 0, 60)]
    [InlineData(21, 0, 90)]
    [InlineData(8, 0, 20)]
    public void Preview_rejects_sessions_outside_operating_rules(int hour, int minute, int duration)
    {
        var result = _policy.Preview(new SchedulePreviewRequest
        {
            ScheduleType = "ONE_TIME",
            StartDate = new DateOnly(2026, 11, 3),
            StartTime = new TimeOnly(hour, minute),
            DurationMinutes = duration,
        }, Now);

        Assert.False(result.IsValid);
    }
}
