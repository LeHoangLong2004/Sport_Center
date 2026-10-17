using System;
using System.Collections.Generic;

namespace SmartGym.Application.DTOs.Reviews;

public class CreateReviewRequest
{
    public Guid CoachId { get; set; }
    public int Rating { get; set; } // 1 to 5
    public string? Comment { get; set; }
    public string? SessionId { get; set; }
    public string? SessionName { get; set; }
    public List<string>? Tags { get; set; }
}

public class ReviewResponse
{
    public Guid Id { get; set; }
    public Guid MemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public Guid CoachId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string? SessionId { get; set; }
    public string? SessionName { get; set; }
    public List<string> Tags { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}
