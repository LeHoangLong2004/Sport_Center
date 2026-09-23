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

    public async Task<CheckInRecord> AddAsync(Guid memberId, Guid? scheduleId, DateTime checkInTime, CheckInResult result)
    {
        // Currently, CheckInResult is not stored in DB based on the new schema, it just inserts if successful.
        // We will insert anyway for logging, assuming only Approved checkins get recorded in gate_checkins table.
        // If Denied, we just return the object but don't insert.
        
        var record = new CheckInRecord(Guid.NewGuid(), memberId, Guid.Empty /* BranchId handled elsewhere normally, fake for now */, Guid.Empty, checkInTime, null);
        
        if (result == CheckInResult.Approved)
        {
            // We need to fetch an active member package for the member to fill the member_package_id.
            var activePkg = await _client.From<MemberPackageModel>().Where(p => p.MemberId == memberId && p.Status == "ACTIVE").Get();
            var pkgId = activePkg.Models.FirstOrDefault()?.Id ?? Guid.Empty;

            // Fetch a branch id (fake it with the user's branch id)
            var user = await _client.From<UserModel>().Where(u => u.Id == memberId).Single();
            var branchId = user?.BranchId ?? Guid.Empty;

            var model = new GateCheckinModel
            {
                Id = record.Id,
                MemberId = memberId,
                BranchId = branchId,
                MemberPackageId = pkgId,
                CheckInTime = checkInTime,
                ReceptionistId = null // Could be populated from current user Context
            };

            await _client.From<GateCheckinModel>().Insert(model);
            
            // Re-create with correct IDs to return
            record = new CheckInRecord(record.Id, memberId, branchId, pkgId, checkInTime, null);
        }

        return record;
    }

    public async Task<IReadOnlyList<CheckInRecord>> GetByMemberAsync(Guid memberId)
    {
        var response = await _client.From<GateCheckinModel>()
            .Where(x => x.MemberId == memberId)
            .Get();

        return response.Models.Select(m => m.ToDomain()).OrderByDescending(r => r.CheckInTime).ToList();
    }

    public async Task<IReadOnlyList<CheckInRecord>> GetAllAsync()
    {
        var response = await _client.From<GateCheckinModel>().Get();
        return response.Models.Select(m => m.ToDomain()).OrderByDescending(r => r.CheckInTime).ToList();
    }

    public async Task<IReadOnlyList<CheckInRecord>> GetTodayAsync()
    {
        var today = DateTime.UtcNow.Date;
        var endOfToday = today.AddDays(1);

        var response = await _client.From<GateCheckinModel>()
            .Where(x => x.CheckInTime >= today && x.CheckInTime < endOfToday)
            .Get();

        return response.Models.Select(m => m.ToDomain()).OrderByDescending(r => r.CheckInTime).ToList();
    }
}
