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

    public async Task<FacilitySchedulingSettings?> GetFacilitySchedulingSettingsAsync(Guid facilityId)
    {
        var rows = await _dbContext.Database.SqlQueryRaw<FacilitySchedulingSettingsSqlRow>(
            "SELECT allow_concurrent_classes AS \"AllowConcurrentClasses\", max_concurrent_classes AS \"MaxConcurrentClasses\", total_capacity AS \"TotalCapacity\" FROM facilities WHERE id = {0}",
            facilityId).ToListAsync();
        var row = rows.SingleOrDefault();
        return row is null
            ? null
            : new FacilitySchedulingSettings(row.AllowConcurrentClasses, Math.Max(1, row.MaxConcurrentClasses), row.TotalCapacity);
    }

    public async Task<IEnumerable<GroupClass>> GetCourseSessionsAsync(Guid classId)
    {
        var rows = await _dbContext.Database.SqlQueryRaw<ClassSqlRawModel>(
            """
            SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes,
                   capacity, current_enrolled, status, approval_status, parent_id, session_number,
                   total_sessions, price_per_session_snapshot, course_fee_snapshot
            FROM classes
            WHERE id = COALESCE((SELECT parent_id FROM classes WHERE id = {0}), {0})
               OR parent_id = COALESCE((SELECT parent_id FROM classes WHERE id = {0}), {0})
            ORDER BY session_number, schedule_time
            """, classId).ToListAsync();
        return rows.Select(ToDomain).ToList();
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
                         current_enrolled, status, approval_status, parent_id, session_number, total_sessions,
                         price_per_session_snapshot, course_fee_snapshot
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
                         current_enrolled, status, approval_status, parent_id, session_number, total_sessions,
                         price_per_session_snapshot, course_fee_snapshot
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

    public async Task<IEnumerable<GroupClass>> GetClassesForScheduleConflictsAsync(
        Guid coachId,
        Guid facilityId,
        DateTime from,
        DateTime to)
    {
        var start = AsUtc(from);
        var end = AsUtc(to);
        var models = await _dbContext.Database
            .SqlQueryRaw<ClassSqlRawModel>(
                @"SELECT id, sport_id, facility_id, coach_id, class_name,
                         schedule_time, duration_minutes, capacity,
                         current_enrolled, status, approval_status, parent_id, session_number, total_sessions,
                         price_per_session_snapshot, course_fee_snapshot
                  FROM classes
                  WHERE (coach_id = {0} OR facility_id = {1})
                    AND schedule_time >= {2}
                    AND schedule_time < {3}",
                coachId,
                facilityId,
                start,
                end)
            .ToListAsync();

        return models.Select(ToDomain).ToList();
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
            model.ApprovalStatus,
            model.ParentId,
            model.SessionNumber,
            model.TotalSessions
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
                         current_enrolled, status, approval_status, parent_id, session_number, total_sessions,
                         price_per_session_snapshot, course_fee_snapshot
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

        var currentClassPrices = await GetCurrentClassPricesBySportAsync();
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
                    Price: TryCalculateCoursePrice(currentClassPrices, c.SportId, sport?.Name, c.TotalSessions),
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
        var nowUtc = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(CenterTime.ToLocal(nowUtc));
        var rows = await _dbContext.Database.SqlQueryRaw<AvailableClassSqlRawModel>(
            """
            SELECT c.id AS "Id", c.sport_id AS "SportId", COALESCE(s.name, 'Unknown Sport') AS "SportName",
                   c.facility_id AS "FacilityId", COALESCE(f.name, 'Unknown Facility') AS "FacilityName",
                   c.coach_id AS "CoachId", COALESCE(u.full_name, 'N/A') AS "CoachName",
                   c.class_name AS "ClassName", c.schedule_time AS "ScheduleTime",
                   c.duration_minutes AS "DurationMinutes", c.capacity AS "Capacity",
                   c.current_enrolled AS "CurrentEnrolled", c.status AS "Status",
                   c.approval_status AS "ApprovalStatus", u.avatar_url AS "CoachAvatar",
                   co.specialty AS "CoachSpecialty", u.phone_number AS "CoachPhone",
                   co.bio AS "CoachBio", co.rating AS "CoachRating", co.experience_years AS "CoachExperienceYears",
                   price.price_per_session * GREATEST(COALESCE(c.total_sessions, 1), 1) AS "Price",
                   c.parent_id AS "ParentId", COALESCE(c.session_number, 1) AS "SessionNumber",
                   GREATEST(COALESCE(c.total_sessions, 1), 1) AS "TotalSessions"
            FROM classes c
            LEFT JOIN sports s ON s.id = c.sport_id
            LEFT JOIN facilities f ON f.id = c.facility_id
            LEFT JOIN LATERAL (
                SELECT coach.id, coach.user_id, coach.specialty, coach.bio, coach.experience_years, coach.rating
                FROM coaches coach
                WHERE coach.id = c.coach_id OR coach.user_id = c.coach_id
                ORDER BY CASE WHEN coach.id = c.coach_id THEN 0 ELSE 1 END
                LIMIT 1
            ) co ON TRUE
            LEFT JOIN users u ON u.id = COALESCE(co.user_id, c.coach_id)
            LEFT JOIN LATERAL (
                SELECT p.price_per_session
                FROM sport_class_pricing p
                WHERE p.sport_id = c.sport_id AND p.is_active = TRUE
                  AND p.effective_from <= {1} AND (p.effective_to IS NULL OR p.effective_to >= {1})
                ORDER BY p.effective_from DESC, p.created_at DESC
                LIMIT 1
            ) price ON TRUE
            WHERE c.status = TRUE AND LOWER(c.approval_status) = 'approved'
              AND c.schedule_time > {0}
              AND (c.parent_id IS NULL OR c.session_number = 1)
            ORDER BY c.schedule_time
            """, nowUtc, today).ToListAsync();

        return rows.Select(c => new ClassResponse(
            Id: c.Id,
            SportId: c.SportId,
            SportName: c.SportName,
            FacilityId: c.FacilityId,
            FacilityName: c.FacilityName,
            CoachId: c.CoachId,
            CoachName: c.CoachName,
            ClassName: c.ClassName,
            ScheduleTime: AsUtc(c.ScheduleTime),
            DurationMinutes: c.DurationMinutes,
            Capacity: c.Capacity,
            CurrentEnrolled: c.CurrentEnrolled,
            AvailableSpots: c.Capacity - c.CurrentEnrolled,
            Status: c.Status,
            ApprovalStatus: c.ApprovalStatus,
            CoachAvatar: SmartGym.Domain.Common.CoachAvatarHelper.GetRealCoachAvatar(c.CoachName, c.CoachAvatar, c.CoachId),
            CoachSpecialty: c.CoachSpecialty ?? "Huấn luyện viên Thể hình",
            CoachPhone: c.CoachPhone ?? "",
            CoachBio: c.CoachBio ?? "Huấn luyện viên phụ trách lớp học.",
            CoachRating: c.CoachRating,
            CoachExperienceYears: c.CoachExperienceYears ?? 5,
            Price: c.Price,
            ParentId: c.ParentId,
            SessionNumber: c.SessionNumber,
            TotalSessions: c.TotalSessions
        )).ToList();
    }

    private async Task<CurrentSportClassPriceLookup> GetCurrentClassPricesBySportAsync()
    {
        var today = DateOnly.FromDateTime(CenterTime.ToLocal(DateTime.UtcNow));
        var prices = await _dbContext.Database.SqlQueryRaw<CurrentSportClassPriceRawModel>(
            """
            SELECT p.sport_id AS "SportId",
                   s.name AS "SportName",
                   p.price_per_session AS "PricePerSession",
                   p.effective_from AS "EffectiveFrom",
                   p.created_at AS "CreatedAt"
            FROM sport_class_pricing p
            INNER JOIN sports s ON s.id = p.sport_id
            WHERE p.is_active = TRUE
              AND p.effective_from <= {0}
              AND (p.effective_to IS NULL OR p.effective_to >= {0})
            ORDER BY p.effective_from DESC, p.created_at DESC
            """,
            today
        ).ToListAsync();

        var orderedPrices = prices
            .OrderByDescending(price => price.EffectiveFrom)
            .ThenByDescending(price => price.CreatedAt)
            .ToList();

        return new CurrentSportClassPriceLookup(
            orderedPrices
                .GroupBy(price => price.SportId)
                .ToDictionary(group => group.Key, group => group.First().PricePerSession),
            orderedPrices
                .GroupBy(price => NormalizeSportName(price.SportName))
                .Where(group => group.Key.Length > 0)
                .ToDictionary(group => group.Key, group => group.First().PricePerSession)
        );
    }

    private static decimal? TryCalculateCoursePrice(
        CurrentSportClassPriceLookup prices,
        Guid sportId,
        string? sportName,
        int totalSessions)
    {
        if (!prices.BySportId.TryGetValue(sportId, out var pricePerSession) &&
            !prices.BySportName.TryGetValue(NormalizeSportName(sportName), out pricePerSession))
            return null;

        return pricePerSession * Math.Max(1, totalSessions);
    }

    private static string NormalizeSportName(string? sportName)
        => string.IsNullOrWhiteSpace(sportName) ? string.Empty : sportName.Trim().ToLowerInvariant();

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

public sealed class FacilitySchedulingSettingsSqlRow
{
    public bool AllowConcurrentClasses { get; set; }
    public int MaxConcurrentClasses { get; set; }
    public int? TotalCapacity { get; set; }
}

internal sealed class CurrentSportClassPriceRawModel
{
    public Guid SportId { get; set; }
    public string SportName { get; set; } = string.Empty;
    public decimal PricePerSession { get; set; }
    public DateOnly EffectiveFrom { get; set; }
    public DateTime CreatedAt { get; set; }
}

internal sealed class AvailableClassSqlRawModel
{
    public Guid Id { get; set; }
    public Guid SportId { get; set; }
    public string SportName { get; set; } = "Unknown Sport";
    public Guid FacilityId { get; set; }
    public string FacilityName { get; set; } = "Unknown Facility";
    public Guid? CoachId { get; set; }
    public string? CoachName { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public DateTime ScheduleTime { get; set; }
    public int DurationMinutes { get; set; }
    public int Capacity { get; set; }
    public int CurrentEnrolled { get; set; }
    public bool Status { get; set; }
    public string ApprovalStatus { get; set; } = "approved";
    public string? CoachAvatar { get; set; }
    public string? CoachSpecialty { get; set; }
    public string? CoachPhone { get; set; }
    public string? CoachBio { get; set; }
    public decimal? CoachRating { get; set; }
    public int? CoachExperienceYears { get; set; }
    public decimal? Price { get; set; }
    public Guid? ParentId { get; set; }
    public int SessionNumber { get; set; }
    public int TotalSessions { get; set; }
}

internal sealed record CurrentSportClassPriceLookup(
    Dictionary<Guid, decimal> BySportId,
    Dictionary<string, decimal> BySportName);
