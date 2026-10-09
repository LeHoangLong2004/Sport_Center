using Postgrest.Attributes;
using Postgrest.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

[Table("appointments")]
public class AppointmentModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("time")]
    public string Time { get; set; } = "";

    [Column("title")]
    public string Title { get; set; } = "";

    [Column("customer_name")]
    public string CustomerName { get; set; } = "";

    [Column("coach_name")]
    public string CoachName { get; set; } = "";

    [Column("status")]
    public string Status { get; set; } = "Đang chờ khách"; // Đã hoàn tất, Đang chờ khách, Đã hủy
}
