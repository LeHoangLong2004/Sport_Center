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
                "Đặt lớp trước 72 giờ (3 ngày)",
                "1 vé mời bạn bè mỗi tháng (1 Day-Pass/tháng)",
                "Mượn 1 khăn tập miễn phí mỗi buổi",
                "Đo InBody định kỳ 1 lần/tháng",
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
            Name = "Premium VIP",
            Description = "Hạng đặc quyền cao cấp với đầy đủ tiện ích thư giãn và ưu đãi tối đa.",
            IsActive = true,
            Prices = Prices(299000, 799000, 1499000, 2799000),
            Benefits =
            [
                "Giảm 10% gói tự tập và lớp nhóm",
                "Giảm 5% gói Coach 1–1",
                "Đặt lớp trước 120 giờ (5 ngày)",
                "2 vé mời bạn bè mỗi tháng (2 Day-Pass/tháng)",
                "Miễn phí Xông hơi đá muối & Hồ sục Jacuzzi",
                "Tủ đồ thông minh riêng & Combo khăn tập cao cấp",
                "Đo InBody không giới hạn & Trợ lý tư vấn AI",
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
            LockerTerms = "Tủ đồ thông minh riêng trong buổi tập kèm combo khăn cao cấp.",
        },
        new()
        {
            Id = "sport-gym-self",
            Category = "sport",
            Name = "Gym tự tập",
            Description = "Tập luyện linh hoạt trong khu Gym với đầy đủ máy móc tạ khối và Cardio.",
            IsActive = true,
            Prices = Prices(500000, 1350000, 2550000, 4800000),
            Benefits = ["Sử dụng toàn bộ thiết bị khu Gym", "Tủ đồ cá nhân và phòng tắm nóng lạnh trong buổi tập"],
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
            Id = "sport-swimming-self",
            Category = "sport",
            Name = "Bơi lội tự do (Bể 4 mùa)",
            Description = "Bơi lội thoải mái với hệ thống gia nhiệt nước ấm và xử lý muối khoáng.",
            IsActive = true,
            Prices = Prices(700000, 1890000, 3570000, 6720000),
            Benefits = ["Sử dụng làn bơi và phao bơi hỗ trợ", "Nước ấm 4 mùa và phòng tắm tráng nước nóng"],
            Terms =
            [
                "Chỉ sử dụng khu Bể bơi trong khung giờ mở cửa.",
                "Tuân thủ nội quy trang phục bơi tiêu chuẩn.",
            ],
            Sport = "Bơi lội",
            Area = "Khu Bể bơi 4 mùa",
            Format = "self",
            AccessHours = "06:00–21:30",
            LockerTerms = "Tủ dùng trong buổi bơi; trả chìa khóa khi rời khu vực.",
        },
        new()
        {
            Id = "sport-yoga-group",
            Category = "sport",
            Name = "Yoga & Pilates Nhóm",
            Description = "Lớp nhóm phù hợp cho người mới và nâng cao, hướng dẫn bởi Master Trainer.",
            IsActive = true,
            Prices = Prices(700000, 1890000, 3570000, 6720000),
            Benefits =
            [
                "12 buổi tập mỗi tháng",
                "Thời lượng 60 phút mỗi buổi",
                "Thảm tập, gạch xốp và dụng cụ hỗ trợ miễn phí",
                "Đã bao gồm quyền sử dụng Studio Yoga trong ca tập",
            ],
            Terms =
            [
                "Buổi tập tính theo tháng sử dụng từ ngày kích hoạt.",
                "Hủy lớp trước 2 giờ được hoàn trả lượt tập.",
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
            Description = "Huấn luyện cá nhân chuyên sâu 1 kèm 1 với giáo án mục tiêu riêng biệt.",
            IsActive = true,
            Prices = Prices(2400000, 6480000, 12240000, 23040000),
            Benefits =
            [
                "8 buổi Coach kèm riêng mỗi tháng",
                "60 phút mỗi buổi",
                "Đã bao gồm quyền sử dụng Combat Zone & găng tập",
                "Chỉnh sửa kỹ thuật đấm, né và rèn thể lực chuyên sâu",
            ],
            Terms =
            [
                "Lịch tập đặt linh hoạt theo khung giờ trống của Coach.",
                "Hủy lịch trước ít nhất 4 giờ để không bị trừ buổi.",
            ],
            Sport = "Boxing",
            Area = "Combat Zone",
            Format = "coach",
            SessionsPerMonth = 8,
            MinutesPerSession = 60,
            MaxClassSize = 1,
            LockerTerms = "Tủ dùng trong buổi học; không giữ đồ qua đêm.",
        },
        new()
        {
            Id = "sport-gym-coach",
            Category = "sport",
            Name = "Gym Kèm PT 1–1 Chuyên Sâu",
            Description = "Huấn luyện viên cá nhân theo sát từng buổi, cam kết mục tiêu tăng cơ giảm mỡ.",
            IsActive = true,
            Prices = Prices(3000000, 8100000, 15300000, 28800000),
            Benefits =
            [
                "12 buổi PT kèm riêng mỗi tháng",
                "Thiết kế giáo án tập luyện và thực đơn dinh dưỡng riêng",
                "Đã bao gồm quyền sử dụng khu Gym",
                "Theo dõi chỉ số InBody và điều chỉnh form chuẩn xác",
            ],
            Terms =
            [
                "Lịch tập do học viên và PT chủ động sắp xếp trên hệ thống.",
                "Hủy lịch báo trước 4 giờ để giữ lượt tập.",
            ],
            Sport = "Gym",
            Area = "Khu Gym",
            Format = "coach",
            SessionsPerMonth = 12,
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
