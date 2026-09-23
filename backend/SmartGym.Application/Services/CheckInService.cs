using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Enums;

namespace SmartGym.Application.Services;

public sealed class CheckInService
{
    private readonly IMemberPackageRepository _packageRepository;
    private readonly ICheckInRepository _checkInRepository;

    public CheckInService(
        IMemberPackageRepository packageRepository,
        ICheckInRepository checkInRepository)
    {
        _packageRepository = packageRepository;
        _checkInRepository = checkInRepository;
    }

    public async Task<(bool Allowed, string Reason, string? PackageName)> ValidateAndCheckInAsync(Guid memberId, DateTime checkInTime)
    {
        var package = await _packageRepository.FindActivePackageAsync(memberId);
        if (package is null)
        {
            await _checkInRepository.AddAsync(memberId, null, checkInTime, CheckInResult.Denied);
            return (false, "Không tìm thấy gói tập đang hoạt động (ACTIVE).", null);
        }

        if (checkInTime.Date > package.EndDate)
        {
            await _checkInRepository.AddAsync(memberId, null, checkInTime, CheckInResult.Denied);
            return (false, $"Gói tập đã hết hạn vào ngày {package.EndDate:dd/MM/yyyy}.", null);
        }

        var plan = await _packageRepository.FindPlanByIdAsync(package.PlanId);
        if (plan is null)
        {
            await _checkInRepository.AddAsync(memberId, null, checkInTime, CheckInResult.Denied);
            return (false, "Không tìm thấy thông tin gói cước.", null);
        }

        if (plan.AccessHours == AccessHours.OffPeak)
        {
            var checkInHour = checkInTime.Hour;
            if (checkInHour >= 16)
            {
                await _checkInRepository.AddAsync(memberId, null, checkInTime, CheckInResult.Denied);
                return (false, "Gói Off-Peak chỉ được check-in trước 16:00. Vui lòng nâng cấp gói All-Access.", plan.PlanName);
            }
        }

        if (package.RemainingSessions.HasValue && package.RemainingSessions <= 0)
        {
            await _checkInRepository.AddAsync(memberId, null, checkInTime, CheckInResult.Denied);
            return (false, "Gói tập đã hết số buổi. Vui lòng gia hạn hoặc mua gói mới.", plan.PlanName);
        }

        await _checkInRepository.AddAsync(memberId, null, checkInTime, CheckInResult.Approved);
        return (true, "Check-in thành công! Chào mừng bạn đến SmartGym.", plan.PlanName);
    }
}
