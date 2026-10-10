namespace SmartGym.Domain.Enums;

public enum PackageStatus
{
    Active,
    Inactive,
    Frozen,
    Expired,
    Suspended
}

public enum AccessHours
{
    All,
    OffPeak
}

public enum CheckInResult
{
    Approved,
    Denied
}
