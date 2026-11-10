using Microsoft.AspNetCore.Routing;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Endpoint quản lý Bộ môn thể thao (Sports), Cơ sở vật chất / Phòng tập (Facilities) và Upload hình ảnh.
/// Được phân tách thành các module partial độc lập (< 120 dòng/file):
/// - SportFacilityEndpoints.Sports.cs: Quản lý danh mục môn thể thao (/api/sports)
/// - SportFacilityEndpoints.Facilities.cs: Quản lý phòng tập / sân bãi (/api/facilities)
/// - SportFacilityEndpoints.Upload.cs: Tải lên hình ảnh Cloudinary & Local (/api/upload/image)
/// </summary>
public static partial class SportFacilityEndpoints
{
    /// <summary>
    /// Đăng ký các route môn thể thao, cơ sở vật chất và upload ảnh vào hệ thống.
    /// </summary>
    /// <param name="app">Đối tượng IEndpointRouteBuilder</param>
    public static void MapSportFacilityEndpoints(this IEndpointRouteBuilder app)
    {
        MapSportEndpoints(app);
        MapFacilityEndpoints(app);
        MapUploadEndpoints(app);
    }
}
