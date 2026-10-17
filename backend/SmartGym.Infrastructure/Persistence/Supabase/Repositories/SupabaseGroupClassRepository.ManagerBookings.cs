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

public sealed partial class SupabaseGroupClassRepository
{
    public async Task<IEnumerable<BookingManagerResponse>> GetAllBookingsForManagerAsync()
    {
        var allClasses = await _dbContext
            .Database.SqlQueryRaw<ClassSqlRawModel>(
                "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status, approval_status FROM classes"
            )
            .ToListAsync();
        var allBookings = await _dbContext
            .Database.SqlQueryRaw<ClassBookingRawModel>(
                "SELECT id, user_id, class_id, status, created_at FROM class_bookings"
            )
            .ToListAsync();
        var users = await _dbContext
            .Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number, avatar_url FROM users")
            .ToListAsync();
        var coaches = await _dbContext
            .Database.SqlQueryRaw<CoachSqlRawModel>("SELECT id, user_id FROM coaches")
            .ToListAsync();

        var result = new List<BookingManagerResponse>();

        foreach (var b in allBookings)
        {
            var c = allClasses.FirstOrDefault(x => x.Id == b.ClassId);
            if (c == null)
                continue;

            var u = users.FirstOrDefault(x => x.Id == b.UserId);
            var coachName = c.CoachId.HasValue
                ? users
                    .FirstOrDefault(x =>
                        coaches.FirstOrDefault(co => co.Id == c.CoachId.Value)?.UserId == x.Id
                    )
                    ?.FullName
                    ?? "N/A"
                : "N/A";

            string formattedStatus = b.Status;
            if (b.Status == "confirmed")
                formattedStatus = "Confirmed";
            else if (b.Status == "pending")
                formattedStatus = "Pending";
            else if (b.Status == "rejected")
                formattedStatus = "Rejected";
            else if (b.Status == "cancelled")
                formattedStatus = "Cancelled";
            else if (b.Status == "attended")
                formattedStatus = "Confirmed";
            else if (b.Status == "no_show")
                formattedStatus = "Cancelled";

            result.Add(
                new BookingManagerResponse
                {
                    Id = b.Id,
                    MemberAvatar = u?.AvatarUrl ?? string.Empty,
                    MemberName = u?.FullName ?? "Unknown",
                    MemberPhone = u?.PhoneNumber ?? "Unknown",
                    MemberCode = "MB-" + (u?.Id.ToString().Substring(0, 4).ToUpper() ?? "0000"),
                    ClassName = c.ClassName,
                    CoachName = coachName,
                    StartTime = c.ScheduleTime,
                    BookedAt = b.CreatedAt == default ? c.ScheduleTime.AddDays(-1) : b.CreatedAt,
                    Status = formattedStatus,
                }
            );
        }

        return result.OrderByDescending(r => r.BookedAt);
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

    [Column("approval_status")]
    public string ApprovalStatus { get; set; } = "approved";
}

public class ClassApprovalRawModel
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("coach_id")]
    public Guid? CoachId { get; set; }

    [Column("class_name")]
    public string ClassName { get; set; } = string.Empty;

    [Column("approval_status")]
    public string ApprovalStatus { get; set; } = string.Empty;
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

    [Column("avatar_url")]
    public string? AvatarUrl { get; set; }
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

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}

public class ClassTimeConflictRawModel
{
    [Column("schedule_time")]
    public DateTime ScheduleTime { get; set; }

    [Column("duration_minutes")]
    public int DurationMinutes { get; set; }
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
