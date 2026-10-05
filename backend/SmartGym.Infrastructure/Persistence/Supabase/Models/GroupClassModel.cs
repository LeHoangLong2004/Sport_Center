using Postgrest.Attributes;
using Postgrest.Models;
using SmartGym.Domain.Entities;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

[Table("classes")]
public class GroupClassModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("sport_id")]
    public Guid SportId { get; set; }

    [Column("coach_id")]
    public Guid? CoachId { get; set; }

    [Column("facility_id")]
    public Guid FacilityId { get; set; }

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

    public GroupClass ToDomain()
    {
        return new GroupClass(
            Id,
            SportId,
            CoachId,
            FacilityId,
            ClassName,
            ScheduleTime,
            DurationMinutes,
            Capacity,
            CurrentEnrolled,
            Status);
    }
}
