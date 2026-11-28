using System;
using System.Linq;
using System.Threading.Tasks;
using SmartGym.Application.Common;

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
        var restoreFacilitySettings = await _classRepository.GetFacilitySchedulingSettingsAsync(targetClass.FacilityId);
        if (restoreFacilitySettings is null)
            return (false, "Không tìm thấy cấu hình phòng tập.");
        var restoreOverlaps = restoreFacilityClasses
            .Where(c => c.Id != classId && FacilityConflictValidator.IsBlockingClass(c))
            .Where(c => Overlaps(restoreStart, restoreEnd, c.ScheduleTime, c.DurationMinutes));
        var restoreFacilityConflict = FacilityConflictValidator.Validate(restoreFacilitySettings, targetClass.Capacity, restoreOverlaps);
        if (restoreFacilityConflict is not null)
            return (false, "Không thể khôi phục: " + restoreFacilityConflict);

        var restoreCenterCapacity = await _classRepository.GetCenterTotalCapacityAsync();
        var restoreCenterClasses = await _classRepository.GetClassesForCenterScheduleConflictsAsync(restoreStart, restoreEnd);
        var restoreCenterCourseSessions = await _classRepository.GetCenterCourseSessionsForScheduleConflictsAsync(restoreStart, restoreEnd);
        var restoreCenterOccupancy = restoreCenterClasses
            .Where(c => c.Id != classId && FacilityConflictValidator.IsBlockingClass(c))
            .Where(c => Overlaps(restoreStart, restoreEnd, c.ScheduleTime, c.DurationMinutes))
            .Sum(c => c.Capacity)
            + restoreCenterCourseSessions
                .Where(courseSession => restoreStart < courseSession.EndTime && courseSession.StartTime < restoreEnd)
                .Sum(courseSession => courseSession.Capacity);
        var restoreCenterConflict = FacilityConflictValidator.ValidateCenterCapacity(
            restoreCenterCapacity, targetClass.Capacity, restoreCenterOccupancy);
        if (restoreCenterConflict is not null)
            return (false, "Không thể khôi phục: " + restoreCenterConflict);

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

        var scheduleTimeUtc = targetClass.ScheduleTime.Kind == DateTimeKind.Utc
            ? targetClass.ScheduleTime
            : targetClass.ScheduleTime.ToUniversalTime();

        if (scheduleTimeUtc <= DateTime.UtcNow)
        {
            return (false, "Không thể duyệt: thời gian bắt đầu lớp học đã trôi qua.");
        }

        var newStart = scheduleTimeUtc;
        var newEnd = newStart.AddMinutes(targetClass.DurationMinutes);

        if (targetClass.CoachId.HasValue)
        {
            var existingClasses = await _classRepository.GetClassesByCoachAndDateAsync(
                targetClass.CoachId.Value,
                scheduleTimeUtc
            );

            if (existingClasses.Any(c =>
                c.Id != classId &&
                c.Status &&
                string.Equals(c.ApprovalStatus, "approved", StringComparison.OrdinalIgnoreCase) &&
                Overlaps(newStart, newEnd, c.ScheduleTime, c.DurationMinutes)))
            {
                return (false, "Không thể duyệt: huấn luyện viên đã có lịch khác trùng thời gian.");
            }

            var existingPtSessions = await _ptSessionRepository.GetSessionsByCoachAndDateAsync(
                targetClass.CoachId.Value,
                scheduleTimeUtc
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

        var courseSessions = (await _classRepository.GetCourseSessionsAsync(classId)).ToList();
        if (courseSessions.Count == 0)
            courseSessions.Add(targetClass);
        var courseSessionIds = courseSessions.Select(session => session.Id).ToHashSet();
        var facilitySettings = await _classRepository.GetFacilitySchedulingSettingsAsync(targetClass.FacilityId);
        if (facilitySettings is null)
            return (false, "Không tìm thấy cấu hình phòng tập.");

        foreach (var session in courseSessions.OrderBy(session => session.SessionNumber))
        {
            var sessionStart = session.ScheduleTime.Kind == DateTimeKind.Utc
                ? session.ScheduleTime
                : session.ScheduleTime.ToUniversalTime();
            var sessionEnd = sessionStart.AddMinutes(session.DurationMinutes);
            var existingFacilityClasses = await _classRepository.GetClassesByFacilityAndDateAsync(session.FacilityId, sessionStart);
            var overlappingFacilityClasses = existingFacilityClasses
                .Where(c => !courseSessionIds.Contains(c.Id) && FacilityConflictValidator.IsBlockingClass(c))
                .Where(c => Overlaps(sessionStart, sessionEnd, c.ScheduleTime, c.DurationMinutes));
            var facilityConflict = FacilityConflictValidator.Validate(facilitySettings, session.Capacity, overlappingFacilityClasses);
            if (facilityConflict is not null)
                return (false, $"Không thể duyệt buổi {session.SessionNumber}: {facilityConflict}");

            var centerCapacity = await _classRepository.GetCenterTotalCapacityAsync();
            var centerClasses = await _classRepository.GetClassesForCenterScheduleConflictsAsync(sessionStart, sessionEnd);
            var centerCourseSessions = await _classRepository.GetCenterCourseSessionsForScheduleConflictsAsync(sessionStart, sessionEnd);
            var centerOverlappingCapacity = centerClasses
                .Where(c => !courseSessionIds.Contains(c.Id) && FacilityConflictValidator.IsBlockingClass(c))
                .Where(c => Overlaps(sessionStart, sessionEnd, c.ScheduleTime, c.DurationMinutes))
                .Sum(c => c.Capacity)
                + centerCourseSessions
                    .Where(courseSession => sessionStart < courseSession.EndTime && courseSession.StartTime < sessionEnd)
                    .Sum(courseSession => courseSession.Capacity);
            var centerConflict = FacilityConflictValidator.ValidateCenterCapacity(
                centerCapacity, session.Capacity, centerOverlappingCapacity);
            if (centerConflict is not null)
                return (false, $"Không thể duyệt buổi {session.SessionNumber}: {centerConflict}");
        }

        return await _classRepository.ApproveClassAsync(classId);
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> RejectClassAsync(Guid classId, string reason)
    {
        return await _classRepository.RejectClassAsync(classId, reason);
    }
}
