using System;
using System.Linq;
using System.Threading.Tasks;
using SmartGym.Application.Common;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Services;

public sealed partial class ClassService
{
    public async Task<(bool IsSuccess, string? ErrorMessage)> CreateClassAsync(
        CreateClassRequest request,
        string approvalStatus = "approved"
    )
    {
        approvalStatus = approvalStatus.Trim().ToLowerInvariant();
        if (approvalStatus is not ("approved" or "pending"))
        {
            return (false, "Trạng thái phê duyệt lớp học không hợp lệ.");
        }

        if (request.Capacity <= 0)
        {
            return (false, "Capacity must be greater than 0.");
        }

        if (request.DurationMinutes <= 0)
        {
            return (false, "Thời lượng lớp học phải lớn hơn 0 phút.");
        }

        if (request.ScheduleTime <= DateTime.UtcNow)
        {
            return (false, "Thời gian học phải lớn hơn thời điểm hiện tại.");
        }

        var newStart = request.ScheduleTime;
        var newEnd = newStart.AddMinutes(request.DurationMinutes);

        var existingClasses = await _classRepository.GetClassesByCoachAndDateAsync(
            request.CoachId,
            request.ScheduleTime
        );
        var existingPtSessions = await _ptSessionRepository.GetSessionsByCoachAndDateAsync(
            request.CoachId,
            request.ScheduleTime
        );

        foreach (var c in existingClasses.Where(c => c.Status && c.ApprovalStatus != "rejected"))
        {
            if (Overlaps(newStart, newEnd, c.ScheduleTime, c.DurationMinutes))
            {
                return (
                    false,
                    $"Huấn luyện viên đã có lớp '{c.ClassName}' vào thời gian này."
                );
            }
        }

        foreach (var p in existingPtSessions.Where(IsBlockingPtSession))
        {
            if (Overlaps(newStart, newEnd, p.ScheduleTime, p.DurationMinutes))
            {
                return (false, "Huấn luyện viên đã có buổi PT vào thời gian này.");
            }
        }

        if (request.CoachId != Guid.Empty && await _classRepository.HasCoachAvailabilityConflictAsync(request.CoachId, newStart, newEnd))
        {
            return (false, "Huấn luyện viên đã đăng lịch trống 1-1 trùng hoặc chồng lấn thời gian này.");
        }

        var existingFacilityClasses = await _classRepository.GetClassesByFacilityAndDateAsync(
            request.FacilityId,
            request.ScheduleTime
        );
        foreach (var c in existingFacilityClasses.Where(c => c.Status && c.ApprovalStatus != "rejected"))
        {
            if (Overlaps(newStart, newEnd, c.ScheduleTime, c.DurationMinutes))
            {
                return (false, $"Phòng tập đã được sử dụng bởi lớp '{c.ClassName}' vào thời gian này.");
            }
        }

        var newClass = new GroupClass(
            id: Guid.NewGuid(),
            sportId: request.SportId,
            coachId: request.CoachId,
            facilityId: request.FacilityId,
            className: request.ClassName,
            scheduleTime: request.ScheduleTime,
            durationMinutes: request.DurationMinutes,
            capacity: request.Capacity,
            currentEnrolled: 0,
            status: true,
            approvalStatus: approvalStatus
        );

        await _classRepository.AddAsync(newClass);

        if (approvalStatus == "pending")
        {
            await _classRepository.NotifyManagersAsync(
                "Có đề xuất lớp học mới cần duyệt",
                $"Coach vừa gửi đề xuất lớp {request.ClassName} vào {CenterTime.ToLocal(request.ScheduleTime):dd/MM/yyyy HH:mm}.",
                "class",
                newClass.Id
            );
        }
        else
        {
            await _classRepository.NotifyCoachAsync(
                request.CoachId,
                "Bạn được phân công lớp học mới",
                $"Bạn vừa được phân công lớp {request.ClassName} vào {CenterTime.ToLocal(request.ScheduleTime):dd/MM/yyyy HH:mm}.",
                "class",
                newClass.Id
            );
        }

        return (true, null);
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> UpdateClassAsync(
        Guid classId,
        CreateClassRequest request
    )
    {
        try
        {
            var targetClass = await _classRepository.GetByIdAsync(classId);
            if (targetClass == null)
            {
                return (false, "Không tìm thấy lớp học.");
            }

            if (request.Capacity <= 0)
            {
                return (false, "Capacity must be greater than 0.");
            }

            if (request.DurationMinutes <= 0)
            {
                return (false, "Thời lượng lớp học phải lớn hơn 0 phút.");
            }

            if (request.ScheduleTime <= DateTime.UtcNow)
            {
                return (false, "Thời gian học phải lớn hơn thời điểm hiện tại.");
            }

            // Check overlap if schedule or coach changed
            if (
                targetClass.ScheduleTime != request.ScheduleTime
                || targetClass.CoachId != request.CoachId
                || targetClass.DurationMinutes != request.DurationMinutes
                || targetClass.FacilityId != request.FacilityId
            )
            {
                var newStart = request.ScheduleTime;
                var newEnd = newStart.AddMinutes(request.DurationMinutes);

                var existingClasses = await _classRepository.GetClassesByCoachAndDateAsync(
                    request.CoachId,
                    request.ScheduleTime
                );
                var existingPtSessions = await _ptSessionRepository.GetSessionsByCoachAndDateAsync(
                    request.CoachId,
                    request.ScheduleTime
                );

                foreach (var c in existingClasses.Where(c => c.Status && c.ApprovalStatus != "rejected"))
                {
                    if (c.Id == classId)
                        continue;
                    if (Overlaps(newStart, newEnd, c.ScheduleTime, c.DurationMinutes))
                    {
                        return (
                            false,
                            $"Huấn luyện viên đã có lớp '{c.ClassName}' vào thời gian này."
                        );
                    }
                }

                foreach (var p in existingPtSessions.Where(IsBlockingPtSession))
                {
                    if (Overlaps(newStart, newEnd, p.ScheduleTime, p.DurationMinutes))
                    {
                        return (false, "Huấn luyện viên đã có buổi PT vào thời gian này.");
                    }
                }

                if (request.CoachId != Guid.Empty && await _classRepository.HasCoachAvailabilityConflictAsync(request.CoachId, newStart, newEnd))
                {
                    return (false, "Huấn luyện viên đã đăng lịch trống 1-1 trùng hoặc chồng lấn thời gian này.");
                }

                var existingFacilityClasses = await _classRepository.GetClassesByFacilityAndDateAsync(
                    request.FacilityId,
                    request.ScheduleTime
                );
                foreach (var c in existingFacilityClasses.Where(c => c.Status && c.ApprovalStatus != "rejected"))
                {
                    if (c.Id != classId && Overlaps(newStart, newEnd, c.ScheduleTime, c.DurationMinutes))
                    {
                        return (false, $"Phòng tập đã được sử dụng bởi lớp '{c.ClassName}' vào thời gian này.");
                    }
                }
            }

            var updatedClass = new GroupClass(
                id: classId,
                sportId: request.SportId,
                coachId: request.CoachId,
                facilityId: request.FacilityId,
                className: request.ClassName,
                scheduleTime: request.ScheduleTime,
                durationMinutes: request.DurationMinutes,
                capacity: request.Capacity,
                currentEnrolled: targetClass.CurrentEnrolled,
                status: targetClass.Status
            );

            await _classRepository.UpdateAsync(updatedClass);

            if (targetClass.CoachId.HasValue && targetClass.CoachId.Value != request.CoachId)
            {
                await _classRepository.NotifyCoachAsync(
                    targetClass.CoachId.Value,
                    "Bạn không còn phụ trách lớp học",
                    $"Lớp {targetClass.ClassName} đã được chuyển sang HLV khác.",
                    "class",
                    classId
                );
            }

            await _classRepository.NotifyCoachAsync(
                request.CoachId,
                "Lịch lớp học đã được cập nhật",
                $"Lớp {request.ClassName} đã được cập nhật lịch vào {CenterTime.ToLocal(request.ScheduleTime):dd/MM/yyyy HH:mm}.",
                "class",
                classId
            );

            await _classRepository.NotifyAffectedMembersAsync(
                classId,
                "Thông tin lớp học thay đổi",
                $"Lớp học {targetClass.ClassName} đã được cập nhật thông tin."
            );

            return (true, null);
        }
        catch (Exception ex)
        {
            return (
                false,
                "Lỗi hệ thống: "
                    + ex.Message
                    + (ex.InnerException != null ? " - " + ex.InnerException.Message : "")
            );
        }
    }
}
