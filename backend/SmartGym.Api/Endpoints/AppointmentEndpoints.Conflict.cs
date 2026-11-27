using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Common;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Models;
using SmartGym.Infrastructure.Persistence.Supabase.Repositories;

namespace SmartGym.Api.Endpoints;

public static partial class AppointmentEndpoints
{
    private static async Task<long> ExecuteConflictCountAsync(
        SmartGymDbContext db,
        string sql,
        params (string Name, object Value)[] parameters)
    {
        var connection = db.Database.GetDbConnection();
        var openedHere = connection.State != ConnectionState.Open;
        if (openedHere) await connection.OpenAsync();

        try
        {
            await using var command = connection.CreateCommand();
            command.CommandText = sql;
            foreach (var (name, value) in parameters)
            {
                var parameter = command.CreateParameter();
                parameter.ParameterName = name;
                parameter.Value = value;
                command.Parameters.Add(parameter);
            }

            var result = await command.ExecuteScalarAsync();
            return Convert.ToInt64(result, CultureInfo.InvariantCulture);
        }
        finally
        {
            if (openedHere) await connection.CloseAsync();
        }
    }

    private static async Task<string?> CheckAppointmentConflictsAsync(
        SmartGymDbContext db,
        global::Supabase.Client supabase,
        List<UserModel> allUsers,
        string normalizedDate,
        string normalizedTime,
        UserModel matchedCoach,
        Guid? coachKey,
        string customerRaw,
        int durationMinutes,
        Guid? excludeAppointmentId = null)
    {
        // 1. Kiểm tra khung giờ quá khứ
        var vnNow = DateTime.UtcNow.AddHours(7);
        if (DateTime.TryParse(normalizedDate, out var parsedDate))
        {
            if (parsedDate.Date < vnNow.Date)
            {
                return "Không thể đặt lịch hẹn vào ngày trong quá khứ.";
            }

            if (parsedDate.Date == vnNow.Date)
            {
                var timeParts = normalizedTime.Split(':');
                if (timeParts.Length >= 2 && int.TryParse(timeParts[0], out var h) && int.TryParse(timeParts[1], out var m))
                {
                    var apptTimeToday = vnNow.Date.AddHours(h).AddMinutes(m);
                    if (apptTimeToday < vnNow.AddMinutes(-5))
                    {
                        return $"Khung giờ {normalizedTime} hôm nay ({normalizedDate}) đã trôi qua. Vui lòng chọn khung giờ khác.";
                    }
                }
            }
        }

        // Tính khoảng thời gian UTC cho buổi hẹn (mặc định 60 phút)
        DateTime apptStartUtc;
        DateTime apptEndUtc;
        if (DateTime.TryParse($"{normalizedDate} {normalizedTime}", out var localApptStart))
        {
            // localApptStart ở múi giờ VN (UTC+7) -> đổi về UTC
            apptStartUtc = localApptStart.AddHours(-7);
            apptEndUtc = apptStartUtc.AddMinutes(Math.Max(1, durationMinutes));
        }
        else
        {
            apptStartUtc = DateTime.UtcNow;
            apptEndUtc = apptStartUtc.AddMinutes(60);
        }

        // 2. Kiểm tra trùng lịch hẹn tiếp đón khác của Coach
        var existingAppointments = await supabase.From<AppointmentModel>().Get();
        if (existingAppointments.Models.Any(existing =>
            existing.Id != (excludeAppointmentId ?? Guid.Empty)
            && NamesMatch(existing.CoachName, matchedCoach.FullName)
            && AppointmentOverlaps(existing, normalizedDate, apptStartUtc, apptEndUtc)))
        {
            return $"Coach '{matchedCoach.FullName}' đã có lịch hẹn tiếp đón khác vào {normalizedTime} ({normalizedDate}).";
        }

        // 3. Kiểm tra Coach có lớp dạy nhóm (Group Class) trùng giờ
        try
        {
            var coachClasses = await db.Database.SqlQueryRaw<ClassSqlRawModel>(
                "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status, approval_status, parent_id, session_number, total_sessions, price_per_session_snapshot, course_fee_snapshot FROM classes WHERE (coach_id = {0} OR coach_id = {1}) AND (approval_status = 'approved' OR approval_status IS NULL) AND status = TRUE",
                coachKey ?? matchedCoach.Id,
                matchedCoach.Id
            ).ToListAsync();

            var conflictingClass = coachClasses.FirstOrDefault(c =>
            {
                var classStart = c.ScheduleTime;
                var classEnd = classStart.AddMinutes(Math.Max(1, c.DurationMinutes));
                return apptStartUtc < classEnd && classStart < apptEndUtc;
            });

            if (conflictingClass != null)
            {
                var localStart = CenterTime.ToLocal(conflictingClass.ScheduleTime);
                var localEnd = localStart.AddMinutes(conflictingClass.DurationMinutes);
                return $"Coach '{matchedCoach.FullName}' đang có lịch dạy lớp nhóm '{conflictingClass.ClassName}' từ {localStart:HH:mm} đến {localEnd:HH:mm} ngày {normalizedDate}.";
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ConflictCheck] Coach class check warning: {ex.Message}");
            return "Không thể kiểm tra lịch lớp của Coach nên hệ thống chưa xác nhận lịch này. Vui lòng thử lại sau.";
        }

        // 4. Kiểm tra Coach có ca dạy kèm PT 1-1 (availability slots đã booked)
        try
        {
            var coachPtConflictCount = await ExecuteConflictCountAsync(
                db,
                @"SELECT COUNT(*)
                  FROM coach_availability_slots
                  WHERE (coach_id = @coachProfileId OR coach_id = @coachUserId)
                    AND status = 'booked'
                    AND start_time < @appointmentEnd AND end_time > @appointmentStart",
                ("@coachProfileId", coachKey ?? matchedCoach.Id),
                ("@coachUserId", matchedCoach.Id),
                ("@appointmentEnd", apptEndUtc),
                ("@appointmentStart", apptStartUtc));

            if (coachPtConflictCount > 0)
            {
                return $"Coach '{matchedCoach.FullName}' đã có ca dạy kèm PT 1-1 trùng khung giờ {normalizedTime} ngày {normalizedDate}.";
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ConflictCheck] Coach PT slot check warning: {ex.Message}");
            return "Không thể kiểm tra ca PT của Coach nên hệ thống chưa xác nhận lịch này. Vui lòng thử lại sau.";
        }

        // 5. Kiểm tra trùng lịch của Hội viên / Khách hàng
        var (customerName, customerPhone) = ParseCustomerInfo(customerRaw);

        // 5a. Trùng với một lịch hẹn tiếp đón khác của chính khách hàng này
        if (!string.IsNullOrWhiteSpace(customerName) || !string.IsNullOrWhiteSpace(customerPhone))
        {
            var conflictAppt = existingAppointments.Models.FirstOrDefault(existing =>
                existing.Id != (excludeAppointmentId ?? Guid.Empty)
                && IsAppointmentForCustomer(existing.CustomerName, customerName, customerPhone)
                && AppointmentOverlaps(existing, normalizedDate, apptStartUtc, apptEndUtc));

            if (conflictAppt != null)
            {
                return $"Khách hàng '{customerName}' đã có một lịch hẹn tiếp đón khác vào lúc {normalizedTime} ngày {normalizedDate}.";
            }
        }

        // 5b. Nếu là Hội viên đã đăng ký tài khoản -> Kiểm tra lớp học và ca PT của Hội viên
        Guid? matchedMemberUserId = null;
        if (!string.IsNullOrWhiteSpace(customerPhone))
        {
            var cleanPhone = NormalizePhone(customerPhone);
            var matchedUser = allUsers.FirstOrDefault(u =>
                !string.IsNullOrWhiteSpace(u.PhoneNumber) && NormalizePhone(u.PhoneNumber) == cleanPhone);
            if (matchedUser != null) matchedMemberUserId = matchedUser.Id;
        }
        if (!matchedMemberUserId.HasValue && !string.IsNullOrWhiteSpace(customerName))
        {
            var matchedUser = allUsers.FirstOrDefault(u =>
                NamesMatch(u.FullName, customerName) && !IsCoachRole(u.Role));
            if (matchedUser != null) matchedMemberUserId = matchedUser.Id;
        }

        if (matchedMemberUserId.HasValue)
        {
            // Kiểm tra lớp nhóm Hội viên đã đặt chỗ
            try
            {
                var memberClassConflictCount = await ExecuteConflictCountAsync(
                    db,
                    @"SELECT COUNT(*)
                      FROM class_bookings b
                      INNER JOIN classes c ON c.id = b.class_id
                      WHERE b.user_id = @memberId
                        AND LOWER(COALESCE(b.status, '')) IN ('confirmed', 'pending', 'approved')
                        AND c.status = true
                        AND (c.approval_status = 'approved' OR c.approval_status IS NULL)
                        AND c.schedule_time < @appointmentEnd
                        AND c.schedule_time + (GREATEST(COALESCE(c.duration_minutes, 60), 1) * INTERVAL '1 minute') > @appointmentStart",
                    ("@memberId", matchedMemberUserId.Value),
                    ("@appointmentEnd", apptEndUtc),
                    ("@appointmentStart", apptStartUtc));

                if (memberClassConflictCount > 0)
                {
                    return $"Hội viên '{customerName}' đã đăng ký lớp học trùng khung giờ {normalizedTime} ngày {normalizedDate}.";
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ConflictCheck] Member class check warning: {ex.Message}");
                return "Không thể kiểm tra lịch lớp của học viên nên hệ thống chưa xác nhận lịch này. Vui lòng thử lại sau.";
            }

            // Kiểm tra ca tập PT 1-1 của Hội viên
            try
            {
                var memberPtConflictCount = await ExecuteConflictCountAsync(
                    db,
                    @"SELECT COUNT(*)
                      FROM coach_availability_slots
                      WHERE booked_member_id = @memberId
                        AND status = 'booked'
                        AND start_time < @appointmentEnd AND end_time > @appointmentStart",
                    ("@memberId", matchedMemberUserId.Value),
                    ("@appointmentEnd", apptEndUtc),
                    ("@appointmentStart", apptStartUtc));

                if (memberPtConflictCount > 0)
                {
                    return $"Hội viên '{customerName}' đã có ca tập PT 1-1 trùng khung giờ {normalizedTime} ngày {normalizedDate}.";
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ConflictCheck] Member PT check warning: {ex.Message}");
                return "Không thể kiểm tra ca PT của học viên nên hệ thống chưa xác nhận lịch này. Vui lòng thử lại sau.";
            }
        }

        return null; // Không có xung đột
    }

