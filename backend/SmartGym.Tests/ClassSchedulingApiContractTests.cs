using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using SmartGym.Api.Endpoints;
using SmartGym.Api.Services;
using SmartGym.Application.Services;
using SmartGym.Infrastructure.Persistence.EF;
using Xunit;

namespace SmartGym.Tests;

public sealed class ClassSchedulingApiContractTests
{
    [Theory]
    [InlineData("/api/class-courses/schedule-preview", "POST")]
    [InlineData("/api/class-courses/", "POST")]
    [InlineData("/api/class-courses/proposals", "POST")]
    [InlineData("/api/class-courses/{courseId:guid}/approve", "PUT")]
    [InlineData("/api/class-courses/{courseId:guid}/enroll", "POST")]
    public async Task Class_course_workflow_routes_are_registered(string routePattern, string method)
    {
        var builder = WebApplication.CreateBuilder();
        builder.Services.AddRouting();
        builder.Services.AddSingleton<ClassSchedulePolicy>();
        builder.Services.AddSingleton<ClassCourseWorkflowService>(_ => null!);
        builder.Services.AddSingleton<SmartGymDbContext>(_ => null!);
        await using var app = builder.Build();

        app.MapClassSchedulingEndpoints();

        var endpoint = ((IEndpointRouteBuilder)app).DataSources
            .SelectMany(source => source.Endpoints)
            .OfType<RouteEndpoint>()
            .Single(item => item.RoutePattern.RawText == routePattern);
        var methods = endpoint.Metadata.GetMetadata<HttpMethodMetadata>();

        Assert.NotNull(methods);
        Assert.Contains(method, methods!.HttpMethods);
        Assert.NotNull(endpoint.Metadata.GetMetadata<Microsoft.AspNetCore.Authorization.IAuthorizeData>());
    }

    [Theory]
    [InlineData("/api/class-pricing/", "GET")]
    [InlineData("/api/class-pricing/{sportId:guid}/quote", "GET")]
    [InlineData("/api/class-pricing/{sportId:guid}", "PUT")]
    public async Task Class_pricing_routes_are_registered(string routePattern, string method)
    {
        var builder = WebApplication.CreateBuilder();
        builder.Services.AddRouting();
        builder.Services.AddSingleton<SmartGymDbContext>(_ => null!);
        await using var app = builder.Build();

        app.MapSportClassPricingEndpoints();

        var endpoint = ((IEndpointRouteBuilder)app).DataSources
            .SelectMany(source => source.Endpoints)
            .OfType<RouteEndpoint>()
            .Single(item => item.RoutePattern.RawText == routePattern);
        var methods = endpoint.Metadata.GetMetadata<HttpMethodMetadata>();

        Assert.NotNull(methods);
        Assert.Contains(method, methods!.HttpMethods);
        Assert.NotNull(endpoint.Metadata.GetMetadata<Microsoft.AspNetCore.Authorization.IAuthorizeData>());
    }
}
