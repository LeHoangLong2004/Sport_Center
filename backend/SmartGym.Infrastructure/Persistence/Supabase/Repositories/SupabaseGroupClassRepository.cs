using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Repositories;

public sealed partial class SupabaseGroupClassRepository : IGroupClassRepository
{
    private readonly global::Supabase.Client _client;
    private readonly SmartGymDbContext _dbContext;

    public SupabaseGroupClassRepository(global::Supabase.Client client, SmartGymDbContext dbContext)
    {
        _client = client;
        _dbContext = dbContext;
    }

    public async Task<GroupClass?> GetByIdAsync(Guid id)
    {
        var response = await _client.From<GroupClassModel>().Where(x => x.Id == id).Single();

        return response?.ToDomain();
    }

    public async Task<ClassDetailResponse?> GetClassDetailByIdAsync(Guid id)
    {
        var classResponse = await _client.From<GroupClassModel>().Where(x => x.Id == id).Single();

        if (classResponse == null)
            return null;
        var c = classResponse;

        var sports = await _dbContext
            .Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports")
            .ToListAsync();
        var facilities = await _dbContext
            .Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities")
            .ToListAsync();
        var coaches = await _dbContext
            .Database.SqlQueryRaw<CoachSqlRawModel>("SELECT id, user_id FROM coaches")
            .ToListAsync();
        var users = await _dbContext
            .Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number, avatar_url FROM users")
            .ToListAsync();

        var sport = sports.FirstOrDefault(s => s.Id == c.SportId);
        var facility = facilities.FirstOrDefault(f => f.Id == c.FacilityId);
        var coach = coaches.FirstOrDefault(co => co.Id == c.CoachId);
        var coachUser = coach != null ? users.FirstOrDefault(u => u.Id == coach.UserId) : null;

        var bookings = await _dbContext
            .Database.SqlQueryRaw<ClassBookingRawModel>(
                "SELECT id, user_id, class_id, status, created_at FROM class_bookings WHERE class_id = {0} AND status != 'cancelled'",
                id
            )
            .ToListAsync();

        var enrolledMembers = bookings
            .Select(b =>
            {
                var memberUser = users.FirstOrDefault(u => u.Id == b.UserId);
                return new EnrolledMemberDto
                {
                    MemberId = b.UserId,
                    FullName = memberUser?.FullName ?? "Unknown",
                    PhoneNumber = memberUser?.PhoneNumber ?? "Unknown",
                    BookingStatus = b.Status,
                };
            })
            .ToList();

        return new ClassDetailResponse(
            Id: c.Id,
            SportId: c.SportId,
            SportName: sport?.Name ?? "Unknown Sport",
            FacilityId: c.FacilityId,
            FacilityName: facility?.Name ?? "Unknown Facility",
            CoachId: c.CoachId,
            CoachName: coachUser?.FullName ?? "N/A",
            ClassName: c.ClassName,
            ScheduleTime: c.ScheduleTime,
            DurationMinutes: c.DurationMinutes,
            Capacity: c.Capacity,
            CurrentEnrolled: c.CurrentEnrolled,
            AvailableSpots: c.Capacity - c.CurrentEnrolled,
            Status: c.Status,
            EnrolledMembers: enrolledMembers
        );
    }

    public async Task<IEnumerable<GroupClass>> GetClassesByCoachAndDateAsync(
        Guid coachId,
        DateTime date
    )
    {
        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1);

        var models = await _dbContext.Database
            .SqlQueryRaw<ClassSqlRawModel>(
                @"SELECT id, sport_id, facility_id, coach_id, class_name,
                         schedule_time, duration_minutes, capacity,
                         current_enrolled, status
                  FROM classes
                  WHERE coach_id = {0}
                    AND schedule_time >= {1}
                    AND schedule_time < {2}",
                coachId,
                startOfDay,
                endOfDay
            )
            .ToListAsync();

