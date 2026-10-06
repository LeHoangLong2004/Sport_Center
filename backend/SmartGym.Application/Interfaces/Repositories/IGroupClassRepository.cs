using SmartGym.Application.DTOs.Classes;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Interfaces.Repositories;

public interface IGroupClassRepository
{
    // Lấy các lớp học do HLV phụ trách trong một ngày cụ thể
    Task<IEnumerable<GroupClass>> GetClassesByCoachAndDateAsync(Guid coachId, DateTime date);
    
    // Lấy danh sách lớp học cho Member (status = true, thời gian tương lai)
    Task<IEnumerable<ClassResponse>> GetAvailableClassesAsync();

    // Thực thi Transaction SQL đặt lớp
    Task<(bool IsSuccess, string? ErrorMessage)> BookClassTransactionAsync(Guid userId, Guid classId, Guid subscriptionId);

    // Thêm một lớp học mới
    Task AddAsync(GroupClass groupClass);

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
}
