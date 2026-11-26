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

        var scheduleTimeUtc = request.ScheduleTime.Kind == DateTimeKind.Utc
            ? request.ScheduleTime
            : request.ScheduleTime.ToUniversalTime();

        if (scheduleTimeUtc <= DateTime.UtcNow)
        {
            return (false, "Thời gian học phải lớn hơn thời điểm hiện tại.");
        }

        if (approvalStatus == "pending" && scheduleTimeUtc < DateTime.UtcNow.AddHours(24))
        {
            return (false, "Thời gian bắt đầu lớp học đề xuất phải cách thời điểm hiện tại ít nhất 24 giờ để Ban quản lý kịp phê duyệt và hội viên đăng ký.");
        }

        var isRecurring = request.DaysOfWeek != null && request.DaysOfWeek.Count > 0;
        var weeks = Math.Max(1, request.Weeks.GetValueOrDefault(10));
        var totalSessions = Math.Max(1, request.TotalSessions.GetValueOrDefault(isRecurring ? request.DaysOfWeek!.Count * weeks : 1));

        var targetDays = isRecurring
            ? request.DaysOfWeek!.Select(day => day % 7).ToHashSet()
            : null;
        if (targetDays != null && !targetDays.Contains((int)CenterTime.ToLocal(scheduleTimeUtc).DayOfWeek))
        {
            return (false, "Ngày khai giảng phải trùng với một trong các thứ đã chọn để là Buổi 1. Hãy chỉnh ngày khai giảng hoặc các thứ học.");
        }

        var facilitySettings = await _classRepository.GetFacilitySchedulingSettingsAsync(request.FacilityId);
        if (facilitySettings is null)
            return (false, "Không tìm thấy cấu hình phòng tập.");

        // Sinh danh sách thời gian các buổi học (Session List Generation)
        var sessionTimes = new List<DateTime>();
        if (isRecurring)
        {
            var curDate = scheduleTimeUtc.Date;
            var timeOfDay = scheduleTimeUtc.TimeOfDay;
            var maxLoopDays = 180;
            var loopCount = 0;

            while (sessionTimes.Count < totalSessions && loopCount < maxLoopDays)
            {
                var dayNum = (int)curDate.DayOfWeek;
                var matches = targetDays!.Contains(dayNum);

                if (matches)
                {
                    var sessionTime = curDate.Add(timeOfDay);
                    if (sessionTime >= scheduleTimeUtc)
                    {
                        sessionTimes.Add(sessionTime);
                    }
                }
                curDate = curDate.AddDays(1);
                loopCount++;
            }

            if (sessionTimes.Count == 0)
            {
                return (false, "Không tìm thấy buổi học nào hợp lệ trong các thứ và khoảng thời gian đã chọn.");
            }
        }
        else
        {
            sessionTimes.Add(scheduleTimeUtc);
        }

        // Quét xung đột tài nguyên ma trận trên toàn bộ các buổi học dự kiến (BR-06, BR-07, BR-08)
        for (int i = 0; i < sessionTimes.Count; i++)
        {
            var sessionStart = sessionTimes[i];
            var sessionEnd = sessionStart.AddMinutes(request.DurationMinutes);

            var existingClasses = await _classRepository.GetClassesByCoachAndDateAsync(
                request.CoachId,
                sessionStart
            );
            var existingPtSessions = await _ptSessionRepository.GetSessionsByCoachAndDateAsync(
                request.CoachId,
                sessionStart
            );

            foreach (var c in existingClasses.Where(c => c.Status && string.Equals(c.ApprovalStatus, "approved", StringComparison.OrdinalIgnoreCase)))
            {
                if (Overlaps(sessionStart, sessionEnd, c.ScheduleTime, c.DurationMinutes))
                {
                    return (
                        false,
                        $"Buổi {i + 1} ({CenterTime.ToLocal(sessionStart):dd/MM/yyyy HH:mm}): HLV đã có lớp '{c.ClassName}' vào thời gian này."
                    );
                }
            }

            foreach (var p in existingPtSessions.Where(IsBlockingPtSession))
            {
                if (Overlaps(sessionStart, sessionEnd, p.ScheduleTime, p.DurationMinutes))
                {
                    return (false, $"Buổi {i + 1} ({CenterTime.ToLocal(sessionStart):dd/MM/yyyy HH:mm}): HLV đã có buổi PT vào thời gian này.");
                }
            }

            if (request.CoachId != Guid.Empty && await _classRepository.HasCoachAvailabilityConflictAsync(request.CoachId, sessionStart, sessionEnd))
            {
                return (false, $"Buổi {i + 1} ({CenterTime.ToLocal(sessionStart):dd/MM/yyyy HH:mm}): HLV đã đăng lịch trống 1-1 trùng thời gian này.");
            }

            var existingFacilityClasses = await _classRepository.GetClassesByFacilityAndDateAsync(
                request.FacilityId,
                sessionStart
            );
            var overlappingFacilityClasses = existingFacilityClasses
                .Where(FacilityConflictValidator.IsBlockingClass)
                .Where(c => Overlaps(sessionStart, sessionEnd, c.ScheduleTime, c.DurationMinutes));
            var facilityConflict = FacilityConflictValidator.Validate(facilitySettings, request.Capacity, overlappingFacilityClasses);
            if (facilityConflict is not null)
                return (false, $"Buổi {i + 1} ({CenterTime.ToLocal(sessionStart):dd/MM/yyyy HH:mm}): {facilityConflict}");
        }

        // Tạo buổi gốc (Root Session: Session 1)
        var rootId = Guid.NewGuid();
        var rootClass = new GroupClass(
            id: rootId,
            sportId: request.SportId,
            coachId: request.CoachId,
            facilityId: request.FacilityId,
            className: request.ClassName,
            scheduleTime: sessionTimes[0],
            durationMinutes: request.DurationMinutes,
            capacity: request.Capacity,
            currentEnrolled: 0,
            status: true,
            approvalStatus: approvalStatus,
            parentId: null,
            sessionNumber: 1,
            totalSessions: sessionTimes.Count
        );

        var persistedRoot = await _classRepository.AddAsync(rootClass);
        var actualRootId = persistedRoot?.Id ?? rootId;

        // Tạo các buổi học con tiếp theo trong chuỗi (Child Sessions: Session 2..N)
        for (int i = 1; i < sessionTimes.Count; i++)
        {
            var childClass = new GroupClass(
                id: Guid.NewGuid(),
                sportId: request.SportId,
                coachId: request.CoachId,
                facilityId: request.FacilityId,
                className: $"{request.ClassName} (Buổi {i + 1})",
                scheduleTime: sessionTimes[i],
                durationMinutes: request.DurationMinutes,
                capacity: request.Capacity,
                currentEnrolled: 0,
                status: true,
                approvalStatus: approvalStatus,
                parentId: actualRootId,
                sessionNumber: i + 1,
                totalSessions: sessionTimes.Count
            );
            await _classRepository.AddAsync(childClass);
        }

        if (approvalStatus == "approved")
        {
            var priceLock = await _classRepository.LockCoursePriceAsync(actualRootId, removeCourseWhenPriceMissing: true);
            if (!priceLock.IsSuccess)
                return priceLock;
        }

        if (approvalStatus == "pending")
        {
            await _classRepository.NotifyManagersAsync(
                "Có đề xuất lớp học mới cần duyệt",
                $"Coach vừa gửi đề xuất lớp {request.ClassName} ({sessionTimes.Count} buổi) bắt đầu từ {CenterTime.ToLocal(sessionTimes[0]):dd/MM/yyyy HH:mm}.",
                "class",
                actualRootId
            );
        }
        else
        {
            await _classRepository.NotifyCoachAsync(
                request.CoachId,
                "Bạn được phân công lớp học mới",
                $"Bạn vừa được phân công lớp {request.ClassName} ({sessionTimes.Count} buổi) bắt đầu từ {CenterTime.ToLocal(sessionTimes[0]):dd/MM/yyyy HH:mm}.",
                "class",
                actualRootId
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

            var facilitySettings = await _classRepository.GetFacilitySchedulingSettingsAsync(request.FacilityId);
            if (facilitySettings is null)
                return (false, "Không tìm thấy cấu hình phòng tập.");

            var scheduleTimeUtc = request.ScheduleTime.Kind == DateTimeKind.Utc
                ? request.ScheduleTime
                : request.ScheduleTime.ToUniversalTime();
            var scheduleChanged = targetClass.ScheduleTime != scheduleTimeUtc
                || targetClass.DurationMinutes != request.DurationMinutes;
            var coachChanged = targetClass.CoachId != request.CoachId;

            if (scheduleTimeUtc <= DateTime.UtcNow)
            {
                return (false, "Thời gian học phải lớn hơn thời điểm hiện tại.");
            }

            // Check overlap if schedule or coach changed
            if (
                targetClass.ScheduleTime != scheduleTimeUtc
                || targetClass.CoachId != request.CoachId
                || targetClass.DurationMinutes != request.DurationMinutes
                || targetClass.Capacity != request.Capacity
                || targetClass.FacilityId != request.FacilityId
            )
            {
                var newStart = scheduleTimeUtc;
                var newEnd = newStart.AddMinutes(request.DurationMinutes);

                var existingClasses = await _classRepository.GetClassesByCoachAndDateAsync(
                    request.CoachId,
                    scheduleTimeUtc
                );
                var existingPtSessions = await _ptSessionRepository.GetSessionsByCoachAndDateAsync(
                    request.CoachId,
                    scheduleTimeUtc
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
                    scheduleTimeUtc
                );
                var overlappingFacilityClasses = existingFacilityClasses
                    .Where(c => c.Id != classId && FacilityConflictValidator.IsBlockingClass(c))
                    .Where(c => Overlaps(newStart, newEnd, c.ScheduleTime, c.DurationMinutes));
                var facilityConflict = FacilityConflictValidator.Validate(facilitySettings, request.Capacity, overlappingFacilityClasses);
                if (facilityConflict is not null)
                    return (false, facilityConflict);
            }

            var updatedClass = new GroupClass(
                id: classId,
                sportId: request.SportId,
                coachId: request.CoachId,
                facilityId: request.FacilityId,
                className: request.ClassName,
                scheduleTime: scheduleTimeUtc,
                durationMinutes: request.DurationMinutes,
                capacity: request.Capacity,
                currentEnrolled: targetClass.CurrentEnrolled,
                status: targetClass.Status,
                approvalStatus: targetClass.ApprovalStatus,
                parentId: targetClass.ParentId,
                sessionNumber: targetClass.SessionNumber,
                totalSessions: targetClass.TotalSessions
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
                $"Lớp {request.ClassName} đã được cập nhật lịch vào {CenterTime.ToLocal(scheduleTimeUtc):dd/MM/yyyy HH:mm}.",
                "class",
                classId
            );

            var memberTitle = scheduleChanged
                ? "Lịch một buổi học đã thay đổi"
                : coachChanged
                    ? "Huấn luyện viên buổi học đã thay đổi"
                    : "Thông tin lớp học thay đổi";
            var memberMessage = scheduleChanged
                ? $"Buổi học {targetClass.ClassName} được dời từ {CenterTime.ToLocal(targetClass.ScheduleTime):dd/MM/yyyy HH:mm} sang {CenterTime.ToLocal(scheduleTimeUtc):dd/MM/yyyy HH:mm}.{FormatAdjustmentReason(request.Reason)}"
                : coachChanged
                    ? $"Huấn luyện viên phụ trách buổi {targetClass.ClassName} đã được thay đổi. Vui lòng xem lịch học để cập nhật thông tin.{FormatAdjustmentReason(request.Reason)}"
                    : $"Lớp học {targetClass.ClassName} đã được cập nhật thông tin.";
            await _classRepository.NotifyAffectedMembersAsync(classId, memberTitle, memberMessage);

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

    private static string FormatAdjustmentReason(string? reason) =>
        string.IsNullOrWhiteSpace(reason) ? string.Empty : $" Lý do: {reason.Trim()}";
}
