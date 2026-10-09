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

    private Branch() { }

    public Guid Id { get; private set; }
    public string BranchCode { get; private set; }
    public string BranchName { get; private set; }
    public string Address { get; private set; }
    public string PhoneNumber { get; private set; }
    public bool IsActive { get; private set; }
}
