using System.Security.Claims;
using SmartGym.Api.Filters;
using SmartGym.Application.DTOs.CheckIn;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Application.Services;
using SmartGym.Domain.Enums;

namespace SmartGym.Api.Endpoints;

public static class CheckInEndpoints
{
    public static void MapCheckInEndpoints(this WebApplication app)
    {
        var checkin = app.MapGroup("/api/checkin").WithTags("Check-in");
        var packages = app.MapGroup("/api/packages").WithTags("Packages");

        // ── Check-in (FR-016, BR-007) ──

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

        checkin.MapGet("/history", async (
            HttpContext context,
            ICheckInRepository checkInRepo,
            IUserRepository userRepo) =>
        {
            var role = context.User.FindFirstValue(ClaimTypes.Role);
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

            IReadOnlyList<SmartGym.Domain.Entities.CheckInRecord> records;

            if (string.Equals(role, UserRole.CenterManager.ToString(), StringComparison.OrdinalIgnoreCase) ||
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
                return new CheckInHistoryEntry(r.Id, memberName, r.CheckInTime, "APPROVED");
            });

            var response = await Task.WhenAll(responseTasks);

            return Results.Ok(response);
        })
        .AddEndpointFilter(Authorize.Roles(UserRole.CenterManager, UserRole.Receptionist, UserRole.Member));

        // ── Member packages (view own packages) ──

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

        packages.MapGet("/plans", async (IMemberPackageRepository packageRepo) =>
        {
            var plans = await packageRepo.GetAllPlansAsync();
            return Results.Ok(plans);
        });
    }
}
