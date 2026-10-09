using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.BodyMetrics;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Services;

public class BodyMetricService : IBodyMetricService
{
    private readonly IBodyMetricRepository _repository;

    public BodyMetricService(IBodyMetricRepository repository)
    {
        _repository = repository;
    }

    public async Task<BodyMetricResponse> CreateAsync(Guid userId, CreateBodyMetricRequest request)
    {
        // Auto-calculate BMI if not provided but weight & height are present
        decimal? bmi = null;
        if (request.Weight.HasValue && request.Height.HasValue && request.Height.Value > 0)
        {
            var heightInMeters = request.Height.Value / 100m;
            bmi = Math.Round(request.Weight.Value / (heightInMeters * heightInMeters), 2);
        }

        var entity = new BodyMetric
        {
            UserId = userId,
            Weight = request.Weight,
            Height = request.Height,
            BodyFat = request.BodyFat,
            MuscleMass = request.MuscleMass,
            Bmi = bmi,
            RecordedAt = DateTime.UtcNow
        };

        var savedEntity = await _repository.AddAsync(entity);

        return MapToResponse(savedEntity);
    }

    public async Task<IEnumerable<BodyMetricResponse>> GetByUserIdAsync(Guid userId)
    {
        var metrics = await _repository.GetByUserIdAsync(userId);
        return metrics.Select(MapToResponse);
    }

    private BodyMetricResponse MapToResponse(BodyMetric m)
    {
        return new BodyMetricResponse
        {
            Id = m.Id,
            UserId = m.UserId,
            Weight = m.Weight,
            Height = m.Height,
            BodyFat = m.BodyFat,
            MuscleMass = m.MuscleMass,
            Bmi = m.Bmi,
            RecordedAt = m.RecordedAt
        };
    }
}
