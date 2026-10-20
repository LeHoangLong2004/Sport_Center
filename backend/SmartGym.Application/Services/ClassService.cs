using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Interfaces;
using SmartGym.Application.Interfaces.Repositories;

namespace SmartGym.Application.Services;

public sealed partial class ClassService
{
    private readonly IGroupClassRepository _classRepository;
    private readonly IPtSessionRepository _ptSessionRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly SmartGym.Application.Interfaces.IUserRepository _userRepository;

    public ClassService(
        IGroupClassRepository classRepository,
        IPtSessionRepository ptSessionRepository,
        ISubscriptionRepository subscriptionRepository,
        SmartGym.Application.Interfaces.IUserRepository userRepository
    )
    {
        _classRepository = classRepository;
        _ptSessionRepository = ptSessionRepository;
        _subscriptionRepository = subscriptionRepository;
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<ClassResponse>> GetAllClassesAsync()
    {
        return await _classRepository.GetAllClassesAsync();
    }

    public async Task<IEnumerable<ClassResponse>> GetAvailableClassesAsync()
    {
        return await _classRepository.GetAvailableClassesAsync();
    }

    public async Task<ClassDetailResponse?> GetClassDetailAsync(Guid classId)
    {
        return await _classRepository.GetClassDetailByIdAsync(classId);
    }

    private static bool Overlaps(DateTime start, DateTime end, DateTime otherStart, int otherDurationMinutes)
    {
        var otherEnd = otherStart.AddMinutes(Math.Max(1, otherDurationMinutes));
        return start < otherEnd && otherStart < end;
    }

    private static bool IsBlockingPtSession(SmartGym.Domain.Entities.PtSession session)
        => IsBlockingPtSession(session.Status);

    private static bool IsBlockingPtSession(string? status)
        => status?.Trim().ToLowerInvariant() is "scheduled" or "pending" or "confirmed" or "sắp diễn ra";

    private static bool IsBlockingMemberBooking(string? status)
        => status?.Trim().ToLowerInvariant() is "pending" or "confirmed" or "approved";
}

