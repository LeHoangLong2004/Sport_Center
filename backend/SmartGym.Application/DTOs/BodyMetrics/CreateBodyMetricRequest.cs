using System;

namespace SmartGym.Application.DTOs.BodyMetrics;

public class CreateBodyMetricRequest
{
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public decimal? BodyFat { get; set; }
    public decimal? MuscleMass { get; set; }
}
