using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Interfaces.Repositories;

public interface IGroupClassRepository
{
    Task<GroupClass?> GetByIdAsync(Guid id);
    Task<IEnumerable<GroupClass>> GetClassesByCoachAndDateAsync(Guid coachId, DateTime date);
    Task<IEnumerable<ClassResponse>> GetAvailableClassesAsync();
    Task AddAsync(GroupClass groupClass);
<<<<<<< Updated upstream

    // Lấy thông tin chi tiết một lớp học
    Task<GroupClass?> GetByIdAsync(Guid id);

    // Hủy đăng ký
    Task<(bool IsSuccess, string? ErrorMessage)> CancelBookingTransactionAsync(Guid userId, Guid classId);

    // Hủy lớp học
    Task<(bool IsSuccess, string? ErrorMessage)> CancelClassTransactionAsync(Guid classId);

    // Cập nhật lớp học
    Task UpdateAsync(GroupClass groupClass);

    // Thông báo cho các thành viên
    Task NotifyAffectedMembersAsync(Guid classId, string title, string message);
=======
    Task UpdateAsync(GroupClass groupClass);
    
    // Transactions
    Task<(bool IsSuccess, string? ErrorMessage)> BookClassTransactionAsync(Guid userId, Guid classId, Guid subscriptionId);
    Task<(bool IsSuccess, string? ErrorMessage)> CancelBookingTransactionAsync(Guid userId, Guid classId);
    Task<(bool IsSuccess, string? ErrorMessage)> CancelClassTransactionAsync(Guid classId);
    Task NotifyAffectedMembersAsync(Guid classId, string title, string message);

    // Giai đoạn G: Điểm danh & Xem lịch
    Task<(bool IsSuccess, string? ErrorMessage)> UpdateAttendanceAsync(Guid classId, List<AttendanceRecordDto> attendanceList);
    Task<MemberScheduleResponse> GetMemberScheduleAsync(Guid userId);
    Task<IEnumerable<CoachClassScheduleDto>> GetCoachScheduleAsync(Guid coachUserId, DateTime? date);
    Task<IEnumerable<ClassResponse>> GetManagerScheduleAsync(Guid? facilityId, Guid? coachId, Guid? sportId, DateTime? date);
>>>>>>> Stashed changes
}
