using System;
using System.Linq;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Repositories;

public sealed class SupabaseCheckInRepository : ICheckInRepository
{
    private readonly global::Supabase.Client _client;

    public SupabaseCheckInRepository(global::Supabase.Client client)
    {
        _client = client;
    }

    public async Task<CheckInRecord> AddAsync(
        Guid memberId,
        Guid? scheduleId,
        DateTime checkInTime,
        CheckInResult result,
        Guid? subscriptionId = null,
        Guid? facilityId = null,
        string? method = "qr"
    )
    {
        var record = new CheckInRecord(
            Guid.NewGuid(),
            memberId,
            facilityId ?? Guid.Empty,
            subscriptionId ?? Guid.Empty,
            checkInTime,
            null
        );

        if (result == CheckInResult.Approved)
        {
            // 1. Tự động tìm subscription đang active nếu chưa được truyền
            if (!subscriptionId.HasValue || subscriptionId.Value == Guid.Empty)
            {
                try
                {
                    var subResponse = await _client.From<SubscriptionCheckInModel>()
                        .Where(x => x.UserId == memberId)
                        .Get();
                    var now = DateTime.UtcNow;
                    var activeSub = subResponse.Models
                        .Where(x => (string.Equals(x.PaymentStatus, "completed", StringComparison.OrdinalIgnoreCase)
                                  || string.Equals(x.PaymentStatus, "paid", StringComparison.OrdinalIgnoreCase)
                                  || string.Equals(x.PaymentStatus, "active", StringComparison.OrdinalIgnoreCase))
                                 && x.EndDate.Date >= now.Date)
                        .OrderByDescending(x => x.EndDate)
                        .FirstOrDefault();

                    if (activeSub != null && activeSub.Id != Guid.Empty)
                    {
                        subscriptionId = activeSub.Id;
                        if (!facilityId.HasValue || facilityId.Value == Guid.Empty)
                        {
                            facilityId = activeSub.FacilityId;
                        }
                    }
                }
                catch
                {
                    // Fallback
                }
            }

            // 2. Tự động lấy facility mặc định đầu tiên nếu chưa có facility_id
            if (!facilityId.HasValue || facilityId.Value == Guid.Empty)
            {
                try
                {
                    var facResponse = await _client.From<FacilityModel>().Limit(1).Get();
                    var defaultFac = facResponse.Models.FirstOrDefault();
                    if (defaultFac != null && defaultFac.Id != Guid.Empty)
                    {
                        facilityId = defaultFac.Id;
                    }
                }
                catch
                {
                    // Fallback
                }
            }

            var model = new GateCheckinModel
            {
                Id = record.Id,
                MemberId = memberId,
                BranchId = (facilityId.HasValue && facilityId.Value != Guid.Empty) ? facilityId.Value : null,
                MemberPackageId = (subscriptionId.HasValue && subscriptionId.Value != Guid.Empty) ? subscriptionId.Value : null,
                CheckInTime = checkInTime,
                Method = string.IsNullOrWhiteSpace(method) ? "qr" : method,
            };

            await _client.From<GateCheckinModel>().Insert(model);

            record = new CheckInRecord(
                record.Id,
                memberId,
                facilityId ?? Guid.Empty,
                subscriptionId ?? Guid.Empty,
                checkInTime,
                null
            );
        }

        return record;
    }

    public async Task<CheckInRecord?> FindOpenByMemberAsync(Guid memberId)
    {
        var response = await _client
            .From<GateCheckinModel>()
            .Where(x => x.MemberId == memberId)
            .Get();

        return response.Models
            .Where(x => x.CheckOutTime is null)
            .OrderByDescending(x => x.CheckInTime)
            .FirstOrDefault()?.ToDomain();
    }

    public async Task<CheckInRecord?> CheckOutAsync(Guid recordId, DateTime checkOutTime)
    {
        var response = await _client
            .From<GateCheckinModel>()
            .Where(x => x.Id == recordId)
            .Get();
        var model = response.Models.FirstOrDefault();
        if (model is null || model.CheckOutTime is not null)
            return null;

        model.CheckOutTime = checkOutTime;
        await _client.From<GateCheckinModel>().Update(model);
        return model.ToDomain();
    }

    public async Task<IReadOnlyList<CheckInRecord>> GetByMemberAsync(Guid memberId)
    {
        try
        {
            var response = await _client
                .From<GateCheckinModel>()
                .Where(x => x.MemberId == memberId)
                .Get();

            return response
                .Models.Select(m => m.ToDomain())
                .OrderByDescending(r => r.CheckInTime)
                .ToList();
        }
        catch
        {
            return Array.Empty<CheckInRecord>();
        }
    }

    public async Task<IReadOnlyList<CheckInRecord>> GetAllAsync()
    {
        try
        {
            var response = await _client.From<GateCheckinModel>().Get();
            return response
                .Models.Select(m => m.ToDomain())
                .OrderByDescending(r => r.CheckInTime)
                .ToList();
        }
        catch
        {
            return Array.Empty<CheckInRecord>();
        }
    }

    public async Task<IReadOnlyList<CheckInRecord>> GetTodayAsync()
    {
        try
        {
            var today = DateTime.UtcNow.Date;
            var endOfToday = today.AddDays(1);

            var response = await _client
                .From<GateCheckinModel>()
                .Where(x => x.CheckInTime >= today && x.CheckInTime < endOfToday)
                .Get();

            return response
                .Models.Select(m => m.ToDomain())
                .OrderByDescending(r => r.CheckInTime)
                .ToList();
        }
        catch
        {
            return Array.Empty<CheckInRecord>();
        }
    }
}
