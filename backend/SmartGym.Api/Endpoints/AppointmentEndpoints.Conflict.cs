using System;
using System.Collections.Generic;
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
    private static async Task<string?> CheckAppointmentConflictsAsync(
        SmartGymDbContext db,
        global::Supabase.Client supabase,
        List<UserModel> allUsers,
        string normalizedDate,
        string normalizedTime,
        UserModel matchedCoach,
        Guid? coachKey,
        string customerRaw,
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
            apptEndUtc = apptStartUtc.AddMinutes(60);
        }
        else
        {
            apptStartUtc = DateTime.UtcNow;
            apptEndUtc = apptStartUtc.AddMinutes(60);
        }

        var dayStartUtc = apptStartUtc.Date.AddDays(-1);
        var dayEndUtc = apptStartUtc.Date.AddDays(2);

        // 2. Kiểm tra trùng lịch hẹn tiếp đón khác của Coach
        var existingAppointments = await supabase.From<AppointmentModel>().Get();
        if (existingAppointments.Models.Any(existing =>
            existing.Id != (excludeAppointmentId ?? Guid.Empty)
            && IsActiveAppointment(existing.Status)
            && string.Equals(existing.Time?.Trim(), normalizedTime, StringComparison.OrdinalIgnoreCase)
            && (string.IsNullOrWhiteSpace(existing.Date) || string.Equals(existing.Date?.Trim(), normalizedDate, StringComparison.OrdinalIgnoreCase))
            && NamesMatch(existing.CoachName, matchedCoach.FullName)))
        {
            return $"Coach '{matchedCoach.FullName}' đã có lịch hẹn tiếp đón khác vào {normalizedTime} ({normalizedDate}).";
        }

        // 3. Kiểm tra Coach có lớp dạy nhóm (Group Class) trùng giờ
        try
        {
            var coachClasses = await db.Database.SqlQueryRaw<ClassSqlRawModel>(
                @"SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status, approval_status
                  FROM classes
                  WHERE (coach_id = {0} OR coach_id = {1})
                    AND status = true
                    AND approval_status = 'approved'
                    AND schedule_time >= {2} AND schedule_time <= {3}",
                matchedCoach.Id,
                coachKey ?? matchedCoach.Id,
                dayStartUtc,
                dayEndUtc
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
        }

        // 4. Kiểm tra Coach có ca dạy kèm PT 1-1 (availability slots đã booked)
        try
        {
            var coachPtSlots = await db.Database.SqlQueryRaw<CoachAvailabilitySlotConflictModel>(
                @"SELECT id, coach_id, start_time, end_time, status, booked_member_name
                  FROM coach_availability_slots
                  WHERE (coach_id = {0} OR coach_id = {1})
                    AND status = 'booked'
                    AND start_time >= {2} AND start_time <= {3}",
                matchedCoach.Id,
                coachKey ?? matchedCoach.Id,
                dayStartUtc,
                dayEndUtc
            ).ToListAsync();

            var conflictingPt = coachPtSlots.FirstOrDefault(s =>
                apptStartUtc < s.EndTime && s.StartTime < apptEndUtc
            );

            if (conflictingPt != null)
            {
                var localStart = CenterTime.ToLocal(conflictingPt.StartTime);
                var localEnd = CenterTime.ToLocal(conflictingPt.EndTime);
                var memberInfo = string.IsNullOrWhiteSpace(conflictingPt.BookedMemberName) ? "" : $" với học viên {conflictingPt.BookedMemberName}";
                return $"Coach '{matchedCoach.FullName}' đã có ca dạy kèm PT 1-1{memberInfo} từ {localStart:HH:mm} đến {localEnd:HH:mm} ngày {normalizedDate}.";
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ConflictCheck] Coach PT slot check warning: {ex.Message}");
        }

        // 5. Kiểm tra trùng lịch của Hội viên / Khách hàng
        var (customerName, customerPhone) = ParseCustomerInfo(customerRaw);

        // 5a. Trùng với một lịch hẹn tiếp đón khác của chính khách hàng này
        if (!string.IsNullOrWhiteSpace(customerName) || !string.IsNullOrWhiteSpace(customerPhone))
        {
            var conflictAppt = existingAppointments.Models.FirstOrDefault(existing =>
                existing.Id != (excludeAppointmentId ?? Guid.Empty)
                && IsActiveAppointment(existing.Status)
                && string.Equals(existing.Time?.Trim(), normalizedTime, StringComparison.OrdinalIgnoreCase)
                && (string.IsNullOrWhiteSpace(existing.Date) || string.Equals(existing.Date?.Trim(), normalizedDate, StringComparison.OrdinalIgnoreCase))
                && IsAppointmentForCustomer(existing.CustomerName, customerName, customerPhone));

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
                var memberClasses = await db.Database.SqlQueryRaw<ClassSqlRawModel>(
                    @"SELECT c.id, c.sport_id, c.facility_id, c.coach_id, c.class_name, c.schedule_time, c.duration_minutes, c.capacity, c.current_enrolled, c.status, c.approval_status
                      FROM class_bookings b
                      INNER JOIN classes c ON c.id = b.class_id
                      WHERE b.user_id = {0}
                        AND LOWER(b.status) IN ('confirmed', 'pending', 'approved')
                        AND c.status = true
                        AND c.approval_status = 'approved'
                        AND c.schedule_time >= {1} AND c.schedule_time <= {2}",
                    matchedMemberUserId.Value,
                    dayStartUtc,
                    dayEndUtc
                ).ToListAsync();

                var conflictingMemberClass = memberClasses.FirstOrDefault(c =>
                {
                    var classStart = c.ScheduleTime;
                    var classEnd = classStart.AddMinutes(Math.Max(1, c.DurationMinutes));
                    return apptStartUtc < classEnd && classStart < apptEndUtc;
                });

                if (conflictingMemberClass != null)
                {
                    var localStart = CenterTime.ToLocal(conflictingMemberClass.ScheduleTime);
                    var localEnd = localStart.AddMinutes(conflictingMemberClass.DurationMinutes);
                    return $"Hội viên '{customerName}' đã có lịch tham gia lớp học '{conflictingMemberClass.ClassName}' từ {localStart:HH:mm} đến {localEnd:HH:mm} ngày {normalizedDate}.";
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ConflictCheck] Member class check warning: {ex.Message}");
            }

            // Kiểm tra ca tập PT 1-1 của Hội viên
            try
            {
                var memberPtSlots = await db.Database.SqlQueryRaw<CoachAvailabilitySlotConflictModel>(
                    @"SELECT id, coach_id, start_time, end_time, status, booked_member_name
                      FROM coach_availability_slots
                      WHERE booked_member_id = {0}
                        AND status = 'booked'
                        AND start_time >= {1} AND start_time <= {2}",
                    matchedMemberUserId.Value,
                    dayStartUtc,
                    dayEndUtc
                ).ToListAsync();

                var conflictingMemberPt = memberPtSlots.FirstOrDefault(s =>
                    apptStartUtc < s.EndTime && s.StartTime < apptEndUtc
                );

                if (conflictingMemberPt != null)
                {
                    var localStart = CenterTime.ToLocal(conflictingMemberPt.StartTime);
                    var localEnd = CenterTime.ToLocal(conflictingMemberPt.EndTime);
                    return $"Hội viên '{customerName}' đã có ca tập PT 1-1 từ {localStart:HH:mm} đến {localEnd:HH:mm} ngày {normalizedDate}.";
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ConflictCheck] Member PT check warning: {ex.Message}");
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
}

