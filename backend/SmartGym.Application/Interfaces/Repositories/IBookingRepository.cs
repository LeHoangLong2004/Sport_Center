using SmartGym.Domain.Entities;

namespace SmartGym.Application.Interfaces.Repositories;

public interface IBookingRepository
{
    Task AddAsync(Booking booking);
    Task UpdateAsync(Booking booking);
    Task<Booking?> FindByIdAsync(Guid id);
    Task<IReadOnlyList<Booking>> GetByMemberAsync(Guid memberId);
    Task<IReadOnlyList<Booking>> GetConfirmedByScheduleAsync(Guid scheduleId);
    Task<Booking?> GetFirstWaitlistAsync(Guid scheduleId);
    Task<int> CountWaitlistAsync(Guid scheduleId);
    Task<Booking?> FindByMemberAndScheduleAsync(Guid memberId, Guid scheduleId);
    Task<IReadOnlyList<Booking>> GetAllAsync();
}
