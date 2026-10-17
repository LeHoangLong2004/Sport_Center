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

        if (validSub == null)
        {
            return (false, "Hội viên chưa có gói tập hợp lệ hoặc gói tập đã hết hạn.");
        }

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
        var result = await _classRepository.BookClassTransactionAsync(userId, classId, validSub.Id);
        if (result.IsSuccess)
        {
            var localSchedule = CenterTime.ToLocal(targetClass.ScheduleTime);
            await _classRepository.NotifyUserAsync(
                userId,
                "Yêu cầu đặt lớp đang chờ duyệt",
                $"Yêu cầu đặt lớp {targetClass.ClassName} vào {localSchedule:dd/MM/yyyy HH:mm} đã được gửi đến Manager.",
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

    public async Task<(bool IsSuccess, string? ErrorMessage)> ApproveBookingAsync(Guid bookingId)
    {
        return await _classRepository.ApproveBookingAsync(bookingId);
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> RejectBookingAsync(Guid bookingId)
    {
        return await _classRepository.RejectBookingAsync(bookingId);
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
