using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartGym.Application.Common;
using SmartGym.Domain.Entities;

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

        // Chuẩn hóa thời gian lớp học về UTC thực tế:
        var classStartTimeUtc = targetClass.ScheduleTime.Hour >= 6
            ? targetClass.ScheduleTime.AddHours(-7)
            : targetClass.ScheduleTime;

        var now = DateTime.UtcNow;
        var timeUntilClass = classStartTimeUtc - now;

        // 3. RÀNG BUỘC THỜI GIAN ĐẶT CHỖ TỐI THIỂU: Chỉ cần trước giờ bắt đầu lớp học
        if (timeUntilClass.TotalSeconds <= 0)
        {
            return (false, "Không thể đặt chỗ. Lớp học đã bắt đầu hoặc đã diễn ra.");
        }

        // 4. Lấy danh sách subscription của User và kiểm tra còn hạn tại thời điểm diễn ra lớp học
        var userSubs = (await _subscriptionRepository.GetByUserIdAsync(userId))?.ToList() ?? new List<Subscription>();

        // 5. RÀNG BUỘC THỜI GIAN ĐẶT CHỖ TỐI ĐA THEO HẠNG THÀNH VIÊN:
        // Cơ bản (Basic): 24 giờ (1 ngày) | Plus: 72 giờ (3 ngày) | Premium: 120 giờ (5 ngày)
        var memberTier = "basic";
        var maxAdvanceHours = 24.0;

        var activeMembershipSub = userSubs.FirstOrDefault(s =>
            s.PaymentStatus == SmartGym.Domain.Enums.PaymentStatus.Completed
            && s.StartDate <= now
            && s.EndDate >= now
            && (
                (!string.IsNullOrWhiteSpace(s.PackageSnapshotJson) && s.PackageSnapshotJson.Contains("\"membership\""))
                || (!string.IsNullOrWhiteSpace(s.PackageId) && (s.PackageId.Contains("plus", StringComparison.OrdinalIgnoreCase) || s.PackageId.Contains("premium", StringComparison.OrdinalIgnoreCase)))
                || (s.Package != null && (s.Package.Name.Contains("plus", StringComparison.OrdinalIgnoreCase) || s.Package.Name.Contains("premium", StringComparison.OrdinalIgnoreCase)))
            )
        );

        if (activeMembershipSub != null)
        {
            var snap = activeMembershipSub.PackageSnapshotJson ?? "";
            var pkgId = activeMembershipSub.PackageId ?? "";
            var pkgName = activeMembershipSub.Package?.Name ?? "";

            if (snap.Contains("\"premium\"", StringComparison.OrdinalIgnoreCase) 
                || pkgId.Contains("premium", StringComparison.OrdinalIgnoreCase)
                || pkgName.Contains("premium", StringComparison.OrdinalIgnoreCase))
            {
                memberTier = "premium";
                maxAdvanceHours = 120.0;
            }
            else if (snap.Contains("\"plus\"", StringComparison.OrdinalIgnoreCase) 
                || pkgId.Contains("plus", StringComparison.OrdinalIgnoreCase)
                || pkgName.Contains("plus", StringComparison.OrdinalIgnoreCase))
            {
                memberTier = "plus";
                maxAdvanceHours = 72.0;
            }
        }

        if (timeUntilClass.TotalHours > maxAdvanceHours)
        {
            var tierDisplayName = memberTier switch
            {
                "premium" => "Premium",
                "plus" => "Plus",
                _ => "Cơ bản"
            };
            var advanceText = memberTier switch
            {
                "premium" => "5 ngày (120 giờ)",
                "plus" => "3 ngày (72 giờ)",
                _ => "24 giờ (1 ngày)"
            };
            return (false, $"Lớp học này chưa mở đặt chỗ cho hạng thành viên của bạn (Hạng {tierDisplayName} chỉ được đặt trước tối đa {advanceText}). Vui lòng quay lại sau hoặc nâng cấp hạng để đặt lịch sớm hơn!");
        }

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

    public async Task<(bool IsSuccess, bool IsLate, string? ErrorMessage)> CancelBookingAsync(
        Guid userId,
        Guid classId
    )
    {
        var targetClass = await _classRepository.GetByIdAsync(classId);
        if (targetClass == null)
        {
            return (false, false, "Không tìm thấy lớp học.");
        }

        // Chuẩn hóa thời gian lớp học về UTC thực tế:
        // Nếu ScheduleTime có giờ >= 6 (lưu theo giờ địa phương VN), trừ 7 tiếng để về UTC chuẩn
        var classStartTimeUtc = targetClass.ScheduleTime.Hour >= 6
            ? targetClass.ScheduleTime.AddHours(-7)
            : targetClass.ScheduleTime;

        var classEndTimeUtc = classStartTimeUtc.AddMinutes(targetClass.DurationMinutes);
        if (DateTime.UtcNow >= classEndTimeUtc)
        {
            return (false, false, "Lớp học này đã kết thúc, không thể hủy đặt chỗ.");
        }

        // Quy định hủy lớp: Nếu hủy trong vòng 2 tiếng trước giờ học là hủy muộn (Late Cancellation)
        var isLate = DateTime.UtcNow.AddHours(2) > classStartTimeUtc;

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

        return (result.IsSuccess, isLate, result.ErrorMessage);
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
