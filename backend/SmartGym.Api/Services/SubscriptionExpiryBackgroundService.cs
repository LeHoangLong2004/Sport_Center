using Microsoft.EntityFrameworkCore;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Services;

/// <summary>
/// Batch job Flow 3 (FR-015): quét gói tập quá hạn để chuyển sang trạng thái
/// <see cref="PaymentStatus.Expired"/> và tạo hóa đơn gia hạn cho các gói bật tự động gia hạn.
/// </summary>
public class SubscriptionExpiryBackgroundService : BackgroundService
{
    private static readonly TimeSpan CheckInterval = TimeSpan.FromHours(6);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SubscriptionExpiryBackgroundService> _logger;

    public SubscriptionExpiryBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<SubscriptionExpiryBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RunBatchAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Batch job quét hạn gói tập thất bại.");
            }

                        try
                        {
                            await Task.Delay(CheckInterval, stoppingToken);
                        }
                        catch (OperationCanceledException)
                        {
                            break; // Ứng dụng đang dừng.
                        }
        }
    }

    internal async Task RunBatchAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<SmartGymDbContext>();

        var now = DateTime.UtcNow;

        var overdue = await dbContext.Subscriptions
            .Where(s => s.PaymentStatus == PaymentStatus.Completed && s.EndDate < now)
            .ToListAsync(cancellationToken);

        foreach (var subscription in overdue)
        {
            subscription.PaymentStatus = PaymentStatus.Expired;

            if (subscription.AutoRenew)
            {
                await CreateRenewalInvoiceAsync(dbContext, subscription, cancellationToken);
            }
        }

        if (overdue.Count > 0)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Đã chuyển {Count} gói tập quá hạn sang trạng thái Expired.", overdue.Count);
        }
    }

    private static async Task CreateRenewalInvoiceAsync(
        SmartGymDbContext dbContext,
        Subscription expired,
        CancellationToken cancellationToken)
    {
        var period = string.Equals(expired.BillingPeriod, "yearly", StringComparison.OrdinalIgnoreCase)
            ? "yearly"
            : "monthly";

        var startDate = expired.EndDate > DateTime.UtcNow ? expired.EndDate : DateTime.UtcNow;
        var endDate = period == "yearly" ? startDate.AddYears(1) : startDate.AddMonths(1);

        // Chỉ tạo kỳ gia hạn mới nếu chưa có kỳ nào chờ thanh toán/đã thanh toán kéo dài hơn gói hiện tại.
        var hasRenewal = await dbContext.Subscriptions.AnyAsync(s =>
            s.Id != expired.Id &&
            s.UserId == expired.UserId &&
            s.PackageId == expired.PackageId &&
            (s.PaymentStatus == PaymentStatus.Pending || s.PaymentStatus == PaymentStatus.Completed) &&
            s.EndDate > expired.EndDate, cancellationToken);

        if (hasRenewal) return;

        dbContext.Subscriptions.Add(new Subscription
        {
            UserId = expired.UserId,
            PackageId = expired.PackageId,
            SportId = expired.SportId,
            FacilityId = expired.FacilityId,
            BillingPeriod = period,
            TotalAmount = expired.TotalAmount,
            PaymentMethod = expired.PaymentMethod,
            PaymentStatus = PaymentStatus.Pending,
            AutoRenew = true,
            StartDate = startDate,
            EndDate = endDate
        });

        dbContext.Invoices.Add(new Invoice
        {
            UserId = expired.UserId,
            TotalAmount = expired.TotalAmount,
            PaymentMethod = expired.PaymentMethod ?? PaymentMethod.CashAtCounter,
            Status = PaymentStatus.Pending
        });
    }
}