using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Application.Services;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;

namespace SmartGym.Tests;

public class Flow4CheckInServiceTests
{
    private class MockMemberPackageRepository : IMemberPackageRepository
    {
        public readonly Dictionary<Guid, PackagePlan> Plans = new();
        public readonly Dictionary<Guid, MemberPackage> ActivePackages = new();

        public Task<IReadOnlyList<PackagePlan>> GetAllPlansAsync() =>
            Task.FromResult<IReadOnlyList<PackagePlan>>(Plans.Values.ToList());

        public Task<PackagePlan?> FindPlanByIdAsync(Guid id) =>
            Task.FromResult(Plans.GetValueOrDefault(id));

        public Task<IReadOnlyList<MemberPackage>> GetByMemberAsync(Guid memberId) =>
            Task.FromResult<IReadOnlyList<MemberPackage>>(ActivePackages.Values.Where(p => p.MemberId == memberId).ToList());

        public Task<MemberPackage?> FindActivePackageAsync(Guid memberId) =>
            Task.FromResult(ActivePackages.GetValueOrDefault(memberId));

        public Task UpdateAsync(MemberPackage package)
        {
            ActivePackages[package.MemberId] = package;
            return Task.CompletedTask;
        }
    }

    private class MockCheckInRepository : ICheckInRepository
    {
        public readonly List<CheckInRecord> Records = new();

        public Task<CheckInRecord> AddAsync(Guid memberId, Guid? scheduleId, DateTime checkInTime, CheckInResult result)
        {
            var record = new CheckInRecord(
                Guid.NewGuid(),
                memberId,
                Guid.NewGuid(),
                Guid.NewGuid(),
                checkInTime,
                null,
                null
            );
            Records.Add(record);
            return Task.FromResult(record);
        }

        public Task<CheckInRecord?> FindOpenByMemberAsync(Guid memberId)
        {
            var open = Records.FirstOrDefault(r => r.MemberId == memberId && r.CheckOutTime == null);
            return Task.FromResult(open);
        }

        public Task<CheckInRecord?> CheckOutAsync(Guid recordId, DateTime checkOutTime)
        {
            var idx = Records.FindIndex(r => r.Id == recordId);
            if (idx >= 0)
            {
                var old = Records[idx];
                var updated = new CheckInRecord(
                    old.Id,
                    old.MemberId,
                    old.BranchId,
                    old.MemberPackageId,
                    old.CheckInTime,
                    old.ReceptionistId,
                    checkOutTime
                );
                Records[idx] = updated;
                return Task.FromResult<CheckInRecord?>(updated);
            }
            return Task.FromResult<CheckInRecord?>(null);
        }

        public Task<IReadOnlyList<CheckInRecord>> GetByMemberAsync(Guid memberId) =>
            Task.FromResult<IReadOnlyList<CheckInRecord>>(Records.Where(r => r.MemberId == memberId).ToList());

        public Task<IReadOnlyList<CheckInRecord>> GetAllAsync() =>
            Task.FromResult<IReadOnlyList<CheckInRecord>>(Records.ToList());

        public Task<IReadOnlyList<CheckInRecord>> GetTodayAsync() =>
            Task.FromResult<IReadOnlyList<CheckInRecord>>(Records.Where(r => r.CheckInTime.Date == DateTime.UtcNow.Date).ToList());
    }

    private (CheckInService service, MockMemberPackageRepository packageRepo, MockCheckInRepository checkInRepo) CreateService()
    {
        var packageRepo = new MockMemberPackageRepository();
        var checkInRepo = new MockCheckInRepository();
        var service = new CheckInService(packageRepo, checkInRepo);
        return (service, packageRepo, checkInRepo);
    }

    [Fact]
    public async Task ValidateAndCheckIn_ShouldDeny_WhenMemberAlreadyInsideCenter()
    {
        var (service, _, checkInRepo) = CreateService();
        var memberId = Guid.NewGuid();

        // Already checked in and open
        await checkInRepo.AddAsync(memberId, null, DateTime.UtcNow.AddHours(-1), CheckInResult.Approved);

        var (allowed, reason, _) = await service.ValidateAndCheckInAsync(memberId, DateTime.UtcNow);

        Assert.False(allowed);
        Assert.Contains("vẫn đang ở trong trung tâm", reason);
    }

    [Fact]
    public async Task ValidateAndCheckIn_ShouldDeny_WhenNoActivePackageFound()
    {
        var (service, _, checkInRepo) = CreateService();
        var memberId = Guid.NewGuid();

        var (allowed, reason, _) = await service.ValidateAndCheckInAsync(memberId, DateTime.UtcNow);

        Assert.False(allowed);
        Assert.Contains("Không tìm thấy gói tập đang hoạt động", reason);
        Assert.Contains(checkInRepo.Records, r => r.MemberId == memberId);
    }

