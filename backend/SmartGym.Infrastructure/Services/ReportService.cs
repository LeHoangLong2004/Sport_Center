using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs.Reports;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Models;
using ClosedXML.Excel;

namespace SmartGym.Infrastructure.Services;

public class ReportService(SmartGymDbContext db, Supabase.Client supabase) : IReportService
{
    private static readonly TimeSpan RetentionWindow   = TimeSpan.FromDays(90);
    private const int AttendanceLookbackDays           = 7;

    // ── Truy vấn đơn giản ────────────────────────────────────────────────────

    public async Task<decimal> GetTotalRevenueAsync(DateTime? startDate, DateTime? endDate)
    {
        var q = db.Invoices.Where(i => i.Status == PaymentStatus.Completed);
        if (startDate.HasValue) q = q.Where(i => i.CreatedAt >= startDate.Value.ToUniversalTime());
        if (endDate.HasValue)   q = q.Where(i => i.CreatedAt <= endDate.Value.ToUniversalTime());
        return await q.SumAsync(i => i.TotalAmount);
    }

    public async Task<int> GetNewMembersCountAsync(DateTime month)
    {
        var start = new DateTime(month.Year, month.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end   = start.AddMonths(1).AddTicks(-1);
        return await db.Users
            .Where(u => u.Role.Name == "member" && u.CreatedAt >= start && u.CreatedAt <= end)
            .CountAsync();
    }

    public async Task<double> GetAverageClassOccupancyAsync(DateTime month)
    {
        var classes = await GetClassesInMonthAsync(month);
        var capacity = classes.Sum(c => c.Capacity);
        if (capacity <= 0) return 0;
        return Math.Round(classes.Sum(c => Math.Min(c.CurrentEnrolled, c.Capacity)) * 100.0 / capacity, 2);
    }

    public async Task<DashboardMetricsResponse> GetDashboardMetricsAsync()
    {
        var today      = DateTime.UtcNow.Date;
        var monthStart = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var todayRev   = await db.Invoices.Where(i => i.Status == PaymentStatus.Completed && i.CreatedAt >= today).SumAsync(i => i.TotalAmount);
        var monthRev   = await db.Invoices.Where(i => i.Status == PaymentStatus.Completed && i.CreatedAt >= monthStart).SumAsync(i => i.TotalAmount);
        var newMembers = await db.Users.Where(u => u.Role.Name == "member" && u.CreatedAt >= monthStart).CountAsync();
        var total      = await db.Users.Where(u => u.Role.Name == "member").CountAsync();
        var activeSubs = await db.Subscriptions.CountAsync(s => s.PaymentStatus == PaymentStatus.Completed && s.EndDate >= today);
        var pending    = await db.Invoices.Where(i => i.Status == PaymentStatus.Pending).Select(i => i.TotalAmount).ToListAsync();
        var classes    = await GetClassesAsync();
        var occupancy  = await GetAverageClassOccupancyAsync(DateTime.UtcNow);

        return new DashboardMetricsResponse(
            todayRev, monthRev, newMembers, total, activeSubs,
            pending.Count, pending.Sum(),
            classes.Count(c => c.Status && c.ScheduleTime >= DateTime.UtcNow),
            $"{occupancy}%", DateTime.UtcNow);
    }

    // ── Báo cáo doanh thu ────────────────────────────────────────────────────

    public async Task<IEnumerable<RevenueByPackageResponse>> GetRevenueByPackageAsync()
    {
        var grouped = await db.Subscriptions
            .Where(s => s.PaymentStatus == PaymentStatus.Completed && s.PackageId != null)
            .GroupBy(s => s.PackageId!)
            .Select(g => new { PackageId = g.Key, Revenue = g.Sum(s => s.TotalAmount), Subs = g.Count() })
            .ToListAsync();

        var names = await db.Packages.ToDictionaryAsync(p => p.Id, p => p.Name);

        return grouped.OrderByDescending(g => g.Revenue)
            .Select(g => new RevenueByPackageResponse(
                g.PackageId,
                names.TryGetValue(g.PackageId, out var n) ? n : g.PackageId,
                g.Revenue, g.Subs));
    }

    public async Task<IEnumerable<RevenueByPaymentMethodResponse>> GetRevenueByPaymentMethodAsync()
    {
        var grouped = await db.Invoices
            .Where(i => i.Status == PaymentStatus.Completed)
            .GroupBy(i => i.PaymentMethod)
            .Select(g => new { Method = g.Key, Revenue = g.Sum(i => i.TotalAmount), Count = g.Count() })
            .ToListAsync();

        return grouped.OrderByDescending(g => g.Revenue)
            .Select(g => new RevenueByPaymentMethodResponse(g.Method.ToDbValue(), g.Method.ToDisplayName(), g.Revenue, g.Count));
    }

    public async Task<IEnumerable<MonthlyRevenueResponse>> GetMonthlyRevenueAsync(int months)
    {
        var n      = Math.Clamp(months, 1, 24);
        var now    = DateTime.UtcNow;
        var first  = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-(n - 1));

        var invoices = await db.Invoices
            .Where(i => i.Status == PaymentStatus.Completed && i.CreatedAt >= first)
            .Select(i => new { i.CreatedAt, i.TotalAmount })
            .ToListAsync();

        var grouped = invoices
            .GroupBy(i => new DateTime(i.CreatedAt.Year, i.CreatedAt.Month, 1, 0, 0, 0, DateTimeKind.Utc))
            .ToDictionary(g => g.Key, g => new { Revenue = g.Sum(x => x.TotalAmount), Count = g.Count() });

        // Tháng không có giao dịch vẫn trả về 0 để biểu đồ không bị lệch trục.
        return Enumerable.Range(0, n)
            .Select(i => first.AddMonths(i))
            .Select(m => grouped.TryGetValue(m, out var d)
                ? new MonthlyRevenueResponse(m.ToString("yyyy-MM"), d.Revenue, d.Count)
                : new MonthlyRevenueResponse(m.ToString("yyyy-MM"), 0, 0));
    }

