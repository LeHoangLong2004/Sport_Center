using System.Collections.Generic;
using System.Linq;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Common;

public static class FacilityConflictValidator
{
    // Older active classes may predate approval_status and have NULL/empty values.
    // They are still live bookings and must continue occupying room capacity.
    public static bool IsBlockingClass(GroupClass item)
    {
        if (!item.Status)
            return false;

        var approvalStatus = item.ApprovalStatus?.Trim();
        return !string.Equals(approvalStatus, "pending", System.StringComparison.OrdinalIgnoreCase)
            && !string.Equals(approvalStatus, "rejected", System.StringComparison.OrdinalIgnoreCase);
    }

    public static string? Validate(
        FacilitySchedulingSettings settings,
        int requestedCapacity,
        IEnumerable<GroupClass> overlappingClasses)
    {
        var overlapping = overlappingClasses.ToList();
        return Validate(settings, requestedCapacity, overlapping.Count, overlapping.Sum(item => item.Capacity), overlapping.FirstOrDefault()?.ClassName);
    }

    public static string? Validate(
        FacilitySchedulingSettings settings,
        int requestedCapacity,
        int overlappingClassCount,
        int overlappingCapacity,
        string? firstConflictName = null)
    {
        if (settings.TotalCapacity is > 0 && requestedCapacity > settings.TotalCapacity.Value)
            return "Sĩ số lớp vượt quá tổng sức chứa của phòng.";

        if (settings.AllowConcurrentClasses)
        {
            if (overlappingClassCount + 1 > Math.Max(1, settings.MaxConcurrentClasses))
                return $"Phòng đã đạt giới hạn {settings.MaxConcurrentClasses} lớp cùng giờ.";
            if (settings.TotalCapacity is > 0 && overlappingCapacity + requestedCapacity > settings.TotalCapacity.Value)
                return $"Tổng sĩ số các lớp cùng giờ vượt sức chứa {settings.TotalCapacity.Value} người của phòng.";
            return null;
        }

        return overlappingClassCount > 0
            ? $"Phòng đã được sử dụng bởi lớp '{firstConflictName ?? "khác"}' trong khung giờ này."
            : null;
    }
}
