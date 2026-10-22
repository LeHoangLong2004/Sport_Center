using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Interfaces;

public sealed record HomeworkBatchAssignmentResult(
    IReadOnlyList<HomeworkProgress> Assignments,
    IReadOnlySet<Guid> CreatedMemberIds);

public interface IHomeworkProgressRepository
{
    Task<HomeworkProgress> CreateAsync(HomeworkProgress progress);
    Task<HomeworkBatchAssignmentResult> AssignMissingBatchAsync(
        Guid planId,
        Guid assignedBy,
        IReadOnlyCollection<Guid> memberIds,
        DateTime? dueDate,
        string? notes,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Guid>> GetEligibleMemberIdsByClassAsync(
        Guid classId,
        CancellationToken cancellationToken = default);
    Task<HomeworkProgress?> GetByIdAsync(Guid id);
    Task<IEnumerable<HomeworkProgress>> GetByMemberIdAsync(Guid memberId);
    Task<bool> UpdateAsync(HomeworkProgress progress);
}
