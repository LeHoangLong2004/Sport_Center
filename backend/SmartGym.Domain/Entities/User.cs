using System;

namespace SmartGym.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? RoleId { get; set; }
    public string FullName { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? EmergencyContact { get; set; }
    public bool Status { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Role? Role { get; set; }
}
