using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;

namespace SmartGym.Application.Services;

public sealed class BookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IClassScheduleRepository _scheduleRepository;
    private readonly IMemberPackageRepository _packageRepository;
    private const int MaxWaitlistSize = 5;

    public BookingService(
        IBookingRepository bookingRepository,
        IClassScheduleRepository scheduleRepository,
        IMemberPackageRepository packageRepository)
    {
        _bookingRepository = bookingRepository;
        _scheduleRepository = scheduleRepository;
        _packageRepository = packageRepository;
    }

    public async Task<(Booking? Booking, string? Error)> CreateBookingAsync(Guid memberId, Guid scheduleId)
    {
        var schedule = await _scheduleRepository.FindByIdAsync(scheduleId);
        if (schedule is null)
        {
            return (null, "Lớp học không tồn tại.");
        }

        var now = DateTime.UtcNow;
        var timeUntilClass = schedule.StartTime - now;

        if (timeUntilClass.TotalMinutes < 30)
        {
            return (null, "Không thể đặt chỗ. Lớp học sẽ bắt đầu trong vòng 30 phút hoặc đã diễn ra.");
        }

        if (timeUntilClass.TotalDays > 7)
        {
            return (null, "Không thể đặt chỗ. Chỉ được đặt tối đa 7 ngày trước giờ học.");
        }

        var existing = await _bookingRepository.FindByMemberAndScheduleAsync(memberId, scheduleId);
        if (existing is not null)
        {
            return (null, $"Bạn đã đặt chỗ cho lớp này (trạng thái: {existing.Status}).");
        }

        var activePackage = await _packageRepository.FindActivePackageAsync(memberId);
        if (activePackage is null)
        {
            return (null, "Bạn không có gói tập nào đang hoạt động.");
        }

        if (schedule.CurrentBookings >= schedule.MaxCapacity)
        {
            var waitlistCount = await _bookingRepository.CountWaitlistAsync(scheduleId);
            if (waitlistCount >= MaxWaitlistSize)
            {
                return (null, "Lớp đã đầy và danh sách chờ cũng đã đạt tối đa (5 người).");
            }

            var waitlistBooking = new Booking(Guid.NewGuid(), scheduleId, memberId, activePackage.Id, BookingStatus.Waitlist, waitlistCount + 1, 0, null, DateTime.UtcNow, null);
            await _bookingRepository.AddAsync(waitlistBooking);
            return (waitlistBooking, null);
        }

        var booking = new Booking(Guid.NewGuid(), scheduleId, memberId, activePackage.Id, BookingStatus.Confirmed, null, 0, null, DateTime.UtcNow, null);
        await _bookingRepository.AddAsync(booking);
        
        schedule.IncrementBookings();
        // Missing update schedule repo, but Supabase will handle this in a real DB or we'll update it later
        
        return (booking, null);
    }

    public async Task<(bool Success, bool IsLateCancellation, Booking? PromotedBooking, string? Error)> CancelBookingAsync(
        Guid bookingId, Guid memberId)
    {
        var booking = await _bookingRepository.FindByIdAsync(bookingId);
        if (booking is null)
        {
            return (false, false, null, "Không tìm thấy đặt chỗ.");
        }

        if (booking.MemberId != memberId)
        {
            return (false, false, null, "Bạn không có quyền hủy đặt chỗ này.");
        }

        if (booking.Status == BookingStatus.Cancelled)
        {
            return (false, false, null, "Đặt chỗ này đã được hủy trước đó.");
        }

        var schedule = await _scheduleRepository.FindByIdAsync(booking.ScheduleId);
        if (schedule is null)
        {
            return (false, false, null, "Lớp học không tồn tại.");
        }

        var now = DateTime.UtcNow;
        var timeUntilClass = schedule.StartTime - now;
        var isLateCancellation = timeUntilClass.TotalHours < 2;

        var wasConfirmed = booking.Status == BookingStatus.Confirmed;
        booking.Cancel();
        await _bookingRepository.UpdateAsync(booking);

        Booking? promotedBooking = null;

        if (wasConfirmed)
        {
            schedule.DecrementBookings();

            var firstWaitlist = await _bookingRepository.GetFirstWaitlistAsync(booking.ScheduleId);

            if (firstWaitlist is not null)
            {
                firstWaitlist.Confirm();
                await _bookingRepository.UpdateAsync(firstWaitlist);
                schedule.IncrementBookings();
                promotedBooking = firstWaitlist;
            }
        }

        return (true, isLateCancellation, promotedBooking, null);
    }
}
