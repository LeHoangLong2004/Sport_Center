using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Application.DTOs;

namespace SmartGym.Api.Endpoints;

public static class AppointmentEndpoints
{
    public static void MapAppointmentEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/appointments").WithTags("Appointments");

        group.MapGet("/", async (IAppointmentRepository repo) =>
        {
            var data = await repo.GetAllAsync();
            return Results.Ok(data);
        });

        group.MapPost("/", async ([FromBody] AppointmentDto request, IAppointmentRepository repo) =>
        {
            request.Id = Guid.NewGuid();
            await repo.AddAsync(request);
            return Results.Ok(request);
        });
    }
}
