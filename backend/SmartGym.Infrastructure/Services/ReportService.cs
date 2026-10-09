using System;
using System.Collections.Generic;
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

public class ReportService : IReportService
{
    /// <summary>Cửa sổ dùng để tính tỷ lệ gia hạn hội viên.</summary>
    private static readonly TimeSpan RetentionWindow = TimeSpan.FromDays(90);

    /// <summary>Số ngày gần nhất lấy số liệu điểm danh cổng.</summary>
    private const int AttendanceLookbackDays = 7;

    private readonly SmartGymDbContext _dbContext;
    private readonly Supabase.Client _supabase;

    public ReportService(SmartGymDbContext dbContext, Supabase.Client supabase)
    {
        _dbContext = dbContext;
        _supabase = supabase;
    }

    public async Task<decimal> GetTotalRevenueAsync(DateTime? startDate, DateTime? endDate)
    {
        var query = _dbContext.Invoices.Where(i => i.Status == PaymentStatus.Completed);

        if (startDate.HasValue)
        {
            query = query.Where(i => i.CreatedAt >= startDate.Value.ToUniversalTime());
        }

        if (endDate.HasValue)
        {
            query = query.Where(i => i.CreatedAt <= endDate.Value.ToUniversalTime());
        }

        return await query.SumAsync(i => i.TotalAmount);
    }

