using System;
using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace SmartGym.Tests;

public class Flow4AttendanceCalculationTests
{
    public class AttendanceStreakCalculator
    {
        private static readonly TimeZoneInfo VietnamTimeZone =
            TimeZoneInfo.FindSystemTimeZoneById(OperatingSystem.IsWindows() ? "SE Asia Standard Time" : "Asia/Ho_Chi_Minh");

        public static DateTime ConvertToVietnamTime(DateTime utcDateTime)
        {
            var utc = DateTime.SpecifyKind(utcDateTime, DateTimeKind.Utc);
            return TimeZoneInfo.ConvertTimeFromUtc(utc, VietnamTimeZone);
        }

        public static int CalculateCurrentStreak(IEnumerable<DateTime> checkInTimesUtc)
        {
            var dates = checkInTimesUtc
                .Select(t => ConvertToVietnamTime(t).Date)
                .Distinct()
                .OrderByDescending(d => d)
                .ToList();

            if (!dates.Any()) return 0;

            var todayVn = ConvertToVietnamTime(DateTime.UtcNow).Date;
            var latest = dates.First();

            // Streak counts if latest checkin was today or yesterday
            if ((todayVn - latest).TotalDays > 1) return 0;

            int streak = 1;
            for (int i = 0; i < dates.Count - 1; i++)
            {
                if ((dates[i] - dates[i + 1]).TotalDays == 1)
                {
                    streak++;
                }
                else
                {
                    break;
                }
            }

            return streak;
        }

        public static bool IsInOffPeakHours(DateTime checkInTimeVn)
        {
            var hour = checkInTimeVn.Hour;
            // OffPeak is before 16:00 (4 PM)
            return hour < 16;
        }

        public static (int TotalSessions, double TotalMinutes, double AvgMinutesPerSession) CalculateMonthlyStats(IEnumerable<(DateTime CheckIn, DateTime? CheckOut)> sessions)
        {
            int total = 0;
            double totalMinutes = 0;

            foreach (var (cin, cout) in sessions)
            {
                total++;
                if (cout.HasValue && cout.Value >= cin)
                {
                    totalMinutes += (cout.Value - cin).TotalMinutes;
                }
                else
                {
                    totalMinutes += 60; // Default 60 min session if unclosed
                }
            }

            double avg = total > 0 ? Math.Round(totalMinutes / total, 1) : 0;
            return (total, Math.Round(totalMinutes, 1), avg);
        }
    }

    [Fact]
    public void ConvertToVietnamTime_ShouldAdd7HoursToUtc()
    {
        var utc = new DateTime(2026, 10, 28, 2, 0, 0, DateTimeKind.Utc);
        var vn = AttendanceStreakCalculator.ConvertToVietnamTime(utc);

        Assert.Equal(9, vn.Hour);
        Assert.Equal(28, vn.Day);
    }

    [Fact]
    public void CalculateCurrentStreak_ShouldReturnZero_WhenNoCheckIns()
    {
        var streak = AttendanceStreakCalculator.CalculateCurrentStreak(new List<DateTime>());
        Assert.Equal(0, streak);
    }

    [Fact]
    public void CalculateCurrentStreak_ShouldCountConsecutiveDays()
    {
        var nowUtc = DateTime.UtcNow;
        var checkIns = new List<DateTime>
        {
            nowUtc,
            nowUtc.AddDays(-1),
            nowUtc.AddDays(-2),
            nowUtc.AddDays(-3),
            nowUtc.AddDays(-4)
        };

        var streak = AttendanceStreakCalculator.CalculateCurrentStreak(checkIns);
        Assert.Equal(5, streak);
    }

    [Fact]
    public void CalculateCurrentStreak_ShouldBreak_WhenGapIsMoreThanOneDay()
    {
        var nowUtc = DateTime.UtcNow;
        var checkIns = new List<DateTime>
        {
            nowUtc,
            nowUtc.AddDays(-1),
            nowUtc.AddDays(-4), // 2 days gap here
            nowUtc.AddDays(-5)
        };

        var streak = AttendanceStreakCalculator.CalculateCurrentStreak(checkIns);
        Assert.Equal(2, streak);
    }

    [Theory]
    [InlineData(6, true)]
    [InlineData(11, true)]
    [InlineData(15, true)]
    [InlineData(16, false)]
    [InlineData(18, false)]
    [InlineData(20, false)]
    public void IsInOffPeakHours_ShouldCorrectlyValidate16HourThreshold(int hour, bool expectedOffPeak)
    {
        var dt = new DateTime(2026, 10, 28, hour, 0, 0);
        var isOffPeak = AttendanceStreakCalculator.IsInOffPeakHours(dt);
        Assert.Equal(expectedOffPeak, isOffPeak);
    }

    [Fact]
    public void CalculateMonthlyStats_ShouldComputeTotalMinutesAndAverageAccurately()
    {
        var baseDate = new DateTime(2026, 10, 1, 8, 0, 0, DateTimeKind.Utc);
        var sessions = new List<(DateTime CheckIn, DateTime? CheckOut)>
        {
            (baseDate, baseDate.AddMinutes(90)),
            (baseDate.AddDays(2), baseDate.AddDays(2).AddMinutes(60)),
            (baseDate.AddDays(4), baseDate.AddDays(4).AddMinutes(45)),
            (baseDate.AddDays(6), null) // unclosed -> defaults to 60 min
        };

        var (totalSessions, totalMinutes, avg) = AttendanceStreakCalculator.CalculateMonthlyStats(sessions);

        Assert.Equal(4, totalSessions);
        Assert.Equal(255.0, totalMinutes); // 90 + 60 + 45 + 60 = 255
        Assert.Equal(63.8, avg); // 255 / 4 = 63.75 -> 63.8
    }
}
