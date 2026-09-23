using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Repositories;

public sealed class SupabaseBookingRepository : IBookingRepository
{
    private readonly global::Supabase.Client _client;

    public SupabaseBookingRepository(global::Supabase.Client client)
    {
        _client = client;
    }

    public async Task AddAsync(Booking booking)
    {
        var model = BookingModel.FromDomain(booking);
        await _client.From<BookingModel>().Insert(model);
    }

    public async Task UpdateAsync(Booking booking)
    {
        var model = BookingModel.FromDomain(booking);
        await _client.From<BookingModel>().Update(model);
    }

    public async Task<Booking?> FindByIdAsync(Guid id)
    {
        var response = await _client.From<BookingModel>()
            .Where(x => x.Id == id)
            .Single();

        return response?.ToDomain();
    }

    public async Task<IReadOnlyList<Booking>> GetByMemberAsync(Guid memberId)
    {
        var response = await _client.From<BookingModel>()
            .Where(x => x.MemberId == memberId)
            .Get();

        return response.Models.Select(m => m.ToDomain()).OrderByDescending(b => b.BookedAt).ToList();
    }

    public async Task<IReadOnlyList<Booking>> GetConfirmedByScheduleAsync(Guid scheduleId)
    {
        var response = await _client.From<BookingModel>()
            .Where(x => x.ScheduleId == scheduleId && x.BookingStatus == "CONFIRMED")
            .Get();

        return response.Models.Select(m => m.ToDomain()).OrderBy(b => b.BookedAt).ToList();
    }

    public async Task<Booking?> GetFirstWaitlistAsync(Guid scheduleId)
    {
        var response = await _client.From<BookingModel>()
            .Where(x => x.ScheduleId == scheduleId && x.BookingStatus == "WAITLIST")
            .Get();

        var first = response.Models.OrderBy(m => m.BookedAt).FirstOrDefault();
        return first?.ToDomain();
    }

    public async Task<int> CountWaitlistAsync(Guid scheduleId)
    {
        var response = await _client.From<BookingModel>()
            .Where(x => x.ScheduleId == scheduleId && x.BookingStatus == "WAITLIST")
            .Count(global::Postgrest.Constants.CountType.Exact);

        return response;
    }

    public async Task<Booking?> FindByMemberAndScheduleAsync(Guid memberId, Guid scheduleId)
    {
        var response = await _client.From<BookingModel>()
            .Where(x => x.MemberId == memberId && x.ScheduleId == scheduleId && x.BookingStatus != "CANCELLED")
            .Single();

        return response?.ToDomain();
    }
}
