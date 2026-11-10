using System;
using Postgrest.Attributes;
using Postgrest.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

/// <summary>
/// Supabase entity model cho bảng 'coaches' (Huấn luyện viên).
/// </summary>
[Table("coaches")]
public class CoachModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("status")]
    public bool IsActive { get; set; }
}

