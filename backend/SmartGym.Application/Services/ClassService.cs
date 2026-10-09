using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Interfaces;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Services;

public sealed class ClassService
{
    private readonly IGroupClassRepository _classRepository;
    private readonly IPtSessionRepository _ptSessionRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;

    public ClassService(
        IGroupClassRepository classRepository, 
        IPtSessionRepository ptSessionRepository,
        ISubscriptionRepository subscriptionRepository)
    {
        _classRepository = classRepository;
        _ptSessionRepository = ptSessionRepository;
        _subscriptionRepository = subscriptionRepository;
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> CreateClassAsync(CreateClassRequest request)
    {
        if (request.Capacity <= 0)
        {
            return (false, "Capacity must be greater than 0.");
        }

        if (request.ScheduleTime <= DateTime.UtcNow)
        {
            return (false, "Schedule time must be in the future.");
        }

        var newStart = request.ScheduleTime;
        var newEnd = newStart.AddMinutes(request.DurationMinutes);

        var existingClasses = await _classRepository.GetClassesByCoachAndDateAsync(request.CoachId, request.ScheduleTime);
        var existingPtSessions = await _ptSessionRepository.GetSessionsByCoachAndDateAsync(request.CoachId, request.ScheduleTime);

        foreach (var c in existingClasses)
        {
            var existingStart = c.ScheduleTime;
            var existingEnd = existingStart.AddMinutes(c.DurationMinutes);
            if (newStart < existingEnd && existingStart < newEnd)
            {
                return (false, $"Coach is already scheduled for class '{c.ClassName}' at this time.");
            }
        }

        foreach (var p in existingPtSessions)
        {
            var existingStart = p.ScheduleTime;
            var existingEnd = existingStart.AddMinutes(p.DurationMinutes);
            if (newStart < existingEnd && existingStart < newEnd)
            {
                return (false, "Coach is already scheduled for a PT session at this time.");
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
            status: true
        );

        await _classRepository.AddAsync(newClass);

        return (true, null);
    }

    public async Task<IEnumerable<ClassResponse>> GetAllClassesAsync()
    {
        return await _classRepository.GetAllClassesAsync();
    }

    public async Task<IEnumerable<ClassResponse>> GetAvailableClassesAsync()
    {
        return await _classRepository.GetAvailableClassesAsync();
    }

    public async Task<ClassDetailResponse?> GetClassDetailAsync(Guid classId)
    {
        return await _classRepository.GetClassDetailByIdAsync(classId);
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> BookClassAsync(Guid userId, Guid classId)
    {
        // 1. Kiểm tra tồn tại lớp học
        var targetClass = await _classRepository.GetByIdAsync(classId);
        if (targetClass == null)
        {
            return (false, "Class not found.");
        }

        // 2. Lấy danh sách subscription của User và kiểm tra còn hạn tại thời điểm diễn ra lớp học
        var userSubs = await _subscriptionRepository.GetByUserIdAsync(userId);
        
        var validSub = userSubs.FirstOrDefault(s => 
            s.PaymentStatus == SmartGym.Domain.Enums.PaymentStatus.Completed &&
            s.StartDate <= targetClass.ScheduleTime &&
            targetClass.ScheduleTime <= s.EndDate);

        if (validSub == null)
        {
            return (false, "You do not have a valid subscription active for the class date.");
        }

        // 3. Gọi hàm thực thi Transaction ở tầng Data (nguyên tử)
        return await _classRepository.BookClassTransactionAsync(userId, classId, validSub.Id);
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> CancelBookingAsync(Guid userId, Guid classId)
    {
        var targetClass = await _classRepository.GetByIdAsync(classId);
        if (targetClass == null)
        {
            return (false, "Class not found.");
        }

        // Logic check time (e.g. at least 2 hours before)
        if (DateTime.UtcNow.AddHours(2) > targetClass.ScheduleTime)
        {
            return (false, "Chỉ có thể hủy lớp trước 2 tiếng so với giờ bắt đầu.");
        }

        return await _classRepository.CancelBookingTransactionAsync(userId, classId);
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> CancelClassAsync(Guid classId)
    {
        var targetClass = await _classRepository.GetByIdAsync(classId);
        if (targetClass == null)
        {
            return (false, "Class not found.");
        }

        var result = await _classRepository.CancelClassTransactionAsync(classId);
        if (result.IsSuccess)
        {
            await _classRepository.NotifyAffectedMembersAsync(classId, "Lớp học đã bị hủy", $"Lớp học {targetClass.ClassName} đã bị hủy.");
        }
        return result;
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> UpdateClassAsync(Guid classId, CreateClassRequest request)
    {
        try
        {
            var targetClass = await _classRepository.GetByIdAsync(classId);
            if (targetClass == null)
            {
                return (false, "Class not found.");
            }

            if (request.Capacity <= 0)
            {
                return (false, "Capacity must be greater than 0.");
            }

            if (request.ScheduleTime <= DateTime.UtcNow)
            {
                return (false, "Schedule time must be in the future.");
            }

            // Check overlap if schedule or coach changed
            if (targetClass.ScheduleTime != request.ScheduleTime || targetClass.CoachId != request.CoachId || targetClass.DurationMinutes != request.DurationMinutes)
            {
                var newStart = request.ScheduleTime;
                var newEnd = newStart.AddMinutes(request.DurationMinutes);

                var existingClasses = await _classRepository.GetClassesByCoachAndDateAsync(request.CoachId, request.ScheduleTime);
                var existingPtSessions = await _ptSessionRepository.GetSessionsByCoachAndDateAsync(request.CoachId, request.ScheduleTime);

                foreach (var c in existingClasses)
                {
                    if (c.Id == classId) continue;
                    var existingStart = c.ScheduleTime;
                    var existingEnd = existingStart.AddMinutes(c.DurationMinutes);
                    if (newStart < existingEnd && existingStart < newEnd)
                    {
                        return (false, $"Coach is already scheduled for class '{c.ClassName}' at this time.");
                    }
                }

                foreach (var p in existingPtSessions)
                {
                    var existingStart = p.ScheduleTime;
                    var existingEnd = existingStart.AddMinutes(p.DurationMinutes);
                    if (newStart < existingEnd && existingStart < newEnd)
                    {
                        return (false, "Coach is already scheduled for a PT session at this time.");
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

            await _classRepository.NotifyAffectedMembersAsync(classId, "Thông tin lớp học thay đổi", $"Lớp học {targetClass.ClassName} đã được cập nhật thông tin.");

            return (true, null);
        }
        catch (Exception ex)
        {
            return (false, "System Error: " + ex.Message + (ex.InnerException != null ? " - " + ex.InnerException.Message : ""));
        }
    }

    // ── GIAI ĐOẠN G: ĐIỂM DANH & XEM LỊCH ──

    public async Task<(bool IsSuccess, string? ErrorMessage)> UpdateAttendanceAsync(Guid classId, UpdateAttendanceRequest request)
    {
        var targetClass = await _classRepository.GetByIdAsync(classId);
        if (targetClass == null)
        {
            return (false, "Class not found.");
        }

        if (request.AttendanceList == null || !request.AttendanceList.Any())
        {
            return (false, "Attendance list cannot be empty.");
        }

        return await _classRepository.UpdateAttendanceAsync(classId, request.AttendanceList);
    }

    public async Task<MemberScheduleResponse> GetMemberScheduleAsync(Guid userId)
    {
        return await _classRepository.GetMemberScheduleAsync(userId);
    }

    public async Task<IEnumerable<CoachClassScheduleDto>> GetCoachScheduleAsync(Guid coachUserId, DateTime? date)
    {
        return await _classRepository.GetCoachScheduleAsync(coachUserId, date);
    }

    public async Task<IEnumerable<ClassResponse>> GetManagerScheduleAsync(Guid? facilityId, Guid? coachId, Guid? sportId, DateTime? date)
    {
        return await _classRepository.GetManagerScheduleAsync(facilityId, coachId, sportId, date);
    }
}
