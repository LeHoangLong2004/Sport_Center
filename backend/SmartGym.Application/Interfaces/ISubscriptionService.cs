using SmartGym.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartGym.Application.Interfaces;

public interface ISubscriptionService
{
    Task<IEnumerable<SubscriptionResponse>> GetMySubscriptionsAsync(Guid userId);
    Task<SubscriptionResponse> SubscribeToPackageAsync(Guid userId, CreateSubscriptionRequest request);
}
