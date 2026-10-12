using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.Classes;

namespace SmartGym.Application.Services;

public sealed partial class ClassService
{
    public async Task<(bool IsSuccess, string? ErrorMessage)> UpdateAttendanceAsync(
        Guid classId,
        UpdateAttendanceRequest request
    )
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

    public async Task<IEnumerable<CoachClassScheduleDto>> GetCoachScheduleAsync(
        Guid coachUserId,
        DateTime? date
    )
    {
        return await _classRepository.GetCoachScheduleAsync(coachUserId, date);
    }

    public async Task<IEnumerable<ClassResponse>> GetManagerScheduleAsync(
        Guid? facilityId,
        Guid? coachId,
        Guid? sportId,
        DateTime? date
    )
    {
        return await _classRepository.GetManagerScheduleAsync(facilityId, coachId, sportId, date);
    }

    public async Task<IEnumerable<BookingManagerResponse>> GetAllBookingsForManagerAsync()
    {
        return await _classRepository.GetAllBookingsForManagerAsync();
    }
}