namespace SmartGym.Domain.Entities;

public sealed class Room
{
    public Room(Guid id, Guid branchId, string roomName, int capacity, bool isUnderMaintenance)
    {
        Id = id;
        BranchId = branchId;
        RoomName = roomName;
        Capacity = capacity;
        IsUnderMaintenance = isUnderMaintenance;
    }

    public Guid Id { get; }
    public Guid BranchId { get; }
    public string RoomName { get; }
    public int Capacity { get; }
    public bool IsUnderMaintenance { get; }
}
