using System.Security.Claims;
using SmartGym.Api.Filters;
using SmartGym.Application.DTOs.CheckIn;
using IPackageRepository = SmartGym.Application.Interfaces.IPackageRepository;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Application.Services;
using SmartGym.Domain.Enums;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Endpoint quản lý Check-in / Check-out và Gói tập của hội viên (Attendance & Access Control).
/// Hỗ trợ: Hội viên tự điểm danh hoặc Lễ tân/Quản lý điểm danh tại quầy, tra cứu lịch sử check-in,
/// xem các gói tập cá nhân đang sở hữu và danh mục gói tập công khai.
/// </summary>
public static class CheckInEndpoints
{
    /// <summary>
    /// Đăng ký các route Check-in và Packages vào ứng dụng.
    /// Nhóm route: /api/checkin và /api/packages
    /// </summary>
    /// <param name="app">Đối tượng WebApplication để định tuyến</param>
    public static void MapCheckInEndpoints(this WebApplication app)
    {
        var checkin = app.MapGroup("/api/checkin").WithTags("Check-in");
        var packages = app.MapGroup("/api/packages").WithTags("Packages");

        // ── Check-in (FR-016, BR-007) ──

        /// <summary>
        /// POST /api/checkin
        /// Thực hiện Check-in cho hội viên khi bước vào phòng tập.
        /// - Kiểm tra tính hợp lệ của gói tập (còn hạn, còn lượt, đúng khung giờ truy cập).
        /// - Ghi nhận thời gian check-in vào hệ thống.
        /// Quyền hạn yêu cầu: CenterManager, Receptionist, hoặc Member (tự check-in).
        /// </summary>
        checkin.MapPost("/", async (
            CheckInRequest request,
            CheckInService checkInService,
            IUserRepository userRepo) =>
        {
            var member = await userRepo.FindByIdAsync(request.MemberId);
            if (member is null)
            {
                return Results.NotFound(new { message = "Không tìm thấy hội viên." });
            }

            var now = DateTime.UtcNow;
            var (allowed, reason, packageName) = await checkInService.ValidateAndCheckInAsync(request.MemberId, now);

            if (!allowed)
            {
                return Results.BadRequest(new CheckInResponse(
                    false, reason, member.FullName, packageName ?? "", now));
            }

            return Results.Ok(new CheckInResponse(
                true, reason, member.FullName, packageName ?? "", now));
        })
        .AddEndpointFilter(Authorize.Roles(UserRole.CenterManager, UserRole.Receptionist, UserRole.Member));

        /// <summary>
        /// POST /api/checkin/checkout
        /// Thực hiện Check-out khi hội viên rời khỏi phòng tập.
        /// - Tính toán tổng thời gian tập luyện (phút).
        /// - Cập nhật trạng thái lượt check-in thành CHECKED_OUT.
        /// Quyền hạn yêu cầu: CenterManager, Receptionist, hoặc Member.
        /// </summary>
        checkin.MapPost("/checkout", async (
            CheckOutRequest request,
            CheckInService checkInService,
            IUserRepository userRepo) =>
        {
            var member = await userRepo.FindByIdAsync(request.MemberId);
            if (member is null)
                return Results.NotFound(new { message = "Không tìm thấy hội viên." });

            var (allowed, message, record) = await checkInService.CheckOutAsync(
                request.MemberId,
                DateTime.UtcNow);

            if (!allowed || record is null)
                return Results.BadRequest(new { allowed, message });

            var durationMinutes = Math.Max(
                0,
                (int)Math.Round((record.CheckOutTime!.Value - record.CheckInTime).TotalMinutes));

            return Results.Ok(new CheckOutResponse(
                true,
                message,
                member.FullName,
                record.CheckInTime,
                record.CheckOutTime.Value,
                durationMinutes));
        })
        .AddEndpointFilter(Authorize.Roles(UserRole.CenterManager, UserRole.Receptionist, UserRole.Member));

        /// <summary>
        /// GET /api/checkin/history
        /// Xem lịch sử check-in / check-out.
        /// - Nếu truyền `memberId`: Lấy lịch sử của hội viên cụ thể.
        /// - Nếu là Manager/Receptionist: Lấy toàn bộ lượt check-in trong ngày hôm nay.
        /// - Nếu là Member: Lấy toàn bộ lịch sử điểm danh của chính mình.
        /// </summary>
        checkin.MapGet("/history", async (
            HttpContext context,
            ICheckInRepository checkInRepo,
            IUserRepository userRepo) =>
        {
            var role = context.User.FindFirstValue(ClaimTypes.Role);
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

            IReadOnlyList<SmartGym.Domain.Entities.CheckInRecord> records;

            var qMemberId = context.Request.Query["memberId"].ToString();
            if (!string.IsNullOrEmpty(qMemberId) && Guid.TryParse(qMemberId, out var targetMemberId))
            {
                records = await checkInRepo.GetByMemberAsync(targetMemberId);
            }
            else if (string.Equals(role, UserRole.CenterManager.ToString(), StringComparison.OrdinalIgnoreCase) ||
                string.Equals(role, UserRole.Receptionist.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                records = await checkInRepo.GetTodayAsync();
            }
            else
            {
                if (!Guid.TryParse(userId, out var memberId))
                {
                    return Results.Unauthorized();
                }
                records = await checkInRepo.GetByMemberAsync(memberId);
            }

            var responseTasks = records.Select(async r =>
            {
                var member = await userRepo.FindByIdAsync(r.MemberId);
                var memberName = member?.FullName ?? "Unknown";
                int? duration = r.CheckOutTime.HasValue
                    ? Math.Max(0, (int)Math.Round((r.CheckOutTime.Value - r.CheckInTime).TotalMinutes))
                    : null;
                return new CheckInHistoryEntry(
                    r.Id,
                    r.MemberId,
                    memberName,
                    r.CheckInTime,
                    r.CheckOutTime,
                    duration,
                    r.CheckOutTime.HasValue ? "CHECKED_OUT" : "APPROVED");
            });

            var response = await Task.WhenAll(responseTasks);

            return Results.Ok(response);
        })
        .AddEndpointFilter(Authorize.Roles(UserRole.CenterManager, UserRole.Receptionist, UserRole.Member));

        // ── Member packages (view own packages) ──

        /// <summary>
        /// GET /api/packages/my
        /// Lấy danh sách các gói tập mà hội viên hiện tại đang sở hữu (kèm số buổi còn lại, hạn sử dụng, giờ tập).
        /// Quyền hạn yêu cầu: Member.
        /// </summary>
        packages.MapGet("/my", async (
            HttpContext context,
            IMemberPackageRepository packageRepo) =>
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userId, out var memberId))
            {
                return Results.Unauthorized();
            }

            var myPackages = await packageRepo.GetByMemberAsync(memberId);
            var responseTasks = myPackages.Select(async p =>
            {
                var plan = await packageRepo.FindPlanByIdAsync(p.PlanId);
                var planName = plan?.PlanName ?? "Unknown";
                var price = plan?.Price ?? 0;
                var accessHours = plan?.AccessHours.ToString() ?? "All";

                return new MemberPackageResponse(
                    p.Id, planName, price, p.StartDate, p.EndDate,
                    p.RemainingSessions, p.Status.ToString(), accessHours);
            });
            var response = await Task.WhenAll(responseTasks);

            return Results.Ok(response);
        })
        .AddEndpointFilter(Authorize.Roles(UserRole.Member));

        // ── Package Plans (public) ──

        /// <summary>
        /// GET /api/packages/plans
        /// Danh mục các gói tập đang mở bán công khai cho hội viên tham khảo.
        /// Không yêu cầu đăng nhập.
        /// </summary>
        packages.MapGet("/plans", async (IPackageRepository packageRepo) =>
        {
            var packages = await packageRepo.GetAllAsync();
            var plans = packages
                .Where(package => package.Status && !string.IsNullOrEmpty(package.CatalogJson))
                .Select(package => new
                {
                    id = package.Id,
                    planName = package.Name,
                    description = package.Description ?? package.Tagline ?? package.Name,
                    price = package.MonthlyPrice ?? 0,
                    durationDays = 30,
                    totalSessions = (int?)null,
                    accessHours = AccessHours.All,
                    isAllAccess = true,
                    isActive = package.Status
                });

            return Results.Ok(plans);
        });
    }
}
