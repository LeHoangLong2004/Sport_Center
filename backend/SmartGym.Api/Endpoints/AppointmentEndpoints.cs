using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using SmartGym.Application.Interfaces.Repositories;
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
            global::Supabase.Client supabase,
            IGroupClassRepository classRepository) =>
        {
            if (string.IsNullOrWhiteSpace(request.Time)
                || string.IsNullOrWhiteSpace(request.Title)
                || string.IsNullOrWhiteSpace(request.CustomerName)
                || string.IsNullOrWhiteSpace(request.CoachName))
            {
                return Results.BadRequest(new
                {
                    message = "Thời gian, tên lịch hẹn, tên khách hàng và tên Coach là bắt buộc.",
                });
            }

            var coachName = request.CoachName.Trim();
            var users = await supabase.From<UserModel>().Get();
            var coaches = await supabase.From<CoachModel>().Get();
            var matchedCoach = users.Models.FirstOrDefault(user =>
                user.IsActive
                && NamesMatch(user.FullName, coachName)
                && (IsCoachRole(user.Role)
                    || coaches.Models.Any(coach =>
                        coach.UserId == user.Id && coach.IsActive)));

            if (matchedCoach is null)
            {
                return Results.BadRequest(new
                {
                    message = $"Coach '{coachName}' không tồn tại hoặc không còn hoạt động tại trung tâm."
                });
            }

            var appointment = new AppointmentModel
            {
                Id = Guid.NewGuid(),
                Time = request.Time.Trim(),
                Title = request.Title.Trim(),
                CustomerName = request.CustomerName.Trim(),
                // Keep the canonical name from users instead of the abbreviated input.
                CoachName = matchedCoach.FullName.Trim(),
                Status = "Đang chờ khách",
            };

            await supabase
                .From<AppointmentModel>()
                .Insert(appointment);

            await classRepository.NotifyCoachAsync(
                matchedCoach.Id,
                "Bạn có lịch hẹn mới",
                $"{appointment.CustomerName} đã đặt lịch hẹn {appointment.Title} vào {appointment.Time}.",
                "appointment",
                appointment.Id
            );

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

    private static bool IsCoachRole(string? role)
    {
        var normalized = role?.Trim().ToLowerInvariant();
        return normalized is "coach" or "trainer" or "huấn luyện viên" or "huan_luyen_vien";
    }

    private static bool NamesMatch(string? storedName, string inputName)
    {
        var stored = NormalizeCoachName(storedName);
        var input = NormalizeCoachName(inputName);
        return stored.Length > 0
            && string.Equals(stored, input, StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizeCoachName(string? name)
    {
        var normalized = name?.Trim() ?? string.Empty;
        var prefixes = new[] { "huấn luyện viên ", "huan luyen vien ", "coach ", "hlv ", "trainer " };

        foreach (var prefix in prefixes)
        {
            if (normalized.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                return normalized[prefix.Length..].Trim();
            }
        }

        return normalized;
    }

    public sealed record CreateAppointmentRequest(
        string Time,
        string Title,
        string CustomerName,
        string? CoachName);
}
