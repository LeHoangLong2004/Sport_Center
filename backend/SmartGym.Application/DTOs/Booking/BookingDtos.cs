namespace SmartGym.Application.DTOs.Booking;

// --- Requests ---
public sealed record CreateBookingRequest(Guid ScheduleId);

public sealed record CancelBookingRequest(Guid BookingId);

// --- Responses ---
public sealed record ClassScheduleResponse(
    Guid Id,
    string ClassName,
    string SportType,
    string CoachName,
    string RoomName,
    DateTime StartTime,
    DateTime EndTime,
    int MaxCapacity,
    int CurrentBookings,
    int AvailableSlots,
    bool IsFull);

public sealed record BookingResponse(
    Guid Id,
    Guid ScheduleId,
    string ClassName,
    string Status,
    DateTime BookedAt);

public sealed record PersonalScheduleEntry(
    Guid ScheduleId,
    string ClassName,
    string SportType,
    string RoomName,
    string CoachName,
    DateTime StartTime,
    DateTime EndTime,
    string Role,
    string? BookingStatus);
