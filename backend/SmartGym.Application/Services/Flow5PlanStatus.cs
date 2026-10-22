using System.Globalization;
using System.Text;
using SmartGym.Application.DTOs.WorkoutPlans;

namespace SmartGym.Application.Services;

/// <summary>
/// Centralizes persisted workout-plan status values used by Flow 5 and the
/// legacy curriculum/homework endpoints.
/// </summary>
public static class Flow5PlanStatus
{
    public static bool IsDraft(string? status) => Is(status, Flow5PlanStatuses.Draft);

    public static bool IsApproved(string? status) => Is(status, Flow5PlanStatuses.Approved);

    public static bool Is(string? status, string expected) =>
        string.Equals(Normalize(status), expected, StringComparison.Ordinal);

    public static string Normalize(string? status)
    {
        var normalized = RemoveDiacritics(status).ToLowerInvariant();
        return normalized switch
        {
            "draft" or "nhap" => Flow5PlanStatuses.Draft,
            "approved" or "da duyet" => Flow5PlanStatuses.Approved,
            "assigned" or "da giao" => Flow5PlanStatuses.Assigned,
            "archived" or "luu tru" => Flow5PlanStatuses.Archived,
            _ => status?.Trim().ToLowerInvariant() ?? string.Empty
        };
    }

    private static string RemoveDiacritics(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return string.Empty;
        var decomposed = value.Trim().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder();
        foreach (var character in decomposed)
        {
            if (character is 'đ' or 'Đ')
            {
                builder.Append('d');
                continue;
            }

            if (CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark
                && (char.IsLetterOrDigit(character) || char.IsWhiteSpace(character)))
            {
                builder.Append(character);
            }
        }

        return string.Join(' ', builder.ToString().Split(' ', StringSplitOptions.RemoveEmptyEntries));
    }
}
