using SmartGym.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartGym.Application.Interfaces;

/// <summary>
/// Giao diện dịch vụ Quản lý Gói tập (Package Management Service).
/// Cung cấp các thao tác CRUD danh mục gói tập thể thao và gói thẻ thành viên.
/// </summary>
public interface IPackageService
{
    Task<IEnumerable<PackageResponse>> GetAllPackagesAsync();
    Task<PackageResponse?> GetPackageByIdAsync(string id);
    Task<PackageResponse> CreatePackageAsync(CreatePackageRequest request);
    Task<PackageResponse?> UpdatePackageAsync(string id, CreatePackageRequest request);
    Task<bool> DeletePackageAsync(string id);
}
