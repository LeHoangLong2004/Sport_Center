using SmartGym.Application.DTOs;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;
using SmartGym.Application.Services;
using SmartGym.Domain.Entities;
using Xunit;

namespace SmartGym.Tests;

public sealed class Flow5AssignmentServiceTests
{
    [Fact]
    public async Task Draft_plan_cannot_be_assigned()
    {
        var plan = CreatePlan(Flow5PlanStatuses.Draft);
        var progress = new FakeProgressRepository();
        var service = CreateService(plan, progress);

        var result = await service.AssignAsync(
            plan.CoachId!.Value,
            plan.Id,
            MemberRequest(Guid.NewGuid()));

        Assert.False(result.IsSuccess);
        Assert.Equal("plan_not_approved", result.ErrorCode);
        Assert.Equal(0, progress.AssignCalls);
    }

    [Fact]
    public async Task Approved_plan_can_be_assigned_to_one_active_member()
    {
        var memberId = Guid.NewGuid();
        var plan = CreatePlan(Flow5PlanStatuses.Approved);
        var progress = new FakeProgressRepository();
        var service = CreateService(plan, progress, new[] { memberId });

        var result = await service.AssignAsync(
            plan.CoachId!.Value,
            plan.Id,
            MemberRequest(memberId));

        Assert.True(result.IsSuccess);
        Assert.Equal(1, result.Data!.AssignedCount);
        Assert.Equal(0, result.Data.SkippedCount);
        Assert.Single(result.Data.Assignments);
    }

    [Fact]
    public async Task Class_assignment_reports_existing_members_as_skipped()
    {
        var firstMember = Guid.NewGuid();
        var secondMember = Guid.NewGuid();
        var plan = CreatePlan(Flow5PlanStatuses.Approved);
        var progress = new FakeProgressRepository
        {
            ClassMemberIds = new[] { firstMember, secondMember },
            ExistingMemberIds = new[] { secondMember }
        };
        var service = CreateService(plan, progress, new[] { firstMember, secondMember });

        var result = await service.AssignAsync(
            plan.CoachId!.Value,
            plan.Id,
            new AssignFlow5PlanRequest
            {
                Target = new Flow5TargetDto { Type = Flow5TargetTypes.Class, Id = Guid.NewGuid() }
            });

        Assert.True(result.IsSuccess);
        Assert.Equal(1, result.Data!.AssignedCount);
        Assert.Equal(1, result.Data.SkippedCount);
        Assert.Equal(1, progress.AssignCalls);
    }

    private static Flow5AssignmentService CreateService(
        WorkoutPlan plan,
        FakeProgressRepository progress,
        IEnumerable<Guid>? memberIds = null)
    {
        return new Flow5AssignmentService(
            new FakePlanRepository(plan),
            progress,
            new FakeUserRepository(memberIds ?? Array.Empty<Guid>()));
    }

    private static AssignFlow5PlanRequest MemberRequest(Guid memberId) => new()
    {
        Target = new Flow5TargetDto { Type = Flow5TargetTypes.Member, Id = memberId }
    };

    private static WorkoutPlan CreatePlan(string status) => new()
    {
        Id = Guid.NewGuid(),
        CoachId = Guid.NewGuid(),
        PlanName = "Test plan",
        Status = status,
        Version = 1
    };

    private sealed class FakePlanRepository : IWorkoutPlanRepository
    {
        private readonly WorkoutPlan _plan;
        public FakePlanRepository(WorkoutPlan plan) => _plan = plan;
        public Task<WorkoutPlan> CreateAsync(WorkoutPlan plan) => Task.FromResult(plan);
        public Task<WorkoutPlan> UpdateAsync(WorkoutPlan plan) => Task.FromResult(plan);
        public Task<WorkoutPlan?> GetByIdAsync(Guid id) => Task.FromResult<WorkoutPlan?>(id == _plan.Id ? _plan : null);
        public Task<IEnumerable<WorkoutPlan>> GetByCoachIdAsync(Guid coachId) => Task.FromResult<IEnumerable<WorkoutPlan>>(new[] { _plan });
    }

    private sealed class FakeProgressRepository : IHomeworkProgressRepository
    {
        public IReadOnlyCollection<Guid> ClassMemberIds { get; init; } = Array.Empty<Guid>();
        public IReadOnlyCollection<Guid> ExistingMemberIds { get; init; } = Array.Empty<Guid>();
        public int AssignCalls { get; private set; }

        public Task<HomeworkBatchAssignmentResult> AssignMissingBatchAsync(
            Guid planId,
            Guid assignedBy,
            IReadOnlyCollection<Guid> memberIds,
            DateTime? dueDate,
            string? notes,
            CancellationToken cancellationToken = default)
        {
            AssignCalls++;
            var missing = memberIds.Except(ExistingMemberIds).ToHashSet();
            var all = memberIds.Select(memberId => new HomeworkProgress
            {
                Id = Guid.NewGuid(),
                MemberId = memberId,
                PlanId = planId,
                AssignedBy = assignedBy,
                Status = "assigned",
                CreatedAt = DateTime.UtcNow
            }).ToList();
            return Task.FromResult(new HomeworkBatchAssignmentResult(all, missing));
        }

        public Task<IReadOnlyList<Guid>> GetEligibleMemberIdsByClassAsync(
            Guid classId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Guid>>(ClassMemberIds.ToList());

        public Task<HomeworkProgress> CreateAsync(HomeworkProgress progress) => Task.FromResult(progress);
        public Task<HomeworkProgress?> GetByIdAsync(Guid id) => Task.FromResult<HomeworkProgress?>(null);
        public Task<IEnumerable<HomeworkProgress>> GetByMemberIdAsync(Guid memberId) => Task.FromResult<IEnumerable<HomeworkProgress>>(Array.Empty<HomeworkProgress>());
        public Task<bool> UpdateAsync(HomeworkProgress progress) => Task.FromResult(true);
    }

    private sealed class FakeUserRepository : IUserRepository
    {
        private readonly HashSet<Guid> _activeMembers;
        public FakeUserRepository(IEnumerable<Guid> activeMembers) => _activeMembers = activeMembers.ToHashSet();

        public Task<User?> GetByIdAsync(Guid id) => Task.FromResult<User?>(
            _activeMembers.Contains(id) ? new User { Id = id, Status = true } : null);
        public Task<User?> GetByEmailAsync(string email) => Task.FromResult<User?>(null);
        public Task<User?> GetByPhoneNumberAsync(string phoneNumber) => Task.FromResult<User?>(null);
        public Task<IEnumerable<User>> GetAllUsersAsync() => Task.FromResult<IEnumerable<User>>(Array.Empty<User>());
        public Task<IEnumerable<MemberLookupResponse>> GetMembersLookupAsync() => Task.FromResult<IEnumerable<MemberLookupResponse>>(Array.Empty<MemberLookupResponse>());
        public Task<Role?> GetRoleByNameAsync(string roleName) => Task.FromResult<Role?>(null);
        public Task<Role?> GetRoleByIdAsync(Guid id) => Task.FromResult<Role?>(null);
        public Task<IEnumerable<Role>> GetAllRolesAsync() => Task.FromResult<IEnumerable<Role>>(Array.Empty<Role>());
        public Task AddAsync(User user) => Task.CompletedTask;
        public Task UpdateAsync(User user) => Task.CompletedTask;
    }
}
