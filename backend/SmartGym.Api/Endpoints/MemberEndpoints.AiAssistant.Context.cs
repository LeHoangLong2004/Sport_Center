using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints
{
    public static partial class MemberEndpoints
    {
        private static async Task<MemberAiContext> BuildMemberAiContextAsync(
            HttpContext httpContext,
            JsonElement body,
            SmartGymDbContext db,
            ILogger logger,
            CancellationToken ct)
        {
            var result = new MemberAiContext();
            var userIdStr = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);

            string? candEmail = null;
            string? candPhone = null;
            string? candName = null;
            string? candId = null;

            if (body.ValueKind == JsonValueKind.Object)
            {
                if (body.TryGetProperty("userEmail", out var ue) && ue.ValueKind == JsonValueKind.String) candEmail = ue.GetString()?.Trim();
                if (body.TryGetProperty("userPhone", out var up) && up.ValueKind == JsonValueKind.String) candPhone = up.GetString()?.Trim();
                if (body.TryGetProperty("userName", out var un) && un.ValueKind == JsonValueKind.String) candName = un.GetString()?.Trim();
                if (body.TryGetProperty("userId", out var ui) && ui.ValueKind == JsonValueKind.String) candId = ui.GetString()?.Trim();
            }

            Guid memberId = Guid.Empty;
            if (!string.IsNullOrEmpty(userIdStr) && Guid.TryParse(userIdStr, out var parsedGuid))
            {
                memberId = parsedGuid;
            }
            else if (!string.IsNullOrEmpty(candId) && Guid.TryParse(candId, out var parsedCandGuid))
            {
                memberId = parsedCandGuid;
            }

            SmartGym.Domain.Entities.User? user = null;
            try
            {
                if (memberId != Guid.Empty)
                {
                    user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == memberId, ct);
                }
                else if (!string.IsNullOrWhiteSpace(candEmail))
                {
                    user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == candEmail, ct);
                    if (user != null) memberId = user.Id;
                }
                else if (!string.IsNullOrWhiteSpace(candPhone))
                {
                    user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.PhoneNumber == candPhone, ct);
                    if (user != null) memberId = user.Id;
                }
            }
            catch (Exception ex)
            {
                logger.LogDebug(ex, "Flow 6: cannot query user in database.");
            }

            if (user != null)
            {
                result.UserId = user.Id.ToString();
                result.FullName = !string.IsNullOrWhiteSpace(user.FullName) ? user.FullName : (candName ?? result.FullName);
                result.TrainingGoal = user.TrainingGoal;
                result.TrainingLevel = user.TrainingLevel;
            }
            else if (!string.IsNullOrWhiteSpace(candName) || !string.IsNullOrWhiteSpace(candEmail))
            {
                result.FullName = candName ?? "Hội viên";
                result.UserId = candId ?? "demo-user";
            }

            var nowUtc = DateTime.UtcNow;
            var vi = CultureInfo.GetCultureInfo("vi-VN");
            var phone = user?.PhoneNumber ?? candPhone ?? string.Empty;

            if (memberId != Guid.Empty)
            {
                try
                {
                    var subs = await db.Subscriptions.AsNoTracking()
                        .Include(s => s.Package)
                        .Where(s => s.UserId == memberId
                                    && s.PaymentStatus == SmartGym.Domain.Enums.PaymentStatus.Completed
                                    && s.EndDate >= nowUtc)
                        .ToListAsync(ct);

                    var groupedSubs = subs
                        .GroupBy(s => s.Package?.Name ?? (s.PackageId switch
                        {
                            "membership-plus" => "Hạng Plus Member",
                            "membership-basic" => "Hạng Basic Member",
                            "membership-premium" => "Hạng Premium Member",
                            "sport-gym-coach" => "Gói Gym Kèm PT 1–1 Chuyên Sâu",
                            "sport-gym-self" => "Gói Gym tự tập",
                            "yoga_pack" => "Gói Tập Yoga",
                            _ => s.PackageId ?? "Gói tập"
                        }))
                        .Select(g => new
                        {
                            PackageName = g.Key,
                            MaxEndDate = g.Max(s => s.EndDate)
                        })
                        .OrderBy(x => x.MaxEndDate)
                        .Take(6);

                    foreach (var g in groupedSubs)
                    {
                        var daysLeft = Math.Max(0, (int)Math.Ceiling((g.MaxEndDate - nowUtc).TotalDays));
                        result.ActivePackages.Add($"{g.PackageName} — hết hạn {ToVn(g.MaxEndDate):dd/MM/yyyy} (còn {daysLeft} ngày)");
                    }
                }
                catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load subscriptions."); }
            }

            var upcomingSessions = new List<(DateTime LocalStart, string Text)>();
            var completedSessions = new List<(DateTime LocalStart, string Text)>();

            try
            {
                var classes = await db.Database.SqlQueryRaw<AiUpcomingClassRow>(
                    @"SELECT c.class_name AS ""ClassName"",
                             COALESCE(s.name, '') AS ""Sport"",
                             COALESCE(f.name, '') AS ""Room"",
                             c.schedule_time AS ""ScheduleTime"",
                             COALESCE(c.duration_minutes, 60) AS ""DurationMinutes"",
                             COALESCE(u.full_name, 'HLV Trung tâm') AS ""CoachName""
                      FROM class_bookings b
                      INNER JOIN classes c ON c.id = b.class_id
                      LEFT JOIN sports s ON s.id = c.sport_id
                      LEFT JOIN facilities f ON f.id = c.facility_id
                      LEFT JOIN coaches co ON co.id = c.coach_id
                      LEFT JOIN users u ON u.id = co.user_id
                      WHERE b.user_id = {0}
                        AND b.status NOT IN ('cancelled', 'rejected', 'class_cancelled')
                        AND c.schedule_time >= NOW()
                      ORDER BY c.schedule_time ASC
                      LIMIT 5", memberId).ToListAsync(ct);

                foreach (var c in classes)
                {
                    var start = ToVn(c.ScheduleTime);
                    var room = string.IsNullOrWhiteSpace(c.Room) ? "" : $", phòng {c.Room}";
                    upcomingSessions.Add((start, $"Lớp nhóm \"{c.ClassName}\" ({c.Sport}) — {FormatVnDateTime(start, vi)}–{start.AddMinutes(c.DurationMinutes):HH:mm}{room}, HLV {c.CoachName}"));
                }
            }
            catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load class bookings."); }

            try
            {
                var pastClasses = await db.Database.SqlQueryRaw<AiUpcomingClassRow>(
                    @"SELECT c.class_name AS ""ClassName"",
                             COALESCE(s.name, '') AS ""Sport"",
                             COALESCE(f.name, '') AS ""Room"",
                             c.schedule_time AS ""ScheduleTime"",
                             COALESCE(c.duration_minutes, 60) AS ""DurationMinutes"",
                             COALESCE(u.full_name, 'HLV Trung tâm') AS ""CoachName""
                      FROM class_bookings b
                      INNER JOIN classes c ON c.id = b.class_id
                      LEFT JOIN sports s ON s.id = c.sport_id
                      LEFT JOIN facilities f ON f.id = c.facility_id
                      LEFT JOIN coaches co ON co.id = c.coach_id
                      LEFT JOIN users u ON u.id = co.user_id
                      WHERE b.user_id = {0}
                        AND b.status NOT IN ('cancelled', 'rejected', 'class_cancelled')
                        AND c.schedule_time < NOW()
                      ORDER BY c.schedule_time DESC
                      LIMIT 6", memberId).ToListAsync(ct);

                foreach (var c in pastClasses)
                {
                    var start = ToVn(c.ScheduleTime);
                    var room = string.IsNullOrWhiteSpace(c.Room) ? "" : $", phòng {c.Room}";
                    completedSessions.Add((start, $"Lớp nhóm \"{c.ClassName}\" ({c.Sport}) — {FormatVnDateTime(start, vi)}–{start.AddMinutes(c.DurationMinutes):HH:mm}{room}, HLV {c.CoachName} (Đã hoàn thành)"));
                }
            }
            catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load past class bookings."); }

            try
            {
                var pts = await db.Database.SqlQueryRaw<AiUpcomingPtRow>(
                    @"SELECT COALESCE(s.sport, 'Gym') AS ""Sport"",
                             COALESCE(s.room, 'Khu vực PT 1-1') AS ""Room"",
                             s.start_time AS ""ScheduleTime"",
                             COALESCE(u.full_name, 'HLV Cá nhân') AS ""CoachName""
                      FROM coach_availability_slots s
                      INNER JOIN coaches c ON c.id = s.coach_id
                      LEFT JOIN users u ON u.id = c.user_id
                      WHERE s.booked_member_id = {0}
                        AND s.status = 'booked'
                        AND s.start_time >= NOW()
                      ORDER BY s.start_time ASC
                      LIMIT 5", memberId).ToListAsync(ct);

                foreach (var p in pts)
                {
                    var start = ToVn(p.ScheduleTime);
                    upcomingSessions.Add((start, $"Buổi PT 1-1 ({p.Sport}) — {FormatVnDateTime(start, vi)}, {p.Room}, HLV {p.CoachName}"));
                }
            }
            catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load PT slots."); }

            try
            {
                var pastPts = await db.Database.SqlQueryRaw<AiUpcomingPtRow>(
                    @"SELECT COALESCE(s.sport, 'Gym') AS ""Sport"",
                             COALESCE(s.room, 'Khu vực PT 1-1') AS ""Room"",
                             s.start_time AS ""ScheduleTime"",
                             COALESCE(u.full_name, 'HLV Cá nhân') AS ""CoachName""
                      FROM coach_availability_slots s
                      INNER JOIN coaches c ON c.id = s.coach_id
                      LEFT JOIN users u ON u.id = c.user_id
                      WHERE s.booked_member_id = {0}
                        AND s.status = 'booked'
                        AND s.start_time < NOW()
                      ORDER BY s.start_time DESC
                      LIMIT 6", memberId).ToListAsync(ct);

                foreach (var p in pastPts)
                {
                    var start = ToVn(p.ScheduleTime);
                    completedSessions.Add((start, $"Buổi PT 1-1 ({p.Sport}) — {FormatVnDateTime(start, vi)}, {p.Room}, HLV {p.CoachName} (Đã hoàn thành)"));
                }
            }
            catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load past PT slots."); }

            var digits = Regex.Replace(phone, "[^0-9]", "");
            if (digits.Length >= 9)
            {
                try
                {
                    var appts = await db.Database.SqlQueryRaw<AiAppointmentRow>(
                        @"SELECT title AS ""Title"", time AS ""Time"", date AS ""Date"",
                                 coach_name AS ""CoachName"", status AS ""Status""
                          FROM appointments
                          WHERE customer_name LIKE '%' || {0} || '%'
                          LIMIT 20", digits).ToListAsync(ct);

                    var todayVn = ToVn(nowUtc).Date;
                    foreach (var a in appts)
                    {
                        if ((a.Status ?? "").Contains("hủy", StringComparison.OrdinalIgnoreCase)) continue;
                        var dateStr = string.IsNullOrWhiteSpace(a.Date) ? todayVn.ToString("yyyy-MM-dd") : a.Date!;
                        if (!DateTime.TryParseExact($"{dateStr} {a.Time}", "yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out var start))
                            continue;
                        var coach = string.IsNullOrWhiteSpace(a.CoachName) ? "" : $", HLV {a.CoachName}";
                        if (start < ToVn(nowUtc).AddMinutes(-30))
                        {
                            completedSessions.Add((start, $"Lịch hẹn tại quầy \"{a.Title}\" — {FormatVnDateTime(start, vi)}{coach} (trạng thái: {a.Status})"));
                        }
                        else
                        {
                            upcomingSessions.Add((start, $"Lịch hẹn tại quầy \"{a.Title}\" — {FormatVnDateTime(start, vi)}{coach} (trạng thái: {a.Status})"));
                        }
                    }
                }
                catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load appointments."); }
            }

            foreach (var s in upcomingSessions.OrderBy(s => s.LocalStart).Take(8))
                result.UpcomingSessions.Add(s.Text);

            foreach (var s in completedSessions.OrderByDescending(s => s.LocalStart).Take(8))
                result.CompletedSessions.Add(s.Text);

            if (memberId != Guid.Empty)
            {
                try
                {
                    var homeworks = await db.HomeworkProgresses.AsNoTracking()
                        .Include(h => h.Plan)
                            .ThenInclude(p => p!.Exercises)
                        .Where(h => h.MemberId == memberId)
                        .OrderByDescending(h => h.AssignedDate)
                        .Take(8)
                        .ToListAsync(ct);

                    foreach (var hw in homeworks)
                    {
                        var plan = hw.Plan;
                        if (plan == null) continue;
                        var duration = plan.DurationMinutes.HasValue ? $"{plan.DurationMinutes} phút" : "45 phút";
                        var level = !string.IsNullOrWhiteSpace(plan.Level) ? $"Trình độ: {plan.Level}" : "Cơ bản";
                        
                        var exerciseList = plan.Exercises != null && plan.Exercises.Count > 0
                            ? string.Join(", ", plan.Exercises.OrderBy(e => e.Order).Select((e, idx) =>
                                $"{idx + 1}. {e.Name} ({e.Sets ?? "3"} hiệp x {e.Reps ?? e.Duration ?? "12 lần"}" +
                                (!string.IsNullOrWhiteSpace(e.Rest) ? $", nghỉ {e.Rest}" : "") +
                                (!string.IsNullOrWhiteSpace(e.Note) ? $" - ghi chú: {e.Note}" : "") + ")"))
                            : "Chưa có bài tập chi tiết";
                            
                        var notes = !string.IsNullOrWhiteSpace(hw.Notes) ? $" [Lưu ý của HLV: {hw.Notes}]" : "";
                        var status = hw.Status switch
                        {
                            "completed" => "Đã hoàn thành",
                            "verified" => "Đã được HLV xác nhận",
                            _ => "Đang thực hiện (chưa hoàn thành)"
                        };
                        var dueDate = hw.DueDate.HasValue ? $" [Hạn: {ToVn(hw.DueDate.Value):dd/MM/yyyy}]" : "";

                        result.AssignedWorkouts.Add($"Giáo án \"{plan.PlanName}\" ({duration}, {level}) — Trạng thái: {status}{dueDate}{notes}. Gồm các bài tập: {exerciseList}");
                    }
                }
                catch (Exception ex)
                {
                    logger.LogDebug(ex, "Flow 6: cannot load assigned workout plans.");
                }

                // 1. Body metrics (InBody)
                try
                {
                    var metric = await db.BodyMetrics.AsNoTracking()
                        .Where(m => m.UserId == memberId)
                        .OrderByDescending(m => m.RecordedAt)
                        .FirstOrDefaultAsync(ct);

                    if (metric != null)
                    {
                        var parts = new List<string>();
                        if (metric.Height.HasValue && metric.Height > 0) parts.Add($"Chiều cao: {metric.Height:0.#}cm");
                        if (metric.Weight.HasValue && metric.Weight > 0) parts.Add($"Cân nặng: {metric.Weight:0.#}kg");
                        if (metric.Bmi.HasValue && metric.Bmi > 0)
                        {
                            var bmiVal = metric.Bmi.Value;
                            var eval = bmiVal < 18.5m ? "Gầy"
                                : bmiVal < 24.9m ? "Chuẩn/Bình thường"
                                : bmiVal < 29.9m ? "Hơi thừa cân"
                                : "Béo phì";
                            parts.Add($"BMI: {bmiVal:0.#} ({eval})");
                        }
                        if (metric.BodyFat.HasValue && metric.BodyFat > 0) parts.Add($"Mỡ: {metric.BodyFat:0.#}%");
                        if (metric.MuscleMass.HasValue && metric.MuscleMass > 0) parts.Add($"Cơ: {metric.MuscleMass:0.#}kg");
                        var dateStr = metric.RecordedAt != default ? $" (đo ngày {ToVn(metric.RecordedAt):dd/MM/yyyy})" : "";
                        result.BodyMetricsSummary = string.Join(", ", parts) + dateStr;
                    }
                }
                catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load body metrics."); }

                // 2. Gate Check-ins (Attendance at center)
                try
                {
                    var checkIns = await db.Database.SqlQueryRaw<AiCheckInRow>(
                        @"SELECT check_in_time AS ""CheckInTime"",
                                 check_out_time AS ""CheckOutTime"",
                                 COALESCE(method, 'qr') AS ""Method""
                          FROM check_in_logs
                          WHERE user_id = {0}
                          ORDER BY check_in_time DESC
                          LIMIT 5", memberId).ToListAsync(ct);

                    var sevenDaysAgo = nowUtc.AddDays(-7);
                    var countLast7Days = checkIns.Count(c => c.CheckInTime >= sevenDaysAgo);
                    if (checkIns.Count > 0)
                    {
                        var latest = checkIns[0];
                        var start = ToVn(latest.CheckInTime);
                        var methodStr = (latest.Method ?? "").ToLowerInvariant() switch
                        {
                            "qr" => "quét mã QR",
                            "card" => "quẹt thẻ",
                            _ => "check-in tại quầy"
                        };
                        var outStr = latest.CheckOutTime.HasValue ? $", check-out lúc {ToVn(latest.CheckOutTime.Value):HH:mm}" : "";
                        result.RecentCheckIns.Add($"Trong 7 ngày qua bạn đã đến phòng tập {countLast7Days} lần. Lần check-in gần nhất: {FormatVnDateTime(start, vi)} ({methodStr}{outStr}).");
                    }
                }
                catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load check-in logs."); }

                // 3. Invoices & Billing
                try
                {
                    var invoices = await db.Invoices.AsNoTracking()
                        .Where(i => i.UserId == memberId)
                        .OrderByDescending(i => i.CreatedAt)
                        .Take(3)
                        .ToListAsync(ct);

                    foreach (var inv in invoices)
                    {
                        var status = inv.Status switch
                        {
                            SmartGym.Domain.Enums.PaymentStatus.Completed => "Đã thanh toán",
                            SmartGym.Domain.Enums.PaymentStatus.Pending => "Chờ thanh toán",
                            SmartGym.Domain.Enums.PaymentStatus.Failed => "Thất bại",
                            _ => inv.Status.ToString()
                        };
                        var date = ToVn(inv.CreatedAt);
                        result.RecentInvoices.Add($"Hóa đơn {inv.InvoiceNumber}: {inv.TotalAmount:N0}đ — {status} ({date:dd/MM/yyyy})");
                    }
                }
                catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load invoices."); }

                // 4. Package benefits & amenities
                try
                {
                    var activePackageIds = await db.Subscriptions.AsNoTracking()
                        .Where(s => s.UserId == memberId && s.PaymentStatus == SmartGym.Domain.Enums.PaymentStatus.Completed && s.EndDate >= nowUtc && s.PackageId != null)
                        .Select(s => s.PackageId!)
                        .Distinct()
                        .ToListAsync(ct);

                    if (activePackageIds.Count > 0)
                    {
                        var benefits = await db.MembershipBenefits.AsNoTracking()
                            .Where(b => activePackageIds.Contains(b.PackageId))
                            .Select(b => b.Description)
                            .Distinct()
                            .Take(5)
                            .ToListAsync(ct);

                        foreach (var b in benefits)
                        {
                            if (!string.IsNullOrWhiteSpace(b))
                                result.PackageBenefits.Add(b);
                        }
                    }
                }
                catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load membership benefits."); }

                // 5. Assigned Coach info
                try
                {
                    var coachRow = await db.Database.SqlQueryRaw<AiCoachInfoRow>(
                        @"SELECT COALESCE(u.full_name, 'HLV Trung tâm') AS ""CoachName"",
                                 COALESCE(cp.specialties, s.sport, 'Fitness & Thể thao') AS ""Specialties""
                          FROM coach_availability_slots s
                          INNER JOIN coaches c ON c.id = s.coach_id
                          INNER JOIN users u ON u.id = c.user_id
                          LEFT JOIN coach_profiles cp ON cp.user_id = u.id
                          WHERE s.booked_member_id = {0}
                          ORDER BY s.start_time DESC
                          LIMIT 1", memberId).FirstOrDefaultAsync(ct);

                    if (coachRow != null && !string.IsNullOrWhiteSpace(coachRow.CoachName))
                    {
                        result.AssignedCoachInfo = $"{coachRow.CoachName} (Chuyên môn: {coachRow.Specialties})";
                    }
                }
                catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load coach info."); }

                // 6. Coach Assessments
                try
                {
                    var assessments = await db.Database.SqlQueryRaw<AiCoachAssessmentRow>(@"
                        SELECT ca.completion AS ""Completion"",
                               ca.metrics_json::text AS ""MetricsJson"",
                               ca.comment AS ""Comment"",
                               ca.next_step AS ""NextStep"",
                               ca.created_at AS ""CreatedAt"",
                               COALESCE(c.class_name, 'Buổi tập cá nhân') AS ""ClassName"",
                               COALESCE(u.full_name, 'HLV Trung tâm') AS ""CoachName"",
                               COALESCE(s.name, 'Thể thao') AS ""SportName""
                        FROM coach_assessments ca
                        LEFT JOIN classes c ON c.id = ca.session_id
                        LEFT JOIN sports s ON s.id = c.sport_id
                        LEFT JOIN coaches co ON co.id = ca.coach_id
                        LEFT JOIN users u ON u.id = co.user_id
                        WHERE ca.member_id = {0}
                        ORDER BY ca.created_at DESC
                        LIMIT 5", memberId).ToListAsync(ct);

                    foreach (var a in assessments)
                    {
                        var dateStr = ToVn(a.CreatedAt).ToString("dd/MM/yyyy");
                        var metricSummary = "";
                        if (!string.IsNullOrWhiteSpace(a.MetricsJson) && a.MetricsJson != "[]")
                        {
                            try
                            {
                                using var doc = JsonDocument.Parse(a.MetricsJson);
                                if (doc.RootElement.ValueKind == JsonValueKind.Array)
                                {
                                    var mList = new List<string>();
                                    foreach (var elem in doc.RootElement.EnumerateArray())
                                    {
                                        var n = elem.TryGetProperty("name", out var np) ? np.GetString() : null;
                                        var v = elem.TryGetProperty("value", out var vp) ? vp.ToString() : null;
                                        var u = elem.TryGetProperty("unit", out var up) ? up.GetString() : null;
                                        if (!string.IsNullOrEmpty(n) && !string.IsNullOrEmpty(v))
                                            mList.Add($"{n}: {v} {u ?? ""}".Trim());
                                    }
                                    if (mList.Count > 0) metricSummary = $" [Chỉ số: {string.Join(", ", mList)}]";
                                }
                            }
                            catch { }
                        }
                        var commentStr = !string.IsNullOrWhiteSpace(a.Comment) ? $" - Nhận xét của HLV: \"{a.Comment}\"" : "";
                        var nextStepStr = !string.IsNullOrWhiteSpace(a.NextStep) ? $" - Định hướng buổi tới: \"{a.NextStep}\"" : "";
                        result.RecentCoachAssessments.Add($"Buổi \"{a.ClassName}\" ({a.SportName}, ngày {dateStr}, HLV {a.CoachName}) — Mức độ hoàn thành: {a.Completion}%{metricSummary}{commentStr}{nextStepStr}");
                    }
                }
                catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load coach assessments."); }

                // 7. Wallet balance & recent topup transactions
                try
                {
                    var balRow = await db.Database.SqlQueryRaw<decimal>(
                        @"SELECT balance AS ""Value"" FROM member_wallet_balances WHERE user_id = {0}", memberId).FirstOrDefaultAsync(ct);
                    result.WalletBalance = balRow;
                }
                catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load wallet balance."); }

                try
                {
                    var txs = await db.Database.SqlQueryRaw<AiWalletTxRow>(
                        @"SELECT id::text AS ""Id"", type AS ""Type"", amount AS ""Amount"", COALESCE(method, 'Ví') AS ""Method"",
                                 COALESCE(status, 'completed') AS ""Status"", COALESCE(note, '') AS ""Note"", created_at AS ""CreatedAt""
                          FROM wallet_transactions
                          WHERE user_id = {0}
                          ORDER BY created_at DESC
                          LIMIT 4", memberId).ToListAsync(ct);
                    foreach (var tx in txs)
                    {
                        var vnTime = ToVn(tx.CreatedAt);
                        var typeStr = tx.Type == "topup" ? "Nạp tiền" : "Thanh toán";
                        var sttStr = tx.Status == "completed" ? "Thành công" : "Đang chờ duyệt";
                        result.RecentWalletTransactions.Add($"{typeStr} {tx.Amount:N0}đ ({tx.Method}, ngày {vnTime:dd/MM HH:mm}) — {sttStr} [{tx.Note}]");
                    }
                }
                catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load wallet tx."); }
            }

            // 8. Store products (Active catalog)
            try
            {
                var prods = await db.Database.SqlQueryRaw<AiProductRow>(
                    @"SELECT name AS ""Name"", COALESCE(category, 'Khác') AS ""Category"", COALESCE(price, 0) AS ""Price"", COALESCE(stock_quantity, 0) AS ""StockQuantity""
                      FROM products
                      WHERE status = true
                      ORDER BY category, name").ToListAsync(ct);
                foreach (var p in prods)
                {
                    var stockStr = p.StockQuantity > 0 ? $"còn {p.StockQuantity}" : "tạm hết hàng";
                    result.StoreProducts.Add($"{p.Name} ({p.Category}): {p.Price:N0}đ ({stockStr})");
                }
            }
            catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load products."); }

            // 9. All available membership & sport packages
            try
            {
                var pkgs = await db.Database.SqlQueryRaw<AiPackageRow>(
                    @"SELECT name AS ""Name"", COALESCE(monthly_price, 0) AS ""MonthlyPrice"", COALESCE(yearly_price, 0) AS ""YearlyPrice"",
                             COALESCE(tagline, '') AS ""Tagline"", COALESCE(package_type, '') AS ""PackageType"", COALESCE(description, '') AS ""Description""
                      FROM packages
                      WHERE status = true
                      ORDER BY monthly_price ASC").ToListAsync(ct);
                foreach (var p in pkgs)
                {
                    var priceStr = p.MonthlyPrice > 0 ? $"{p.MonthlyPrice:N0}đ/tháng" : "Miễn phí";
                    if (p.YearlyPrice > 0) priceStr += $" ({p.YearlyPrice:N0}đ/năm)";
                    var desc = !string.IsNullOrWhiteSpace(p.Description) ? $" — {p.Description}" : (!string.IsNullOrWhiteSpace(p.Tagline) ? $" — {p.Tagline}" : "");
                    result.AvailablePackages.Add($"{p.Name} [{p.PackageType}]: {priceStr}{desc}");
                }
            }
            catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load available packages."); }

            // 10. Center coaches
            try
            {
                var coaches = await db.Database.SqlQueryRaw<AiAllCoachRow>(
                    @"SELECT u.full_name AS ""FullName"",
                             COALESCE(c.specialty, cp.specialties, '') AS ""Specialties"",
                             COALESCE(string_agg(DISTINCT s.name, ', '), '') AS ""Sports"",
                             COALESCE(cp.certifications, '') AS ""Certifications"",
                             COALESCE(cp.bio, '') AS ""Bio"",
                             COALESCE(c.experience_years, cp.experience_years, 3) AS ""ExperienceYears"",
                             COALESCE(c.rating, 5.0) AS ""Rating""
                      FROM coaches c
                      JOIN users u ON u.id = c.user_id
                      LEFT JOIN coach_profiles cp ON cp.user_id = u.id
                      LEFT JOIN coach_sports cs ON cs.coach_id = c.id
                      LEFT JOIN sports s ON s.id = cs.sport_id
                      WHERE c.status = true
                      GROUP BY u.full_name, c.specialty, cp.specialties, cp.certifications, cp.bio, c.experience_years, cp.experience_years, c.rating
                      ORDER BY u.full_name").ToListAsync(ct);

                foreach (var c in coaches)
                {
                    var specParts = new List<string>();
                    if (!string.IsNullOrWhiteSpace(c.Sports))
                    {
                        specParts.Add(c.Sports);
                    }
                    if (!string.IsNullOrWhiteSpace(c.Specialties)
                        && !c.Specialties.Equals("Huấn luyện viên", StringComparison.OrdinalIgnoreCase)
                        && !c.Specialties.Equals(c.Sports, StringComparison.OrdinalIgnoreCase))
                    {
                        specParts.Add(c.Specialties);
                    }

                    var finalSpec = specParts.Count > 0 ? string.Join(", ", specParts) : "Fitness & Thể thao";
                    var certInfo = !string.IsNullOrWhiteSpace(c.Certifications) ? $" | Chứng chỉ: {c.Certifications}" : "";
                    var bioInfo = !string.IsNullOrWhiteSpace(c.Bio) ? $" | Giới thiệu: {c.Bio}" : "";

                    result.CenterCoaches.Add($"HLV {c.FullName} (Chuyên môn: {finalSpec}, {c.ExperienceYears} năm kinh nghiệm, {c.Rating:0.#}★{certInfo}{bioInfo})");
                }
            }
            catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load coaches."); }

            // 11. Center facilities
            try
            {
                var facs = await db.Database.SqlQueryRaw<AiFacilityRow>(
                    @"SELECT name AS ""Name"", COALESCE(address, '123 Nguyễn Huệ, Q1, TP.HCM') AS ""Address""
                      FROM facilities
                      WHERE status = true
                      ORDER BY name").ToListAsync(ct);
                foreach (var f in facs)
                {
                    result.CenterFacilities.Add($"{f.Name} ({f.Address})");
                }
            }
            catch (Exception ex) { logger.LogDebug(ex, "Flow 6: cannot load facilities."); }

            return result;
        }
    }
}

