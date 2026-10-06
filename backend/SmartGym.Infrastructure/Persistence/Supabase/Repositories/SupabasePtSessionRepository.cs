using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Repositories;

public sealed class SupabasePtSessionRepository : IPtSessionRepository
{
    private readonly global::Supabase.Client _client;

    public SupabasePtSessionRepository(global::Supabase.Client client)
    {
        _client = client;
    }

    public async Task<IEnumerable<PtSession>> GetSessionsByCoachAndDateAsync(Guid coachId, DateTime date)
    {
        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1);

        // 1. Get enrollments for this coach
        var enrollmentsResponse = await _client.From<PtEnrollmentModel>()
            .Where(x => x.CoachId == coachId)
            .Get();

        var enrollmentIds = enrollmentsResponse.Models.Select(e => e.Id).ToList();

        if (!enrollmentIds.Any())
        {
            return Enumerable.Empty<PtSession>();
        }

        // 2. Get sessions for those enrollments on the specific date
        // Note: Postgrest-csharp might not support 'in' queries on large arrays gracefully, but for small sets it's fine.
        var sessionsResponse = await _client.From<PtSessionModel>()
            .Where(x => enrollmentIds.Contains(x.EnrollmentId))
            .Where(x => x.ScheduleTime >= startOfDay)
            .Where(x => x.ScheduleTime < endOfDay)
            .Where(x => x.Status == "scheduled") // Only consider scheduled sessions for overlap
            .Get();

        return sessionsResponse.Models.Select(x => x.ToDomain(coachId));
    }
}
