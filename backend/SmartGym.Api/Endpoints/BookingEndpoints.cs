using System.Security.Claims;
using SmartGym.Api.Filters;
using SmartGym.Application.DTOs.Booking;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Application.Services;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Endpoint quản lý Đặt chỗ lớp học và Lịch cá nhân (Class Booking & Schedule).
/// Cung cấp các thao tác: Tìm kiếm lịch lớp học, đặt chỗ tham gia lớp (hỗ trợ danh sách chờ Waitlist),
/// hủy đặt chỗ (áp dụng phạt No-show nếu hủy muộn), và xem danh sách các lớp đã đặt của hội viên.
/// </summary>
public static class BookingEndpoints
{
    /// <summary>
    /// Đăng ký các route đặt chỗ lớp học vào hệ thống.
    /// Nhóm route: /api/classes, /api/bookings, /api/schedule
    /// </summary>
    /// <param name="app">Đối tượng WebApplication để định tuyến</param>
    public static void MapBookingEndpoints(this WebApplication app)
    {
        var classes = app.MapGroup("/api/classes").WithTags("Classes");
        var bookings = app.MapGroup("/api/bookings").WithTags("Bookings");
        var schedule = app.MapGroup("/api/schedule").WithTags("Personal Schedule");

        // ── Class listing (public, any authenticated user) ──

        /// <summary>
        /// GET /api/classes
        /// Tìm kiếm và xem danh sách lịch các lớp học thể thao theo bộ môn hoặc ngày.
        /// Không giới hạn quyền truy cập.
        /// </summary>
        classes.MapGet(
            "/",
            async (
                IClassScheduleRepository scheduleRepo,
                IUserRepository userRepo,
                string? sport,
                DateTime? date
            ) =>
            {
                var results = await scheduleRepo.SearchAsync(sport, date);
                var responseTasks = results.Select(async s =>
                    await ToClassResponseAsync(s, userRepo)
                );
                var response = await Task.WhenAll(responseTasks);
                return Results.Ok(response);
            }
        );

        // Chi tiết lớp học (GET /api/classes/{id}) được đăng ký tại ClassEndpoints
        // vì dùng ClassService.GetClassDetailAsync để trả về đủ danh sách học viên.

        // ── Booking management (Member, Receptionist) ──

        /// <summary>
        /// POST /api/bookings
        /// Đặt chỗ tham gia một lớp học theo lịch (ScheduleId).
        /// - Nếu lớp còn chỗ: Đặt thành công (Confirmed).
        /// - Nếu lớp đã đầy: Tự động đưa vào danh sách chờ (Waitlist).
        /// Quyền hạn yêu cầu: Member hoặc Receptionist.
        /// </summary>
        bookings
            .MapPost(
                "/",
                async (
                    CreateBookingRequest request,
                    HttpContext context,
                    BookingService bookingService
                ) =>
                {
                    var memberId = GetUserId(context);
                    if (memberId is null)
                        return Results.Unauthorized();

                    var (booking, error) = await bookingService.CreateBookingAsync(
                        memberId.Value,
                        request.ScheduleId
                    );
                    if (booking is null)
                    {
                        return Results.BadRequest(new { message = error });
                    }

                    var statusMessage =
                        booking.Status == BookingStatus.Waitlist
                            ? "Lớp đã đầy. Bạn đã được thêm vào danh sách chờ (Waitlist)."
                            : "Đặt chỗ thành công!";

                    return Results.Ok(new { message = statusMessage, booking });
                }
            )
            .AddEndpointFilter(Authorize.Roles(UserRole.Member, UserRole.Receptionist));

        /// <summary>
        /// DELETE /api/bookings/{id}
        /// Hủy đặt chỗ lớp học.
        /// - Nếu hủy sát giờ (Late Cancellation): Trừ 1 buổi tập theo chính sách No-show.
        /// - Tự động đôn người đứng đầu danh sách chờ (Waitlist) lên thành viên chính thức.
        /// Quyền hạn yêu cầu: Member hoặc Receptionist.
        /// </summary>
        bookings
            .MapDelete(
                "/{id:guid}",
                async (
                    Guid id,
                    HttpContext context,
                    BookingService bookingService,
                    IMemberPackageRepository packageRepo
                ) =>
                {
                    var memberId = GetUserId(context);
                    if (memberId is null)
                        return Results.Unauthorized();

                    var (success, isLate, promoted, error) =
                        await bookingService.CancelBookingAsync(id, memberId.Value);
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
                            penaltyMessage =
                                " (Hủy muộn: 1 buổi tập đã bị trừ theo chính sách No-show)";
                        }
                    }

                    string? promotedMessage = null;
                    if (promoted is not null)
                    {
                        promotedMessage =
                            "Người đứng đầu danh sách chờ đã được đôn lên chính thức.";
                    }

                    return Results.Ok(
                        new
                        {
                            message = $"Đã hủy đặt chỗ thành công.{penaltyMessage}",
                            isLateCancellation = isLate,
                            waitlistPromoted = promotedMessage,
                        }
                    );
                }
            )
            .AddEndpointFilter(Authorize.Roles(UserRole.Member, UserRole.Receptionist));

        /* bookings.MapGet("/all", async (
            IBookingRepository bookingRepo,
            IClassScheduleRepository scheduleRepo,
            IUserRepository userRepo) =>
        {
... (Removed duplicate endpoint. It's mapped in Program.cs using ClassService)
        })
        .AddEndpointFilter(Authorize.Roles(UserRole.CenterManager, UserRole.Receptionist))
        .WithSummary("Tất cả đơn đặt chỗ (Dành cho Quản lý)"); */

        /// <summary>
        /// GET /api/bookings/my
        /// Lấy toàn bộ danh sách các lượt đặt chỗ lớp học của hội viên đang đăng nhập.
        /// Quyền hạn yêu cầu: Member hoặc Receptionist.
        /// </summary>
        bookings
            .MapGet(
                "/my",
                async (
                    HttpContext context,
                    IBookingRepository bookingRepo,
                    IClassScheduleRepository scheduleRepo
                ) =>
                {
                    var memberId = GetUserId(context);
                    if (memberId is null)
                        return Results.Unauthorized();

                    var myBookings = await bookingRepo.GetByMemberAsync(memberId.Value);
                    var responseTasks = myBookings.Select(async b =>
                    {
                        var schedule = await scheduleRepo.FindByIdAsync(b.ScheduleId);
                        var className = schedule?.ClassName ?? "";
                        return new BookingResponse(
                            b.Id,
                            b.ScheduleId,
                            className,
                            b.Status.ToString(),
                            b.BookedAt
                        );
                    });

                    var response = await Task.WhenAll(responseTasks);
                    return Results.Ok(response);
                }
            )
            .AddEndpointFilter(Authorize.Roles(UserRole.Member, UserRole.Receptionist));

        // ── Personal schedule (Member sees booked classes, Coach sees teaching schedule) ──

        /* schedule.MapGet("/my", async (
            HttpContext context,
            IBookingRepository bookingRepo,
            IClassScheduleRepository scheduleRepo,
            IUserRepository userRepo) =>
        {
... (Removed duplicate endpoint. It's mapped in Program.cs using ClassService)
        })
        .AddEndpointFilter(Authorize.Roles(UserRole.Member, UserRole.Coach, UserRole.Receptionist)); */
    }

    /// <summary>
    /// Tiện ích trích xuất User ID (Guid) từ Claims trong HttpContext.
    /// </summary>
    private static Guid? GetUserId(HttpContext context)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userId, out var id) ? id : null;
    }

    /// <summary>
    /// Chuyển đổi thực thể ClassSchedule sang DTO phản hồi ClassScheduleResponse kèm thông tin HLV và số chỗ trống.
    /// </summary>
    private static async Task<ClassScheduleResponse> ToClassResponseAsync(
        ClassSchedule s,
        IUserRepository userRepo
    )
    {
        var coach = await userRepo.FindByIdAsync(s.CoachId);
        var coachName = coach?.FullName ?? "N/A";
        var available = Math.Max(0, s.MaxCapacity - s.CurrentBookings);
        return new ClassScheduleResponse(
            s.Id,
            s.ClassName,
            s.SportType,
            coachName,
            s.RoomName,
            s.StartTime,
            s.EndTime,
            s.MaxCapacity,
            s.CurrentBookings,
            available,
            available == 0
        );
    }
}
