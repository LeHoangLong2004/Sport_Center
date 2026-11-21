using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Common;
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
            .Database.SqlQueryRaw<CoachSqlRawModel>("SELECT id, user_id, specialty, bio, experience_years, rating FROM coaches")
            .ToListAsync();
        var users = await _dbContext
            .Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number, avatar_url FROM users")
            .ToListAsync();

        var sport = sports.FirstOrDefault(s => s.Id == c.SportId);
        var facility = facilities.FirstOrDefault(f => f.Id == c.FacilityId);
        var (coach, coachUser) = ResolveCoach(c.CoachId, coaches, users);

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

        var rootId = c.ParentId ?? c.Id;
        var relatedSessions = await _dbContext.Database
            .SqlQueryRaw<ClassSessionRawModel>(
                @"SELECT id, session_number, schedule_time, duration_minutes, approval_status 
                  FROM classes 
                  WHERE id = {0} OR parent_id = {0} 
                  ORDER BY session_number ASC, schedule_time ASC",
                rootId
            )
            .ToListAsync();

        var sessionSummaries = relatedSessions.Select(s => new ClassSessionSummaryDto(
            s.Id,
            s.SessionNumber,
            s.ScheduleTime,
            s.DurationMinutes,
            s.ApprovalStatus
        )).ToList();

        return new ClassDetailResponse(
            Id: c.Id,
            SportId: c.SportId,
            SportName: sport?.Name ?? "Unknown Sport",
            FacilityId: c.FacilityId,
            FacilityName: facility?.Name ?? "Unknown Facility",
            CoachId: c.CoachId,
            CoachName: coachUser?.FullName ?? "N/A",
            ClassName: c.ClassName,
            ScheduleTime: AsUtc(c.ScheduleTime),
            DurationMinutes: c.DurationMinutes,
            Capacity: c.Capacity,
            CurrentEnrolled: c.CurrentEnrolled,
            AvailableSpots: c.Capacity - c.CurrentEnrolled,
            Status: c.Status,
            EnrolledMembers: enrolledMembers,
            ApprovalStatus: c.ApprovalStatus,
            ParentId: c.ParentId,
            SessionNumber: c.SessionNumber,
            TotalSessions: c.TotalSessions,
            Sessions: sessionSummaries
        );
    }

    public async Task<IEnumerable<GroupClass>> GetClassesByCoachAndDateAsync(
        Guid coachId,
        DateTime date
    )
    {
        var startOfDay = AsUtc(date).Date;
        var endOfDay = startOfDay.AddDays(1);

        var models = await _dbContext.Database
            .SqlQueryRaw<ClassSqlRawModel>(
                @"SELECT id, sport_id, facility_id, coach_id, class_name,
                         schedule_time, duration_minutes, capacity,
                         current_enrolled, status, approval_status
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
        var startOfDay = AsUtc(date).Date;
        var endOfDay = startOfDay.AddDays(1);

        var models = await _dbContext.Database
            .SqlQueryRaw<ClassSqlRawModel>(
                @"SELECT id, sport_id, facility_id, coach_id, class_name,
                         schedule_time, duration_minutes, capacity,
                         current_enrolled, status, approval_status
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
            model.Status,
            model.ApprovalStatus
        );

    private static DateTime AsUtc(DateTimeOffset value)
        => value.UtcDateTime;

    private static DateTime AsUtc(DateTime value)
        => value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc),
        };

    public async Task<IEnumerable<ClassResponse>> GetAllClassesAsync()
    {
        var classModels = await _dbContext.Database
            .SqlQueryRaw<ClassSqlRawModel>(
                @"SELECT id, sport_id, facility_id, coach_id, class_name,
                         schedule_time, duration_minutes, capacity,
                         current_enrolled, status, approval_status
                  FROM classes"
            )
            .ToListAsync();

        if (!classModels.Any())
            return Enumerable.Empty<ClassResponse>();

        var sports = await _dbContext
            .Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports")
            .ToListAsync();
        var facilities = await _dbContext
            .Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities")
            .ToListAsync();
        var coaches = await _dbContext
            .Database.SqlQueryRaw<CoachSqlRawModel>("SELECT id, user_id, specialty, bio, experience_years, rating FROM coaches")
            .ToListAsync();
        var users = await _dbContext
            .Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number, avatar_url FROM users")
            .ToListAsync();

        return classModels
            .Select(c =>
            {
                var sport = sports.FirstOrDefault(s => s.Id == c.SportId);
                var facility = facilities.FirstOrDefault(f => f.Id == c.FacilityId);
                var (coach, user) = ResolveCoach(c.CoachId, coaches, users);

                return new ClassResponse(
                    Id: c.Id,
                    SportId: c.SportId,
                    SportName: sport?.Name ?? "Unknown Sport",
                    FacilityId: c.FacilityId,
                    FacilityName: facility?.Name ?? "Unknown Facility",
                    CoachId: c.CoachId,
                    CoachName: user?.FullName ?? "N/A",
                    ClassName: c.ClassName,
                    ScheduleTime: AsUtc(c.ScheduleTime),
                    DurationMinutes: c.DurationMinutes,
                    Capacity: c.Capacity,
                    CurrentEnrolled: c.CurrentEnrolled,
                    AvailableSpots: c.Capacity - c.CurrentEnrolled,
                    Status: c.Status,
                    ApprovalStatus: c.ApprovalStatus,
                    CoachAvatar: SmartGym.Domain.Common.CoachAvatarHelper.GetRealCoachAvatar(user?.FullName, user?.AvatarUrl, c.CoachId),
                    CoachSpecialty: coach?.Specialty ?? "Huấn luyện viên Thể hình",
                    CoachPhone: user?.PhoneNumber ?? "",
                    CoachBio: coach?.Bio ?? "Huấn luyện viên phụ trách lớp học.",
                    CoachRating: coach?.Rating,
                    CoachExperienceYears: coach?.ExperienceYears ?? 5,
                    Price: 150000m,
                    ParentId: c.ParentId,
                    SessionNumber: c.SessionNumber,
                    TotalSessions: c.TotalSessions
                );
            })
            .OrderBy(x => x.ScheduleTime)
            .ToList();
    }

    public async Task<IEnumerable<ClassResponse>> GetAvailableClassesAsync()
    {
        var nowUtc = DateTimeOffset.UtcNow;
        var classResponse = await _client
            .From<GroupClassModel>()
            .Where(x => x.Status == true)
            .Where(x => x.ScheduleTime > nowUtc)
            .Get();

        var classModels = classResponse.Models
            .Where(c => c.Status && 
                        string.Equals(c.ApprovalStatus, "approved", StringComparison.OrdinalIgnoreCase) &&
                        c.ScheduleTime > nowUtc &&
                        (c.ParentId == null || c.SessionNumber == 1))
            .ToList();
        if (!classModels.Any())
            return Enumerable.Empty<ClassResponse>();

        var sports = await _dbContext
            .Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports")
            .ToListAsync();
        var facilities = await _dbContext
            .Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities")
            .ToListAsync();
        var coaches = await _dbContext
            .Database.SqlQueryRaw<CoachSqlRawModel>("SELECT id, user_id, specialty, bio, experience_years, rating FROM coaches")
            .ToListAsync();
        var users = await _dbContext
            .Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number, avatar_url FROM users")
            .ToListAsync();

        return classModels
            .Select(c =>
            {
                var sport = sports.FirstOrDefault(s => s.Id == c.SportId);
                var facility = facilities.FirstOrDefault(f => f.Id == c.FacilityId);
                var (coach, user) = ResolveCoach(c.CoachId, coaches, users);

                return new ClassResponse(
                    Id: c.Id,
                    SportId: c.SportId,
                    SportName: sport?.Name ?? "Unknown Sport",
                    FacilityId: c.FacilityId,
                    FacilityName: facility?.Name ?? "Unknown Facility",
                    CoachId: c.CoachId,
                    CoachName: user?.FullName ?? "N/A",
                    ClassName: c.ClassName,
                    ScheduleTime: AsUtc(c.ScheduleTime),
                    DurationMinutes: c.DurationMinutes,
                    Capacity: c.Capacity,
                    CurrentEnrolled: c.CurrentEnrolled,
                    AvailableSpots: c.Capacity - c.CurrentEnrolled,
                    Status: c.Status,
                    ApprovalStatus: c.ApprovalStatus,
                    CoachAvatar: SmartGym.Domain.Common.CoachAvatarHelper.GetRealCoachAvatar(user?.FullName, user?.AvatarUrl, c.CoachId),
                    CoachSpecialty: coach?.Specialty ?? "Huấn luyện viên Thể hình",
                    CoachPhone: user?.PhoneNumber ?? "",
                    CoachBio: coach?.Bio ?? "Huấn luyện viên phụ trách lớp học.",
                    CoachRating: coach?.Rating,
                    CoachExperienceYears: coach?.ExperienceYears ?? 5,
                    Price: c.TotalSessions > 1 ? c.TotalSessions * 150000m : 150000m,
                    ParentId: c.ParentId,
                    SessionNumber: c.SessionNumber,
                    TotalSessions: c.TotalSessions
                );
            })
            .OrderBy(x => x.ScheduleTime)
            .ToList();
    }

    private static (CoachSqlRawModel? Coach, UserSqlRawModel? User) ResolveCoach(
        Guid? coachId,
        IReadOnlyCollection<CoachSqlRawModel> coaches,
        IReadOnlyCollection<UserSqlRawModel> users
    )
    {
        if (!coachId.HasValue)
            return (null, null);

        // Legacy class records may store either coaches.id or users.id in coach_id.
        // Resolve both forms so the account profile (including avatar_url) is always used.
        var coach = coaches.FirstOrDefault(c => c.Id == coachId.Value || c.UserId == coachId.Value);
        var userId = coach?.UserId ?? coachId.Value;
        var user = users.FirstOrDefault(u => u.Id == userId);

        return (coach, user);
    }

}
