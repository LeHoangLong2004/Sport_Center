using SmartGym.Domain.Enums;

namespace SmartGym.Domain.Entities;

public sealed class Booking
{
    public Booking(
        Guid id,
        Guid scheduleId,
        Guid memberId,
        Guid memberPackageId,
        BookingStatus status,
        int? waitlistPriority,
        int swapCountInWeek,
        Guid? swappedFromScheduleId,
        DateTime bookedAt,
        DateTime? cancelledAt)
    {
        Id = id;
        ScheduleId = scheduleId;
        MemberId = memberId;
        MemberPackageId = memberPackageId;
        Status = status;
        WaitlistPriority = waitlistPriority;
        SwapCountInWeek = swapCountInWeek;
        SwappedFromScheduleId = swappedFromScheduleId;
        BookedAt = bookedAt;
        CancelledAt = cancelledAt;
    }

    public Guid Id { get; }
    public Guid ScheduleId { get; }
    public Guid MemberId { get; }
    public Guid MemberPackageId { get; }
    public BookingStatus Status { get; private set; }
    public int? WaitlistPriority { get; }
    public int SwapCountInWeek { get; }
    public Guid? SwappedFromScheduleId { get; }
    public DateTime BookedAt { get; }
    public DateTime? CancelledAt { get; private set; }

    public void Cancel()
    {
        Status = BookingStatus.Cancelled;
        CancelledAt = DateTime.UtcNow;
    }

    public void Confirm() => Status = BookingStatus.Confirmed;
}
