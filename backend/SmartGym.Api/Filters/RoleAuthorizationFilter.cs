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
        EndpointFilterDelegate next
    )
    {
        var httpContext = context.HttpContext;

        if (httpContext.User.Identity?.IsAuthenticated != true)
        {
            return Results.Json(
                new { message = "Vui lòng đăng nhập để truy cập tài nguyên này." },
                statusCode: 401
            );
        }

        var roleClaim = httpContext.User.FindFirstValue(ClaimTypes.Role)
            ?? httpContext.User.FindFirst("role")?.Value;

        if (string.IsNullOrWhiteSpace(roleClaim))
        {
            return Results.Json(
                new
                {
                    message = "Bạn không có quyền truy cập chức năng này.",
                    requiredRoles = _allowedRoles.Select(r => r.ToString()),
                },
                statusCode: 403
            );
        }

        var normalized = roleClaim.Trim().ToLowerInvariant().Replace("_", "").Replace(" ", "").Replace("-", "");

        bool isAllowed = false;

        // Admin có toàn quyền quản trị và thực hiện mọi tác vụ của Manager & Lễ tân
        if (normalized is "admin" or "administrator")
        {
            isAllowed = true;
        }
        else if (normalized is "manager" or "centermanager")
        {
            isAllowed = _allowedRoles.Contains(UserRole.CenterManager) || _allowedRoles.Contains(UserRole.Receptionist);
        }
        else if (normalized is "receptionist" or "reception" or "staff")
        {
            isAllowed = _allowedRoles.Contains(UserRole.Receptionist) || _allowedRoles.Contains(UserRole.CenterManager);
        }
        else if (normalized is "coach" or "trainer" or "pt")
        {
            isAllowed = _allowedRoles.Contains(UserRole.Coach);
        }
        else if (normalized is "member" or "customer" or "user")
        {
            isAllowed = _allowedRoles.Contains(UserRole.Member);
        }
        else if (Enum.TryParse<UserRole>(roleClaim, ignoreCase: true, out var userRole))
        {
            isAllowed = _allowedRoles.Contains(userRole);
        }

        if (!isAllowed)
        {
            return Results.Json(
                new
                {
                    message = "Bạn không có quyền truy cập chức năng này.",
                    requiredRoles = _allowedRoles.Select(r => r.ToString()),
                },
                statusCode: 403
            );
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
