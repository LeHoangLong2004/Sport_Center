using Postgrest.Attributes;
using Postgrest.Models;
using SmartGym.Domain.Entities;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

[Table("gate_checkins")]
public class GateCheckinModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("member_id")]
    public Guid MemberId { get; set; }

    [Column("branch_id")]
    public Guid BranchId { get; set; }

    [Column("member_package_id")]
    public Guid MemberPackageId { get; set; }

    [Column("check_in_time")]
    public DateTime CheckInTime { get; set; }

    [Column("receptionist_id")]
    public Guid? ReceptionistId { get; set; }

    public CheckInRecord ToDomain()
    {
        return new CheckInRecord(
            Id,
            MemberId,
            BranchId,
            MemberPackageId,
            CheckInTime,
            ReceptionistId
        );
    }

    public static GateCheckinModel FromDomain(CheckInRecord record)
    {
        return new GateCheckinModel
        {
            Id = record.Id,
            MemberId = record.MemberId,
            BranchId = record.BranchId,
            MemberPackageId = record.MemberPackageId,
            CheckInTime = record.CheckInTime,
            ReceptionistId = record.ReceptionistId
        };
    }
}