    private static (string Name, string Phone) ParseCustomerInfo(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return ("", "");
        var trimmed = raw.Trim();

        var matchParen = Regex.Match(trimmed, @"^(.*?)\s*\((0[0-9\s\.\-]{8,13})\)$");
        if (matchParen.Success)
        {
            return (matchParen.Groups[1].Value.Trim(), Regex.Replace(matchParen.Groups[2].Value, @"[\s\.\-]", ""));
        }

        var matchDash = Regex.Match(trimmed, @"^(.*?)\s*-\s*(0[0-9\s\.\-]{8,13})$");
        if (matchDash.Success)
        {
            return (matchDash.Groups[1].Value.Trim(), Regex.Replace(matchDash.Groups[2].Value, @"[\s\.\-]", ""));
        }

        return (trimmed, "");
    }

    private static bool IsAppointmentForCustomer(string? storedCustomerName, string targetName, string targetPhone)
    {
        if (string.IsNullOrWhiteSpace(storedCustomerName)) return false;
        var (sName, sPhone) = ParseCustomerInfo(storedCustomerName);

        if (!string.IsNullOrWhiteSpace(targetPhone) && !string.IsNullOrWhiteSpace(sPhone))
        {
            if (NormalizePhone(targetPhone) == NormalizePhone(sPhone)) return true;
        }

        if (!string.IsNullOrWhiteSpace(targetName) && !string.IsNullOrWhiteSpace(sName))
        {
            if (NamesMatch(sName, targetName)) return true;
        }

        return false;
    }

