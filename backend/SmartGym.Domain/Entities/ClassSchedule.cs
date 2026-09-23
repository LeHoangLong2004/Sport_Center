namespace SmartGym.Domain.Entities;

public sealed class ClassSchedule
{
    public ClassSchedule(
        Guid id,
        Guid programId,
        Guid roomId,
        Guid coachId,
        DateTime startTime,
        DateTime endTime,
        int maxCapacity,
        int currentBookings,
        bool isCancelled)
    {
        Id = id;
        ProgramId = programId;
        RoomId = roomId;
        CoachId = coachId;
        StartTime = startTime;
        EndTime = endTime;
        MaxCapacity = maxCapacity;
        CurrentBookings = currentBookings;
        IsCancelled = isCancelled;
    }

    public Guid Id { get; }
    public Guid ProgramId { get; }
    public Guid RoomId { get; }
    public Guid CoachId { get; }
    public DateTime StartTime { get; }
    public DateTime EndTime { get; }
    public int MaxCapacity { get; }
    public int CurrentBookings { get; private set; }
    public bool IsCancelled { get; }

    // Helpers to support backward compatibility for now if we don't eager load
    public string ClassName { get; set; } = "";
    public string SportType { get; set; } = "";
    public string RoomName { get; set; } = "";

    public void IncrementBookings() => CurrentBookings++;
    public void DecrementBookings() => CurrentBookings = Math.Max(0, CurrentBookings - 1);
}
