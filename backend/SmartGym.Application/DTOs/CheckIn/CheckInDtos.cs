namespace SmartGym.Application.DTOs.CheckIn;

// --- Requests ---
public sealed record CheckInRequest(Guid MemberId);

// --- Responses ---
public sealed record CheckInResponse(
    bool Allowed,
    string Message,
    string MemberName,
    string PackageName,
    DateTime CheckInTime);

public sealed record CheckInHistoryEntry(
    Guid Id,
    string MemberName,
    DateTime CheckInTime,
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
