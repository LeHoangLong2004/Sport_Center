using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SmartGym.Infrastructure.Persistence.Supabase.Repositories;

public sealed class SupabaseGroupClassRepository : IGroupClassRepository
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
        var response = await _client.From<GroupClassModel>()
            .Where(x => x.Id == id)
            .Single();

        return response?.ToDomain();
    }

    public async Task<ClassDetailResponse?> GetClassDetailByIdAsync(Guid id)
    {
        var classResponse = await _client.From<GroupClassModel>()
            .Where(x => x.Id == id)
            .Single();

        if (classResponse == null) return null;
        var c = classResponse;

        var sports = await _dbContext.Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports").ToListAsync();
        var facilities = await _dbContext.Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities").ToListAsync();
        var coaches = await _dbContext.Database.SqlQueryRaw<CoachSqlRawModel>("SELECT id, user_id FROM coaches").ToListAsync();
        var users = await _dbContext.Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number FROM users").ToListAsync();
        
        var sport = sports.FirstOrDefault(s => s.Id == c.SportId);
        var facility = facilities.FirstOrDefault(f => f.Id == c.FacilityId);
        var coach = coaches.FirstOrDefault(co => co.Id == c.CoachId);
        var coachUser = coach != null ? users.FirstOrDefault(u => u.Id == coach.UserId) : null;

        var bookings = await _dbContext.Database.SqlQueryRaw<ClassBookingRawModel>(
            "SELECT id, user_id, class_id, status FROM class_bookings WHERE class_id = {0}", id
        ).ToListAsync();
        
        var enrolledMembers = bookings.Select(b => {
            var memberUser = users.FirstOrDefault(u => u.Id == b.UserId);
            return new EnrolledMemberDto
            {
                MemberId = b.UserId,
                FullName = memberUser?.FullName ?? "Unknown",
                PhoneNumber = memberUser?.PhoneNumber ?? "Unknown",
                BookingStatus = b.Status
            };
        }).ToList();

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
            EnrolledMembers: enrolledMembers
        );
    }

    public async Task<IEnumerable<GroupClass>> GetClassesByCoachAndDateAsync(Guid coachId, DateTime date)
    {
        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1);

        var response = await _client.From<GroupClassModel>()
            .Where(x => x.CoachId == coachId)
            .Where(x => x.ScheduleTime >= startOfDay)
            .Where(x => x.ScheduleTime < endOfDay)
            .Get();

        return response.Models.Select(x => x.ToDomain());
    }

    public async Task<IEnumerable<ClassResponse>> GetAvailableClassesAsync()
    {
        var classResponse = await _client.From<GroupClassModel>()
            .Where(x => x.Status == true)
            .Where(x => x.ScheduleTime > DateTime.UtcNow)
            .Get();

        var classModels = classResponse.Models;
        if (!classModels.Any()) return Enumerable.Empty<ClassResponse>();

        var sports = await _dbContext.Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports").ToListAsync();
        var facilities = await _dbContext.Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities").ToListAsync();
        var coaches = await _dbContext.Database.SqlQueryRaw<CoachSqlRawModel>("SELECT id, user_id FROM coaches").ToListAsync();
        var users = await _dbContext.Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number FROM users").ToListAsync();

        return classModels.Select(c =>
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
                AvailableSpots: c.Capacity - c.CurrentEnrolled
            );
        }).OrderBy(x => x.ScheduleTime).ToList();
    }

    public async Task AddAsync(GroupClass groupClass)
    {
        if (groupClass.CoachId.HasValue)
        {
            await _dbContext.Database.ExecuteSqlRawAsync(
                @"INSERT INTO coaches (id, user_id, specialty, experience_years)
                  VALUES ({0}, {0}, 'General Coach', 3)
                  ON CONFLICT (user_id) DO NOTHING",
                groupClass.CoachId.Value);
        }

        var model = new GroupClassModel
        {
            Id = groupClass.Id,
            SportId = groupClass.SportId,
            CoachId = groupClass.CoachId,
            FacilityId = groupClass.FacilityId,
            ClassName = groupClass.ClassName,
            ScheduleTime = groupClass.ScheduleTime,
            DurationMinutes = groupClass.DurationMinutes,
            Capacity = groupClass.Capacity,
            CurrentEnrolled = groupClass.CurrentEnrolled,
            Status = groupClass.Status
        };

        await _client.From<GroupClassModel>().Insert(model);
    }

    public async Task UpdateAsync(GroupClass groupClass)
    {
        var model = new GroupClassModel
        {
            Id = groupClass.Id,
            SportId = groupClass.SportId,
            CoachId = groupClass.CoachId,
            FacilityId = groupClass.FacilityId,
            ClassName = groupClass.ClassName,
            ScheduleTime = groupClass.ScheduleTime,
            DurationMinutes = groupClass.DurationMinutes,
            Capacity = groupClass.Capacity,
            CurrentEnrolled = groupClass.CurrentEnrolled,
            Status = groupClass.Status
        };

        await _client.From<GroupClassModel>().Update(model);
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> BookClassTransactionAsync(Guid userId, Guid classId, Guid subscriptionId)
    {
        using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            var affectedRows = await _dbContext.Database.ExecuteSqlRawAsync(
                @"UPDATE classes 
                  SET current_enrolled = current_enrolled + 1
                  WHERE id = {0} AND status = true 
                    AND current_enrolled < capacity AND schedule_time > now()",
                classId);

            if (affectedRows == 0)
            {
                await transaction.RollbackAsync();
                return (false, "Lớp đã đầy, đã đóng hoặc đã bắt đầu.");
            }

            await _dbContext.Database.ExecuteSqlRawAsync(
                @"INSERT INTO class_bookings (user_id, class_id, subscription_id, status)
                  VALUES ({0}, {1}, {2}, 'confirmed')
                  ON CONFLICT (user_id, class_id) 
                  DO UPDATE SET status = 'confirmed', subscription_id = {2}",
                userId, classId, subscriptionId);

            await _dbContext.Database.ExecuteSqlRawAsync(
                @"INSERT INTO notifications (user_id, title, message)
                  VALUES ({0}, 'Đặt lớp thành công', 'Bạn đã đặt chỗ thành công cho lớp học.')",
                userId);

            await transaction.CommitAsync();
            return (true, null);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return (false, "Lỗi hệ thống khi đặt lớp. " + ex.Message);
        }
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> CancelBookingTransactionAsync(Guid userId, Guid classId)
    {
        using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            var affectedBooking = await _dbContext.Database.ExecuteSqlRawAsync(
                @"UPDATE class_bookings 
                  SET status = 'cancelled' 
                  WHERE user_id = {0} AND class_id = {1} AND status = 'confirmed'",
                userId, classId);

            if (affectedBooking == 0)
            {
                await transaction.RollbackAsync();
                return (false, "Không tìm thấy thông tin đặt chỗ hoặc đã bị hủy.");
            }

            await _dbContext.Database.ExecuteSqlRawAsync(
                @"UPDATE classes 
                  SET current_enrolled = current_enrolled - 1 
                  WHERE id = {0}",
                classId);

            await _dbContext.Database.ExecuteSqlRawAsync(
                @"INSERT INTO notifications (user_id, title, message)
                  VALUES ({0}, 'Hủy đặt lớp thành công', 'Bạn đã hủy chỗ thành công cho lớp học.')",
                userId);

            await transaction.CommitAsync();
            return (true, null);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return (false, "Lỗi hệ thống khi hủy đặt lớp. " + ex.Message);
        }
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> CancelClassTransactionAsync(Guid classId)
    {
        using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            var affected = await _dbContext.Database.ExecuteSqlRawAsync(
                @"UPDATE classes 
                  SET status = false 
                  WHERE id = {0}",
                classId);

            if (affected == 0)
            {
                await transaction.RollbackAsync();
                return (false, "Lớp học không tồn tại.");
            }

            await _dbContext.Database.ExecuteSqlRawAsync(
                @"UPDATE class_bookings 
                  SET status = 'class_cancelled' 
                  WHERE class_id = {0} AND status = 'confirmed'",
                classId);

            await transaction.CommitAsync();
            return (true, null);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return (false, "Lỗi hệ thống khi hủy lớp học. " + ex.Message);
        }
    }

    public async Task NotifyAffectedMembersAsync(Guid classId, string title, string message)
    {
        await _dbContext.Database.ExecuteSqlRawAsync(
            @"INSERT INTO notifications (user_id, title, message)
              SELECT user_id, {1}, {2} 
              FROM class_bookings 
              WHERE class_id = {0} AND status = 'confirmed'",
            classId, title, message);

        await _dbContext.Database.ExecuteSqlRawAsync(
            @"INSERT INTO notifications (user_id, title, message)
              SELECT coaches.user_id, {1}, {2} 
              FROM classes 
              INNER JOIN coaches ON classes.coach_id = coaches.id
              WHERE classes.id = {0}",
            classId, title, message);
    }

    // ── GIAI ĐOẠN G: ĐIỂM DANH & XEM LỊCH ──

    public async Task<(bool IsSuccess, string? ErrorMessage)> UpdateAttendanceAsync(Guid classId, List<AttendanceRecordDto> attendanceList)
    {
        using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            foreach (var item in attendanceList)
            {
                var validStatus = item.Status.ToLower() == "no_show" ? "no_show" : "attended";

                await _dbContext.Database.ExecuteSqlRawAsync(
                    @"UPDATE class_bookings 
                      SET status = {2} 
                      WHERE class_id = {0} AND user_id = {1}",
                    classId, item.MemberId, validStatus);
            }

            await transaction.CommitAsync();
            return (true, null);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return (false, "Lỗi hệ thống khi điểm danh. " + ex.Message);
        }
    }

    public async Task<MemberScheduleResponse> GetMemberScheduleAsync(Guid userId)
    {
        var response = new MemberScheduleResponse();

        var classBookings = await _dbContext.Database.SqlQueryRaw<ClassBookingRawModel>(
            "SELECT id, user_id, class_id, status FROM class_bookings WHERE user_id = {0}", userId
        ).ToListAsync();

        if (classBookings.Any())
        {
            var classes = await _dbContext.Database.SqlQueryRaw<ClassSqlRawModel>(
                "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status FROM classes").ToListAsync();
            var sports = await _dbContext.Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports").ToListAsync();
            var facilities = await _dbContext.Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities").ToListAsync();
            var coaches = await _dbContext.Database.SqlQueryRaw<CoachSqlRawModel>("SELECT id, user_id FROM coaches").ToListAsync();
            var users = await _dbContext.Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number FROM users").ToListAsync();

            response.ClassBookings = classBookings.Select(cb =>
            {
                var targetClass = classes.FirstOrDefault(c => c.Id == cb.ClassId);
                var sport = targetClass != null ? sports.FirstOrDefault(s => s.Id == targetClass.SportId) : null;
                var facility = targetClass != null ? facilities.FirstOrDefault(f => f.Id == targetClass.FacilityId) : null;
                var coach = targetClass != null ? coaches.FirstOrDefault(co => co.Id == targetClass.CoachId) : null;
                var coachUser = coach != null ? users.FirstOrDefault(u => u.Id == coach.UserId) : null;

                return new MemberClassBookingDto
                {
                    BookingId = cb.Id,
                    ClassId = cb.ClassId,
                    ClassName = targetClass?.ClassName ?? "Unknown Class",
                    SportName = sport?.Name ?? "N/A",
                    FacilityName = facility?.Name ?? "N/A",
                    CoachName = coachUser?.FullName ?? "N/A",
                    ScheduleTime = targetClass?.ScheduleTime ?? DateTime.MinValue,
                    DurationMinutes = targetClass?.DurationMinutes ?? 60,
                    Status = cb.Status
                };
            }).OrderBy(x => x.ScheduleTime).ToList();
        }

        var ptSessions = await _dbContext.Database.SqlQueryRaw<PtSessionMemberSqlDto>(
            @"SELECT ps.id, ps.schedule_time, ps.duration_minutes, ps.status 
              FROM pt_sessions ps 
              INNER JOIN pt_enrollments pe ON ps.enrollment_id = pe.id 
              WHERE pe.user_id = {0}", userId
        ).ToListAsync();

        if (ptSessions.Any())
        {
            response.PtSessions = ptSessions.Select(ps => new MemberPtSessionDto
            {
                SessionId = ps.Id,
                CoachName = "Personal Trainer",
                ScheduleTime = ps.ScheduleTime,
                DurationMinutes = ps.DurationMinutes,
                Status = ps.Status
            }).OrderBy(x => x.ScheduleTime).ToList();
        }

        return response;
    }

    public async Task<IEnumerable<CoachClassScheduleDto>> GetCoachScheduleAsync(Guid coachUserId, DateTime? date)
    {
        var coach = await _dbContext.Database.SqlQueryRaw<CoachSqlRawModel>(
            "SELECT id, user_id FROM coaches WHERE user_id = {0}", coachUserId).FirstOrDefaultAsync();

        if (coach == null) return Enumerable.Empty<CoachClassScheduleDto>();

        var allClasses = await _dbContext.Database.SqlQueryRaw<ClassSqlRawModel>(
            "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status FROM classes WHERE coach_id = {0}", coach.Id).ToListAsync();

        if (date.HasValue)
        {
            var startOfDay = date.Value.Date;
            var endOfDay = startOfDay.AddDays(1);
            allClasses = allClasses.Where(c => c.ScheduleTime >= startOfDay && c.ScheduleTime < endOfDay).ToList();
        }

        if (!allClasses.Any()) return Enumerable.Empty<CoachClassScheduleDto>();

        var sports = await _dbContext.Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports").ToListAsync();
        var facilities = await _dbContext.Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities").ToListAsync();
        var allBookings = await _dbContext.Database.SqlQueryRaw<ClassBookingRawModel>("SELECT id, user_id, class_id, status FROM class_bookings").ToListAsync();
        var users = await _dbContext.Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number FROM users").ToListAsync();

        var result = new List<CoachClassScheduleDto>();

        foreach (var c in allClasses)
        {
            var sport = sports.FirstOrDefault(s => s.Id == c.SportId);
            var facility = facilities.FirstOrDefault(f => f.Id == c.FacilityId);

            var enrolledMembers = (
                from cb in allBookings
                join u in users on cb.UserId equals u.Id
                where cb.ClassId == c.Id && cb.Status != "cancelled"
                select new EnrolledMemberDto
                {
                    MemberId = u.Id,
                    FullName = u.FullName,
                    PhoneNumber = u.PhoneNumber,
                    BookingStatus = cb.Status
                }
            ).ToList();

            result.Add(new CoachClassScheduleDto
            {
                ClassId = c.Id,
                ClassName = c.ClassName,
                SportName = sport?.Name ?? "N/A",
                FacilityName = facility?.Name ?? "N/A",
                ScheduleTime = c.ScheduleTime,
                DurationMinutes = c.DurationMinutes,
                Capacity = c.Capacity,
                CurrentEnrolled = c.CurrentEnrolled,
                EnrolledMembers = enrolledMembers
            });
        }

        return result.OrderBy(x => x.ScheduleTime).ToList();
    }

    public async Task<IEnumerable<ClassResponse>> GetManagerScheduleAsync(Guid? facilityId, Guid? coachId, Guid? sportId, DateTime? date)
    {
        var allClasses = await _dbContext.Database.SqlQueryRaw<ClassSqlRawModel>(
            "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status FROM classes").ToListAsync();

        if (facilityId.HasValue && facilityId.Value != Guid.Empty)
            allClasses = allClasses.Where(c => c.FacilityId == facilityId.Value).ToList();

        if (coachId.HasValue && coachId.Value != Guid.Empty)
            allClasses = allClasses.Where(c => c.CoachId == coachId.Value).ToList();

        if (sportId.HasValue && sportId.Value != Guid.Empty)
            allClasses = allClasses.Where(c => c.SportId == sportId.Value).ToList();

        if (date.HasValue)
        {
            var startOfDay = date.Value.Date;
            var endOfDay = startOfDay.AddDays(1);
            allClasses = allClasses.Where(c => c.ScheduleTime >= startOfDay && c.ScheduleTime < endOfDay).ToList();
        }

        if (!allClasses.Any()) return Enumerable.Empty<ClassResponse>();

        var sports = await _dbContext.Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports").ToListAsync();
        var facilities = await _dbContext.Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities").ToListAsync();
        var coaches = await _dbContext.Database.SqlQueryRaw<CoachSqlRawModel>("SELECT id, user_id FROM coaches").ToListAsync();
        var users = await _dbContext.Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number FROM users").ToListAsync();

        return allClasses.Select(c =>
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
                AvailableSpots: c.Capacity - c.CurrentEnrolled
            );
        }).OrderBy(x => x.ScheduleTime).ToList();
    }
}

