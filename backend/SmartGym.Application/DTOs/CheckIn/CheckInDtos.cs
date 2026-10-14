namespace SmartGym.Application.DTOs.CheckIn;

// --- Requests ---
public sealed record CheckInRequest(Guid MemberId);
public sealed record CheckOutRequest(Guid MemberId);

// --- Responses ---
public sealed record CheckInResponse(
    bool Allowed,
    string Message,
    string MemberName,
    string PackageName,
    DateTime CheckInTime);

public sealed record CheckOutResponse(
    bool Allowed,
    string Message,
    string MemberName,
    DateTime CheckInTime,
    DateTime CheckOutTime,
    int DurationMinutes);

public sealed record CheckInHistoryEntry(
    Guid Id,
    Guid MemberId,
    string MemberName,
    DateTime CheckInTime,
    DateTime? CheckOutTime,
    int? DurationMinutes,
    string Result);

public sealed record MemberPackageResponse(
    Guid Id,
    string PlanName,
    decimal Price,
    DateTime StartDate,
    DateTime EndDate,
    int? RemainingSessions,
    string Status,
    string AccessHours);
