using System;
using Postgrest.Attributes;
using Postgrest.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

/// <summary>
/// Supabase entity model cho bảng 'sports' (Các bộ môn thể thao: Yoga, Gym, Boxing, Bơi lội...).
/// </summary>
[Table("sports")]
public class SportModel : BaseModel
{
    [PrimaryKey("id", true)]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("image_url")]
    public string? ImageUrl { get; set; }

    [Column("description")]
    public string? Description { get; set; }
}

