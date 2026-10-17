using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Interfaces.Repositories;

public interface IGroupClassRepository
{
    Task<GroupClass?> GetByIdAsync(Guid id);
    Task<ClassDetailResponse?> GetClassDetailByIdAsync(Guid id);
    Task<IEnumerable<GroupClass>> GetClassesByCoachAndDateAsync(Guid coachId, DateTime date);
    Task<IEnumerable<GroupClass>> GetClassesByFacilityAndDateAsync(Guid facilityId, DateTime date);
    Task<bool> HasCoachAvailabilityConflictAsync(Guid coachId, DateTime startTime, DateTime endTime);
    Task<IEnumerable<ClassResponse>> GetAllClassesAsync();
    Task<IEnumerable<ClassResponse>> GetAvailableClassesAsync();
    Task AddAsync(GroupClass groupClass);
    Task UpdateAsync(GroupClass groupClass);

    // Transactions
    Task<(bool IsSuccess, string? ErrorMessage)> BookClassTransactionAsync(
        Guid userId,
        Guid classId,
        Guid subscriptionId
    );
    Task<(bool IsSuccess, string? ErrorMessage)> CancelBookingTransactionAsync(
        Guid userId,
        Guid classId
    );
    Task<(bool IsSuccess, string? ErrorMessage)> CancelClassTransactionAsync(Guid classId);
    Task<(bool IsSuccess, string? ErrorMessage)> RestoreClassTransactionAsync(Guid classId);
    Task<(bool IsSuccess, string? ErrorMessage)> ApproveBookingAsync(Guid bookingId);
    Task<(bool IsSuccess, string? ErrorMessage)> RejectBookingAsync(Guid bookingId);
    Task NotifyCoachAsync(
        Guid coachId,
        string title,
        string message,
        string targetType = "system",
        Guid? targetId = null
    );
    Task NotifyUserAsync(
        Guid userId,
        string title,
        string message,
        string targetType = "system",
        Guid? targetId = null
    );
    Task NotifyManagersAsync(
        string title,
        string message,
        string targetType = "system",
        Guid? targetId = null
    );
    Task NotifyAffectedMembersAsync(Guid classId, string title, string message);

    // Giai đoạn G: Điểm danh & Xem lịch
    Task<IEnumerable<BookingManagerResponse>> GetAllBookingsForManagerAsync();
    Task<(bool IsSuccess, string? ErrorMessage)> UpdateAttendanceAsync(
        Guid classId,
        List<AttendanceRecordDto> attendanceList
    );
    Task<MemberScheduleResponse> GetMemberScheduleAsync(Guid userId);
    Task<IEnumerable<CoachClassScheduleDto>> GetCoachScheduleAsync(
        Guid coachUserId,
        DateTime? date
    );
    Task<IEnumerable<ClassResponse>> GetManagerScheduleAsync(
        Guid? facilityId,
        Guid? coachId,
        Guid? sportId,
        DateTime? date
    );
}