// ── RAW SQL POCO DTOs FOR EF CORE RAW QUERIES ──

public class ClassSqlRawModel
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("sport_id")]
    public Guid SportId { get; set; }

    [Column("facility_id")]
    public Guid FacilityId { get; set; }

    [Column("coach_id")]
    public Guid? CoachId { get; set; }

    [Column("class_name")]
    public string ClassName { get; set; } = string.Empty;

    [Column("schedule_time")]
    public DateTime ScheduleTime { get; set; }

    [Column("duration_minutes")]
    public int DurationMinutes { get; set; }

    [Column("capacity")]
    public int Capacity { get; set; }

    [Column("current_enrolled")]
    public int CurrentEnrolled { get; set; }

    [Column("status")]
    public bool Status { get; set; }
}

public class SportSqlRawModel
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;
}

public class FacilitySqlRawModel
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;
}

public class CoachSqlRawModel
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }
}

public class UserSqlRawModel
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("full_name")]
    public string FullName { get; set; } = string.Empty;

    [Column("phone_number")]
    public string PhoneNumber { get; set; } = string.Empty;
}

public class PtSessionMemberSqlDto
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("schedule_time")]
    public DateTime ScheduleTime { get; set; }

    [Column("duration_minutes")]
    public int DurationMinutes { get; set; }

    [Column("status")]
    public string Status { get; set; } = string.Empty;
}

public class ClassBookingRawModel
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("class_id")]
    public Guid ClassId { get; set; }

    [Column("status")]
    public string Status { get; set; } = string.Empty;
}

public class PtEnrollmentRawModel
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("coach_id")]
    public Guid? CoachId { get; set; }
}
