using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Repositories;

public sealed class SupabaseMemberPackageRepository : IMemberPackageRepository
{
    private readonly global::Supabase.Client _client;

    public SupabaseMemberPackageRepository(global::Supabase.Client client)
    {
        _client = client;
    }

    public async Task<IReadOnlyList<PackagePlan>> GetAllPlansAsync()
    {
        var response = await _client.From<PackagePlanModel>().Where(p => p.IsActive == true).Get();
        return response.Models.Select(m => m.ToDomain()).ToList();
    }

    public async Task<PackagePlan?> FindPlanByIdAsync(Guid id)
    {
        var response = await _client.From<PackagePlanModel>().Where(x => x.Id == id).Single();
        return response?.ToDomain();
    }

    public async Task<IReadOnlyList<MemberPackage>> GetByMemberAsync(Guid memberId)
    {
        var response = await _client.From<MemberPackageModel>().Where(x => x.MemberId == memberId).Get();
        return response.Models.Select(m => m.ToDomain()).ToList();
    }

    public async Task<MemberPackage?> FindActivePackageAsync(Guid memberId)
    {
        var response = await _client.From<MemberPackageModel>()
            .Where(x => x.MemberId == memberId && x.Status == "ACTIVE")
            .Get();

        var first = response.Models.FirstOrDefault();
        return first?.ToDomain();
    }

    public async Task UpdateAsync(MemberPackage package)
    {
        var model = MemberPackageModel.FromDomain(package);
        await _client.From<MemberPackageModel>().Update(model);
    }
}
