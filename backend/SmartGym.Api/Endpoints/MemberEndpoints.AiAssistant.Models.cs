using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.Json;

namespace SmartGym.Api.Endpoints
{
    public static partial class MemberEndpoints
    {
        private const int AiMaxQuestionLength = 1000;
        private const int AiMaxHistoryTurns = 6;
        private const int AiMaxHistoryTextLength = 500;
        private const int AiPerMemberRequestsPerMinute = 8;

        // Whitelisted actions the frontend knows how to handle (maps to MemberScreen or the ticket tab).
        private static readonly Dictionary<string, string> AiActionLabels = new(StringComparer.OrdinalIgnoreCase)
        {
            ["schedule"] = "Xem lịch tập của tôi",
            ["booking"] = "Đặt lớp / PT 1-1",
            ["packages"] = "Xem gói tập & Bảng giá",
            ["packages_sport"] = "Xem gói môn tập",
            ["packages_membership"] = "Xem gói thành viên VIP",
            ["payments"] = "Xem ví & Lịch sử thanh toán",
            ["workouts"] = "Xem giáo án & bài tập",
            ["attendance"] = "Xem lịch sử điểm danh",
            ["chat"] = "Nhắn tin với HLV",
            ["shop"] = "Ghé Cửa hàng sản phẩm",
            ["support_ticket"] = "Gửi phiếu hỗ trợ cho Lễ tân",
        };

        private sealed class MemberAiContext
        {
            public string? UserId { get; set; }
            public string FullName { get; set; } = "Hội viên";
            public string? TrainingGoal { get; set; }
            public string? TrainingLevel { get; set; }
            public List<string> ActivePackages { get; } = new();
            public List<string> UpcomingSessions { get; } = new();
            public List<string> CompletedSessions { get; } = new();
            public List<string> AssignedWorkouts { get; } = new();
            public string? BodyMetricsSummary { get; set; }
            public List<string> RecentCheckIns { get; } = new();
            public List<string> RecentInvoices { get; } = new();
            public List<string> PackageBenefits { get; } = new();
            public string? AssignedCoachInfo { get; set; }
            public List<string> RecentCoachAssessments { get; } = new();
            public decimal? WalletBalance { get; set; }
            public List<string> RecentWalletTransactions { get; } = new();
            public List<string> AvailablePackages { get; } = new();
            public List<string> StoreProducts { get; } = new();
            public List<string> CenterCoaches { get; } = new();
            public List<string> CenterFacilities { get; } = new();
            public bool IsAuthenticated => !string.IsNullOrEmpty(UserId);
        }

        private sealed class AiProductRow
        {
            public string Name { get; set; } = string.Empty;
            public string Category { get; set; } = string.Empty;
            public decimal Price { get; set; }
            public int StockQuantity { get; set; }
        }

        private sealed class AiPackageRow
        {
            public string Name { get; set; } = string.Empty;
            public decimal MonthlyPrice { get; set; }
            public decimal YearlyPrice { get; set; }
            public string Tagline { get; set; } = string.Empty;
            public string PackageType { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
        }

        private sealed class AiAllCoachRow
        {
            public string FullName { get; set; } = string.Empty;
            public string Specialties { get; set; } = string.Empty;
            public string Sports { get; set; } = string.Empty;
            public string Certifications { get; set; } = string.Empty;
            public string Bio { get; set; } = string.Empty;
            public int ExperienceYears { get; set; }
            public decimal Rating { get; set; }
        }

        private sealed class AiFacilityRow
        {
            public string Name { get; set; } = string.Empty;
            public string Address { get; set; } = string.Empty;
        }

        private sealed class AiWalletTxRow
        {
            public string Id { get; set; } = string.Empty;
            public string Type { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public string Method { get; set; } = string.Empty;
            public string Status { get; set; } = string.Empty;
            public string Note { get; set; } = string.Empty;
            public DateTime CreatedAt { get; set; }
        }

        private sealed class AiUpcomingClassRow
        {
            public string ClassName { get; set; } = string.Empty;
            public string Sport { get; set; } = string.Empty;
            public string Room { get; set; } = string.Empty;
            public DateTime ScheduleTime { get; set; }
            public int DurationMinutes { get; set; }
            public string CoachName { get; set; } = string.Empty;
        }

        private sealed class AiUpcomingPtRow
        {
            public string Sport { get; set; } = string.Empty;
            public string Room { get; set; } = string.Empty;
            public DateTime ScheduleTime { get; set; }
            public string CoachName { get; set; } = string.Empty;
        }

        private sealed class AiAppointmentRow
        {
            public string? Title { get; set; }
            public string? Time { get; set; }
            public string? Date { get; set; }
            public string? CoachName { get; set; }
            public string? Status { get; set; }
        }

        private sealed class AiCheckInRow
        {
            public DateTime CheckInTime { get; set; }
            public DateTime? CheckOutTime { get; set; }
            public string Method { get; set; } = string.Empty;
        }

        private sealed class AiCoachInfoRow
        {
            public string CoachName { get; set; } = string.Empty;
            public string Specialties { get; set; } = string.Empty;
        }

        private sealed class AiCoachAssessmentRow
        {
            public int Completion { get; set; }
            public string? MetricsJson { get; set; }
            public string? Comment { get; set; }
            public string? NextStep { get; set; }
            public DateTime CreatedAt { get; set; }
            public string ClassName { get; set; } = string.Empty;
            public string CoachName { get; set; } = string.Empty;
            public string SportName { get; set; } = string.Empty;
        }

        private static DateTime ToVn(DateTime utc) => DateTime.SpecifyKind(utc, DateTimeKind.Utc).AddHours(7);

        private static string FormatVnDateTime(DateTime local, CultureInfo vi)
        {
            var today = ToVn(DateTime.UtcNow).Date;
            var label = local.Date == today ? "Hôm nay"
                : local.Date == today.AddDays(1) ? "Ngày mai"
                : CultureInfo.CurrentCulture.TextInfo.ToTitleCase(local.ToString("dddd", vi));
            return $"{label} {local:dd/MM} lúc {local:HH:mm}";
        }

        private static List<(string Role, string Text)> ReadChatHistory(JsonElement body)
        {
            var turns = new List<(string, string)>();
            if (body.ValueKind != JsonValueKind.Object
                || !body.TryGetProperty("history", out var history)
                || history.ValueKind != JsonValueKind.Array)
                return turns;

            foreach (var item in history.EnumerateArray())
            {
                if (item.ValueKind != JsonValueKind.Object) continue;
                var role = item.TryGetProperty("role", out var r) && r.ValueKind == JsonValueKind.String ? r.GetString() : null;
                var text = item.TryGetProperty("text", out var t) && t.ValueKind == JsonValueKind.String ? t.GetString() : null;
                if (string.IsNullOrWhiteSpace(text)) continue;
                role = role == "ai" ? "Trợ lý" : "Hội viên";
                text = text!.Length > AiMaxHistoryTextLength ? text[..AiMaxHistoryTextLength] + "…" : text;
                turns.Add((role, text));
            }

            return turns.Count > AiMaxHistoryTurns ? turns.Skip(turns.Count - AiMaxHistoryTurns).ToList() : turns;
        }
    }
}

