using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Api.Endpoints;

public static class AppointmentEndpoints
{
    public static void MapAppointmentEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/appointments").WithTags("Appointments");

        group.MapGet("", async (global::Supabase.Client supabase) =>
        {
            var response = await supabase
                .From<AppointmentModel>()
                .Get();

            var appointments = response.Models
                .OrderBy(a => a.Time)
                .Select(a => new
                {
                    id = a.Id,
                    time = a.Time,
                    title = a.Title,
                    customerName = a.CustomerName,
                    coachName = a.CoachName,
                    status = a.Status,
                });

            return Results.Ok(appointments);
        });

        group.MapPost("", async (
            CreateAppointmentRequest request,
            global::Supabase.Client supabase) =>
        {
            if (string.IsNullOrWhiteSpace(request.Time)
                || string.IsNullOrWhiteSpace(request.Title)
                || string.IsNullOrWhiteSpace(request.CustomerName))
            {
                return Results.BadRequest(new
                {
                    message = "Thời gian, tên lịch hẹn và tên khách hàng là bắt buộc.",
                });
            }

            var appointment = new AppointmentModel
            {
                Id = Guid.NewGuid(),
                Time = request.Time.Trim(),
                Title = request.Title.Trim(),
                CustomerName = request.CustomerName.Trim(),
                CoachName = string.IsNullOrWhiteSpace(request.CoachName)
                    ? null
                    : request.CoachName.Trim(),
                Status = "Đang chờ khách",
            };

            await supabase
                .From<AppointmentModel>()
                .Insert(appointment);

            return Results.Created(
                $"/api/appointments/{appointment.Id}",
                new
                {
                    id = appointment.Id,
                    time = appointment.Time,
                    title = appointment.Title,
                    customerName = appointment.CustomerName,
                    coachName = appointment.CoachName,
                    status = appointment.Status,
                });
        });
    }

    public sealed record CreateAppointmentRequest(
        string Time,
        string Title,
        string CustomerName,
        string? CoachName);
}
