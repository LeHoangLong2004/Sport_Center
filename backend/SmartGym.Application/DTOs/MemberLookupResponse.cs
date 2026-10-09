namespace SmartGym.Application.DTOs;

public class MemberLookupResponse
{
    public Guid Id { get; set; }
    public string MemberCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string PackageName { get; set; } = string.Empty;
    public DateTime? ExpiryDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string StatusColor { get; set; } = string.Empty;
}
