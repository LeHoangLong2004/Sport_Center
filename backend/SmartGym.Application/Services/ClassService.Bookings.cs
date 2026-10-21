using System;
using System.Linq;
using System.Threading.Tasks;
using SmartGym.Application.Common;

namespace SmartGym.Application.Services;

public sealed partial class ClassService
{
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
            && (
                (s.SportId.HasValue && s.SportId.Value == targetClass.SportId) ||
                (s.Package != null && !string.IsNullOrWhiteSpace(targetClass.ClassName) && s.Package.Name.Contains(targetClass.ClassName, StringComparison.OrdinalIgnoreCase)) ||
                (!string.IsNullOrWhiteSpace(s.PackageId) && !string.IsNullOrWhiteSpace(targetClass.ClassName) && targetClass.ClassName.Contains(s.PackageId, StringComparison.OrdinalIgnoreCase))
            )
        ) ?? userSubs.FirstOrDefault(s =>
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

    public async Task<(bool IsSuccess, string? ErrorMessage)> ApproveBookingAsync(Guid bookingId)
    {
        return await _classRepository.ApproveBookingAsync(bookingId);
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> RejectBookingAsync(Guid bookingId)
    {
        return await _classRepository.RejectBookingAsync(bookingId);
    }
}
