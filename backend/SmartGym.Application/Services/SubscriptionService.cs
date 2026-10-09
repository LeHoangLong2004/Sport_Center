using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartGym.Application.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly IPackageRepository _packageRepository;

    public SubscriptionService(ISubscriptionRepository subscriptionRepository, IPackageRepository packageRepository)
    {
        _subscriptionRepository = subscriptionRepository;
        _packageRepository = packageRepository;
    }

    public async Task<IEnumerable<SubscriptionResponse>> GetMySubscriptionsAsync(Guid userId)
    {
        var subscriptions = await _subscriptionRepository.GetByUserIdAsync(userId);
        return subscriptions.Select(s => new SubscriptionResponse
        {
            Id = s.Id,
            UserId = s.UserId,
            PackageId = s.PackageId,
            PackageName = s.Package?.Name,
            BillingPeriod = s.BillingPeriod,
            TotalAmount = s.TotalAmount,
            PaymentMethod = s.PaymentMethod,
            PaymentStatus = s.PaymentStatus,
            StartDate = s.StartDate,
            EndDate = s.EndDate,
            AutoRenew = s.AutoRenew,
            CreatedAt = s.CreatedAt
        });
    }

    public async Task<SubscriptionResponse> SubscribeToPackageAsync(Guid userId, CreateSubscriptionRequest request)
    {
        var package = await _packageRepository.GetByIdAsync(request.PackageId);
        if (package == null) throw new Exception("Package not found");

        decimal amount = request.BillingPeriod == "yearly" 
            ? (package.YearlyPrice ?? 0) 
            : (package.MonthlyPrice ?? 0);

        var subscription = new Subscription
        {
            UserId = userId,
            PackageId = package.Id,
            BillingPeriod = request.BillingPeriod,
            TotalAmount = amount,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = SmartGym.Domain.Enums.PaymentStatus.Pending, // Will be updated to paid via webhook/gateway
            StartDate = DateTime.UtcNow,
            EndDate = request.BillingPeriod == "yearly" ? DateTime.UtcNow.AddYears(1) : DateTime.UtcNow.AddMonths(1),
            AutoRenew = false,
            CreatedAt = DateTime.UtcNow
        };

        await _subscriptionRepository.AddAsync(subscription);

        return new SubscriptionResponse
        {
            Id = subscription.Id,
            UserId = subscription.UserId,
            PackageId = subscription.PackageId,
            PackageName = package.Name,
            BillingPeriod = subscription.BillingPeriod,
            TotalAmount = subscription.TotalAmount,
            PaymentMethod = subscription.PaymentMethod,
            PaymentStatus = subscription.PaymentStatus,
            StartDate = subscription.StartDate,
            EndDate = subscription.EndDate,
            AutoRenew = subscription.AutoRenew,
            CreatedAt = subscription.CreatedAt
        };
    }
}
