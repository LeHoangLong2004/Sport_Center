using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Infrastructure.Authorization;

/// <summary>
/// Centralizes Flow 5 authorization so each endpoint does not implement a different
/// Coach/Member/Class ownership rule.
/// </summary>
public sealed class Flow5AuthorizationService : IFlow5AuthorizationService
{
    private readonly SmartGymDbContext _db;

    public Flow5AuthorizationService(SmartGymDbContext db)
    {
        _db = db;
    }

    public Flow5CoachContext? ResolveCoach(ClaimsPrincipal principal)
    {
        var rawUserId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? principal.FindFirst("sub")?.Value;
        var role = principal.FindFirst(ClaimTypes.Role)?.Value
            ?? principal.FindFirst("role")?.Value;

        if (!Guid.TryParse(rawUserId, out var userId)
            || !IsCoachRole(role)
            || string.IsNullOrWhiteSpace(role))
        {
            return null;
        }

        // The Coach profile id is resolved from the database in AuthorizeTargetAsync.
        // This method only parses trusted identity claims and is intentionally side-effect free.
        return new Flow5CoachContext(userId, Guid.Empty, role.ToLowerInvariant());
    }

    public async Task<Flow5AuthorizationResult> AuthorizeTargetAsync(
        ClaimsPrincipal principal,
        Flow5TargetDto target,
        CancellationToken cancellationToken = default)
    {
        var parsedContext = ResolveCoach(principal);
        if (parsedContext is null)
            return Flow5AuthorizationResult.Unauthorized();

        if (target is null || target.Id == Guid.Empty)
            return Flow5AuthorizationResult.Forbidden("Target học viên hoặc lớp học không hợp lệ.");

        if (!IsSupportedTargetType(target.Type))
            return Flow5AuthorizationResult.Forbidden("Target phải là member hoặc class.");

        var coachId = await ResolveActiveCoachIdAsync(
            parsedContext.UserId,
            cancellationToken);
        if (coachId is null)
        {
            return Flow5AuthorizationResult.Forbidden(
                "Tài khoản chưa có hồ sơ Coach đang hoạt động.");
        }

        var context = parsedContext with { CoachId = coachId.Value };
        var allowed = string.Equals(target.Type, Flow5TargetTypes.Member, StringComparison.OrdinalIgnoreCase)
            ? await CanAccessMemberAsync(context, target.Id, cancellationToken)
            : await CanAccessClassAsync(context, target.Id, cancellationToken);

        if (allowed)
            return Flow5AuthorizationResult.Allowed(context);

        return Flow5AuthorizationResult.Forbidden(
            "Coach không phụ trách học viên hoặc lớp học được chọn.");
    }

    private async Task<Guid?> ResolveActiveCoachIdAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var ids = await _db.Database.SqlQueryRaw<Guid>(
                "SELECT id FROM coaches WHERE user_id = {0} AND status = TRUE LIMIT 1",
                userId)
            .ToListAsync(cancellationToken);

        if (ids.Count > 0)
            return ids[0];

        // Older records sometimes store users.id directly in classes/coach relations.
        var legacyIds = await _db.Database.SqlQueryRaw<Guid>(
                "SELECT id FROM coaches WHERE id = {0} AND status = TRUE LIMIT 1",
                userId)
            .ToListAsync(cancellationToken);

        return legacyIds.Count > 0 ? legacyIds[0] : null;
    }

    private async Task<bool> CanAccessClassAsync(
        Flow5CoachContext context,
        Guid classId,
        CancellationToken cancellationToken)
    {
        var classMatches = await _db.Database.SqlQueryRaw<bool>(
                @"SELECT EXISTS (
                    SELECT 1
                    FROM classes c
                    WHERE c.id = {0}
                      AND c.status = TRUE
                      AND LOWER(COALESCE(c.approval_status, 'approved')) <> 'rejected'
                      AND (c.coach_id = {1} OR c.coach_id = {2})
                ) AS ""Value""",
                classId,
                context.CoachId,
                context.UserId)
            .ToListAsync(cancellationToken);

        return classMatches.FirstOrDefault();
    }

    private async Task<bool> CanAccessMemberAsync(
        Flow5CoachContext context,
        Guid memberId,
        CancellationToken cancellationToken)
    {
        var memberExists = await _db.Users
            .AsNoTracking()
            .AnyAsync(user => user.Id == memberId && user.Status, cancellationToken);
        if (!memberExists)
            return false;

        var classBookingMatches = await _db.Database.SqlQueryRaw<bool>(
                @"SELECT EXISTS (
                    SELECT 1
                    FROM class_bookings b
                    INNER JOIN classes c ON c.id = b.class_id
                    WHERE b.user_id = {0}
                      AND c.status = TRUE
                      AND LOWER(COALESCE(c.approval_status, 'approved')) <> 'rejected'
                      AND (c.coach_id = {1} OR c.coach_id = {2})
                      AND LOWER(COALESCE(b.status, '')) NOT IN ('cancelled', 'rejected', 'class_cancelled')
                ) AS ""Value""",
                memberId,
                context.CoachId,
                context.UserId)
            .ToListAsync(cancellationToken);

        if (classBookingMatches.FirstOrDefault())
            return true;

        // PT enrollment is optional in some legacy database snapshots. A missing
        // optional table must not break class-based authorization.
        try
        {
            var ptMatches = await _db.Database.SqlQueryRaw<bool>(
                    @"SELECT EXISTS (
                        SELECT 1
                        FROM pt_enrollments p
                        WHERE p.user_id = {0}
                          AND (p.coach_id = {1} OR p.coach_id = {2})
                          AND LOWER(COALESCE(p.payment_status, '')) = 'completed'
                    ) AS ""Value""",
                    memberId,
                    context.CoachId,
                    context.UserId)
                .ToListAsync(cancellationToken);

            return ptMatches.FirstOrDefault();
        }
        catch (Exception)
        {
            return false;
        }
    }

    private static bool IsCoachRole(string? role) =>
        string.Equals(role, "coach", StringComparison.OrdinalIgnoreCase)
        || string.Equals(role, "pt", StringComparison.OrdinalIgnoreCase);

    private static bool IsSupportedTargetType(string? type) =>
        string.Equals(type, Flow5TargetTypes.Member, StringComparison.OrdinalIgnoreCase)
        || string.Equals(type, Flow5TargetTypes.Class, StringComparison.OrdinalIgnoreCase);
}
