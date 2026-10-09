using System;

namespace SmartGym.Application.DTOs.Classes;

public class BookingManagerResponse
{
    public Guid Id { get; set; }
    public string MemberAvatar { get; set; } = string.Empty;
    public string MemberName { get; set; } = string.Empty;
    public string MemberPhone { get; set; } = string.Empty;
    public string MemberCode { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string CoachName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime BookedAt { get; set; }
    public string Status { get; set; } = string.Empty;
}
