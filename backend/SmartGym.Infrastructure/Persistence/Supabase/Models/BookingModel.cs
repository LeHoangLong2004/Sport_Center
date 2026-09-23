using Postgrest.Attributes;
using Postgrest.Models;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

[Table("bookings")]
public class BookingModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("schedule_id")]
    public Guid ScheduleId { get; set; }

    [Column("member_id")]
    public Guid MemberId { get; set; }

    [Column("member_package_id")]
    public Guid MemberPackageId { get; set; }

    [Column("booking_status")]
    public string BookingStatus { get; set; } = "";

    [Column("waitlist_priority")]
    public int? WaitlistPriority { get; set; }

    [Column("swap_count_in_week")]
    public int SwapCountInWeek { get; set; }

    [Column("swapped_from_schedule_id")]
    public Guid? SwappedFromScheduleId { get; set; }

    [Column("booked_at")]
    public DateTime BookedAt { get; set; }

    [Column("cancelled_at")]
    public DateTime? CancelledAt { get; set; }

    public Booking ToDomain()
    {
        var statusEnum = BookingStatus == "NO_SHOW" ? Domain.Enums.BookingStatus.NoShow : Enum.Parse<BookingStatus>(BookingStatus, true);

        return new Booking(
            Id,
            ScheduleId,
            MemberId,
            MemberPackageId,
            statusEnum,
            WaitlistPriority,
            SwapCountInWeek,
            SwappedFromScheduleId,
            BookedAt,
            CancelledAt
        );
    }

    public static BookingModel FromDomain(Booking booking)
    {
        var statusStr = booking.Status == Domain.Enums.BookingStatus.NoShow ? "NO_SHOW" : booking.Status.ToString().ToUpper();

        return new BookingModel
        {
            Id = booking.Id,
            ScheduleId = booking.ScheduleId,
            MemberId = booking.MemberId,
            MemberPackageId = booking.MemberPackageId,
            BookingStatus = statusStr,
            WaitlistPriority = booking.WaitlistPriority,
            SwapCountInWeek = booking.SwapCountInWeek,
            SwappedFromScheduleId = booking.SwappedFromScheduleId,
            BookedAt = booking.BookedAt,
            CancelledAt = booking.CancelledAt
        };
    }
}
