namespace SmartGym.Domain.Entities;

public sealed class CheckInRecord
{
    public CheckInRecord(
        Guid id,
        Guid memberId,
        Guid branchId,
        Guid memberPackageId,
        DateTime checkInTime,
        Guid? receptionistId,
        DateTime? checkOutTime = null)
    {
        Id = id;
        MemberId = memberId;
        BranchId = branchId;
        MemberPackageId = memberPackageId;
        CheckInTime = checkInTime;
        ReceptionistId = receptionistId;
        CheckOutTime = checkOutTime;
    }

    public Guid Id { get; }
    public Guid MemberId { get; }
    public Guid BranchId { get; }
    public Guid MemberPackageId { get; }
    public DateTime CheckInTime { get; }
    public Guid? ReceptionistId { get; }
    public DateTime? CheckOutTime { get; }
}
