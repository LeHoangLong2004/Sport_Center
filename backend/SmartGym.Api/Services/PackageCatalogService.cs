using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Services;

public sealed class PackageCatalogException(int statusCode, string message) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}

public sealed class PackageCatalogService(SmartGymDbContext db)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    private static readonly CatalogPackageDto[] Defaults =
    [
        new()
        {
            Id = "membership-basic", Category = "membership", Tier = "basic", Name = "Cơ bản",
            Description = "Hạng mặc định dành cho mọi hội viên.", IsActive = true,
            Prices = Prices(0, 0, 0, 0),
            Benefits = ["Hạng mặc định miễn phí", "Có thể mua riêng từng gói môn tập"],
            Terms = ["Miễn phí và không giới hạn thời hạn.", "Gói thành viên không bao gồm quyền vào khu tập."],
            LockerTerms = "Sử dụng tủ theo điều kiện của gói môn và trong buổi tập hợp lệ."
        },
        new()
        {
            Id = "membership-plus", Category = "membership", Tier = "plus", Name = "Plus",
            Description = "Thêm ưu đãi mua gói môn và chủ động đặt lớp sớm hơn.", IsActive = true,
            Prices = Prices(149000, 399000, 749000, 1399000),
            Benefits = ["Giảm 5% gói tự tập và lớp nhóm", "Giảm 2% gói Coach 1–1", "Đặt lớp trước 72 giờ"],
            Terms = ["Hiệu lực tính từ ngày xác nhận thanh toán hoặc nối tiếp hạng trả phí hiện tại.", "Ưu đãi không thay thế quyền tập theo gói môn.", "Gói thành viên không bao gồm quyền vào khu tập."],
            GroupDiscountPct = 5, CoachDiscountPct = 2, BookingAdvanceHours = 72,
            LockerTerms = "Được sử dụng tủ trong buổi tập hợp lệ theo điều kiện của gói môn."
        },
        new()
        {
            Id = "membership-premium", Category = "membership", Tier = "premium", Name = "Premium",
            Description = "Mức ưu đãi cao hơn và thời gian đặt lớp sớm hơn.", IsActive = true,
            Prices = Prices(299000, 799000, 1499000, 2799000),
            Benefits = ["Giảm 10% gói tự tập và lớp nhóm", "Giảm 5% gói Coach 1–1", "Đặt lớp trước 120 giờ", "Ưu tiên hỗ trợ tại trung tâm"],
            Terms = ["Hiệu lực tính từ ngày xác nhận thanh toán hoặc nối tiếp hạng trả phí hiện tại.", "Ưu đãi không thay thế quyền tập theo gói môn.", "Gói thành viên không bao gồm quyền vào khu tập."],
            GroupDiscountPct = 10, CoachDiscountPct = 5, BookingAdvanceHours = 120,
            LockerTerms = "Được sử dụng tủ trong buổi tập hợp lệ theo điều kiện của gói môn."
        },
        new()
        {
            Id = "sport-gym-self", Category = "sport", Name = "Gym tự tập",
            Description = "Tập luyện linh hoạt trong khu Gym.", IsActive = true,
            Prices = Prices(500000, 1350000, 2550000, 4800000),
            Benefits = ["Sử dụng thiết bị khu Gym", "Tủ đồ trong buổi tập"],
            Terms = ["Chỉ sử dụng khu Gym trong khung giờ mở cửa.", "Gói tự tập không bao gồm chỗ trong lớp nhóm hoặc Coach 1–1."],
            Sport = "Gym", Area = "Khu Gym", Format = "self", AccessHours = "06:00–22:00",
            LockerTerms = "Tủ dùng trong buổi tập; không giữ đồ qua đêm."
        },
        new()
        {
            Id = "sport-yoga-group", Category = "sport", Name = "Yoga nhóm",
            Description = "Lớp nhóm phù hợp cho người mới và người tập lâu năm.", IsActive = true,
            Prices = Prices(700000, 1890000, 3570000, 6720000),
            Benefits = ["12 buổi tập mỗi tháng", "Hướng dẫn bởi Coach", "Sử dụng Studio Yoga trong buổi học"],
            Terms = ["Buổi tập tính theo tháng sử dụng từ ngày kích hoạt.", "Hủy lớp đúng hạn được trả lại lượt; không chuyển lượt chưa dùng sang kỳ sau."],
            Sport = "Yoga", Area = "Studio Yoga", Format = "group", SessionsPerMonth = 12,
            MinutesPerSession = 60, MaxClassSize = 16,
            LockerTerms = "Tủ dùng trong buổi học; không giữ đồ qua đêm."
        },
        new()
        {
            Id = "sport-boxing-coach", Category = "sport", Name = "Boxing Coach 1–1",
            Description = "Huấn luyện cá nhân với lộ trình theo mục tiêu.", IsActive = true,
            Prices = Prices(2400000, 6480000, 12240000, 23040000),
            Benefits = ["8 buổi Coach mỗi tháng", "60 phút mỗi buổi", "Đã bao gồm quyền sử dụng khu Boxing"],
            Terms = ["Lịch tập phụ thuộc Coach và khung giờ còn trống.", "Buổi được cấp theo tháng sử dụng; hủy muộn hoặc không đến có thể mất lượt."],
            Sport = "Boxing", Area = "Combat Zone", Format = "coach", SessionsPerMonth = 8,
            MinutesPerSession = 60, MaxClassSize = 1,
            LockerTerms = "Tủ dùng trong buổi học; không giữ đồ qua đêm."
        }
    ];

    private static Dictionary<int, decimal> Prices(decimal one, decimal three, decimal six, decimal twelve) =>
        new() { [1] = one, [3] = three, [6] = six, [12] = twelve };

    public async Task<IReadOnlyList<CatalogPackageDto>> GetCatalogAsync(bool includeInactive, CancellationToken cancellationToken)
    {
        await EnsureDefaultsAsync(cancellationToken);
        var query = db.Packages.Include(p => p.Features).Include(p => p.Benefits).AsNoTracking();
        if (!includeInactive)
            query = query.Where(package => package.Status);

        var packages = await query.OrderBy(package => package.PackageType).ThenBy(package => package.Id)
            .ToListAsync(cancellationToken);
            
        return packages.Select(package => 
        {
            if (!string.IsNullOrEmpty(package.CatalogJson))
            {
                return DeserializeCatalog(package.CatalogJson);
            }
            
            // Map legacy package or package added without CatalogJson
            return new CatalogPackageDto
            {
                Id = package.Id,
                Category = package.PackageType,
                Name = package.Name,
                Tier = package.PackageType == "membership" ? package.Tagline : null,
                Format = package.PackageType == "sport" ? package.Tagline : null,
                Description = package.Description ?? "",
                IsActive = package.Status,
                Prices = new Dictionary<int, decimal>
                {
                    [1] = package.MonthlyPrice ?? 0,
                    [3] = (package.MonthlyPrice ?? 0) * 3 * 0.95m, // Guess discount
                    [6] = (package.MonthlyPrice ?? 0) * 6 * 0.9m,
                    [12] = package.YearlyPrice ?? (package.MonthlyPrice ?? 0) * 12 * 0.85m
                },
                Benefits = package.Features.Select(f => f.FeatureText).Concat(package.Benefits.Select(b => b.Description)).ToList(),
                Terms = new List<string> { "Gói tập được áp dụng theo quy định của trung tâm." },
                GroupDiscountPct = 0,
                CoachDiscountPct = 0,
                BookingAdvanceHours = 24,
                LockerTerms = "Sử dụng tủ theo quy định.",
                Sport = package.PackageType == "sport" ? package.Name : null
            };
        }).ToArray();
    }

    public async Task<CatalogPackageDto> SaveCatalogPackageAsync(
        string id,
        CatalogPackageDto request,
        bool create,
        CancellationToken cancellationToken)
    {
        ValidatePackage(id, request, create);
        await EnsureDefaultsAsync(cancellationToken);

        var package = await db.Packages.Include(item => item.Features).Include(item => item.Benefits)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (create)
        {
            if (package is not null)
                throw new PackageCatalogException(StatusCodes.Status409Conflict, "Đã tồn tại mã gói này.");
            package = new Package { Id = id };
            db.Packages.Add(package);
        }
        else if (package is null || package.CatalogJson is null)
        {
            throw new PackageCatalogException(StatusCodes.Status404NotFound, "Không tìm thấy gói trong danh mục.");
        }

        if (package!.CatalogJson is not null)
        {
            var current = DeserializeCatalog(package.CatalogJson);
            if (current.Category == "membership" && current.Tier != request.Tier)
                throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Mã hạng thành viên không thể thay đổi.");
            if (current.Tier == "basic" && (!request.IsActive || request.Prices.Values.Any(price => price != 0)))
                throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Hạng Cơ bản luôn miễn phí và luôn được mở.");
        }

        package.Name = request.Name.Trim();
        package.Tagline = request.Category == "membership" ? request.Tier : request.Format;
        package.PackageType = request.Category;
        package.MonthlyPrice = request.Prices[1];
        package.YearlyPrice = request.Prices[12];
        package.Description = request.Description.Trim();
        package.Status = request.IsActive;
        package.CatalogJson = JsonSerializer.Serialize(request, JsonOptions);

        db.PackageFeatures.RemoveRange(package.Features);
        db.MembershipBenefits.RemoveRange(package.Benefits);
        package.Features = request.Benefits.Select(text => new PackageFeature { PackageId = id, FeatureText = text }).ToList();
        package.Benefits = request.Benefits.Select(text => new MembershipBenefit
        {
            PackageId = id,
            BenefitType = "general",
            Description = text
        }).ToList();

        await db.SaveChangesAsync(cancellationToken);
        return request;
    }

    public async Task SetPackageStatusAsync(string id, bool isActive, CancellationToken cancellationToken)
    {
        var package = await db.Packages.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (package?.CatalogJson is null)
            throw new PackageCatalogException(StatusCodes.Status404NotFound, "Không tìm thấy gói trong danh mục.");

        var catalog = DeserializeCatalog(package.CatalogJson);
        if (catalog.Tier == "basic" && !isActive)
            throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Hạng Cơ bản luôn được mở.");

        catalog.IsActive = isActive;
        package.Status = isActive;
        package.CatalogJson = JsonSerializer.Serialize(catalog, JsonOptions);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<PackageOrderResponse> CreateOrderAsync(Guid userId, CreatePackageOrderRequest request, CancellationToken cancellationToken)
    {
        if (request.DurationMonths is not (1 or 3 or 6 or 12))
            throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Kỳ hạn chỉ được là 1, 3, 6 hoặc 12 tháng.");

        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(item => item.Id == userId && item.Status, cancellationToken);
        if (user is null)
            throw new PackageCatalogException(StatusCodes.Status401Unauthorized, "Không tìm thấy hội viên đang đăng nhập.");

        var package = await db.Packages.AsNoTracking().FirstOrDefaultAsync(item => item.Id == request.PackageId, cancellationToken);
        if (package?.CatalogJson is null || !package.Status)
            throw new PackageCatalogException(StatusCodes.Status404NotFound, "Gói này không tồn tại hoặc đã ngừng bán.");

        var snapshot = DeserializeCatalog(package.CatalogJson);
        if (snapshot.Category == "membership" && snapshot.Tier == "basic")
            throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Hạng Cơ bản miễn phí, không cần tạo đơn.");

        var subtotal = snapshot.Prices.GetValueOrDefault(request.DurationMonths);
        if (subtotal <= 0)
            throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Gói chưa cấu hình giá cho kỳ hạn này.");

        var membership = await GetActiveMembershipAsync(userId, DateTime.UtcNow, cancellationToken);
        var discountPct = snapshot.Category == "sport"
            ? snapshot.Format == "coach" ? membership?.CoachDiscountPct ?? 0 : membership?.GroupDiscountPct ?? 0
            : 0;
        var discountAmount = decimal.Round(subtotal * discountPct / 100m, 0, MidpointRounding.AwayFromZero);
        var total = subtotal - discountAmount;
        var now = DateTime.UtcNow;
        var (start, end) = await GetProjectedPeriodAsync(userId, snapshot, request.DurationMonths, now, cancellationToken);

        var subscription = new Subscription
        {
            UserId = userId,
            PackageId = package.Id,
            BillingPeriod = $"months:{request.DurationMonths}",
            DurationMonths = request.DurationMonths,
            TotalAmount = total,
            DiscountPct = discountPct,
            DiscountAmount = discountAmount,
            PackageSnapshotJson = JsonSerializer.Serialize(snapshot, JsonOptions),
            PaymentStatus = PaymentStatus.Pending,
            StartDate = start,
            EndDate = end,
            CreatedAt = now,
            AutoRenew = false
        };
        db.Subscriptions.Add(subscription);
        await db.SaveChangesAsync(cancellationToken);
        return MapOrder(subscription, user.FullName, user.Email, snapshot);
    }

    public async Task<IReadOnlyList<PackageOrderResponse>> GetOrdersAsync(Guid? memberId, CancellationToken cancellationToken)
    {
        IQueryable<Subscription> query = db.Subscriptions.AsNoTracking()
            .Include(subscription => subscription.User)
            .Include(subscription => subscription.Package);
        if (memberId.HasValue)
            query = query.Where(subscription => subscription.UserId == memberId.Value);

        var subscriptions = await query.OrderByDescending(subscription => subscription.CreatedAt).ToListAsync(cancellationToken);
        return subscriptions.Select(subscription => MapOrder(
            subscription,
            subscription.User?.FullName ?? string.Empty,
            subscription.User?.Email ?? string.Empty,
            DeserializeSnapshot(subscription))).ToArray();
    }

    public async Task<PackageOrderResponse> ConfirmPaymentAsync(Guid orderId, CancellationToken cancellationToken)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var subscription = await db.Subscriptions
            .FromSqlInterpolated($"SELECT * FROM subscriptions WHERE id = {orderId} FOR UPDATE")
            .Include(item => item.User)
            .Include(item => item.Package)
            .FirstOrDefaultAsync(cancellationToken);
        if (subscription?.PackageSnapshotJson is null)
            throw new PackageCatalogException(StatusCodes.Status404NotFound, "Không tìm thấy đơn gói tập.");
        if (subscription.PaymentStatus != PaymentStatus.Pending)
            throw new PackageCatalogException(StatusCodes.Status409Conflict, "Đơn đã được xử lý, không thể xác nhận thanh toán lần nữa.");

        var snapshot = DeserializeSnapshot(subscription);
        var (start, end) = await GetProjectedPeriodAsync(
            subscription.UserId,
            snapshot,
            subscription.DurationMonths ?? ParseDuration(subscription.BillingPeriod),
            DateTime.UtcNow,
            cancellationToken);
        subscription.StartDate = start;
        subscription.EndDate = end;
        subscription.PaymentStatus = PaymentStatus.Completed;
        subscription.PaidAt = DateTime.UtcNow;
        var invoice = await db.Invoices.FirstOrDefaultAsync(item => item.Id == orderId, cancellationToken);
        if (invoice is not null)
        {
            invoice.Status = PaymentStatus.Completed;
            invoice.PaidAt = subscription.PaidAt;
        }
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return MapOrder(subscription, subscription.User?.FullName ?? string.Empty, subscription.User?.Email ?? string.Empty, snapshot);
    }

    public async Task<PackageCheckoutResponse> CheckoutAsync(
        Guid userId,
        CreatePackageCheckoutRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.PaymentMethod))
            throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Hình thức thanh toán không hợp lệ.");

        PaymentMethod paymentMethod;
        try
        {
            paymentMethod = PaymentMethodExtensions.ParseDbValue(request.PaymentMethod);
        }
        catch (ArgumentException)
        {
            throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Hình thức thanh toán không hợp lệ.");
        }

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var order = await CreateOrderAsync(userId, new CreatePackageOrderRequest
        {
            PackageId = request.PackageId,
            DurationMonths = request.DurationMonths
        }, cancellationToken);

        var subscription = await db.Subscriptions.SingleAsync(item => item.Id == order.Id, cancellationToken);
        subscription.PaymentMethod = paymentMethod;
        db.Invoices.Add(new Invoice
        {
            // Reuse the order ID so the invoice and subscription stay linked without a schema change.
            Id = subscription.Id,
            UserId = userId,
            TotalAmount = order.Total,
            PaymentMethod = paymentMethod,
            Status = PaymentStatus.Pending
        });
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return new PackageCheckoutResponse { Order = order, InvoiceId = subscription.Id };
    }

    public async Task<bool> HasActiveSportAccessAsync(Guid userId, string sport, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var snapshots = await db.Subscriptions.AsNoTracking()
            .Where(subscription => subscription.UserId == userId &&
                subscription.PaymentStatus == PaymentStatus.Completed &&
                subscription.PackageSnapshotJson != null &&
                subscription.StartDate <= now &&
                subscription.EndDate >= now)
            .Select(subscription => subscription.PackageSnapshotJson!)
            .ToListAsync(cancellationToken);
        return snapshots.Select(DeserializeCatalog)
            .Any(package => package.Category == "sport" && string.Equals(package.Sport?.Trim(), sport.Trim(), StringComparison.OrdinalIgnoreCase));
    }

    private async Task EnsureDefaultsAsync(CancellationToken cancellationToken)
    {
        var existingIds = await db.Packages.Where(package => Defaults.Select(item => item.Id).Contains(package.Id))
            .Select(package => package.Id).ToListAsync(cancellationToken);
        var missing = Defaults.Where(item => !existingIds.Contains(item.Id)).ToArray();
        if (missing.Length == 0)
            return;

        foreach (var item in missing)
        {
            db.Packages.Add(new Package
            {
                Id = item.Id,
                Name = item.Name,
                Tagline = item.Category == "membership" ? item.Tier : item.Format,
                PackageType = item.Category,
                MonthlyPrice = item.Prices[1],
                YearlyPrice = item.Prices[12],
                Description = item.Description,
                Status = item.IsActive,
                CatalogJson = JsonSerializer.Serialize(item, JsonOptions),
                Features = item.Benefits.Select(text => new PackageFeature
                {
                    PackageId = item.Id,
                    FeatureText = text
                }).ToList(),
                Benefits = item.Benefits.Select(text => new MembershipBenefit
                {
                    PackageId = item.Id,
                    BenefitType = "general",
                    Description = text
                }).ToList()
            });
        }
        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task<CatalogPackageDto?> GetActiveMembershipAsync(Guid userId, DateTime now, CancellationToken cancellationToken)
    {
        var subscriptions = await db.Subscriptions.AsNoTracking()
            .Include(s => s.Package)
            .Where(subscription => subscription.UserId == userId &&
                subscription.PaymentStatus == PaymentStatus.Completed &&
                subscription.StartDate <= now &&
                subscription.EndDate >= now)
            .OrderByDescending(subscription => subscription.StartDate)
            .ToListAsync(cancellationToken);
            
        return subscriptions.Select(DeserializeSnapshot).FirstOrDefault(package => package.Category == "membership" && package.Tier is "plus" or "premium");
    }

    private async Task<(DateTime Start, DateTime End)> GetProjectedPeriodAsync(
        Guid userId,
        CatalogPackageDto snapshot,
        int durationMonths,
        DateTime now,
        CancellationToken cancellationToken)
    {
        var today = now.Date;
        var subscriptions = await db.Subscriptions.AsNoTracking()
            .Where(item => item.UserId == userId &&
                item.PaymentStatus == PaymentStatus.Completed &&
                item.PackageSnapshotJson != null)
            .Select(item => new { item.PackageSnapshotJson, item.EndDate })
            .ToListAsync(cancellationToken);

        var matchingEnds = subscriptions
            .Select(item => new { Package = DeserializeCatalog(item.PackageSnapshotJson!), item.EndDate })
            .Where(item => item.Package.Category == snapshot.Category &&
                (snapshot.Category == "membership" || string.Equals(item.Package.Sport, snapshot.Sport, StringComparison.OrdinalIgnoreCase)))
            .Select(item => item.EndDate.Date);
        var latestEnd = matchingEnds.DefaultIfEmpty(today.AddDays(-1)).Max();
        var start = latestEnd >= today ? latestEnd.AddDays(1) : today;
        var end = start.AddMonths(durationMonths).AddDays(-1);
        return (DateTime.SpecifyKind(start, DateTimeKind.Utc), DateTime.SpecifyKind(end, DateTimeKind.Utc).AddHours(23).AddMinutes(59).AddSeconds(59));
    }

    private static PackageOrderResponse MapOrder(Subscription subscription, string userName, string userEmail, CatalogPackageDto snapshot)
    {
        var duration = subscription.DurationMonths ?? ParseDuration(subscription.BillingPeriod);
        return new PackageOrderResponse
        {
            Id = subscription.Id,
            UserId = subscription.UserId,
            UserName = userName,
            UserEmail = userEmail,
            PackageId = subscription.PackageId ?? snapshot.Id,
            PackageSnapshot = snapshot,
            DurationMonths = duration,
            Subtotal = subscription.TotalAmount + subscription.DiscountAmount,
            DiscountPct = subscription.DiscountPct,
            DiscountAmount = subscription.DiscountAmount,
            Total = subscription.TotalAmount,
            Status = subscription.PaymentStatus switch
            {
                PaymentStatus.Completed => "paid",
                PaymentStatus.Failed or PaymentStatus.Expired => "failed",
                _ => "pending"
            },
            CreatedAt = subscription.CreatedAt,
            PaidAt = subscription.PaidAt,
            StartDate = subscription.StartDate,
            EndDate = subscription.EndDate
        };
    }

    private static int ParseDuration(string? billingPeriod) => billingPeriod switch
    {
        "monthly" => 1,
        "yearly" => 12,
        _ when billingPeriod?.StartsWith("months:", StringComparison.OrdinalIgnoreCase) == true &&
            int.TryParse(billingPeriod.AsSpan(7), out var months) => months,
        _ => 1
    };

    private static CatalogPackageDto DeserializeSnapshot(Subscription subscription)
    {
        if (!string.IsNullOrWhiteSpace(subscription.PackageSnapshotJson))
            return DeserializeCatalog(subscription.PackageSnapshotJson);
            
        var package = subscription.Package;
        if (package == null) 
        {
            return new CatalogPackageDto
            {
                Id = subscription.PackageId ?? "unknown",
                Category = "unknown",
                Name = "Gói đã xóa hoặc không xác định",
                Description = "Thông tin gói tập không còn tồn tại trong hệ thống.",
                Prices = new Dictionary<int, decimal> { [1] = subscription.TotalAmount },
                Benefits = new List<string>(),
                Terms = new List<string>()
            };
        }
            
        return new CatalogPackageDto
        {
            Id = package.Id,
            Category = package.PackageType,
            Name = package.Name,
            Tier = package.PackageType == "membership" ? package.Tagline : null,
            Format = package.PackageType == "sport" ? package.Tagline : null,
            Description = package.Description ?? "",
            IsActive = package.Status,
            Prices = new Dictionary<int, decimal>
            {
                [1] = package.MonthlyPrice ?? 0,
                [12] = package.YearlyPrice ?? (package.MonthlyPrice ?? 0) * 12 * 0.85m
            },
            Benefits = package.Features?.Select(f => f.FeatureText).ToList() ?? new List<string>(),
            Terms = new List<string> { "Gói tập được áp dụng theo quy định của trung tâm." },
            Sport = package.PackageType == "sport" ? package.Name : null
        };
    }

    private static CatalogPackageDto DeserializeCatalog(string json) =>
        JsonSerializer.Deserialize<CatalogPackageDto>(json, JsonOptions)
        ?? throw new PackageCatalogException(StatusCodes.Status500InternalServerError, "Dữ liệu danh mục gói không hợp lệ.");

    private static void ValidatePackage(string id, CatalogPackageDto package, bool create)
    {
        if (!string.Equals(id, package.Id, StringComparison.Ordinal))
            throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Mã gói trong URL và nội dung không khớp.");
        if (string.IsNullOrWhiteSpace(package.Name) || string.IsNullOrWhiteSpace(package.Description))
            throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Tên gói và mô tả là bắt buộc.");
        if (package.Benefits.Count == 0 || package.Benefits.Any(string.IsNullOrWhiteSpace))
            throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Gói cần ít nhất một quyền lợi hợp lệ.");
        if (!new[] { 1, 3, 6, 12 }.All(period => package.Prices.TryGetValue(period, out var price) && price >= 0))
            throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Cần cấu hình giá không âm cho các kỳ hạn 1, 3, 6 và 12 tháng.");
        if (package.Category is not ("membership" or "sport"))
            throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Loại gói không hợp lệ.");
        if (package.Category == "membership")
        {
            if (create || package.Tier is not ("basic" or "plus" or "premium"))
                throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Chỉ được cấu hình ba hạng Cơ bản, Plus và Premium.");
            if (package.Tier == "basic" && (package.Prices.Values.Any(price => price != 0) || !package.IsActive))
                throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Hạng Cơ bản luôn miễn phí và luôn được mở.");
            if (package.Tier != "basic" && package.Prices.Values.Any(price => price <= 0))
                throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Các hạng trả phí phải có giá lớn hơn 0.");
            if (package.GroupDiscountPct is < 0 or > 100 || package.CoachDiscountPct is < 0 or > 100 || package.BookingAdvanceHours < 0)
                throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Quy tắc ưu đãi không hợp lệ.");
        }
        else
        {
            if (string.IsNullOrWhiteSpace(package.Sport) || string.IsNullOrWhiteSpace(package.Area) ||
                package.Format is not ("self" or "group" or "coach") ||
                package.Prices.Values.Any(price => price <= 0))
                throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Gói môn tập cần bộ môn, khu, hình thức và giá dương cho đủ kỳ hạn.");
            if (package.Format != "self" && (package.SessionsPerMonth is null or <= 0 || package.MinutesPerSession is null or <= 0))
                throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Gói lớp nhóm/Coach cần số buổi mỗi tháng và thời lượng.");
            if (package.Format == "group" && package.MaxClassSize is null or <= 0)
                throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Gói lớp nhóm cần sĩ số tối đa hợp lệ.");
            if (create && package.Id.StartsWith("membership-", StringComparison.Ordinal))
                throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Mã gói môn không hợp lệ.");
        }
    }
}