    public async Task<int> GetNewMembersCountAsync(DateTime month)
    {
        var startOfMonth = new DateTime(month.Year, month.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var endOfMonth = startOfMonth.AddMonths(1).AddTicks(-1);

        return await _dbContext.Users
            .Where(u => u.Role.Name == "member" && u.CreatedAt >= startOfMonth && u.CreatedAt <= endOfMonth)
            .CountAsync();
    }

    public async Task<double> GetAverageClassOccupancyAsync(DateTime month)
    {
        var classes = await GetClassesInMonthAsync(month);

        var totalCapacity = classes.Sum(c => c.Capacity);
        if (totalCapacity <= 0) return 0;

        var totalEnrolled = classes.Sum(c => Math.Min(c.CurrentEnrolled, c.Capacity));
        return Math.Round(totalEnrolled * 100.0 / totalCapacity, 2);
    }

    public async Task<DashboardMetricsResponse> GetDashboardMetricsAsync()
    {
        var today = DateTime.UtcNow.Date;
        var monthStart = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var todayRevenue = await _dbContext.Invoices
            .Where(i => i.Status == PaymentStatus.Completed && i.CreatedAt >= today)
            .SumAsync(i => i.TotalAmount);

        var monthRevenue = await _dbContext.Invoices
            .Where(i => i.Status == PaymentStatus.Completed && i.CreatedAt >= monthStart)
            .SumAsync(i => i.TotalAmount);

        var newMembersThisMonth = await _dbContext.Users
            .Where(u => u.Role.Name == "member" && u.CreatedAt >= monthStart)
            .CountAsync();

        var totalMembers = await _dbContext.Users
            .Where(u => u.Role.Name == "member")
            .CountAsync();

        var activeSubscriptions = await _dbContext.Subscriptions
            .CountAsync(s => s.PaymentStatus == PaymentStatus.Completed && s.EndDate >= today);

        var pendingInvoices = await _dbContext.Invoices
            .Where(i => i.Status == PaymentStatus.Pending)
            .Select(i => i.TotalAmount)
            .ToListAsync();

        var classes = await GetClassesAsync();
        var upcomingClasses = classes.Count(c => c.Status && c.ScheduleTime >= DateTime.UtcNow);
        var occupancyRate = await GetAverageClassOccupancyAsync(DateTime.UtcNow);

        return new DashboardMetricsResponse(
            todayRevenue,
            monthRevenue,
            newMembersThisMonth,
            totalMembers,
            activeSubscriptions,
            pendingInvoices.Count,
            pendingInvoices.Sum(),
            upcomingClasses,
            $"{occupancyRate}%",
            DateTime.UtcNow);
    }

    public async Task<IEnumerable<RevenueByPackageResponse>> GetRevenueByPackageAsync()
    {
        var grouped = await _dbContext.Subscriptions
            .Where(s => s.PaymentStatus == PaymentStatus.Completed && s.PackageId != null)
            .GroupBy(s => s.PackageId!)
            .Select(g => new { PackageId = g.Key, Revenue = g.Sum(s => s.TotalAmount), Subscriptions = g.Count() })
            .ToListAsync();

        var packageNames = await _dbContext.Packages.ToDictionaryAsync(p => p.Id, p => p.Name);

        return grouped
            .OrderByDescending(g => g.Revenue)
            .Select(g => new RevenueByPackageResponse(
                g.PackageId,
                packageNames.TryGetValue(g.PackageId, out var name) ? name : g.PackageId,
                g.Revenue,
                g.Subscriptions))
            .ToList();
    }

    public async Task<IEnumerable<RevenueByPaymentMethodResponse>> GetRevenueByPaymentMethodAsync()
    {
        var grouped = await _dbContext.Invoices
            .Where(i => i.Status == PaymentStatus.Completed)
            .GroupBy(i => i.PaymentMethod)
            .Select(g => new { Method = g.Key, Revenue = g.Sum(i => i.TotalAmount), Invoices = g.Count() })
            .ToListAsync();

        return grouped
            .OrderByDescending(g => g.Revenue)
            .Select(g => new RevenueByPaymentMethodResponse(
                g.Method.ToDbValue(),
                g.Method.ToDisplayName(),
                g.Revenue,
                g.Invoices))
            .ToList();
    }

    public async Task<IEnumerable<ExpiringMemberResponse>> GetExpiringMembersAsync()
    {
        var now = DateTime.UtcNow;
        var targetDate = now.AddDays(7);

        var expiring = await _dbContext.Subscriptions
            .Include(s => s.User)
            .Include(s => s.Package)
            .Where(s => s.PaymentStatus == PaymentStatus.Completed && s.EndDate >= now && s.EndDate <= targetDate)
            .OrderBy(s => s.EndDate)
            .ToListAsync();

        return expiring.Select(s => new ExpiringMemberResponse(
            s.Id,
            s.UserId,
            s.User?.FullName,
            s.User?.Email,
            s.PackageId,
            s.Package?.Name,
            s.EndDate.ToString("yyyy-MM-dd"),
            (int)Math.Ceiling((s.EndDate.Date - now.Date).TotalDays),
            s.AutoRenew))
            .ToList();
    }

    public async Task<MemberRetentionResponse> GetMemberRetentionRateAsync()
    {
        var now = DateTime.UtcNow;
        var windowStart = now - RetentionWindow;

        var completed = await _dbContext.Subscriptions
            .Where(s => s.PaymentStatus == PaymentStatus.Completed)
            .Select(s => new { s.UserId, s.StartDate, s.EndDate })
            .ToListAsync();

        var expiring = completed
            .Where(s => s.EndDate >= windowStart && s.EndDate <= now)
            .ToList();

        var expiringMembers = expiring.Select(s => s.UserId).Distinct().Count();
        var renewedMembers = expiring
            .Where(s => completed.Any(other => other.UserId == s.UserId && other.StartDate >= s.EndDate))
            .Select(s => s.UserId)
            .Distinct()
            .Count();

        var rate = expiringMembers == 0 ? 0 : Math.Round(renewedMembers * 100.0 / expiringMembers, 2);

        return new MemberRetentionResponse(
            windowStart.ToString("yyyy-MM-dd"),
            now.ToString("yyyy-MM-dd"),
            expiringMembers,
            renewedMembers,
            $"{rate}%",
            rate);
    }

    public async Task<IEnumerable<AttendanceStatResponse>> GetAttendanceStatsAsync()
    {
        var since = DateTime.UtcNow.Date.AddDays(-AttendanceLookbackDays);

        var checkIns = await GetCheckInLogsAsync();

        return checkIns
            .Where(c => c.CheckInTime >= since)
            .GroupBy(c => c.CheckInTime.Hour)
            .OrderBy(g => g.Key)
            .Select(g => new AttendanceStatResponse($"{g.Key:00}:00", g.Count()))
            .ToList();
    }

    public async Task<IEnumerable<TrainerPerformanceResponse>> GetTrainerPerformanceAsync()
    {
        var classes = await GetClassesAsync();
        var coachNames = await GetCoachNamesAsync();

        return classes
            .Where(c => c.CoachId.HasValue)
            .GroupBy(c => c.CoachId!.Value)
            .Select(g => new TrainerPerformanceResponse(
                g.Key,
                coachNames.TryGetValue(g.Key, out var name) ? name : "Chưa xác định",
                g.Count(),
                g.Sum(c => c.CurrentEnrolled),
                g.Count(c => c.Status && c.ScheduleTime >= DateTime.UtcNow),
                FormatFillRate(g)))
            .OrderByDescending(x => x.Sessions)
            .ToList();
    }

    private static string FormatFillRate(IEnumerable<GroupClassModel> classes)
    {
        var capacity = classes.Sum(c => c.Capacity);
        if (capacity == 0) return "0%";

        var enrolled = classes.Sum(c => Math.Min(c.CurrentEnrolled, c.Capacity));
        return $"{(int)Math.Round(enrolled * 100.0 / capacity)}%";
    }

    private static string ToFillRate(int enrolled, int capacity) =>
        capacity <= 0 ? "0%" : $"{(int)Math.Round(Math.Min(enrolled, capacity) * 100.0 / capacity)}%";

    private async Task<Dictionary<Guid, string>> GetSportNamesAsync()
    {
        try
        {
            var sports = (await _supabase.From<SportModel>().Get()).Models;
            return sports.ToDictionary(s => s.Id, s => s.Name);
        }
        catch (Exception)
        {
            return new Dictionary<Guid, string>();
        }
    }

    public async Task<IEnumerable<OutstandingInvoiceResponse>> GetOutstandingInvoicesAsync()
    {
        var outstanding = await _dbContext.Invoices
            .Include(i => i.User)
            .Where(i => i.Status == PaymentStatus.Pending)
            .OrderBy(i => i.CreatedAt)
            .ToListAsync();

        var now = DateTime.UtcNow;

        return outstanding.Select(i => new OutstandingInvoiceResponse(
            i.Id,
            i.InvoiceNumber,
            i.UserId,
            i.User?.FullName,
            i.TotalAmount,
            i.PaymentMethod.ToDisplayName(),
            i.CreatedAt,
            (int)Math.Max(0, (now - i.CreatedAt).TotalDays)))
            .ToList();
    }

    public async Task<IEnumerable<MonthlyRevenueResponse>> GetMonthlyRevenueAsync(int months)
    {
        var safeMonths = Math.Clamp(months, 1, 24);

        var now = DateTime.UtcNow;
        var firstMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc)
            .AddMonths(-(safeMonths - 1));

        var invoices = await _dbContext.Invoices
            .Where(i => i.Status == PaymentStatus.Completed && i.CreatedAt >= firstMonth)
            .Select(i => new { i.CreatedAt, i.TotalAmount })
            .ToListAsync();

        var grouped = invoices
            .GroupBy(i => new DateTime(i.CreatedAt.Year, i.CreatedAt.Month, 1, 0, 0, 0, DateTimeKind.Utc))
            .ToDictionary(g => g.Key, g => new { Revenue = g.Sum(x => x.TotalAmount), Count = g.Count() });

        // Tháng không có giao dịch vẫn trả về doanh thu 0 để biểu đồ không bị lệch trục.
        return Enumerable.Range(0, safeMonths)
            .Select(offset => firstMonth.AddMonths(offset))
            .Select(month => grouped.TryGetValue(month, out var data)
                ? new MonthlyRevenueResponse(month.ToString("yyyy-MM"), data.Revenue, data.Count)
                : new MonthlyRevenueResponse(month.ToString("yyyy-MM"), 0, 0))
            .ToList();
    }

