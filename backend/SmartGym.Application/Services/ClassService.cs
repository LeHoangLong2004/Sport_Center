using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartGym.Application.Common;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Interfaces;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Services;

public sealed partial class ClassService
{
    private readonly IGroupClassRepository _classRepository;
    private readonly IPtSessionRepository _ptSessionRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly SmartGym.Application.Interfaces.IUserRepository _userRepository;

    public ClassService(
        IGroupClassRepository classRepository,
        IPtSessionRepository ptSessionRepository,
        ISubscriptionRepository subscriptionRepository,
        SmartGym.Application.Interfaces.IUserRepository userRepository
    )
    {
        _classRepository = classRepository;
        _ptSessionRepository = ptSessionRepository;
        _subscriptionRepository = subscriptionRepository;
        _userRepository = userRepository;
    }

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

    public async Task<(bool IsSuccess, string? ErrorMessage)> BookClassAsync(
        Guid userId,
        Guid classId
    )
    {
        // 1. Kiểm tra tồn tại lớp học
        var targetClass = await _classRepository.GetByIdAsync(classId);
        if (targetClass == null)
        {
            return (false, "Không tìm thấy lớp học.");
        }

        // 2. Kiểm tra trạng thái tài khoản hội viên (UserStatus)
        if (!targetClass.Status || !string.Equals(targetClass.ApprovalStatus, "approved", StringComparison.OrdinalIgnoreCase))
        {
            return (false, "Lớp học chưa được Manager phê duyệt hoặc đã ngừng hoạt động.");
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return (false, "Không tìm thấy thông tin hội viên.");
        }
        if (!user.Status)
        {
            return (false, "Tài khoản hội viên đang bị tạm khóa hoặc ngưng hoạt động.");
        }

        // 3. Lấy danh sách subscription của User và kiểm tra còn hạn tại thời điểm diễn ra lớp học
        var userSubs = await _subscriptionRepository.GetByUserIdAsync(userId);

        var validSub = userSubs.FirstOrDefault(s =>
            s.PaymentStatus == SmartGym.Domain.Enums.PaymentStatus.Completed
            && s.StartDate <= targetClass.ScheduleTime
            && targetClass.ScheduleTime <= s.EndDate
        );

        // Thành viên ở mọi hạng (kể cả Basic / chưa mua gói tháng) đều được đặt lớp:
        // Nếu có gói tháng hợp lệ thì gắn với subscriptionId, nếu là Basic thì đặt theo vé giá gốc (subscriptionId = null).
        Guid? subscriptionIdToUse = validSub?.Id;

        var targetStart = targetClass.ScheduleTime;
        var targetEnd = targetStart.AddMinutes(targetClass.DurationMinutes);
        var memberSchedule = await _classRepository.GetMemberScheduleAsync(userId);

        if (memberSchedule.ClassBookings.Any(b =>
                b.ClassId != classId
                && IsBlockingMemberBooking(b.Status)
                && Overlaps(targetStart, targetEnd, b.ScheduleTime, b.DurationMinutes)))
        {
            return (false, "Bạn đã có một lớp học khác trùng thời gian.");
        }

        if (memberSchedule.PtSessions.Any(p =>
                IsBlockingPtSession(p.Status)
                && Overlaps(targetStart, targetEnd, p.ScheduleTime, p.DurationMinutes)))
        {
            return (false, "Bạn đã có một buổi PT trùng thời gian với lớp học này.");
        }

        // 4. Gọi hàm thực thi Transaction ở tầng Data (nguyên tử)
        var result = await _classRepository.BookClassTransactionAsync(userId, classId, subscriptionIdToUse);
        if (result.IsSuccess)
        {
            var localSchedule = CenterTime.ToLocal(targetClass.ScheduleTime);
            await _classRepository.NotifyUserAsync(
                userId,
                "Đặt lớp thành công",
                $"Bạn đã đặt thành công lớp {targetClass.ClassName} vào {localSchedule:dd/MM/yyyy HH:mm}.",
                "class",
                targetClass.Id
            );
            await _classRepository.NotifyManagersAsync(
                "Có đơn đặt lớp mới cần duyệt",
                $"Hội viên {user.FullName} vừa gửi yêu cầu đặt lớp {targetClass.ClassName} vào {localSchedule:dd/MM/yyyy HH:mm}.",
                "class",
                targetClass.Id
            );

            if (targetClass.CoachId.HasValue)
            {
                await _classRepository.NotifyCoachAsync(
                targetClass.CoachId.Value,
                "Có học viên vừa đặt lớp",
                $"Một học viên vừa đặt lớp {targetClass.ClassName} vào {CenterTime.ToLocal(targetClass.ScheduleTime):dd/MM/yyyy HH:mm}.",
                "class",
                targetClass.Id
                );
            }
        }

        return result;
    }


    private static bool Overlaps(DateTime start, DateTime end, DateTime otherStart, int otherDurationMinutes)
    {
        var otherEnd = otherStart.AddMinutes(Math.Max(1, otherDurationMinutes));
        return start < otherEnd && otherStart < end;
    }

    private static bool IsBlockingPtSession(SmartGym.Domain.Entities.PtSession session)
        => IsBlockingPtSession(session.Status);

    private static bool IsBlockingPtSession(string? status)
        => status?.Trim().ToLowerInvariant() is "scheduled" or "pending" or "confirmed" or "sắp diễn ra";

    private static bool IsBlockingMemberBooking(string? status)
        => status?.Trim().ToLowerInvariant() is "pending" or "confirmed" or "approved";

}

