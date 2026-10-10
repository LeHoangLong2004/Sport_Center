using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Repositories;

public sealed class SupabaseClassScheduleRepository : IClassScheduleRepository
{
    private readonly global::Supabase.Client _client;

    public SupabaseClassScheduleRepository(global::Supabase.Client client)
    {
        _client = client;
    }

    public async Task<IReadOnlyList<ClassSchedule>> GetAllAsync()
    {
        var response = await _client.From<ClassScheduleModel>().Get();
        return response.Models.Select(m => m.ToDomain()).ToList();
    }

    public async Task<ClassSchedule?> FindByIdAsync(Guid id)
    {
        var response = await _client.From<ClassScheduleModel>().Where(x => x.Id == id).Single();
        return response?.ToDomain();
    }

    public async Task<IReadOnlyList<ClassSchedule>> SearchAsync(string? sportType, DateTime? date)
    {
        var query = _client.From<ClassScheduleModel>();
        
        // This requires complex joins for program/sportType. 
        // For now, we fetch all and filter in memory since we don't have joined models yet.
        var schedules = await query.Get();
        var domainSchedules = schedules.Models.Select(m => m.ToDomain()).ToList();
        
        // Mocking the joined properties for backward compatibility
        foreach (var s in domainSchedules)
        {
            var program = await _client.From<ClassProgramModel>().Where(p => p.Id == s.ProgramId).Single();
            var room = await _client.From<RoomModel>().Where(r => r.Id == s.RoomId).Single();
            if (program != null)
            {
                s.ClassName = program.ProgramName;
                s.SportType = program.ProgramName;
            }
            if (room != null)
            {
                s.RoomName = room.RoomName;
            }
        }

        IEnumerable<ClassSchedule> result = domainSchedules;
        if (!string.IsNullOrWhiteSpace(sportType))
        {
            result = result.Where(s => s.SportType.Contains(sportType, StringComparison.OrdinalIgnoreCase));
        }

        if (date.HasValue)
        {
            result = result.Where(s => s.StartTime.Date == date.Value.Date);
        }

        return result.OrderBy(s => s.StartTime).ToList();
    }

    public async Task<IReadOnlyList<ClassSchedule>> GetByCoachAsync(Guid coachId)
    {
        var response = await _client.From<ClassScheduleModel>().Where(x => x.CoachId == coachId).Get();
        var domainSchedules = response.Models.Select(m => m.ToDomain()).ToList();
        
        foreach (var s in domainSchedules)
        {
            var program = await _client.From<ClassProgramModel>().Where(p => p.Id == s.ProgramId).Single();
            var room = await _client.From<RoomModel>().Where(r => r.Id == s.RoomId).Single();
            if (program != null)
            {
                s.ClassName = program.ProgramName;
                s.SportType = program.ProgramName;
            }
            if (room != null)
            {
                s.RoomName = room.RoomName;
            }
        }
        
        return domainSchedules.OrderBy(s => s.StartTime).ToList();
    }

    public async Task<bool> HasCoachConflictAsync(Guid coachId, DateTime start, DateTime end, Guid? excludeScheduleId = null)
    {
        var response = await _client.From<ClassScheduleModel>()
            .Where(x => x.CoachId == coachId && x.IsCancelled == false)
            .Get();

        return response.Models.Any(s => s.Id != excludeScheduleId && s.StartTime < end && s.EndTime > start);
    }

    public async Task<bool> HasRoomConflictAsync(string roomName, DateTime start, DateTime end, Guid? excludeScheduleId = null)
    {
        var room = await _client.From<RoomModel>().Where(r => r.RoomName == roomName).Single();
        if (room == null) return false;

        var response = await _client.From<ClassScheduleModel>()
            .Where(x => x.RoomId == room.Id && x.IsCancelled == false)
            .Get();

        return response.Models.Any(s => s.Id != excludeScheduleId && s.StartTime < end && s.EndTime > start);
    }
}
