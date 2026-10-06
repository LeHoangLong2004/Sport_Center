using SmartGym.Domain.Entities;

namespace SmartGym.Application.Interfaces.Repositories;

public interface IPtSessionRepository
{
    // Lấy các buổi PT do HLV phụ trách trong một ngày cụ thể (được join từ pt_enrollments)
    Task<IEnumerable<PtSession>> GetSessionsByCoachAndDateAsync(Guid coachId, DateTime date);
}
