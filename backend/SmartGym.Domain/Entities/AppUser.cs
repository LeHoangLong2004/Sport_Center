using SmartGym.Domain.Enums;

namespace SmartGym.Domain.Entities;

public sealed class AppUser
{
    public AppUser(
        Guid id,
        Guid? branchId,
        string email,
        string passwordHash,
        string fullName,
        string phoneNumber,
        UserRole role,
        string? memberCode,
        string? qrSecretToken,
        string referralCode,
        string? avatarUrl,
        bool isMfaEnabled,
        bool isActive)
    {
        Id = id;
        BranchId = branchId;
        Email = email;
        PasswordHash = passwordHash;
        FullName = fullName;
        PhoneNumber = phoneNumber;
        Role = role;
        MemberCode = memberCode;
        QrSecretToken = qrSecretToken;
        ReferralCode = referralCode;
        AvatarUrl = avatarUrl;
        IsMfaEnabled = isMfaEnabled;
        IsActive = isActive;
    }

    public Guid Id { get; }
    public Guid? BranchId { get; }
    public string Email { get; }
    public string PasswordHash { get; private set; }
    public string FullName { get; }
    public string PhoneNumber { get; }
    public UserRole Role { get; }
    public string? MemberCode { get; }
    public string? QrSecretToken { get; }
    public string ReferralCode { get; }
    public string? AvatarUrl { get; }
    public bool IsMfaEnabled { get; }
    public bool IsActive { get; }

    // Domain behavior
    public void ChangePassword(string passwordHash)
    {
        PasswordHash = passwordHash;
    }

    // Mapping backwards compatibility properties
    public bool EmailVerified => IsActive;
    public UserStatus Status => IsActive ? UserStatus.Active : UserStatus.Inactive;

    public void MarkEmailVerified()
    {
        // EmailVerified is currently simulated via IsActive for now.
    }
}
