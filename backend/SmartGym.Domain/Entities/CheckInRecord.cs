namespace SmartGym.Domain.Entities;

public sealed class CheckInRecord
{
    public CheckInRecord(
        Guid id,
        Guid memberId,
        Guid branchId,
        Guid memberPackageId,
        DateTime checkInTime,
        Guid? receptionistId)
    {
        Id = id;
        MemberId = memberId;
        BranchId = branchId;
        MemberPackageId = memberPackageId;
        CheckInTime = checkInTime;
        ReceptionistId = receptionistId;
    }

    public Guid Id { get; }
    public Guid MemberId { get; }
    public Guid BranchId { get; }
    public Guid MemberPackageId { get; }
    public DateTime CheckInTime { get; }
    public Guid? ReceptionistId { get; }
}
