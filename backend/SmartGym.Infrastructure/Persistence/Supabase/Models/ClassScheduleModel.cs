using Postgrest.Attributes;
using Postgrest.Models;
using SmartGym.Domain.Entities;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

[Table("class_schedules")]
public class ClassScheduleModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("program_id")]
    public Guid ProgramId { get; set; }

    [Column("room_id")]
    public Guid RoomId { get; set; }

    [Column("coach_id")]
    public Guid CoachId { get; set; }

    [Column("start_time")]
    public DateTime StartTime { get; set; }

    [Column("end_time")]
    public DateTime EndTime { get; set; }

    [Column("max_capacity")]
    public int MaxCapacity { get; set; }

    [Column("current_bookings")]
    public int CurrentBookings { get; set; }

    [Column("is_cancelled")]
    public bool IsCancelled { get; set; }

    public ClassSchedule ToDomain()
    {
        return new ClassSchedule(
            Id,
            ProgramId,
            RoomId,
            CoachId,
            StartTime,
            EndTime,
            MaxCapacity,
            CurrentBookings,
            IsCancelled
        );
    }
}
