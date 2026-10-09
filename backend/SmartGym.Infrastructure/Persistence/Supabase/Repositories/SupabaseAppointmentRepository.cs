using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Repositories;

public sealed class SupabaseAppointmentRepository : IAppointmentRepository
{
    private readonly global::Supabase.Client _client;

    public SupabaseAppointmentRepository(global::Supabase.Client client)
    {
        _client = client;
    }

    public async Task<IReadOnlyList<AppointmentDto>> GetAllAsync()
    {
        var response = await _client.From<AppointmentModel>().Get();
        return response.Models.OrderBy(m => m.Time).Select(m => new AppointmentDto
        {
            Id = m.Id,
            Time = m.Time,
            Title = m.Title,
            CustomerName = m.CustomerName,
            CoachName = m.CoachName,
            Status = m.Status
        }).ToList();
    }

    public async Task AddAsync(AppointmentDto appointment)
    {
        var model = new AppointmentModel
        {
            Id = appointment.Id,
            Time = appointment.Time,
            Title = appointment.Title,
            CustomerName = appointment.CustomerName,
            CoachName = appointment.CoachName,
            Status = appointment.Status
        };
        await _client.From<AppointmentModel>().Insert(model);
    }
}
