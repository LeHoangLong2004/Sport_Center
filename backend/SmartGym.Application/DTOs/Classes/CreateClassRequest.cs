namespace SmartGym.Application.DTOs.Classes;

public sealed record CreateClassRequest(
    Guid SportId,
    Guid FacilityId,
    Guid CoachId,
    string ClassName,
    DateTime ScheduleTime,
    int DurationMinutes,
    int Capacity
);
