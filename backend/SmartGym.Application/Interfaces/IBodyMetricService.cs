using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.BodyMetrics;

namespace SmartGym.Application.Interfaces;

public interface IBodyMetricService
{
    Task<BodyMetricResponse> CreateAsync(Guid userId, CreateBodyMetricRequest request);
    Task<IEnumerable<BodyMetricResponse>> GetByUserIdAsync(Guid userId);
}
