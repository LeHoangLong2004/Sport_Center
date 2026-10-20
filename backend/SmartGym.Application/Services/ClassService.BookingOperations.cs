using System;
using System.Linq;
using System.Threading.Tasks;
using SmartGym.Application.Common;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Services;

public sealed partial class ClassService
{
    public async Task<(bool IsSuccess, string? ErrorMessage)> CancelBookingAsync(
        Guid userId,
        Guid classId
    )
    {
        var targetClass = await _classRepository.GetByIdAsync(classId);
        if (targetClass == null)
        {
            return (false, "Không tìm thấy lớp học.");
        }

        // Logic check time (e.g. at least 2 hours before)
        if (DateTime.UtcNow.AddHours(2) > targetClass.ScheduleTime)
        {
            return (false, "Chỉ có thể hủy lớp trước 2 tiếng so với giờ bắt đầu.");
        }

        var result = await _classRepository.CancelBookingTransactionAsync(userId, classId);
        if (result.IsSuccess)
        {
            var localSchedule = CenterTime.ToLocal(targetClass.ScheduleTime);
            await _classRepository.NotifyManagersAsync(
                "Có yêu cầu hủy đặt lớp",
                $"Hội viên vừa hủy đặt lớp {targetClass.ClassName} vào {localSchedule:dd/MM/yyyy HH:mm}.",
                "class",
                targetClass.Id
            );

            if (targetClass.CoachId.HasValue)
            {
                await _classRepository.NotifyCoachAsync(
                targetClass.CoachId.Value,
                "Học viên đã hủy đặt lớp",
                $"Một học viên vừa hủy đặt lớp {targetClass.ClassName} vào {CenterTime.ToLocal(targetClass.ScheduleTime):dd/MM/yyyy HH:mm}.",
                "class",
                targetClass.Id
                );
            }
        }

        return result;
    }

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
                return (false, $"KhÃ´ng thá»ƒ khÃ´i phá»¥c vÃ¬ phÃ²ng táº­p Ä‘ang Ä‘Æ°á»£c sá»­ dá»¥ng bá»Ÿi lá»›p '{existingClass.ClassName}'.");
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
}

