using Postgrest.Attributes;
using Postgrest.Models;
using SmartGym.Domain.Entities;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

[Table("branches")]
public class BranchModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("branch_code")]
    public string BranchCode { get; set; } = "";

    [Column("branch_name")]
    public string BranchName { get; set; } = "";

    [Column("address")]
    public string Address { get; set; } = "";

    [Column("phone_number")]
    public string PhoneNumber { get; set; } = "";

    [Column("is_active")]
    public bool IsActive { get; set; }

    public Branch ToDomain() => new Branch(Id, BranchCode, BranchName, Address, PhoneNumber, IsActive);
}
