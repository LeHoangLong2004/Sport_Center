using System;

namespace SmartGym.Application.DTOs.BodyMetrics;

public class BodyMetricResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public decimal? BodyFat { get; set; }
    public decimal? MuscleMass { get; set; }
    public decimal? Bmi { get; set; }
    public DateTime RecordedAt { get; set; }
}
