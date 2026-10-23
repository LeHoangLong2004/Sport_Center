using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.EF;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SmartGym.Infrastructure.Persistence.EF.Repositories;

public class HomeworkProgressRepository : IHomeworkProgressRepository
{
    private readonly SmartGymDbContext _context;

    public HomeworkProgressRepository(SmartGymDbContext context)
    {
        _context = context;
    }

    public async Task<HomeworkProgress> CreateAsync(HomeworkProgress progress)
    {
        _context.HomeworkProgresses.Add(progress);
        await _context.SaveChangesAsync();
        return progress;
    }

    public async Task<HomeworkBatchAssignmentResult> AssignMissingBatchAsync(
        Guid planId,
        Guid assignedBy,
        IReadOnlyCollection<Guid> memberIds,
        DateTime? dueDate,
        string? notes,
        CancellationToken cancellationToken = default)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(() => AssignMissingBatchCoreAsync(
            planId,
            assignedBy,
            memberIds,
            dueDate,
            notes,
            cancellationToken));
    }

    private async Task<HomeworkBatchAssignmentResult> AssignMissingBatchCoreAsync(
        Guid planId,
        Guid assignedBy,
        IReadOnlyCollection<Guid> memberIds,
        DateTime? dueDate,
        string? notes,
        CancellationToken cancellationToken)
    {
        var requestedMembers = memberIds.Where(id => id != Guid.Empty).Distinct().ToHashSet();
        if (requestedMembers.Count == 0)
            return new HomeworkBatchAssignmentResult(Array.Empty<HomeworkProgress>(), new HashSet<Guid>());

        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);

        var existing = await _context.HomeworkProgresses
            .Where(progress => progress.PlanId == planId && requestedMembers.Contains(progress.MemberId))
            .ToListAsync(cancellationToken);
        var existingMembers = existing.Select(progress => progress.MemberId).ToHashSet();
        var missingMembers = requestedMembers.Except(existingMembers).ToHashSet();
        var now = DateTime.UtcNow;

        var newAssignments = missingMembers.Select(memberId => new HomeworkProgress
        {
            Id = Guid.NewGuid(),
            MemberId = memberId,
            PlanId = planId,
            AssignedBy = assignedBy,
            Status = "assigned",
            ProgressPct = 0,
            AssignedDate = now,
            DueDate = dueDate,
            Notes = notes,
            CreatedAt = now
        }).ToList();

        if (newAssignments.Count > 0)
        {
            await _context.HomeworkProgresses.AddRangeAsync(newAssignments, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);

        var assignments = await _context.HomeworkProgresses
            .AsNoTracking()
            .Include(progress => progress.Plan)
            .ThenInclude(plan => plan!.Exercises)
            .Where(progress => progress.PlanId == planId && requestedMembers.Contains(progress.MemberId))
            .OrderBy(progress => progress.MemberId)
            .ToListAsync(cancellationToken);

        return new HomeworkBatchAssignmentResult(assignments, missingMembers);
    }

    public async Task<IReadOnlyList<Guid>> GetEligibleMemberIdsByClassAsync(
        Guid classId,
        CancellationToken cancellationToken = default) =>
        await _context.Database.SqlQueryRaw<Guid>(
                @"SELECT DISTINCT user_id AS ""Value""
                  FROM class_bookings
                  WHERE class_id = {0}
                    AND LOWER(COALESCE(status, '')) NOT IN ('cancelled', 'rejected', 'class_cancelled')",
                classId)
            .ToListAsync(cancellationToken);

    public async Task<HomeworkProgress?> GetByIdAsync(Guid id)
    {
        return await _context.HomeworkProgresses
            .Include(p => p.Plan)
                .ThenInclude(p => p!.Exercises)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<HomeworkProgress>> GetByMemberIdAsync(Guid memberId)
    {
        return await _context.HomeworkProgresses
            .Include(p => p.Plan)
                .ThenInclude(p => p!.Exercises)
            .Where(p => p.MemberId == memberId)
            .OrderByDescending(p => p.AssignedDate)
            .ToListAsync();
    }

    public async Task<bool> UpdateAsync(HomeworkProgress progress)
    {
        _context.HomeworkProgresses.Update(progress);
        var updated = await _context.SaveChangesAsync();
        return updated > 0;
    }
}
