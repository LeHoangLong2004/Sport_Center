using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using SmartGym.Api.Endpoints;

namespace SmartGym.Api.Extensions;

public static class EndpointRouteExtensions
{
    public static WebApplication MapSmartGymEndpoints(this WebApplication app)
    {
        app.MapLegacyCatalogEndpoints();
        app.MapLegacyClassEndpoints();
        app.MapLegacyScheduleEndpoints();
        app.MapProductEndpoints();
        app.MapProductOrderEndpoints();
        app.MapAppointmentEndpoints();

        app.MapGet("/", () => Results.Redirect("/swagger"));
        return app;
    }
}
