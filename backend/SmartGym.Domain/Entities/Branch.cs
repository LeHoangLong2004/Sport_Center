namespace SmartGym.Domain.Entities;

public sealed class Branch
{
    public Branch(Guid id, string branchCode, string branchName, string address, string phoneNumber, bool isActive)
    {
        Id = id;
        BranchCode = branchCode;
        BranchName = branchName;
        Address = address;
        PhoneNumber = phoneNumber;
        IsActive = isActive;
    }

    public Guid Id { get; }
    public string BranchCode { get; }
    public string BranchName { get; }
    public string Address { get; }
    public string PhoneNumber { get; }
    public bool IsActive { get; }
}
