using Postgrest.Attributes;
using Postgrest.Models;
using SmartGym.Domain.Entities;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

[Table("pt_enrollments")]
public class PtEnrollmentModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("coach_id")]
    public Guid? CoachId { get; set; }
}

[Table("pt_sessions")]
public class PtSessionModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("enrollment_id")]
    public Guid EnrollmentId { get; set; }

    [Column("schedule_time")]
    public DateTime ScheduleTime { get; set; }

    [Column("duration_minutes")]
    public int DurationMinutes { get; set; }

    [Column("status")]
    public string Status { get; set; } = string.Empty;

    [Column("notes")]
    public string? Notes { get; set; }

    public PtSession ToDomain(Guid? coachId = null)
    {
        var session = new PtSession(
            Id,
            EnrollmentId,
            ScheduleTime,
            DurationMinutes,
            Status,
            Notes);
        session.CoachId = coachId;
        return session;
    }
}
