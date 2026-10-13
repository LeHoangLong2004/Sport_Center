using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces;
using System;
using System.Threading.Tasks;

namespace SmartGym.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", async (RegisterRequest request, IAuthService authService) =>
        {
            try
            {
                var response = await authService.RegisterAsync(request);
                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        });

        group.MapPost("/login", async (LoginRequest request, IAuthService authService) =>
        {
            try
            {
                var response = await authService.LoginAsync(request);
                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        });

        // Auto-refresh dev token for Coach
        group.MapPost("/dev-token", async (IUserRepository userRepo, ITokenService tokenService) =>
        {
            var coach = await userRepo.GetByIdAsync(Guid.Parse("25f50fba-506a-4edf-9db7-43f77f6741a4"));
            if (coach == null)
            {
                var allUsers = await userRepo.GetAllUsersAsync();
                coach = System.Linq.Enumerable.FirstOrDefault(allUsers, u => u.Role != null && u.Role.Name.ToLower() == "coach");
            }

            if (coach == null)
            {
                coach = new SmartGym.Domain.Entities.User
                {
                    Id = Guid.Parse("25f50fba-506a-4edf-9db7-43f77f6741a4"),
                    FullName = "Enam",
                    Email = "hoxuananhnam1@gmail.com",
                    PhoneNumber = "0989123789",
                    Status = true
                };
            }

            var token = tokenService.GenerateJwtToken(coach, "coach");
            return Results.Ok(new
            {
                token,
                user = new
                {
                    id = coach.Id,
                    fullName = coach.FullName,
                    email = coach.Email,
                    roleName = "coach",
                    role = "coach"
                }
            });
        });
    }
}
