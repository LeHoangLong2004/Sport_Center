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
    public void Recurring_rejects_multiple_end_modes()
    {
        var result = _policy.Preview(new SchedulePreviewRequest
        {
            ScheduleType = "RECURRING",
            StartDate = new DateOnly(2026, 11, 2),
            StartTime = new TimeOnly(8, 0),
            DurationMinutes = 60,
            DaysOfWeek = [DayOfWeek.Monday],
            EndMode = "BY_WEEKS",
            Weeks = 2,
            TotalSessions = 2,
        }, Now);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.Contains("đúng một end_mode"));
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
            EndMode = "BY_SESSION_COUNT",
            TotalSessions = 2,
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