    [Fact]
    public async Task ValidateAndCheckIn_ShouldDeny_WhenPackageHasExpired()
    {
        var (service, packageRepo, checkInRepo) = CreateService();
        var memberId = Guid.NewGuid();
        var planId = Guid.NewGuid();

        packageRepo.Plans[planId] = new PackagePlan(planId, "Gói 1 Tháng", "Mô tả", 500000, 30, null, AccessHours.All, true, true);
        packageRepo.ActivePackages[memberId] = new MemberPackage(
            Guid.NewGuid(),
            memberId,
            planId,
            Guid.NewGuid(),
            DateTime.UtcNow.AddDays(-31),
            DateTime.UtcNow.AddDays(-1), // Expired yesterday
            null,
            PackageStatus.Active,
            0,
            0,
            null,
            false
        );

        var (allowed, reason, _) = await service.ValidateAndCheckInAsync(memberId, DateTime.UtcNow);

        Assert.False(allowed);
        Assert.Contains("Gói tập đã hết hạn", reason);
        Assert.Contains(checkInRepo.Records, r => r.MemberId == memberId);
    }

    [Fact]
    public async Task ValidateAndCheckIn_ShouldDeny_WhenOffPeakPackageChecksInAfter16h()
    {
        var (service, packageRepo, _) = CreateService();
        var memberId = Guid.NewGuid();
        var planId = Guid.NewGuid();

        packageRepo.Plans[planId] = new PackagePlan(planId, "Gói Giờ Thấp Điểm (Off-Peak)", "OffPeak", 350000, 30, null, AccessHours.OffPeak, false, true);
        packageRepo.ActivePackages[memberId] = new MemberPackage(
            Guid.NewGuid(),
            memberId,
            planId,
            Guid.NewGuid(),
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(30),
            null,
            PackageStatus.Active,
            0,
            0,
            null,
            false
        );

        var checkInAfternoon = new DateTime(2026, 10, 28, 17, 30, 0, DateTimeKind.Utc);
        var (allowed, reason, _) = await service.ValidateAndCheckInAsync(memberId, checkInAfternoon);

        Assert.False(allowed);
        Assert.Contains("Gói Off-Peak chỉ được check-in trước 16:00", reason);
    }

    [Fact]
    public async Task ValidateAndCheckIn_ShouldApprove_WhenOffPeakPackageChecksInBefore16h()
    {
        var (service, packageRepo, checkInRepo) = CreateService();
        var memberId = Guid.NewGuid();
        var planId = Guid.NewGuid();

        packageRepo.Plans[planId] = new PackagePlan(planId, "Gói Giờ Thấp Điểm (Off-Peak)", "OffPeak", 350000, 30, null, AccessHours.OffPeak, false, true);
        packageRepo.ActivePackages[memberId] = new MemberPackage(
            Guid.NewGuid(),
            memberId,
            planId,
            Guid.NewGuid(),
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(30),
            null,
            PackageStatus.Active,
            0,
            0,
            null,
            false
        );

        var checkInMorning = new DateTime(2026, 10, 28, 9, 0, 0, DateTimeKind.Utc);
        var (allowed, reason, planName) = await service.ValidateAndCheckInAsync(memberId, checkInMorning);

        Assert.True(allowed);
        Assert.Contains("Check-in thành công", reason);
        Assert.Equal("Gói Giờ Thấp Điểm (Off-Peak)", planName);
        Assert.Contains(checkInRepo.Records, r => r.MemberId == memberId);
    }

    [Fact]
    public async Task ValidateAndCheckIn_ShouldDeny_WhenSessionsExhausted()
    {
        var (service, packageRepo, _) = CreateService();
        var memberId = Guid.NewGuid();
        var planId = Guid.NewGuid();

        packageRepo.Plans[planId] = new PackagePlan(planId, "Gói 10 Buổi PT", "PT", 2000000, 30, 10, AccessHours.All, false, true);
        packageRepo.ActivePackages[memberId] = new MemberPackage(
            Guid.NewGuid(),
            memberId,
            planId,
            Guid.NewGuid(),
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(30),
            0, // remaining 0
            PackageStatus.Active,
            0,
            0,
            null,
            false
        );

        var (allowed, reason, _) = await service.ValidateAndCheckInAsync(memberId, DateTime.UtcNow);

        Assert.False(allowed);
        Assert.Contains("Gói tập đã hết số buổi", reason);
    }

    [Fact]
    public async Task CheckOutAsync_ShouldFail_WhenNoOpenRecordFound()
    {
        var (service, _, _) = CreateService();
        var memberId = Guid.NewGuid();

        var (allowed, message, record) = await service.CheckOutAsync(memberId, DateTime.UtcNow);

        Assert.False(allowed);
        Assert.Contains("chưa có phiên check-in đang mở", message);
        Assert.Null(record);
    }

    [Fact]
    public async Task CheckOutAsync_ShouldSucceed_WhenValidOpenRecordExists()
    {
        var (service, _, checkInRepo) = CreateService();
        var memberId = Guid.NewGuid();
        var checkInTime = DateTime.UtcNow.AddHours(-2);

        await checkInRepo.AddAsync(memberId, null, checkInTime, CheckInResult.Approved);

        var checkOutTime = DateTime.UtcNow;
        var (allowed, message, record) = await service.CheckOutAsync(memberId, checkOutTime);

        Assert.True(allowed);
        Assert.NotNull(record);
        Assert.Equal(checkOutTime, record.CheckOutTime);
    }
}
