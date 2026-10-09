namespace SmartGym.Application.DTOs;

public class AppointmentDto
{
    public Guid Id { get; set; }
    public string Time { get; set; } = "";
    public string Title { get; set; } = "";
    public string CustomerName { get; set; } = "";
    public string CoachName { get; set; } = "";
    public string Status { get; set; } = "Đang chờ khách";
}
