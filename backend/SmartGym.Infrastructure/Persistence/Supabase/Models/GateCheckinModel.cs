using Postgrest.Attributes;
using Postgrest.Models;
using SmartGym.Domain.Entities;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

[Table("check_in_logs")]
public class GateCheckinModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid MemberId { get; set; }

    [Column("facility_id")]
    public Guid? BranchId { get; set; }

    [Column("subscription_id")]
    public Guid? MemberPackageId { get; set; }

    [Column("check_in_time")]
    public DateTime CheckInTime { get; set; }

    [Column("check_out_time")]
    public DateTime? CheckOutTime { get; set; }

    /// <summary>'qr' | 'manual' | 'card'</summary>
    [Column("method")]
    public string? Method { get; set; }

    public CheckInRecord ToDomain()
    {
        return new CheckInRecord(
            Id,
            MemberId,
            BranchId ?? Guid.Empty,
            MemberPackageId ?? Guid.Empty,
            ToUtc(CheckInTime),
            null,
            CheckOutTime.HasValue ? ToUtc(CheckOutTime.Value) : null
        );
    }

    private static DateTime ToUtc(DateTime value)
        => value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Local).ToUniversalTime()
        };

    public static GateCheckinModel FromDomain(CheckInRecord record)
    {
        return new GateCheckinModel
        {
            Id = record.Id,
            MemberId = record.MemberId,
            BranchId = record.BranchId == Guid.Empty ? null : record.BranchId,
            MemberPackageId = record.MemberPackageId == Guid.Empty ? null : record.MemberPackageId,
            CheckInTime = record.CheckInTime,
            CheckOutTime = record.CheckOutTime,
        };
    }
}
