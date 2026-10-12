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
            Name = "Cơ bản",
            Description = "Hạng mặc định dành cho mọi hội viên.",
            IsActive = true,
            Prices = Prices(0, 0, 0, 0),
            Benefits = ["Hạng mặc định miễn phí", "Có thể mua riêng từng gói môn tập"],
            Terms =
            [
                "Miễn phí và không giới hạn thời hạn.",
                "Gói thành viên không bao gồm quyền vào khu tập.",
            ],
            LockerTerms = "Sử dụng tủ theo điều kiện của gói môn và trong buổi tập hợp lệ.",
        },
        new()
        {
            Id = "membership-plus",
            Category = "membership",
            Tier = "plus",
            Name = "Plus",
            Description = "Thêm ưu đãi mua gói môn và chủ động đặt lớp sớm hơn.",
            IsActive = true,
            Prices = Prices(149000, 399000, 749000, 1399000),
            Benefits =
            [
                "Giảm 5% gói tự tập và lớp nhóm",
                "Giảm 2% gói Coach 1–1",
                "Đặt lớp trước 72 giờ",
            ],
            Terms =
            [
                "Hiệu lực tính từ ngày xác nhận thanh toán hoặc nối tiếp hạng trả phí hiện tại.",
                "Ưu đãi không thay thế quyền tập theo gói môn.",
                "Gói thành viên không bao gồm quyền vào khu tập.",
            ],
            GroupDiscountPct = 5,
            CoachDiscountPct = 2,
            BookingAdvanceHours = 72,
            LockerTerms = "Được sử dụng tủ trong buổi tập hợp lệ theo điều kiện của gói môn.",
        },
        new()
        {
            Id = "membership-premium",
            Category = "membership",
            Tier = "premium",
            Name = "Premium",
            Description = "Mức ưu đãi cao hơn và thời gian đặt lớp sớm hơn.",
            IsActive = true,
            Prices = Prices(299000, 799000, 1499000, 2799000),
            Benefits =
            [
                "Giảm 10% gói tự tập và lớp nhóm",
                "Giảm 5% gói Coach 1–1",
                "Đặt lớp trước 120 giờ",
                "Ưu tiên hỗ trợ tại trung tâm",
            ],
            Terms =
            [
                "Hiệu lực tính từ ngày xác nhận thanh toán hoặc nối tiếp hạng trả phí hiện tại.",
                "Ưu đãi không thay thế quyền tập theo gói môn.",
                "Gói thành viên không bao gồm quyền vào khu tập.",
            ],
            GroupDiscountPct = 10,
            CoachDiscountPct = 5,
            BookingAdvanceHours = 120,
            LockerTerms = "Được sử dụng tủ trong buổi tập hợp lệ theo điều kiện của gói môn.",
        },
        new()
        {
            Id = "sport-gym-self",
            Category = "sport",
            Name = "Gym tự tập",
            Description = "Tập luyện linh hoạt trong khu Gym.",
            IsActive = true,
            Prices = Prices(500000, 1350000, 2550000, 4800000),
            Benefits = ["Sử dụng thiết bị khu Gym", "Tủ đồ trong buổi tập"],
            Terms =
            [
                "Chỉ sử dụng khu Gym trong khung giờ mở cửa.",
                "Gói tự tập không bao gồm chỗ trong lớp nhóm hoặc Coach 1–1.",
            ],
            Sport = "Gym",
            Area = "Khu Gym",
            Format = "self",
            AccessHours = "06:00–22:00",
            LockerTerms = "Tủ dùng trong buổi tập; không giữ đồ qua đêm.",
        },
        new()
        {
            Id = "sport-yoga-group",
            Category = "sport",
            Name = "Yoga nhóm",
            Description = "Lớp nhóm phù hợp cho người mới và người tập lâu năm.",
            IsActive = true,
            Prices = Prices(700000, 1890000, 3570000, 6720000),
            Benefits =
            [
                "12 buổi tập mỗi tháng",
                "Hướng dẫn bởi Coach",
                "Sử dụng Studio Yoga trong buổi học",
            ],
            Terms =
            [
                "Buổi tập tính theo tháng sử dụng từ ngày kích hoạt.",
                "Hủy lớp đúng hạn được trả lại lượt; không chuyển lượt chưa dùng sang kỳ sau.",
            ],
            Sport = "Yoga",
            Area = "Studio Yoga",
            Format = "group",
            SessionsPerMonth = 12,
            MinutesPerSession = 60,
            MaxClassSize = 16,
            LockerTerms = "Tủ dùng trong buổi học; không giữ đồ qua đêm.",
        },
        new()
        {
            Id = "sport-boxing-coach",
            Category = "sport",
            Name = "Boxing Coach 1–1",
            Description = "Huấn luyện cá nhân với lộ trình theo mục tiêu.",
            IsActive = true,
            Prices = Prices(2400000, 6480000, 12240000, 23040000),
            Benefits =
            [
                "8 buổi Coach mỗi tháng",
                "60 phút mỗi buổi",
                "Đã bao gồm quyền sử dụng khu Boxing",
            ],
            Terms =
            [
                "Lịch tập phụ thuộc Coach và khung giờ còn trống.",
                "Buổi được cấp theo tháng sử dụng; hủy muộn hoặc không đến có thể mất lượt.",
            ],
            Sport = "Boxing",
            Area = "Combat Zone",
            Format = "coach",
            SessionsPerMonth = 8,
            MinutesPerSession = 60,
            MaxClassSize = 1,
            LockerTerms = "Tủ dùng trong buổi học; không giữ đồ qua đêm.",
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
