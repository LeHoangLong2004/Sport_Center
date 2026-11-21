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
    List<EnrolledMemberDto> EnrolledMembers,
    string ApprovalStatus = "approved",
    Guid? ParentId = null,
    int SessionNumber = 1,
    int TotalSessions = 1,
    List<ClassSessionSummaryDto>? Sessions = null
);

public sealed record ClassSessionSummaryDto(
    Guid Id,
    int SessionNumber,
    DateTime ScheduleTime,
    int DurationMinutes,
    string Status
);
