using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Interfaces;

public interface IBodyMetricRepository
{
    Task<BodyMetric> AddAsync(BodyMetric bodyMetric);
    Task<IEnumerable<BodyMetric>> GetByUserIdAsync(Guid userId);
}