    public async Task<IEnumerable<ClassOccupancyResponse>> GetClassOccupancyByClassAsync(DateTime month)
    {
        var classes = await GetClassesInMonthAsync(month);
        var sportNames = await GetSportNamesAsync();

        return classes
            .OrderByDescending(c => c.Capacity == 0 ? 0 : (double)c.CurrentEnrolled / c.Capacity)
            .Select(c => new ClassOccupancyResponse(
                c.Id,
                c.ClassName,
                sportNames.TryGetValue(c.SportId, out var sportName) ? sportName : null,
                c.Capacity,
                c.CurrentEnrolled,
                ToFillRate(c.CurrentEnrolled, c.Capacity)))
            .ToList();
    }

    public async Task<IEnumerable<PopularClassResponse>> GetPopularClassesAsync(DateTime month, int top)
    {
        var safeTop = Math.Clamp(top, 1, 20);

        var classes = await GetClassesInMonthAsync(month);
        var coachNames = await GetCoachNamesAsync();
        var sportNames = await GetSportNamesAsync();

        return classes
            .OrderByDescending(c => c.CurrentEnrolled)
            .ThenByDescending(c => c.Capacity)
            .Take(safeTop)
            .Select((c, index) => new PopularClassResponse(
                index + 1,
                c.Id,
                c.ClassName,
                c.CoachId.HasValue && coachNames.TryGetValue(c.CoachId.Value, out var coachName) ? coachName : null,
                sportNames.TryGetValue(c.SportId, out var sportName) ? sportName : null,
                c.Capacity,
                c.CurrentEnrolled,
                ToFillRate(c.CurrentEnrolled, c.Capacity)))
            .ToList();
    }

