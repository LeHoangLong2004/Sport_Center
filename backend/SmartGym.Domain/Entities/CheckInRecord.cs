namespace SmartGym.Domain.Entities;

/// <summary>
/// Thực thể Bản ghi điểm danh (Check-in/Check-out Record Entity).
/// Ghi nhận thời điểm hội viên vào và rời phòng tập, chi nhánh tập luyện và nhân viên lễ tân trực quầy.
/// </summary>
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
