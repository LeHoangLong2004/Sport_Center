using System;
using Postgrest.Attributes;
using Postgrest.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

/// <summary>
/// Bảng <c>check_in_logs</c> — lịch sử điểm danh cổng thực tế trong schema Supabase.
/// Chỉ dùng cho báo cáo của Flow 3 (số lượt check-in theo khung giờ).
/// </summary>
[Table("check_in_logs")]
public class CheckInLogModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("facility_id")]
    public Guid? FacilityId { get; set; }

    [Column("subscription_id")]
    public Guid? SubscriptionId { get; set; }

    [Column("check_in_time")]
    public DateTime CheckInTime { get; set; }

    [Column("check_out_time")]
    public DateTime? CheckOutTime { get; set; }

    /// <summary>'qr' | 'manual' | 'card'</summary>
    [Column("method")]
    public string? Method { get; set; }
}