namespace SmartGym.Domain.Entities;

public sealed class GroupClass
{
    public GroupClass(
        Guid id,
        Guid sportId,
        Guid? coachId,
        Guid facilityId,
        string className,
        DateTime scheduleTime,
        int durationMinutes,
        int capacity,
        int currentEnrolled,
        bool status)
    {
        Id = id;
        SportId = sportId;
        CoachId = coachId;
        FacilityId = facilityId;
        ClassName = className;
        ScheduleTime = scheduleTime;
        DurationMinutes = durationMinutes;
        Capacity = capacity;
        CurrentEnrolled = currentEnrolled;
        Status = status;
    }

    public Guid Id { get; }
    public Guid SportId { get; }
    public Guid? CoachId { get; }
    public Guid FacilityId { get; }
    public string ClassName { get; }
    public DateTime ScheduleTime { get; }
    public int DurationMinutes { get; }
    public int Capacity { get; }
    public int CurrentEnrolled { get; private set; }
    public bool Status { get; }

    public void IncrementEnrolled() => CurrentEnrolled++;
    public void DecrementEnrolled() => CurrentEnrolled = Math.Max(0, CurrentEnrolled - 1);
}
