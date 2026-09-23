using SmartGym.Domain.Entities;

namespace SmartGym.Application.Interfaces.Repositories;

public interface IClassScheduleRepository
{
    Task<IReadOnlyList<ClassSchedule>> GetAllAsync();
    Task<ClassSchedule?> FindByIdAsync(Guid id);
    Task<IReadOnlyList<ClassSchedule>> SearchAsync(string? sportType, DateTime? date);
    Task<IReadOnlyList<ClassSchedule>> GetByCoachAsync(Guid coachId);
    Task<bool> HasCoachConflictAsync(Guid coachId, DateTime start, DateTime end, Guid? excludeScheduleId = null);
    Task<bool> HasRoomConflictAsync(string roomName, DateTime start, DateTime end, Guid? excludeScheduleId = null);
}
