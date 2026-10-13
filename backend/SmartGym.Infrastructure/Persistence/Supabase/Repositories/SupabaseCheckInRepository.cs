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
        CheckInResult result
    )
    {
        var record = new CheckInRecord(
            Guid.NewGuid(),
            memberId,
            Guid.Empty,
            Guid.Empty,
            checkInTime,
            null
        );

        if (result == CheckInResult.Approved)
        {
            // Lấy subscription đang ACTIVE của member
            var activePkg = await _client
                .From<MemberPackageModel>()
                .Where(p => p.MemberId == memberId && p.Status == "ACTIVE")
                .Get();
            var pkgId = activePkg.Models.FirstOrDefault()?.Id;

            var model = new GateCheckinModel
            {
                Id = record.Id,
                MemberId = memberId,
                BranchId = null,       // facility_id — để null nếu không xác định được
                MemberPackageId = pkgId,
                CheckInTime = checkInTime,
                Method = "manual",
            };

            await _client.From<GateCheckinModel>().Insert(model);

            record = new CheckInRecord(record.Id, memberId, Guid.Empty, pkgId ?? Guid.Empty, checkInTime, null);
        }

        return record;
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