    // ── Báo cáo hội viên ─────────────────────────────────────────────────────

    public async Task<IEnumerable<ExpiringMemberResponse>> GetExpiringMembersAsync()
    {
        var now    = DateTime.UtcNow;
        var target = now.AddDays(7);

        return (await db.Subscriptions
            .Include(s => s.User).Include(s => s.Package)
            .Where(s => s.PaymentStatus == PaymentStatus.Completed && s.EndDate >= now && s.EndDate <= target)
            .OrderBy(s => s.EndDate)
            .ToListAsync())
            .Select(s => new ExpiringMemberResponse(
                s.Id, s.UserId, s.User?.FullName, s.User?.Email,
                s.PackageId, s.Package?.Name,
                s.EndDate.ToString("yyyy-MM-dd"),
                (int)Math.Ceiling((s.EndDate.Date - now.Date).TotalDays),
                s.AutoRenew));
    }

    public async Task<MemberRetentionResponse> GetMemberRetentionRateAsync()
    {
        var now    = DateTime.UtcNow;
        var winStart = now - RetentionWindow;

        var completed = await db.Subscriptions
            .Where(s => s.PaymentStatus == PaymentStatus.Completed)
            .Select(s => new { s.UserId, s.StartDate, s.EndDate })
            .ToListAsync();

        var expiring       = completed.Where(s => s.EndDate >= winStart && s.EndDate <= now).ToList();
        var expiringCount  = expiring.Select(s => s.UserId).Distinct().Count();
        var renewedCount   = expiring
            .Where(s => completed.Any(o => o.UserId == s.UserId && o.StartDate >= s.EndDate))
            .Select(s => s.UserId).Distinct().Count();
        var rate           = expiringCount == 0 ? 0 : Math.Round(renewedCount * 100.0 / expiringCount, 2);

        return new MemberRetentionResponse(
            winStart.ToString("yyyy-MM-dd"), now.ToString("yyyy-MM-dd"),
            expiringCount, renewedCount, $"{rate}%", rate);
    }

