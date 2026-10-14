using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Repositories;

public sealed class SupabaseMemberPackageRepository : IMemberPackageRepository
{
    private readonly global::Supabase.Client _client;
    private readonly Dictionary<Guid, PackagePlan> _plans = new();

    public SupabaseMemberPackageRepository(global::Supabase.Client client)
    {
        _client = client;
    }

    public async Task<IReadOnlyList<PackagePlan>> GetAllPlansAsync()
    {
        var response = await _client.From<CheckInPackageModel>().Where(p => p.Status == true).Get();
        return response.Models.Select(ToPlan).ToList();
    }

    public async Task<PackagePlan?> FindPlanByIdAsync(Guid id)
    {
        return _plans.TryGetValue(id, out var plan) ? plan : null;
    }

    public async Task<IReadOnlyList<MemberPackage>> GetByMemberAsync(Guid memberId)
    {
        var response = await _client.From<SubscriptionCheckInModel>().Where(x => x.UserId == memberId).Get();
        return await ToDomainList(response.Models);
    }

    public async Task<MemberPackage?> FindActivePackageAsync(Guid memberId)
    {
        var now = DateTime.UtcNow;
        var response = await _client.From<SubscriptionCheckInModel>().Where(x => x.UserId == memberId).Get();
        var subscription = response.Models
            .Where(x => IsPaid(x.PaymentStatus) && x.StartDate.Date <= now.Date && x.EndDate.Date >= now.Date)
            .OrderByDescending(x => x.EndDate)
            .FirstOrDefault();
        return subscription is null ? null : await ToDomain(subscription);
    }

    public async Task UpdateAsync(MemberPackage package)
    {
        // Check-in currently does not mutate package data. Session accounting can be
        // added later without coupling this flow to the legacy member_packages table.
        await Task.CompletedTask;
    }

    private async Task<IReadOnlyList<MemberPackage>> ToDomainList(IEnumerable<SubscriptionCheckInModel> models)
    {
        var result = new List<MemberPackage>();
        foreach (var model in models)
        {
            var item = await ToDomain(model);
            if (item is not null) result.Add(item);
        }
        return result;
    }

    private async Task<MemberPackage?> ToDomain(SubscriptionCheckInModel subscription)
    {
        if (string.IsNullOrWhiteSpace(subscription.PackageId)) return null;
        var packageResponse = await _client.From<CheckInPackageModel>()
            .Where(x => x.Id == subscription.PackageId)
            .Get();
        var package = packageResponse.Models.FirstOrDefault();
        if (package is null) return null;

        var plan = ToPlan(package);
        return new MemberPackage(
            subscription.Id,
            subscription.UserId,
            plan.Id,
            subscription.FacilityId ?? Guid.Empty,
            subscription.StartDate,
            subscription.EndDate,
            null,
            subscription.EndDate.Date >= DateTime.UtcNow.Date ? PackageStatus.Active : PackageStatus.Expired,
            0,
            0,
            null,
            false);
    }

    private PackagePlan ToPlan(CheckInPackageModel package)
    {
        var id = Guid.NewGuid();
        var plan = new PackagePlan(
            id,
            package.Name,
            package.Name,
            package.MonthlyPrice ?? 0,
            30,
            null,
            AccessHours.All,
            true,
            package.Status);
        _plans[id] = plan;
        return plan;
    }

    private static bool IsPaid(string? status) =>
        string.Equals(status, "completed", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(status, "paid", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(status, "active", StringComparison.OrdinalIgnoreCase);
}
