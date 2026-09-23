using SmartGym.Domain.Entities;

namespace SmartGym.Application.Interfaces.Repositories;

public interface IMemberPackageRepository
{
    Task<IReadOnlyList<PackagePlan>> GetAllPlansAsync();
    Task<PackagePlan?> FindPlanByIdAsync(Guid id);
    Task<IReadOnlyList<MemberPackage>> GetByMemberAsync(Guid memberId);
    Task<MemberPackage?> FindActivePackageAsync(Guid memberId);
    Task UpdateAsync(MemberPackage package);
}