    // ── Báo cáo lớp học & HLV ────────────────────────────────────────────────

    public async Task<IEnumerable<ClassOccupancyResponse>> GetClassOccupancyByClassAsync(DateTime month)
    {
        var classes    = await GetClassesInMonthAsync(month);
        var sportNames = await GetSportNamesAsync();

        return classes.OrderByDescending(c => c.Capacity == 0 ? 0 : (double)c.CurrentEnrolled / c.Capacity)
            .Select(c => new ClassOccupancyResponse(
                c.Id, c.ClassName,
                sportNames.TryGetValue(c.SportId, out var sn) ? sn : null,
                c.Capacity, c.CurrentEnrolled,
                ToFillRate(c.CurrentEnrolled, c.Capacity)));
    }

    public async Task<IEnumerable<PopularClassResponse>> GetPopularClassesAsync(DateTime month, int top)
    {
        var classes    = await GetClassesInMonthAsync(month);
        var coaches    = await GetCoachNamesAsync();
        var sportNames = await GetSportNamesAsync();

        return classes.OrderByDescending(c => c.CurrentEnrolled).ThenByDescending(c => c.Capacity)
            .Take(Math.Clamp(top, 1, 20))
            .Select((c, i) => new PopularClassResponse(
                i + 1, c.Id, c.ClassName,
                c.CoachId.HasValue && coaches.TryGetValue(c.CoachId.Value, out var cn) ? cn : null,
                sportNames.TryGetValue(c.SportId, out var sn) ? sn : null,
                c.Capacity, c.CurrentEnrolled,
                ToFillRate(c.CurrentEnrolled, c.Capacity)));
    }

    public async Task<IEnumerable<TrainerPerformanceResponse>> GetTrainerPerformanceAsync()
    {
        var classes = await GetClassesAsync();
        var coaches = await GetCoachNamesAsync();

        return classes.Where(c => c.CoachId.HasValue)
            .GroupBy(c => c.CoachId!.Value)
            .Select(g => new TrainerPerformanceResponse(
                g.Key,
                coaches.TryGetValue(g.Key, out var n) ? n : "Chưa xác định",
                g.Count(),
                g.Sum(c => c.CurrentEnrolled),
                g.Count(c => c.Status && c.ScheduleTime >= DateTime.UtcNow),
                FormatFillRate(g)))
            .OrderByDescending(x => x.Sessions);
    }

    // ── Điểm danh & xuất Excel ───────────────────────────────────────────────

    public async Task<IEnumerable<AttendanceStatResponse>> GetAttendanceStatsAsync()
    {
        var since   = DateTime.UtcNow.Date.AddDays(-AttendanceLookbackDays);
        var checkIns = await GetCheckInLogsAsync();

        return checkIns.Where(c => c.CheckInTime >= since)
            .GroupBy(c => c.CheckInTime.Hour)
            .OrderBy(g => g.Key)
            .Select(g => new AttendanceStatResponse($"{g.Key:00}:00", g.Count()));
    }

    public async Task<IEnumerable<OutstandingInvoiceResponse>> GetOutstandingInvoicesAsync()
    {
        var now  = DateTime.UtcNow;
        var list = await db.Invoices.Include(i => i.User)
            .Where(i => i.Status == PaymentStatus.Pending)
            .OrderBy(i => i.CreatedAt)
            .ToListAsync();

        return list.Select(i => new OutstandingInvoiceResponse(
            i.Id, i.InvoiceNumber, i.UserId, i.User?.FullName,
            i.TotalAmount, i.PaymentMethod.ToDisplayName(),
            i.CreatedAt, (int)Math.Max(0, (now - i.CreatedAt).TotalDays)));
    }

