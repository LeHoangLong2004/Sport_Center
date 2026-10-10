using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;

namespace SmartGym.Application.Interfaces.Repositories;

public interface ICheckInRepository
{
    Task<CheckInRecord> AddAsync(Guid memberId, Guid? scheduleId, DateTime checkInTime, CheckInResult result);
    Task<IReadOnlyList<CheckInRecord>> GetByMemberAsync(Guid memberId);
    Task<IReadOnlyList<CheckInRecord>> GetAllAsync();
    Task<IReadOnlyList<CheckInRecord>> GetTodayAsync();
}
