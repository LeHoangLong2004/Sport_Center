using System;
using System.Collections.Generic;

namespace SmartGym.Application.DTOs.Classes;

public class MemberClassBookingDto
{
    public Guid BookingId { get; set; }
    public Guid ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public string SportName { get; set; } = string.Empty;
    public string FacilityName { get; set; } = string.Empty;
    public Guid? CoachId { get; set; }
    public string CoachName { get; set; } = string.Empty;
    public string? CoachAvatar { get; set; }
    public string? CoachSpecialty { get; set; }
    public string? CoachPhone { get; set; }
    public string? CoachBio { get; set; }
    public decimal? CoachRating { get; set; }
    public int? CoachExperienceYears { get; set; }
    public decimal Price { get; set; } = 150000;
    public DateTime ScheduleTime { get; set; }
    public int DurationMinutes { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class MemberPtSessionDto
{
    public Guid SessionId { get; set; }
    public Guid? CoachId { get; set; }
    public string CoachName { get; set; } = string.Empty;
    public string? CoachAvatar { get; set; }
    public string? CoachSpecialty { get; set; }
    public string? CoachPhone { get; set; }
    public decimal? CoachRating { get; set; }
    public DateTime ScheduleTime { get; set; }
    public int DurationMinutes { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class MemberScheduleResponse
{
    public List<MemberClassBookingDto> ClassBookings { get; set; } = new();
    public List<MemberPtSessionDto> PtSessions { get; set; } = new();
}

public class EnrolledMemberDto
{
    public Guid MemberId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string BookingStatus { get; set; } = string.Empty;
}

public class CoachClassScheduleDto
{
    public Guid ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public string SportName { get; set; } = string.Empty;
    public string FacilityName { get; set; } = string.Empty;
    public DateTime ScheduleTime { get; set; }
    public int DurationMinutes { get; set; }
    public int Capacity { get; set; }
    public int CurrentEnrolled { get; set; }
    public List<EnrolledMemberDto> EnrolledMembers { get; set; } = new();
}
