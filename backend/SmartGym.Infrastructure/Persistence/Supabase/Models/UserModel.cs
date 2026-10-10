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

    [Column("is_active")]
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
            Enum.Parse<UserRole>(Role, true),
            MemberCode,
            QrSecretToken,
            ReferralCode,
            AvatarUrl,
            IsMfaEnabled,
            IsActive
        );
    }
}
