namespace SmartGym.Application.DTOs.Classes;

public sealed record ClassDetailResponse(
    Guid Id,
    Guid SportId,
    string SportName,
    Guid FacilityId,
    string FacilityName,
    Guid? CoachId,
    string? CoachName,
    string ClassName,
    DateTime ScheduleTime,
    int DurationMinutes,
    int Capacity,
    int CurrentEnrolled,
    int AvailableSpots,
    bool Status,
    List<EnrolledMemberDto> EnrolledMembers
);
