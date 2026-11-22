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

        // Sinh danh sách thời gian các buổi học (Session List Generation)
        var sessionTimes = new List<DateTime>();
        if (isRecurring)
        {
            var targetDays = request.DaysOfWeek!.Select(d => d % 7).ToHashSet();
            var curDate = scheduleTimeUtc.Date;
            var timeOfDay = scheduleTimeUtc.TimeOfDay;
            var maxLoopDays = 180;
            var loopCount = 0;

            while (sessionTimes.Count < totalSessions && loopCount < maxLoopDays)
            {
                var dayNum = (int)curDate.DayOfWeek;
                var matches = targetDays.Contains(dayNum) 
                    || (dayNum == 0 && targetDays.Contains(7)) 
                    || targetDays.Contains(dayNum == 0 ? 7 : dayNum);

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
            foreach (var c in existingFacilityClasses.Where(c => c.Status && string.Equals(c.ApprovalStatus, "approved", StringComparison.OrdinalIgnoreCase)))
            {
                if (Overlaps(sessionStart, sessionEnd, c.ScheduleTime, c.DurationMinutes))
                {
                    return (false, $"Buổi {i + 1} ({CenterTime.ToLocal(sessionStart):dd/MM/yyyy HH:mm}): Phòng tập đã được sử dụng bởi lớp '{c.ClassName}'.");
                }
            }
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

            var scheduleTimeUtc = request.ScheduleTime.Kind == DateTimeKind.Utc
                ? request.ScheduleTime
                : request.ScheduleTime.ToUniversalTime();

            if (scheduleTimeUtc <= DateTime.UtcNow)
            {
                return (false, "Thời gian học phải lớn hơn thời điểm hiện tại.");
            }

            // Check overlap if schedule or coach changed
            if (
                targetClass.ScheduleTime != scheduleTimeUtc
                || targetClass.CoachId != request.CoachId
                || targetClass.DurationMinutes != request.DurationMinutes
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
                scheduleTime: scheduleTimeUtc,
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
                $"Lớp {request.ClassName} đã được cập nhật lịch vào {CenterTime.ToLocal(scheduleTimeUtc):dd/MM/yyyy HH:mm}.",
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