    private static string NormalizePhone(string? phone)
    {
        return Regex.Replace(phone ?? "", @"[\s\.\-\+]", "");
    }

    private static bool IsCoachRole(string? role)
    {
        var normalized = role?.Trim().ToLowerInvariant();
        return normalized is "coach" or "trainer" or "pt" or "huấn luyện viên" or "huan_luyen_vien";
    }

    private static bool IsManagerRole(string? role)
    {
        var normalized = role?.Trim().ToLowerInvariant().Replace(" ", "").Replace("-", "");
        return normalized is "admin" or "manager" or "center_manager" or "centermanager" or "quảnlý" or "quanly";
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
        return normalized is not "đã hủy" and not "coach từ chối" and not "đã từ chối"
            and not "cancelled" and not "completed" and not "rejected";
    }

    private static bool AppointmentOverlaps(
        AppointmentModel existing,
        string fallbackDate,
        DateTime requestedStartUtc,
        DateTime requestedEndUtc)
    {
        if (!IsActiveAppointment(existing.Status)) return false;
        var dateText = string.IsNullOrWhiteSpace(existing.Date) ? fallbackDate : existing.Date.Trim();
        var startText = existing.Time?.Split('-', 2)[0].Trim();
        if (!DateOnly.TryParseExact(dateText, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date)
            || !TimeOnly.TryParse(startText, CultureInfo.InvariantCulture, DateTimeStyles.None, out var startTime))
            return false;

        var localStart = date.ToDateTime(startTime);
        var localEnd = localStart.AddMinutes(Math.Max(1, existing.DurationMinutes));
        var rangeParts = existing.Time?.Split('-', 2, StringSplitOptions.TrimEntries);
        if (rangeParts is { Length: 2 }
            && TimeOnly.TryParse(rangeParts[1], CultureInfo.InvariantCulture, DateTimeStyles.None, out var explicitEnd))
        {
            localEnd = date.ToDateTime(explicitEnd);
            if (localEnd <= localStart) localEnd = localEnd.AddDays(1);
        }

        var existingStartUtc = DateTime.SpecifyKind(localStart.AddHours(-7), DateTimeKind.Utc);
        var existingEndUtc = DateTime.SpecifyKind(localEnd.AddHours(-7), DateTimeKind.Utc);
        return requestedStartUtc < existingEndUtc && existingStartUtc < requestedEndUtc;
    }
}

