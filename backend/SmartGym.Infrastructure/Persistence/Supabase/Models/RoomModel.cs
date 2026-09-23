using Postgrest.Attributes;
using Postgrest.Models;
using SmartGym.Domain.Entities;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

[Table("rooms")]
public class RoomModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("branch_id")]
    public Guid BranchId { get; set; }

    [Column("room_name")]
    public string RoomName { get; set; } = "";

    [Column("capacity")]
    public int Capacity { get; set; }

    [Column("is_under_maintenance")]
    public bool IsUnderMaintenance { get; set; }

    public Room ToDomain() => new Room(Id, BranchId, RoomName, Capacity, IsUnderMaintenance);
}
