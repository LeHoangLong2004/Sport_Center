using System;

namespace SmartGym.Api.Endpoints;

public static partial class AppointmentEndpoints
{
    public sealed record CreateAppointmentRequest(
        string? Date,
        string Time,
        string Title,
        string CustomerName,
        string? CoachName,
        int? DurationMinutes = null,
        string? Location = null);

    public sealed record UpdateAppointmentStatusRequest(string Status);

    public sealed record CoachAppointmentResponseRequest(string Response);

}

