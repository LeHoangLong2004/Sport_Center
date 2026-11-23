using SmartGym.Application.Common;
using SmartGym.Domain.Entities;
using Xunit;

namespace SmartGym.Tests;

public sealed class Flow2FacilityCapacityTests
{
    [Fact]
    public void Shared_room_allows_second_class_when_both_limits_are_satisfied()
    {
        var settings = new FacilitySchedulingSettings(
            AllowConcurrentClasses: true,
            MaxConcurrentClasses: 2,
            TotalCapacity: 30);

        var error = FacilityConflictValidator.Validate(
            settings,
            requestedCapacity: 12,
            overlappingClassCount: 1,
            overlappingCapacity: 18);

        Assert.Null(error);
    }

    [Fact]
    public void Shared_room_blocks_third_class_even_when_total_capacity_would_allow_it()
    {
        var settings = new FacilitySchedulingSettings(true, MaxConcurrentClasses: 2, TotalCapacity: 30);

        var error = FacilityConflictValidator.Validate(
            settings,
            requestedCapacity: 4,
            overlappingClassCount: 2,
            overlappingCapacity: 18);

        Assert.Contains("giới hạn 2 lớp", error);
    }

    [Fact]
    public void Shared_room_blocks_when_combined_class_capacities_exceed_total_capacity()
    {
        var settings = new FacilitySchedulingSettings(true, MaxConcurrentClasses: 2, TotalCapacity: 30);

        var error = FacilityConflictValidator.Validate(
            settings,
            requestedCapacity: 13,
            overlappingClassCount: 1,
            overlappingCapacity: 18);

        Assert.Contains("Tổng sĩ số", error);
    }

    [Fact]
    public void Non_shared_room_blocks_any_overlapping_class()
    {
        var settings = new FacilitySchedulingSettings(false, MaxConcurrentClasses: 3, TotalCapacity: 30);

        var error = FacilityConflictValidator.Validate(
            settings,
            requestedCapacity: 5,
            overlappingClassCount: 1,
            overlappingCapacity: 10,
            firstConflictName: "Lớp Yoga");

        Assert.Contains("Lớp Yoga", error);
    }

    [Fact]
    public void Room_rejects_a_single_class_larger_than_its_total_capacity()
    {
        var settings = new FacilitySchedulingSettings(true, MaxConcurrentClasses: 2, TotalCapacity: 30);

        var error = FacilityConflictValidator.Validate(
            settings,
            requestedCapacity: 31,
            overlappingClassCount: 0,
            overlappingCapacity: 0);

        Assert.Contains("vượt quá tổng sức chứa", error);
    }
}
