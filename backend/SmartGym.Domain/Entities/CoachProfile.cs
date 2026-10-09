using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartGym.Domain.Entities;

public class CoachProfile
{
    [Key]
    public Guid UserId { get; set; }

    public string? Specialties { get; set; } // e.g. "Gym, Yoga, CrossFit"
    public string? Certifications { get; set; } // Can be JSON array string or comma separated
    public int? ExperienceYears { get; set; }
    public string? Bio { get; set; }

    // Navigation property
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
}
