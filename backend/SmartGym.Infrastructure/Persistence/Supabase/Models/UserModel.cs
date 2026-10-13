using Postgrest.Attributes;
using Postgrest.Models;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

[Table("users")]
public class UserModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("branch_id")]
    public Guid? BranchId { get; set; }

    [Column("member_code")]
    public string? MemberCode { get; set; }

    [Column("qr_secret_token")]
    public string? QrSecretToken { get; set; }

    [Column("email")]
    public string Email { get; set; } = "";

    [Column("password_hash")]
    public string PasswordHash { get; set; } = "";

    [Column("full_name")]
    public string FullName { get; set; } = "";

    [Column("phone_number")]
    public string PhoneNumber { get; set; } = "";

    [Column("role")]
    public string Role { get; set; } = "";

    [Column("avatar_url")]
    public string? AvatarUrl { get; set; }

    [Column("referral_code")]
    public string ReferralCode { get; set; } = "";

    [Column("is_mfa_enabled")]
    public bool IsMfaEnabled { get; set; }

    // Supabase schema stores the account status in `status`.
    [Column("status")]
    public bool IsActive { get; set; }

    public AppUser ToDomain()
    {
        return new AppUser(
            Id,
            BranchId,
            Email,
            PasswordHash,
            FullName,
            PhoneNumber,
            ParseRole(Role),
            MemberCode,
            QrSecretToken,
            ReferralCode,
            AvatarUrl,
            IsMfaEnabled,
            IsActive
        );
    }

    private static UserRole ParseRole(string? value)
    {
        var normalized = value?.Trim().ToLowerInvariant()
            .Replace("-", "_")
            .Replace(" ", "_");

        return normalized switch
        {
            "manager" or "admin" or "center_manager" or "centermanager" => UserRole.CenterManager,
            "receptionist" or "staff" => UserRole.Receptionist,
            "coach" or "trainer" => UserRole.Coach,
            "member" or "user" => UserRole.Member,
            _ when Enum.TryParse<UserRole>(value, true, out var parsed) => parsed,
            _ => UserRole.Member
        };
    }
}
