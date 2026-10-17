using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartGym.Domain.Entities;

public class Review
{
    public Guid Id { get; set; }
    public Guid MemberId { get; set; }
    public Guid CoachId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string? SessionId { get; set; }
    public string? SessionName { get; set; }
    public string? TagsJson { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? Member { get; set; }
}
