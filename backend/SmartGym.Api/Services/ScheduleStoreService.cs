using System;
using System.Collections.Generic;

namespace SmartGym.Api.Services;

// Legacy compatibility surface for endpoints that still accept this service.
// Real schedules and PT availability are stored in PostgreSQL:
// classes, class_bookings, coach_availability_slots and pt_sessions.
// This service intentionally has no seed data, JSON persistence or in-memory
// fallback so the API cannot expose demo sessions.
public sealed class ScheduleSessionRecord
{
    public string Id { get; set; } = "";
    public string Type { get; set; } = "group";
    public string? ClassId { get; set; }
    public string ClassName { get; set; } = "";
    public string Sport { get; set; } = "";
    public string Level { get; set; } = "";
    public string Date { get; set; } = "";
    public string StartTime { get; set; } = "";
    public string EndTime { get; set; } = "";
    public string Room { get; set; } = "";
    public string CoachId { get; set; } = "";
    public string CoachName { get; set; } = "";
    public int Capacity { get; set; }
    public int RegisteredCount { get; set; }
    public string Status { get; set; } = "";
    public string AttendanceStatus { get; set; } = "";
    public string CoachNote { get; set; } = "";
    public string? MemberId { get; set; }
    public string? MemberName { get; set; }
    public string? MemberPhone { get; set; }
    public string? MemberEmail { get; set; }
    public string? Goal { get; set; }
    public string? UserNote { get; set; }
    public string? CancelReason { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class BookPtSessionRequest
{
    public string? SlotId { get; set; }
    public string? Name { get; set; }
    public string? Sport { get; set; }
    public string? Level { get; set; }
    public string? Date { get; set; }
    public string? StartTime { get; set; }
    public string? EndTime { get; set; }
    public string? Room { get; set; }
    public string? CoachId { get; set; }
    public string? CoachName { get; set; }
    public string? MemberId { get; set; }
    public string? MemberName { get; set; }
    public string? MemberPhone { get; set; }
    public string? MemberEmail { get; set; }
    public string? Goal { get; set; }
    public string? CoachNote { get; set; }
}

public sealed class ScheduleStoreService
{
    public List<ScheduleSessionRecord> GetAllSessions() => new();

    public List<ScheduleSessionRecord> GetSessionsForCoach(string? coachId) => new();

    public List<ScheduleSessionRecord> GetSessionsForMember(string? memberId) => new();

    public List<ScheduleSessionRecord> GetAvailablePtSlots() => new();

    public bool TryBookPtSlot(
        BookPtSessionRequest request,
        out ScheduleSessionRecord? booked,
        out string? conflictMessage)
    {
        booked = null;
        conflictMessage = "Khung giờ PT không tồn tại trong database.";
        return false;
    }

    public ScheduleSessionRecord BookPtSlot(BookPtSessionRequest request)
        => throw new InvalidOperationException("PT slot phải được tạo và đặt qua database.");

    public bool CancelBooking(string sessionId, string reason) => false;

    public bool UpdateAttendance(string sessionId, string status, string coachNote) => false;
}
