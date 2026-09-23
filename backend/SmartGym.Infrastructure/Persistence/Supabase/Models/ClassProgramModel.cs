using Postgrest.Attributes;
using Postgrest.Models;
using SmartGym.Domain.Entities;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

[Table("class_programs")]
public class ClassProgramModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("program_name")]
    public string ProgramName { get; set; } = "";

    [Column("difficulty_level")]
    public string DifficultyLevel { get; set; } = "";

    [Column("standard_duration_minutes")]
    public int StandardDurationMinutes { get; set; }

    public ClassProgram ToDomain() => new ClassProgram(Id, ProgramName, DifficultyLevel, StandardDurationMinutes);
}
