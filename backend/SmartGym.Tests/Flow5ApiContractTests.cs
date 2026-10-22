using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using SmartGym.Application.Interfaces;
using SmartGym.Api.Endpoints;
using SmartGym.Infrastructure.Persistence.EF;
using Xunit;

namespace SmartGym.Tests;

public sealed class Flow5ApiContractTests
{
    [Fact]
    public async Task Assignment_endpoint_is_registered_as_post_route()
    {
        var builder = WebApplication.CreateBuilder();
        builder.Services.AddRouting();
        // Route metadata generation only needs service registrations; no request is executed.
        builder.Services.AddSingleton<IFlow5WorkoutPlanService>(_ => null!);
        builder.Services.AddSingleton<IFlow5RecommendationService>(_ => null!);
        builder.Services.AddSingleton<IFlow5AssignmentService>(_ => null!);
        builder.Services.AddSingleton<IFlow5AuthorizationService>(_ => null!);
        builder.Services.AddSingleton<IFlow5ContextService>(_ => null!);
        builder.Services.AddSingleton<IFlow5WorkoutPlanValidator>(_ => null!);
        builder.Services.AddSingleton<SmartGymDbContext>(_ => null!);
        await using var app = builder.Build();

        app.MapFlow5WorkoutPlanEndpoints();

        var route = ((IEndpointRouteBuilder)app).DataSources
            .SelectMany(source => source.Endpoints)
            .OfType<RouteEndpoint>()
            .Single(endpoint => endpoint.RoutePattern.RawText == "/api/workout-plans/{id:guid}/assign");
        var methods = route.Metadata.GetMetadata<HttpMethodMetadata>();

        Assert.NotNull(methods);
        Assert.Contains("POST", methods!.HttpMethods);
    }
}
