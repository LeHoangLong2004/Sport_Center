using System;
using Postgrest.Attributes;
using Postgrest.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

/// <summary>
/// Supabase entity model cho bảng 'facilities' (Cơ sở vật chất, phòng tập, sân tập).
/// </summary>
[Table("facilities")]
public class FacilityModel : BaseModel
{
    [PrimaryKey("id", true)]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("image_url")]
    public string? ImageUrl { get; set; }

    [Column("address")]
    public string Address { get; set; } = "Chưa cập nhật";

    [Column("allow_concurrent_classes")]
    public bool AllowConcurrentClasses { get; set; }

    [Column("max_concurrent_classes")]
    public int MaxConcurrentClasses { get; set; } = 1;

    [Column("total_capacity")]
    public int? TotalCapacity { get; set; }
}