    public async Task<byte[]> ExportRevenueReportAsync(DateTime? startDate, DateTime? endDate)
    {
        var query = _dbContext.Invoices.Where(i => i.Status == PaymentStatus.Completed);

        if (startDate.HasValue)
        {
            query = query.Where(i => i.CreatedAt >= startDate.Value.ToUniversalTime());
        }

        if (endDate.HasValue)
        {
            query = query.Where(i => i.CreatedAt <= endDate.Value.ToUniversalTime());
        }

        var invoices = await query
            .Include(i => i.User)
            .OrderBy(i => i.CreatedAt)
            .ToListAsync();

        using var workbook = new XLWorkbook();

        var worksheet = workbook.Worksheets.Add("Revenue Report");
        worksheet.Cell(1, 1).Value = "Mã hóa đơn";
        worksheet.Cell(1, 2).Value = "Hội viên";
        worksheet.Cell(1, 3).Value = "Số tiền";
        worksheet.Cell(1, 4).Value = "Hình thức";
        worksheet.Cell(1, 5).Value = "Trạng thái";
        worksheet.Cell(1, 6).Value = "Ngày thanh toán";
        worksheet.Row(1).Style.Font.Bold = true;

        int row = 2;
        foreach (var invoice in invoices)
        {
            worksheet.Cell(row, 1).Value = invoice.InvoiceNumber;
            worksheet.Cell(row, 2).Value = invoice.User?.FullName ?? invoice.UserId.ToString();
            worksheet.Cell(row, 3).Value = invoice.TotalAmount;
            worksheet.Cell(row, 4).Value = invoice.PaymentMethod.ToDisplayName();
            worksheet.Cell(row, 5).Value = invoice.Status.ToDisplayName();
            worksheet.Cell(row, 6).Value = (invoice.PaidAt ?? invoice.CreatedAt).ToString("yyyy-MM-dd HH:mm");
            row++;
        }

        worksheet.Cell(row, 2).Value = "Tổng cộng";
        worksheet.Cell(row, 2).Style.Font.Bold = true;
        worksheet.Cell(row, 3).Value = invoices.Sum(i => i.TotalAmount);
        worksheet.Cell(row, 3).Style.Font.Bold = true;
        worksheet.Cell(row, 3).Style.NumberFormat.Format = "#,##0";
        worksheet.Columns().AdjustToContents();

        using var summaryStream = new System.IO.MemoryStream();
        workbook.SaveAs(summaryStream);
        return summaryStream.ToArray();
    }

    private async Task<List<GroupClassModel>> GetClassesAsync()
    {
        try
        {
            var response = await _supabase.From<GroupClassModel>().Get();
            return response.Models.ToList();
        }
        catch (Exception)
        {
            // Bảng classes không truy cập được: báo cáo vẫn chạy với dữ liệu rỗng.
            return new List<GroupClassModel>();
        }
    }

    private async Task<List<GroupClassModel>> GetClassesInMonthAsync(DateTime month)
    {
        var startOfMonth = new DateTime(month.Year, month.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var endOfMonth = startOfMonth.AddMonths(1);

        var classes = await GetClassesAsync();

        return classes
            .Where(c => c.ScheduleTime >= startOfMonth && c.ScheduleTime < endOfMonth)
            .ToList();
    }

    private async Task<List<CheckInLogModel>> GetCheckInLogsAsync()
    {
        try
        {
            var response = await _supabase.From<CheckInLogModel>().Get();
            return response.Models.ToList();
        }
        catch (Exception)
        {
            // Không đọc được bảng check_in_logs: báo cáo vẫn trả về danh sách rỗng.
            return new List<CheckInLogModel>();
        }
    }

    private async Task<Dictionary<Guid, string>> GetCoachNamesAsync()
    {
        var coachNames = new Dictionary<Guid, string>();

        try
        {
            var coaches = (await _supabase.From<CoachModel>().Get()).Models;
            var users = (await _supabase.From<SupabaseUserModel>().Get()).Models
                .ToDictionary(u => u.Id, u => u.FullName);

            foreach (var coach in coaches)
            {
                if (users.TryGetValue(coach.UserId, out var fullName))
                {
                    coachNames[coach.Id] = fullName;
                }
            }
        }
        catch (Exception)
        {
            // Không lấy được tên HLV thì trả về danh sách rỗng.
        }

        return coachNames;
    }
}
