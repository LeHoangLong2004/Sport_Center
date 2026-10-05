using System;
using System.Collections.Generic;

namespace SmartGym.Domain.Entities;

public class Role
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    // Navigation property
    public ICollection<User> Users { get; set; } = new List<User>();
}
