using SmartGym.Application.DTOs;

namespace SmartGym.Application.Interfaces.Repositories;

public interface IAppointmentRepository
{
    Task<IReadOnlyList<AppointmentDto>> GetAllAsync();
    Task AddAsync(AppointmentDto appointment);
}