        return models.Select(ToDomain);
    }

    public async Task<IEnumerable<GroupClass>> GetClassesByFacilityAndDateAsync(
        Guid facilityId,
        DateTime date
    )
    {
        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1);

        var models = await _dbContext.Database
            .SqlQueryRaw<ClassSqlRawModel>(
                @"SELECT id, sport_id, facility_id, coach_id, class_name,
                         schedule_time, duration_minutes, capacity,
                         current_enrolled, status
                  FROM classes
                  WHERE facility_id = {0}
                    AND schedule_time >= {1}
                    AND schedule_time < {2}",
                facilityId,
                startOfDay,
                endOfDay
            )
            .ToListAsync();

        return models.Select(ToDomain);
    }

    private static GroupClass ToDomain(ClassSqlRawModel model)
        => new(
            model.Id,
            model.SportId,
            model.CoachId,
            model.FacilityId,
            model.ClassName,
            model.ScheduleTime,
            model.DurationMinutes,
            model.Capacity,
            model.CurrentEnrolled,
            model.Status
        );

    public async Task<IEnumerable<ClassResponse>> GetAllClassesAsync()
    {
        var classResponse = await _client.From<GroupClassModel>().Get();
        var classModels = classResponse.Models;
        if (!classModels.Any())
            return Enumerable.Empty<ClassResponse>();

        var sports = await _dbContext
            .Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports")
            .ToListAsync();
        var facilities = await _dbContext
            .Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities")
            .ToListAsync();
        var coaches = await _dbContext
            .Database.SqlQueryRaw<CoachSqlRawModel>("SELECT id, user_id FROM coaches")
            .ToListAsync();
        var users = await _dbContext
            .Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number, avatar_url FROM users")
            .ToListAsync();

        return classModels
            .Select(c =>
            {
                var sport = sports.FirstOrDefault(s => s.Id == c.SportId);
                var facility = facilities.FirstOrDefault(f => f.Id == c.FacilityId);
                var coach = coaches.FirstOrDefault(co => co.Id == c.CoachId);
                var user = coach != null ? users.FirstOrDefault(u => u.Id == coach.UserId) : null;

                return new ClassResponse(
                    Id: c.Id,
                    SportId: c.SportId,
                    SportName: sport?.Name ?? "Unknown Sport",
                    FacilityId: c.FacilityId,
                    FacilityName: facility?.Name ?? "Unknown Facility",
                    CoachId: c.CoachId,
                    CoachName: user?.FullName ?? "N/A",
                    ClassName: c.ClassName,
                    ScheduleTime: c.ScheduleTime,
                    DurationMinutes: c.DurationMinutes,
                    Capacity: c.Capacity,
                    CurrentEnrolled: c.CurrentEnrolled,
                    AvailableSpots: c.Capacity - c.CurrentEnrolled,
                    Status: c.Status
                );
            })
            .OrderBy(x => x.ScheduleTime)
            .ToList();
    }

    public async Task<IEnumerable<ClassResponse>> GetAvailableClassesAsync()
    {
        var classResponse = await _client
            .From<GroupClassModel>()
            .Where(x => x.Status == true)
            .Where(x => x.ScheduleTime > DateTime.UtcNow)
            .Get();

        var classModels = classResponse.Models;
        if (!classModels.Any())
            return Enumerable.Empty<ClassResponse>();

        var sports = await _dbContext
            .Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports")
            .ToListAsync();
        var facilities = await _dbContext
            .Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities")
            .ToListAsync();
        var coaches = await _dbContext
            .Database.SqlQueryRaw<CoachSqlRawModel>("SELECT id, user_id FROM coaches")
            .ToListAsync();
        var users = await _dbContext
            .Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number, avatar_url FROM users")
            .ToListAsync();

        return classModels
            .Select(c =>
            {
                var sport = sports.FirstOrDefault(s => s.Id == c.SportId);
                var facility = facilities.FirstOrDefault(f => f.Id == c.FacilityId);
                var coach = coaches.FirstOrDefault(co => co.Id == c.CoachId);
                var user = coach != null ? users.FirstOrDefault(u => u.Id == coach.UserId) : null;

                return new ClassResponse(
                    Id: c.Id,
                    SportId: c.SportId,
                    SportName: sport?.Name ?? "Unknown Sport",
                    FacilityId: c.FacilityId,
                    FacilityName: facility?.Name ?? "Unknown Facility",
                    CoachId: c.CoachId,
                    CoachName: user?.FullName ?? "N/A",
                    ClassName: c.ClassName,
                    ScheduleTime: c.ScheduleTime,
                    DurationMinutes: c.DurationMinutes,
                    Capacity: c.Capacity,
                    CurrentEnrolled: c.CurrentEnrolled,
                    AvailableSpots: c.Capacity - c.CurrentEnrolled,
                    Status: c.Status
                );
            })
            .OrderBy(x => x.ScheduleTime)
            .ToList();
    }

}
