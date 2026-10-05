namespace SmartGym.Domain.Entities;

public sealed class PtSession
{
    public PtSession(
        Guid id,
        Guid enrollmentId,
        DateTime scheduleTime,
        int durationMinutes,
        string status,
        string? notes)
    {
        Id = id;
        EnrollmentId = enrollmentId;
        ScheduleTime = scheduleTime;
        DurationMinutes = durationMinutes;
        Status = status;
        Notes = notes;
    }

    public Guid Id { get; }
    public Guid EnrollmentId { get; }
    public DateTime ScheduleTime { get; }
    public int DurationMinutes { get; }
    public string Status { get; }
    public string? Notes { get; }
    
    // To support joining with PT Enrollment to find the Coach ID
    public Guid? CoachId { get; set; }
}
