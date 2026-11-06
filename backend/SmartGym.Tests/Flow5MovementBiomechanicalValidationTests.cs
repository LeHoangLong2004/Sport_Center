using System;
using System.Linq;
using SmartGym.Tests.Fixtures;
using Xunit;

namespace SmartGym.Tests;

public class Flow5MovementBiomechanicalValidationTests
{
    [Fact]
    public void Catalog_ShouldContainExpectedNumberOfMovementProfiles()
    {
        var catalog = SmartGymExerciseMovementFixtures.DetailedMovementCatalog;
        Assert.NotNull(catalog);
        Assert.True(catalog.Count >= 100, $"Expected at least 100 movements, but found {catalog.Count}");
    }

    [Fact]
    public void AllMovements_ShouldHaveUniqueCodes()
    {
        var catalog = SmartGymExerciseMovementFixtures.DetailedMovementCatalog;
        var duplicates = catalog.GroupBy(m => m.Code).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
        Assert.Empty(duplicates);
    }

    [Theory]
    [InlineData("Chest")]
    [InlineData("Back")]
    [InlineData("Legs")]
    [InlineData("Shoulders")]
    [InlineData("Arms")]
    [InlineData("Core")]
    [InlineData("Cardio")]
    public void Catalog_ShouldCoverMajorMovementCategories(string category)
    {
        var catalog = SmartGymExerciseMovementFixtures.DetailedMovementCatalog;
        var exists = catalog.Any(m => m.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
        Assert.True(exists, $"Category '{category}' must be represented in movement catalog.");
    }

    [Fact]
    public void AllMovements_MustHaveSafePrescribedRestIntervals()
    {
        var catalog = SmartGymExerciseMovementFixtures.DetailedMovementCatalog;
        foreach (var m in catalog)
        {
            Assert.InRange(m.RestSeconds, 30, 300);
        }
    }

    [Fact]
    public void AllMovements_MustIncludeSafetyWarningsAndBreathingProtocols()
    {
        var catalog = SmartGymExerciseMovementFixtures.DetailedMovementCatalog;
        foreach (var m in catalog)
        {
            Assert.False(string.IsNullOrWhiteSpace(m.SafetyWarning), $"Movement {m.Code} missing safety warning");
            Assert.False(string.IsNullOrWhiteSpace(m.BreathingProtocol), $"Movement {m.Code} missing breathing protocol");
            Assert.False(string.IsNullOrWhiteSpace(m.SetupCue), $"Movement {m.Code} missing setup cue");
            Assert.False(string.IsNullOrWhiteSpace(m.ExecutionCue), $"Movement {m.Code} missing execution cue");
        }
    }

    [Fact]
    public void AllMovements_MustHavePositiveMetabolicEquivalents()
    {
        var catalog = SmartGymExerciseMovementFixtures.DetailedMovementCatalog;
        foreach (var m in catalog)
        {
            Assert.True(m.MetabolicEquivalent > 0, $"Movement {m.Code} has invalid MET value");
        }
    }

    [Fact]
    public void AllMovements_WorkingSetsShouldBeWithinHypertrophyStrengthBounds()
    {
        var catalog = SmartGymExerciseMovementFixtures.DetailedMovementCatalog;
        foreach (var m in catalog)
        {
            Assert.InRange(m.WorkingSets, 1, 10);
            Assert.InRange(m.WarmupSets, 1, 5);
        }
    }

    [Theory]
    [InlineData("Horizontal Push")]
    [InlineData("Vertical Push")]
    [InlineData("Horizontal Pull")]
    [InlineData("Vertical Pull")]
    [InlineData("Squat")]
    [InlineData("Hinge")]
    public void Catalog_ShouldIncludeFunctionalKineticPatterns(string pattern)
    {
        var catalog = SmartGymExerciseMovementFixtures.DetailedMovementCatalog;
        var count = catalog.Count(m => m.MovementPattern.Equals(pattern, StringComparison.OrdinalIgnoreCase));
        Assert.True(count > 0, $"Pattern '{pattern}' should have at least 1 exercise registered.");
    }
}
