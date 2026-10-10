namespace SmartGym.Domain.Entities;

public sealed class ClassProgram
{
    public ClassProgram(Guid id, string programName, string difficultyLevel, int standardDurationMinutes)
    {
        Id = id;
        ProgramName = programName;
        DifficultyLevel = difficultyLevel;
        StandardDurationMinutes = standardDurationMinutes;
    }

    public Guid Id { get; }
    public string ProgramName { get; }
    public string DifficultyLevel { get; }
    public int StandardDurationMinutes { get; }
}
