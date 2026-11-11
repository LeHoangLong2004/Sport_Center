using System;
using Postgrest.Attributes;
using Postgrest.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

/// <summary>
/// Supabase entity model cho bảng 'users' (Thông tin cơ bản của người dùng).
/// </summary>
[Table("users")]
public class SupabaseUserModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("full_name")]
    public string FullName { get; set; } = string.Empty;
}

