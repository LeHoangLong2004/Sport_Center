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

public sealed partial class SupabaseGroupClassRepository
{
    public async Task<(bool IsSuccess, string? ErrorMessage)> UpdateAttendanceAsync(
        Guid classId,
        List<AttendanceRecordDto> attendanceList
    )
    {
        var strategy = _dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
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
                        classId,
                        item.MemberId,
                        validStatus
                    );
                }

                await transaction.CommitAsync();
                return (true, null);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return (false, "Lỗi hệ thống khi điểm danh. " + ex.Message);
            }
        });
    }

    public async Task<MemberScheduleResponse> GetMemberScheduleAsync(Guid userId)
    {
        var response = new MemberScheduleResponse();

        var classBookings = await _dbContext
            .Database.SqlQueryRaw<ClassBookingRawModel>(
                "SELECT id, user_id, class_id, status, created_at FROM class_bookings WHERE user_id = {0}",
                userId
            )
            .ToListAsync();

        if (classBookings.Any())
        {
            var classes = await _dbContext
                .Database.SqlQueryRaw<ClassSqlRawModel>(
                    "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status, approval_status FROM classes"
                )
                .ToListAsync();
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
                .Database.SqlQueryRaw<UserSqlRawModel>(
                    "SELECT id, full_name, phone_number, avatar_url FROM users"
                )
                .ToListAsync();

            response.ClassBookings = classBookings
                .Select(cb =>
                {
                    var targetClass = classes.FirstOrDefault(c => c.Id == cb.ClassId);
                    var sport =
                        targetClass != null
                            ? sports.FirstOrDefault(s => s.Id == targetClass.SportId)
                            : null;
                    var facility =
                        targetClass != null
                            ? facilities.FirstOrDefault(f => f.Id == targetClass.FacilityId)
                            : null;
                    var coach =
                        targetClass != null
                            ? coaches.FirstOrDefault(co => co.Id == targetClass.CoachId)
                            : null;
                    var coachUser =
                        coach != null ? users.FirstOrDefault(u => u.Id == coach.UserId) : null;

                    return new MemberClassBookingDto
                    {
                        BookingId = cb.Id,
                        ClassId = cb.ClassId,
                        ClassName = targetClass?.ClassName ?? "Unknown Class",
                        SportName = sport?.Name ?? "N/A",
                        FacilityName = facility?.Name ?? "N/A",
                        CoachId = targetClass?.CoachId,
                        CoachName = coachUser?.FullName ?? "N/A",
                        CoachAvatar = SmartGym.Domain.Common.CoachAvatarHelper.GetRealCoachAvatar(coachUser?.FullName, coachUser?.AvatarUrl, coach?.Id),
                        CoachSpecialty = coach?.Specialty ?? "Huấn luyện viên Thể hình",
                        CoachPhone = coachUser?.PhoneNumber ?? "",
                        CoachBio = coach?.Bio ?? "Huấn luyện viên phụ trách lớp học.",
                        CoachRating = coach?.Rating ?? 4.9m,
                        CoachExperienceYears = coach?.ExperienceYears ?? 5,
                        Price = 150000m,
                        ScheduleTime = targetClass?.ScheduleTime ?? DateTime.MinValue,
                        DurationMinutes = targetClass?.DurationMinutes ?? 60,
                        Status = cb.Status,
                    };
                })
                .OrderBy(x => x.ScheduleTime)
                .ToList();
        }

        var ptSessions = await _dbContext
            .Database.SqlQueryRaw<PtSessionMemberSqlDto>(
                @"SELECT ps.id, ps.schedule_time, ps.duration_minutes, ps.status 
              FROM pt_sessions ps 
              INNER JOIN pt_enrollments pe ON ps.enrollment_id = pe.id 
              WHERE pe.user_id = {0}",
                userId
            )
            .ToListAsync();

        if (ptSessions.Any())
        {
            response.PtSessions = ptSessions
                .Select(ps => new MemberPtSessionDto
                {
                    SessionId = ps.Id,
                    CoachName = "Personal Trainer",
                    ScheduleTime = ps.ScheduleTime,
                    DurationMinutes = ps.DurationMinutes,
                    Status = ps.Status,
                })
                .OrderBy(x => x.ScheduleTime)
                .ToList();
        }

        return response;
    }

    public async Task<IEnumerable<CoachClassScheduleDto>> GetCoachScheduleAsync(
        Guid coachUserId,
        DateTime? date
    )
    {
        var coach = await _dbContext
            .Database.SqlQueryRaw<CoachSqlRawModel>(
                "SELECT id, user_id, specialty, bio, experience_years, rating FROM coaches WHERE user_id = {0}",
                coachUserId
            )
            .FirstOrDefaultAsync();

        if (coach == null)
            return Enumerable.Empty<CoachClassScheduleDto>();

        var allClasses = await _dbContext
            .Database.SqlQueryRaw<ClassSqlRawModel>(
                    "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status, approval_status FROM classes WHERE coach_id = {0}",
                coach.Id
            )
            .ToListAsync();

        if (date.HasValue)
        {
            var startOfDay = date.Value.Date;
            var endOfDay = startOfDay.AddDays(1);
            allClasses = allClasses
                .Where(c => c.ScheduleTime >= startOfDay && c.ScheduleTime < endOfDay)
                .ToList();
        }

        if (!allClasses.Any())
            return Enumerable.Empty<CoachClassScheduleDto>();

        var sports = await _dbContext
            .Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports")
            .ToListAsync();
        var facilities = await _dbContext
            .Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities")
            .ToListAsync();
        var allBookings = await _dbContext
            .Database.SqlQueryRaw<ClassBookingRawModel>(
                "SELECT id, user_id, class_id, status, created_at FROM class_bookings"
            )
            .ToListAsync();
        var users = await _dbContext
            .Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number, avatar_url FROM users")
            .ToListAsync();

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
                    BookingStatus = cb.Status,
                }
            ).ToList();

            result.Add(
                new CoachClassScheduleDto
                {
                    ClassId = c.Id,
                    ClassName = c.ClassName,
                    SportName = sport?.Name ?? "N/A",
                    FacilityName = facility?.Name ?? "N/A",
                    // Classes are stored as UTC. Return the center's local time
                    // so legacy coach schedule consumers render the same slot
                    // as the manager calendar.
                    ScheduleTime = CenterTime.ToLocal(c.ScheduleTime),
                    DurationMinutes = c.DurationMinutes,
                    Capacity = c.Capacity,
                    CurrentEnrolled = c.CurrentEnrolled,
                    EnrolledMembers = enrolledMembers,
                }
            );
        }

        return result.OrderBy(x => x.ScheduleTime).ToList();
    }

    public async Task<IEnumerable<ClassResponse>> GetManagerScheduleAsync(
        Guid? facilityId,
        Guid? coachId,
        Guid? sportId,
        DateTime? date
    )
    {
        var allClasses = await _dbContext
            .Database.SqlQueryRaw<ClassSqlRawModel>(
                    "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status, approval_status FROM classes"
            )
            .ToListAsync();

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
            allClasses = allClasses
                .Where(c => c.ScheduleTime >= startOfDay && c.ScheduleTime < endOfDay)
                .ToList();
        }

        if (!allClasses.Any())
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

        return allClasses
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
                    Status: c.Status,
                    ApprovalStatus: c.ApprovalStatus
                );
            })
            .OrderBy(x => x.ScheduleTime)
            .ToList();
    }

}
