using System.Security.Claims;
using SmartGym.Api.Filters;
using SmartGym.Application.DTOs.Booking;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Application.Services;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;

namespace SmartGym.Api.Endpoints;

public static class BookingEndpoints
{
    public static void MapBookingEndpoints(this WebApplication app)
    {
        var classes = app.MapGroup("/api/classes").WithTags("Classes");
        var bookings = app.MapGroup("/api/bookings").WithTags("Bookings");
        var schedule = app.MapGroup("/api/schedule").WithTags("Personal Schedule");

        // ── Class listing (public, any authenticated user) ──

        classes.MapGet("/", async (IClassScheduleRepository scheduleRepo, IUserRepository userRepo, string? sport, DateTime? date) =>
        {
            var results = await scheduleRepo.SearchAsync(sport, date);
            var responseTasks = results.Select(async s => await ToClassResponseAsync(s, userRepo));
            var response = await Task.WhenAll(responseTasks);
            return Results.Ok(response);
        });

        // Chi tiết lớp học (GET /api/classes/{id}) được đăng ký tại ClassEndpoints
                // vì dùng ClassService.GetClassDetailAsync để trả về đủ danh sách học viên.

        // ── Booking management (Member, Receptionist) ──

        bookings.MapPost("/", async (
            CreateBookingRequest request,
            HttpContext context,
            BookingService bookingService) =>
        {
            var memberId = GetUserId(context);
            if (memberId is null) return Results.Unauthorized();

            var (booking, error) = await bookingService.CreateBookingAsync(memberId.Value, request.ScheduleId);
            if (booking is null)
            {
                return Results.BadRequest(new { message = error });
            }

            var statusMessage = booking.Status == BookingStatus.Waitlist
                ? "Lớp đã đầy. Bạn đã được thêm vào danh sách chờ (Waitlist)."
                : "Đặt chỗ thành công!";

            return Results.Ok(new
            {
                message = statusMessage,
                booking
            });
        })
        .AddEndpointFilter(Authorize.Roles(UserRole.Member, UserRole.Receptionist));

        bookings.MapDelete("/{id:guid}", async (
            Guid id,
            HttpContext context,
            BookingService bookingService,
            IMemberPackageRepository packageRepo) =>
        {
            var memberId = GetUserId(context);
            if (memberId is null) return Results.Unauthorized();

            var (success, isLate, promoted, error) = await bookingService.CancelBookingAsync(id, memberId.Value);
            if (!success)
            {
                return Results.BadRequest(new { message = error });
            }

            string penaltyMessage = "";
            if (isLate)
            {
                var package = await packageRepo.FindActivePackageAsync(memberId.Value);
                if (package is not null)
                {
                    package.DeductSession();
                    await packageRepo.UpdateAsync(package);
                    penaltyMessage = " (Hủy muộn: 1 buổi tập đã bị trừ theo chính sách No-show)";
                }
            }

            string? promotedMessage = null;
            if (promoted is not null)
            {
                promotedMessage = "Người đứng đầu danh sách chờ đã được đôn lên chính thức.";
            }

            return Results.Ok(new
            {
                message = $"Đã hủy đặt chỗ thành công.{penaltyMessage}",
                isLateCancellation = isLate,
                waitlistPromoted = promotedMessage
            });
        })
        .AddEndpointFilter(Authorize.Roles(UserRole.Member, UserRole.Receptionist));

        bookings.MapGet("/my", async (
            HttpContext context,
            IBookingRepository bookingRepo,
            IClassScheduleRepository scheduleRepo) =>
        {
            var memberId = GetUserId(context);
            if (memberId is null) return Results.Unauthorized();

            var myBookings = await bookingRepo.GetByMemberAsync(memberId.Value);
            var responseTasks = myBookings.Select(async b =>
            {
                var schedule = await scheduleRepo.FindByIdAsync(b.ScheduleId);
                var className = schedule?.ClassName ?? "";
                return new BookingResponse(b.Id, b.ScheduleId, className, b.Status.ToString(), b.BookedAt);
            });

            var response = await Task.WhenAll(responseTasks);
            return Results.Ok(response);
        })
        .AddEndpointFilter(Authorize.Roles(UserRole.Member, UserRole.Receptionist));

        // ── Personal schedule (Member sees booked classes, Coach sees teaching schedule) ──

        schedule.MapGet("/my", async (
            HttpContext context,
            IBookingRepository bookingRepo,
            IClassScheduleRepository scheduleRepo) =>
        {
            var userId = GetUserId(context);
            if (userId is null) return Results.Unauthorized();

            var role = context.User.FindFirstValue(ClaimTypes.Role);

            List<PersonalScheduleEntry> entries;

            if (string.Equals(role, UserRole.Coach.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                var coachClasses = await scheduleRepo.GetByCoachAsync(userId.Value);
                entries = coachClasses.Select(s => new PersonalScheduleEntry(
                    s.Id, s.ClassName, s.SportType, s.RoomName,
                    s.StartTime, s.EndTime, "Coach", null
                )).ToList();
            }
            else
            {
                var myBookingsRaw = await bookingRepo.GetByMemberAsync(userId.Value);
                var myBookings = myBookingsRaw.Where(b => b.Status != BookingStatus.Cancelled).ToList();

                var entryTasks = myBookings.Select(async b =>
                {
                    var s = await scheduleRepo.FindByIdAsync(b.ScheduleId);
                    return s is null ? null : new PersonalScheduleEntry(
                        s.Id, s.ClassName, s.SportType, s.RoomName,
                        s.StartTime, s.EndTime, "Member", b.Status.ToString()
                    );
                });

                var resolvedEntries = await Task.WhenAll(entryTasks);
                entries = resolvedEntries.Where(e => e is not null).Cast<PersonalScheduleEntry>().ToList();
            }

            return Results.Ok(entries.OrderBy(e => e.StartTime));
        })
        .AddEndpointFilter(Authorize.Roles(UserRole.Member, UserRole.Coach, UserRole.Receptionist));
    }

    private static Guid? GetUserId(HttpContext context)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userId, out var id) ? id : null;
    }

    private static async Task<ClassScheduleResponse> ToClassResponseAsync(ClassSchedule s, IUserRepository userRepo)
    {
        var coach = await userRepo.FindByIdAsync(s.CoachId);
        var coachName = coach?.FullName ?? "N/A";
        var available = Math.Max(0, s.MaxCapacity - s.CurrentBookings);
        return new ClassScheduleResponse(
            s.Id, s.ClassName, s.SportType, coachName, s.RoomName,
            s.StartTime, s.EndTime, s.MaxCapacity, s.CurrentBookings,
            available, available == 0);
    }
}
