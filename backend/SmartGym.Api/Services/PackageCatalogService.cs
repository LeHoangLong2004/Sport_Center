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

public sealed partial class PackageCatalogService(SmartGymDbContext db)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true,
    };

    private static readonly CatalogPackageDto[] Defaults =
    [
        new()
        {
            Id = "membership-basic",
            Category = "membership",
            Tier = "basic",
            TierRank = 0,
            Name = "Cơ bản",
            Description = "Hạng mặc định dành cho mọi hội viên.",
            IsActive = true,
            Prices = Prices(0, 0, 0, 0),
            Benefits = ["Hạng mặc định miễn phí", "Có thể nâng cấp lên hạng thành viên trả phí", "1 vé mời bạn bè mỗi tháng (1 Day-Pass/tháng)"],
            Terms =
            [
                "Miễn phí và không giới hạn thời hạn.",
                "Quyền lợi thành viên áp dụng theo điều kiện của từng dịch vụ.",
            ],
            LockerTerms = "Sử dụng tủ theo điều kiện của trung tâm trong buổi tập hợp lệ.",
        },
        new()
        {
            Id = "membership-plus",
            Category = "membership",
            Tier = "plus",
            TierRank = 1,
            Name = "Plus",
            Description = "Thêm ưu đãi đặt lớp và chủ động đặt lớp sớm hơn.",
            IsActive = true,
            Prices = Prices(149000, 399000, 749000, 1399000),
            Benefits =
            [
                "Giảm 8% khi đặt lớp nhóm",
                "Giảm 5% khi đặt Coach 1–1",
                "Đặt lớp trước 72 giờ (3 ngày)",
                "3 vé mời bạn bè mỗi tháng (3 Day-Pass/tháng)",
                "Mượn 1 khăn tập miễn phí mỗi buổi",
            ],
            Terms =
            [
                "Hiệu lực tính từ ngày xác nhận thanh toán hoặc nối tiếp hạng trả phí hiện tại.",
                "Ưu đãi áp dụng theo điều kiện của từng dịch vụ.",
            ],
            GroupDiscountPct = 8,
            CoachDiscountPct = 5,
            BookingAdvanceHours = 72,
            LockerTerms = "Được sử dụng tủ trong buổi tập hợp lệ theo điều kiện của trung tâm.",
        },
        new()
        {
            Id = "membership-premium",
            Category = "membership",
            Tier = "premium",
            TierRank = 2,
            Name = "Premium VIP",
            Description = "Hạng đặc quyền cao cấp với đầy đủ tiện ích thư giãn và ưu đãi tối đa.",
            IsActive = true,
            Prices = Prices(299000, 799000, 1499000, 2799000),
            Benefits =
            [
                "Giảm 15% khi đặt lớp nhóm",
                "Giảm 8% khi đặt Coach 1–1",
                "Đặt lớp trước 120 giờ (5 ngày)",
                "5 vé mời bạn bè mỗi tháng (5 Day-Pass/tháng)",
                "Miễn phí Xông hơi đá muối & Hồ sục Jacuzzi",
                "Tủ đồ thông minh riêng & Combo khăn tập cao cấp",
            ],
            Terms =
            [
                "Hiệu lực tính từ ngày xác nhận thanh toán hoặc nối tiếp hạng trả phí hiện tại.",
                "Ưu đãi áp dụng theo điều kiện của từng dịch vụ.",
            ],
            GroupDiscountPct = 15,
            CoachDiscountPct = 8,
            BookingAdvanceHours = 120,
            LockerTerms = "Tủ đồ thông minh riêng trong buổi tập kèm combo khăn cao cấp.",
        },
    ];

    private static Dictionary<int, decimal> Prices(
        decimal one,
        decimal three,
        decimal six,
        decimal twelve
    ) =>
        new()
        {
            [1] = one,
            [3] = three,
            [6] = six,
            [12] = twelve,
        };

}
