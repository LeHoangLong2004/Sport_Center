using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Common;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Models;
using SmartGym.Infrastructure.Persistence.Supabase.Repositories;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Endpoint quản lý Lịch hẹn Huấn luyện viên cá nhân (1-on-1 PT Appointments).
/// Hỗ trợ: Xem danh sách lịch hẹn, đặt lịch hẹn mới kèm kiểm tra xung đột lịch và tự động đồng bộ sang lớp 1-kèm-1,
/// cập nhật trạng thái (Xác nhận, Hoàn thành, Hủy) và xóa lịch hẹn.
/// </summary>
public static partial class AppointmentEndpoints
{
    /// <summary>
    /// Đăng ký các route lịch hẹn vào ứng dụng.
    /// Nhóm route gốc: /api/appointments
    /// </summary>
    /// <param name="app">Đối tượng WebApplication để định tuyến</param>
    public static void MapAppointmentEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/appointments").WithTags("Appointments");

        /// <summary>
        /// GET /api/appointments
        /// Lấy danh sách lịch hẹn PT, hỗ trợ lọc theo tên Huấn luyện viên (coach) hoặc tên Hội viên (member).
        /// </summary>
        group.MapGet("", async (
            string? coach,
            string? member,
            global::Supabase.Client supabase) =>
        {
            var response = await supabase
                .From<AppointmentModel>()
                .Get();

            var query = response.Models.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(coach))
            {
                query = query.Where(a => NamesMatch(a.CoachName, coach));
            }

            if (!string.IsNullOrWhiteSpace(member))
            {
                var cleanMember = member.Trim();
                query = query.Where(a =>
                    (!string.IsNullOrWhiteSpace(a.CustomerName)
                     && a.CustomerName.Contains(cleanMember, StringComparison.OrdinalIgnoreCase)));
            }

            var appointments = query
                .OrderBy(a => a.Date)
                .ThenBy(a => a.Time)
                .Select(a => new
                {
                    id = a.Id,
                    date = a.Date ?? "",
                    time = a.Time,
                    title = a.Title,
                    customerName = a.CustomerName,
                    coachName = a.CoachName,
                    status = a.Status,
                });

            return Results.Ok(appointments);
        });

        /// <summary>
        /// POST /api/appointments
        /// Tạo mới lịch hẹn PT (1-kèm-1).
        /// - Kiểm tra ràng buộc thời gian, tên khách hàng và huấn luyện viên.
        /// - Tự động tạo bản ghi lớp học cá nhân tương ứng trong cơ sở dữ liệu để đồng bộ lịch dạy.
        /// </summary>
        group.MapPost("", async (
            CreateAppointmentRequest request,
            global::Supabase.Client supabase,
            IGroupClassRepository classRepository,
            SmartGymDbContext db) =>
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

            var normalizedTime = request.Time.Trim();
            var normalizedDate = string.IsNullOrWhiteSpace(request.Date)
                ? DateTime.UtcNow.AddHours(7).ToString("yyyy-MM-dd")
                : request.Date.Trim();

            var coachKey = coaches.Models.FirstOrDefault(c => c.UserId == matchedCoach.Id)?.Id;

            // Kiểm tra toàn diện xung đột lịch (Coach bận lớp/PT, Member bận lớp/PT, giờ quá khứ)
            var conflictError = await CheckAppointmentConflictsAsync(
                db,
                supabase,
                users.Models,
                normalizedDate,
                normalizedTime,
                matchedCoach,
                coachKey,
                request.CustomerName);

            if (!string.IsNullOrEmpty(conflictError))
            {
                return Results.Conflict(new { message = conflictError });
            }

            var appointment = new AppointmentModel
            {
                Id = Guid.NewGuid(),
                Date = normalizedDate,
                Time = request.Time.Trim(),
                Title = request.Title.Trim(),
                CustomerName = request.CustomerName.Trim(),
                CoachName = matchedCoach.FullName.Trim(),
                Status = "Đang chờ khách",
            };

            await supabase
                .From<AppointmentModel>()
                .Insert(appointment);

            await classRepository.NotifyCoachAsync(
                matchedCoach.Id,
                "Bạn có lịch hẹn mới",
                $"{appointment.CustomerName} đã đặt lịch hẹn {appointment.Title} vào {appointment.Time} ({appointment.Date}).",
                "appointment",
                appointment.Id
            );

            return Results.Created(
                $"/api/appointments/{appointment.Id}",
                new
                {
                    id = appointment.Id,
                    date = appointment.Date,
                    time = appointment.Time,
                    title = appointment.Title,
                    customerName = appointment.CustomerName,
                    coachName = appointment.CoachName,
                    status = appointment.Status,
                });
        });

        /// <summary>
        /// PUT /api/appointments/{id}/status
        /// Cập nhật trạng thái lịch hẹn (Confirmed, Cancelled, Completed, Pending...).
        /// Nếu khôi phục trạng thái hoạt động: Tự động kiểm tra xung đột thời gian với lịch dạy của HLV.
        /// </summary>
        group.MapPut("/{id:guid}/status", async (
            Guid id,
            UpdateAppointmentStatusRequest request,
            global::Supabase.Client supabase,
            SmartGymDbContext db) =>
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
            // Nếu khôi phục về trạng thái hoạt động -> kiểm tra xung đột lại
            if (IsActiveAppointment(newStatus)
                && !string.IsNullOrWhiteSpace(appointment.CoachName)
                && !string.IsNullOrWhiteSpace(appointment.Time))
            {
                var users = await supabase.From<UserModel>().Get();
                var coaches = await supabase.From<CoachModel>().Get();
                var matchedCoach = users.Models.FirstOrDefault(user =>
                    user.IsActive && NamesMatch(user.FullName, appointment.CoachName));

                if (matchedCoach != null)
                {
                    var coachKey = coaches.Models.FirstOrDefault(c => c.UserId == matchedCoach.Id)?.Id;
                    var apptDate = string.IsNullOrWhiteSpace(appointment.Date)
                        ? DateTime.UtcNow.AddHours(7).ToString("yyyy-MM-dd")
                        : appointment.Date.Trim();

                    var conflictError = await CheckAppointmentConflictsAsync(
                        db,
                        supabase,
                        users.Models,
                        apptDate,
                        appointment.Time.Trim(),
                        matchedCoach,
                        coachKey,
                        appointment.CustomerName,
                        excludeAppointmentId: appointment.Id);

                    if (!string.IsNullOrEmpty(conflictError))
                    {
                        return Results.Conflict(new
                        {
                            message = $"Không thể khôi phục lịch hẹn: {conflictError}"
                        });
                    }
                }
            }

            appointment.Status = newStatus;
            await supabase
                .From<AppointmentModel>()
                .Update(appointment);

            return Results.Ok(new
            {
                id = appointment.Id,
                date = appointment.Date ?? "",
                time = appointment.Time,
                title = appointment.Title,
                customerName = appointment.CustomerName,
                coachName = appointment.CoachName,
                status = appointment.Status,
            });
        });

        /// <summary>
        /// DELETE /api/appointments/{id}
        /// Xóa bản ghi lịch hẹn khỏi hệ thống cơ sở dữ liệu Supabase.
        /// </summary>
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
}
