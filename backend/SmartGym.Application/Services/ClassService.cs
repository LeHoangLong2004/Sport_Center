using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Interfaces;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;
using System.Linq;

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
        // 1. Kiểm tra tính hợp lệ cơ bản
        if (request.Capacity <= 0)
        {
            return (false, "Capacity must be greater than 0.");
        }

        if (request.ScheduleTime <= DateTime.UtcNow)
        {
            return (false, "Schedule time must be in the future.");
        }

        // 2. Kiểm tra trùng giờ HLV (Overlap check)
        var newStart = request.ScheduleTime;
        var newEnd = newStart.AddMinutes(request.DurationMinutes);

        // Lấy lịch trong ngày của HLV
        var existingClasses = await _classRepository.GetClassesByCoachAndDateAsync(request.CoachId, request.ScheduleTime);
        var existingPtSessions = await _ptSessionRepository.GetSessionsByCoachAndDateAsync(request.CoachId, request.ScheduleTime);

        // Check trùng với các lớp Group-X
        foreach (var c in existingClasses)
        {
            var existingStart = c.ScheduleTime;
            var existingEnd = existingStart.AddMinutes(c.DurationMinutes);

            // Hai khoảng trùng nhau khi: A.start < B.end AND B.start < A.end
            if (newStart < existingEnd && existingStart < newEnd)
            {
                return (false, $"Coach is already scheduled for class '{c.ClassName}' at this time.");
            }
        }

        // Check trùng với các buổi PT
        foreach (var p in existingPtSessions)
        {
            var existingStart = p.ScheduleTime;
            var existingEnd = existingStart.AddMinutes(p.DurationMinutes);

            if (newStart < existingEnd && existingStart < newEnd)
            {
                return (false, "Coach is already scheduled for a PT session at this time.");
            }
        }

        // 3. Nếu hợp lệ, tiến hành lưu
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
            status: true // Mặc định mở lớp
        );

        await _classRepository.AddAsync(newClass);

        return (true, null);
    }

    public async Task<IEnumerable<ClassResponse>> GetAvailableClassesAsync()
    {
        return await _classRepository.GetAvailableClassesAsync();
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> BookClassAsync(Guid userId, Guid classId)
    {
        // 1. Lấy danh sách subcription của User
        var userSubs = await _subscriptionRepository.GetByUserIdAsync(userId);
        
        var validSub = userSubs.FirstOrDefault(s => s.PaymentStatus == "completed");
        if (validSub == null)
        {
            return (false, "You do not have a valid subscription to book this class.");
        }

        // 2. Gọi hàm thực thi Transaction ở tầng Data (không dùng EF trực tiếp ở đây)
        return await _classRepository.BookClassTransactionAsync(userId, classId, validSub.Id);
    }
}
