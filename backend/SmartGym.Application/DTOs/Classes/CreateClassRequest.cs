namespace SmartGym.Application.DTOs.Classes;

public class CreateClassRequest
{
    public Guid SportId { get; set; }
    public Guid FacilityId { get; set; }
    public Guid CoachId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public DateTime ScheduleTime { get; set; }
    public int DurationMinutes { get; set; }
    public int Capacity { get; set; }
}