    public async Task<byte[]> ExportRevenueReportAsync(DateTime? startDate, DateTime? endDate)
    {
        var q = db.Invoices.Where(i => i.Status == PaymentStatus.Completed);
        if (startDate.HasValue) q = q.Where(i => i.CreatedAt >= startDate.Value.ToUniversalTime());
        if (endDate.HasValue)   q = q.Where(i => i.CreatedAt <= endDate.Value.ToUniversalTime());

        var invoices = await q.Include(i => i.User).OrderBy(i => i.CreatedAt).ToListAsync();

        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Revenue Report");

        string[] headers = ["Mã hóa đơn", "Hội viên", "Số tiền", "Hình thức", "Trạng thái", "Ngày thanh toán"];
        for (int col = 0; col < headers.Length; col++) ws.Cell(1, col + 1).Value = headers[col];
        ws.Row(1).Style.Font.Bold = true;

        int row = 2;
        foreach (var inv in invoices)
        {
            ws.Cell(row, 1).Value = inv.InvoiceNumber;
            ws.Cell(row, 2).Value = inv.User?.FullName ?? inv.UserId.ToString();
            ws.Cell(row, 3).Value = inv.TotalAmount;
            ws.Cell(row, 4).Value = inv.PaymentMethod.ToDisplayName();
            ws.Cell(row, 5).Value = inv.Status.ToDisplayName();
            ws.Cell(row, 6).Value = (inv.PaidAt ?? inv.CreatedAt).ToString("yyyy-MM-dd HH:mm");
            row++;
        }

        ws.Cell(row, 2).Value = "Tổng cộng";
        ws.Cell(row, 2).Style.Font.Bold = true;
        ws.Cell(row, 3).Value = invoices.Sum(i => i.TotalAmount);
        ws.Cell(row, 3).Style.Font.Bold = true;
        ws.Cell(row, 3).Style.NumberFormat.Format = "#,##0";
        ws.Columns().AdjustToContents();

        using var ms = new System.IO.MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    // ── Supabase helpers ─────────────────────────────────────────────────────

    private async Task<List<GroupClassModel>> GetClassesAsync()
    {
        try { return (await supabase.From<GroupClassModel>().Get()).Models.ToList(); }
        catch { return []; }
    }

    private async Task<List<GroupClassModel>> GetClassesInMonthAsync(DateTime month)
    {
        var start = new DateTime(month.Year, month.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end   = start.AddMonths(1);
        var all   = await GetClassesAsync();
        return all.Where(c => c.ScheduleTime >= start && c.ScheduleTime < end).ToList();
    }

    private async Task<List<CheckInLogModel>> GetCheckInLogsAsync()
    {
        try { return (await supabase.From<CheckInLogModel>().Get()).Models.ToList(); }
        catch { return []; }
    }

    private async Task<Dictionary<Guid, string>> GetSportNamesAsync()
    {
        try { return (await supabase.From<SportModel>().Get()).Models.ToDictionary(s => s.Id, s => s.Name); }
        catch { return []; }
    }

    private async Task<Dictionary<Guid, string>> GetCoachNamesAsync()
    {
        try
        {
            var coaches = (await supabase.From<CoachModel>().Get()).Models;
            var users   = (await supabase.From<SupabaseUserModel>().Get()).Models
                .ToDictionary(u => u.Id, u => u.FullName);

            return coaches
                .Where(c => users.ContainsKey(c.UserId))
                .ToDictionary(c => c.Id, c => users[c.UserId]);
        }
        catch { return []; }
    }

    // ── Static helpers ───────────────────────────────────────────────────────

    private static string FormatFillRate(IEnumerable<GroupClassModel> classes)
    {
        var cap = classes.Sum(c => c.Capacity);
        return cap == 0 ? "0%" : $"{(int)Math.Round(classes.Sum(c => Math.Min(c.CurrentEnrolled, c.Capacity)) * 100.0 / cap)}%";
    }

    private static string ToFillRate(int enrolled, int capacity) =>
        capacity <= 0 ? "0%" : $"{(int)Math.Round(Math.Min(enrolled, capacity) * 100.0 / capacity)}%";
}
