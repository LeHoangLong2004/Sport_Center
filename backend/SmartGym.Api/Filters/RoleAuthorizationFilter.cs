using System.Security.Claims;
using SmartGym.Domain.Enums;

namespace SmartGym.Api.Filters;

/// <summary>
/// FR-003 / NFR-006: Role-based authorization endpoint filter.
/// Checks that the authenticated user has one of the required roles.
/// </summary>
public sealed class RoleAuthorizationFilter : IEndpointFilter
{
    private readonly UserRole[] _allowedRoles;

    public RoleAuthorizationFilter(params UserRole[] allowedRoles)
    {
        _allowedRoles = allowedRoles;
    }

    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next)
    {
        var httpContext = context.HttpContext;

        if (httpContext.User.Identity?.IsAuthenticated != true)
        {
            return Results.Json(
                new { message = "Vui lòng đăng nhập để truy cập tài nguyên này." },
                statusCode: 401);
        }

        var roleClaim = httpContext.User.FindFirstValue(ClaimTypes.Role);
        if (string.IsNullOrEmpty(roleClaim) ||
            !Enum.TryParse<UserRole>(roleClaim, ignoreCase: true, out var userRole) ||
            !_allowedRoles.Contains(userRole))
        {
            return Results.Json(
                new { message = "Bạn không có quyền truy cập chức năng này.", requiredRoles = _allowedRoles.Select(r => r.ToString()) },
                statusCode: 403);
        }

        return await next(context);
    }
}

/// <summary>
/// Extension methods to easily apply role-based authorization to endpoint groups or individual endpoints.
/// Usage: group.AddEndpointFilter(Authorize.Roles(UserRole.Member, UserRole.Receptionist));
/// </summary>
public static class Authorize
{
    public static RoleAuthorizationFilter Roles(params UserRole[] roles) => new(roles);
}
