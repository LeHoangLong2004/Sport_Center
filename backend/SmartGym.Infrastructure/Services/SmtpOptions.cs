namespace SmartGym.Infrastructure.Services;

public class SmtpOptions
{
    public const string SectionName = "Smtp";

    public string? Host { get; set; }
    public int Port { get; set; } = 587;
    public string? User { get; set; }
    public string? Password { get; set; }
    public string From { get; set; } = "no-reply@smartgym.vn";
    public string? FromName { get; set; } = "SmartGym Center";
    public bool EnableSsl { get; set; } = true;
}