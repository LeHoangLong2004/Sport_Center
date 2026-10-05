using SmartGym.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartGym.Application.Interfaces;

public interface IPackageService
{
    Task<IEnumerable<PackageResponse>> GetAllPackagesAsync();
    Task<PackageResponse?> GetPackageByIdAsync(string id);
    Task<PackageResponse> CreatePackageAsync(CreatePackageRequest request);
    Task<bool> DeletePackageAsync(string id);
}
