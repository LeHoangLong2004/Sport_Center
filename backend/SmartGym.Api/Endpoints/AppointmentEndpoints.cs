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

            var existingAppointments = await supabase.From<AppointmentModel>().Get();
            var normalizedTime = request.Time.Trim();
            if (existingAppointments.Models.Any(existing =>
                IsActiveAppointment(existing.Status)
                && string.Equals(existing.Time?.Trim(), normalizedTime, StringComparison.OrdinalIgnoreCase)
                && NamesMatch(existing.CoachName, matchedCoach.FullName)))
            {
                return Results.Conflict(new
                {
                    message = $"Coach '{matchedCoach.FullName}' đã có lịch hẹn khác vào {normalizedTime}."
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

        group.MapPut("/{id:guid}/status", async (
            Guid id,
            UpdateAppointmentStatusRequest request,
            global::Supabase.Client supabase) =>
        {
            if (string.IsNullOrWhiteSpace(request.Status))
            {
                return Results.BadRequest(new { message = "Trạng thái không hợp lệ." });
            }

            var response = await supabase
                .From<AppointmentModel>()
                .Where(a => a.Id == id)
                .Get();

            var appointment = response.Models.FirstOrDefault();
            if (appointment is null)
            {
                return Results.NotFound(new { message = "Không tìm thấy lịch hẹn." });
            }

            var newStatus = request.Status.Trim();
            // If restoring back to an active state, ensure the coach doesn't have a double-booking conflict
            if (IsActiveAppointment(newStatus)
                && !string.IsNullOrWhiteSpace(appointment.CoachName)
                && !string.IsNullOrWhiteSpace(appointment.Time))
            {
                var existingAppointments = await supabase.From<AppointmentModel>().Get();
                var normalizedTime = appointment.Time.Trim();
                if (existingAppointments.Models.Any(existing =>
                    existing.Id != appointment.Id
                    && IsActiveAppointment(existing.Status)
                    && string.Equals(existing.Time?.Trim(), normalizedTime, StringComparison.OrdinalIgnoreCase)
                    && NamesMatch(existing.CoachName, appointment.CoachName)))
                {
                    return Results.Conflict(new
                    {
                        message = $"HLV '{appointment.CoachName}' đã có lịch hẹn khác vào lúc {normalizedTime}. Không thể khôi phục lịch này."
                    });
                }
            }

            appointment.Status = newStatus;
            await supabase
                .From<AppointmentModel>()
                .Update(appointment);

            return Results.Ok(new
            {
                id = appointment.Id,
                time = appointment.Time,
                title = appointment.Title,
                customerName = appointment.CustomerName,
                coachName = appointment.CoachName,
                status = appointment.Status,
            });
        });

        group.MapDelete("/{id:guid}", async (
            Guid id,
            global::Supabase.Client supabase) =>
        {
            await supabase
                .From<AppointmentModel>()
                .Where(a => a.Id == id)
                .Delete();

            return Results.NoContent();
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

    private static bool IsActiveAppointment(string? status)
    {
        var normalized = status?.Trim().ToLowerInvariant();
        return normalized is not "đã hủy" and not "đã hoàn tất" and not "cancelled" and not "completed";
    }

    public sealed record CreateAppointmentRequest(
        string Time,
        string Title,
        string CustomerName,
        string? CoachName);

    public sealed record UpdateAppointmentStatusRequest(string Status);
}
