using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartGym.Application.Services;

public class PackageService : IPackageService
{
    private readonly IPackageRepository _packageRepository;

    public PackageService(IPackageRepository packageRepository)
    {
        _packageRepository = packageRepository;
    }

    public async Task<IEnumerable<PackageResponse>> GetAllPackagesAsync()
    {
        var packages = await _packageRepository.GetAllAsync();
        return packages.Select(MapToResponse);
    }

    public async Task<PackageResponse?> GetPackageByIdAsync(string id)
    {
        var package = await _packageRepository.GetByIdAsync(id);
        if (package == null) return null;
        return MapToResponse(package);
    }

    public async Task<PackageResponse> CreatePackageAsync(CreatePackageRequest request)
    {
        var package = new Package
        {
            Id = request.Id,
            Name = request.Name,
            Tagline = request.Tagline,
            PackageType = request.PackageType,
            MonthlyPrice = request.MonthlyPrice,
            YearlyPrice = request.YearlyPrice,
            Description = request.Description,
            Status = true,
            Features = request.Features.Select(f => new PackageFeature { FeatureText = f }).ToList(),
            Benefits = request.Benefits.Select(b => new MembershipBenefit { BenefitType = "general", Description = b }).ToList()
        };

        await _packageRepository.AddAsync(package);
        return MapToResponse(package);
    }

    public async Task<bool> DeletePackageAsync(string id)
    {
        var package = await _packageRepository.GetByIdAsync(id);
        if (package == null) return false;
        
        await _packageRepository.DeleteAsync(id);
        return true;
    }

    private PackageResponse MapToResponse(Package p)
    {
        return new PackageResponse
        {
            Id = p.Id,
            Name = p.Name,
            Tagline = p.Tagline,
            PackageType = p.PackageType,
            MonthlyPrice = p.MonthlyPrice,
            YearlyPrice = p.YearlyPrice,
            Description = p.Description,
            Status = p.Status,
            Features = p.Features.Select(f => f.FeatureText),
            Benefits = p.Benefits.Select(b => b.Description)
        };
    }
}
