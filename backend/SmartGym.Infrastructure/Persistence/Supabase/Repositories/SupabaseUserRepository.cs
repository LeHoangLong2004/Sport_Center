using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Repositories;

public sealed class SupabaseUserRepository : IUserRepository
{
    private readonly global::Supabase.Client _client;

    public SupabaseUserRepository(global::Supabase.Client client)
    {
        _client = client;
    }

    public async Task<AppUser?> FindByEmailAsync(string email)
    {
        var response = await _client.From<UserModel>()
            .Where(x => x.Email == email)
            .Single();

        return response?.ToDomain();
    }

    public async Task<AppUser?> FindByIdAsync(Guid id)
    {
        var response = await _client.From<UserModel>()
            .Where(x => x.Id == id)
            .Single();

        return response?.ToDomain();
    }

    public async Task UpdateAsync(AppUser user)
    {
        var model = new UserModel
        {
            Id = user.Id,
            BranchId = user.BranchId,
            Email = user.Email,
            PasswordHash = user.PasswordHash,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role.ToString().ToUpper(),
            MemberCode = user.MemberCode,
            QrSecretToken = user.QrSecretToken,
            ReferralCode = user.ReferralCode,
            AvatarUrl = user.AvatarUrl,
            IsMfaEnabled = user.IsMfaEnabled,
            IsActive = user.IsActive
        };

        await _client.From<UserModel>().Update(model);
    }
}
