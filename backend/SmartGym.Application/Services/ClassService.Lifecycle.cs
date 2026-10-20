using System;
using System.Linq;
using System.Threading.Tasks;

namespace SmartGym.Application.Services;

public sealed partial class ClassService
{
    public async Task<(bool IsSuccess, string? ErrorMessage)> CancelClassAsync(Guid classId)
    {
        var targetClass = await _classRepository.GetByIdAsync(classId);
        if (targetClass == null)
        {
            return (false, "Không tìm thấy lớp học.");
        }

        var result = await _classRepository.CancelClassTransactionAsync(classId);
        if (result.IsSuccess)
        {
            await _classRepository.NotifyAffectedMembersAsync(
                classId,
                "Lớp học đã bị hủy",
                $"Lớp học {targetClass.ClassName} đã bị hủy."
            );
        }
        return result;
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> RestoreClassAsync(Guid classId)
    {
        var targetClass = await _classRepository.GetByIdAsync(classId);
        if (targetClass == null)
        {
            return (false, "Không tìm thấy lớp học.");
        }

        if (targetClass.Status)
        {
            return (false, "Lớp học này đang hoạt động.");
        }

        if (targetClass.ScheduleTime <= DateTime.UtcNow)
        {
            return (false, "Không thể khôi phục lớp học đã bắt đầu hoặc đã diễn ra.");
        }

        var restoreStart = targetClass.ScheduleTime;
        var restoreEnd = restoreStart.AddMinutes(targetClass.DurationMinutes);
        var restoreFacilityClasses = await _classRepository.GetClassesByFacilityAndDateAsync(
            targetClass.FacilityId,
            targetClass.ScheduleTime
        );
        foreach (var existingClass in restoreFacilityClasses.Where(c => c.Status && c.ApprovalStatus != "rejected"))
        {
            if (existingClass.Id != classId
                && Overlaps(restoreStart, restoreEnd, existingClass.ScheduleTime, existingClass.DurationMinutes))
            {
                return (false, $"Không thể khôi phục vì phòng tập đang được sử dụng bởi lớp '{existingClass.ClassName}'.");
            }
        }

        if (targetClass.CoachId.HasValue)
        {
            var newStart = targetClass.ScheduleTime;
            var newEnd = newStart.AddMinutes(targetClass.DurationMinutes);
            var existingClasses = await _classRepository.GetClassesByCoachAndDateAsync(
                targetClass.CoachId.Value,
                targetClass.ScheduleTime
            );

            foreach (var existingClass in existingClasses.Where(c => c.Status && c.ApprovalStatus != "rejected"))
            {
                if (existingClass.Id == classId || !existingClass.Status)
                    continue;

                if (Overlaps(newStart, newEnd, existingClass.ScheduleTime, existingClass.DurationMinutes))
                {
                    return (
                        false,
                        $"Không thể khôi phục vì HLV đang có lớp '{existingClass.ClassName}' trùng thời gian."
                    );
                }
            }

            var existingPtSessions = await _ptSessionRepository.GetSessionsByCoachAndDateAsync(
                targetClass.CoachId.Value,
                targetClass.ScheduleTime
            );

            foreach (var session in existingPtSessions.Where(IsBlockingPtSession))
            {
                if (Overlaps(newStart, newEnd, session.ScheduleTime, session.DurationMinutes))
                {
                    return (false, "Không thể khôi phục vì HLV đang có buổi PT trùng thời gian.");
                }
            }

            if (await _classRepository.HasCoachAvailabilityConflictAsync(targetClass.CoachId.Value, newStart, newEnd))
            {
                return (false, "Không thể khôi phục vì HLV đã đăng lịch trống 1-1 trùng thời gian.");
            }

            var existingFacilityClasses = await _classRepository.GetClassesByFacilityAndDateAsync(
                targetClass.FacilityId,
                targetClass.ScheduleTime
            );
            foreach (var existingClass in existingFacilityClasses.Where(c => c.Status && c.ApprovalStatus != "rejected"))
            {
                if (existingClass.Id != classId
                    && Overlaps(newStart, newEnd, existingClass.ScheduleTime, existingClass.DurationMinutes))
                {
                    return (false, $"Không thể khôi phục vì phòng tập đang được sử dụng bởi lớp '{existingClass.ClassName}'.");
                }
            }
        }

        var result = await _classRepository.RestoreClassTransactionAsync(classId);
        if (result.IsSuccess)
        {
            await _classRepository.NotifyAffectedMembersAsync(
                classId,
                "Lớp học đã được khôi phục",
                $"Lớp học {targetClass.ClassName} đã được mở lại. Lượt đăng ký cũ đang chờ duyệt lại."
            );
        }

        return result;
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> ApproveClassAsync(Guid classId)
    {
        var targetClass = await _classRepository.GetByIdAsync(classId);
        if (targetClass == null)
        {
            return (false, "Không tìm thấy đề xuất lớp học.");
        }

        if (!string.Equals(targetClass.ApprovalStatus, "pending", StringComparison.OrdinalIgnoreCase))
        {
            return (false, "Đề xuất lớp học không còn ở trạng thái chờ duyệt.");
        }

        var newStart = targetClass.ScheduleTime;
        var newEnd = newStart.AddMinutes(targetClass.DurationMinutes);

        if (targetClass.CoachId.HasValue)
        {
            var existingClasses = await _classRepository.GetClassesByCoachAndDateAsync(
                targetClass.CoachId.Value,
                targetClass.ScheduleTime
            );

            if (existingClasses.Any(c =>
                c.Id != classId &&
                c.Status &&
                c.ApprovalStatus != "rejected" &&
                Overlaps(newStart, newEnd, c.ScheduleTime, c.DurationMinutes)))
            {
                return (false, "Không thể duyệt: huấn luyện viên đã có lịch khác trùng thời gian.");
            }

            var existingPtSessions = await _ptSessionRepository.GetSessionsByCoachAndDateAsync(
                targetClass.CoachId.Value,
                targetClass.ScheduleTime
            );
            if (existingPtSessions.Any(p =>
                IsBlockingPtSession(p) &&
                Overlaps(newStart, newEnd, p.ScheduleTime, p.DurationMinutes)))
            {
                return (false, "Không thể duyệt: huấn luyện viên đã có buổi PT trùng thời gian.");
            }

            if (await _classRepository.HasCoachAvailabilityConflictAsync(
                targetClass.CoachId.Value,
                newStart,
                newEnd))
            {
                return (false, "Không thể duyệt: lịch trống 1-1 của huấn luyện viên bị trùng thời gian.");
            }
        }

        var existingFacilityClasses = await _classRepository.GetClassesByFacilityAndDateAsync(
            targetClass.FacilityId,
            targetClass.ScheduleTime
        );
        if (existingFacilityClasses.Any(c =>
            c.Id != classId &&
            c.Status &&
            c.ApprovalStatus != "rejected" &&
            Overlaps(newStart, newEnd, c.ScheduleTime, c.DurationMinutes)))
        {
            return (false, "Không thể duyệt: phòng tập đã có lớp khác trùng thời gian.");
        }

        return await _classRepository.ApproveClassAsync(classId);
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> RejectClassAsync(Guid classId)
    {
        return await _classRepository.RejectClassAsync(classId);
    }
}
