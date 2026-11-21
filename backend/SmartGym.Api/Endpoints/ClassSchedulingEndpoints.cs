using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.Security.Claims;
using SmartGym.Application.DTOs.ClassScheduling;
using SmartGym.Application.Services;
using SmartGym.Api.Services;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

public static class ClassSchedulingEndpoints
{
    public static void MapClassSchedulingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/class-courses").WithTags("Class Courses");

        group.MapPost("/schedule-preview", (SchedulePreviewRequest request, ClassSchedulePolicy policy) =>
        {
            var result = policy.Preview(request, DateTimeOffset.UtcNow);
            return result.IsValid
                ? Results.Ok(result)
                : Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["schedule"] = result.Errors.ToArray(),
                });
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin", "coach"));

        group.MapPost("/", async (CreateClassCourseRequest request, HttpContext context, ClassCourseWorkflowService workflow) =>
        {
            if (!TryGetUserId(context, out var actorId)) return Results.Unauthorized();
            if (!request.CoachId.HasValue) return Results.BadRequest(new { message = "Manager phải chọn huấn luyện viên phụ trách." });
            var result = await workflow.CreateAsync(request, actorId, request.CoachId.Value, approveImmediately: true);
            return result.Result != null ? Results.Created($"/api/class-courses/{result.Result.CourseId}", result.Result) : Results.BadRequest(new { message = result.Error });
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        group.MapPost("/proposals", async (CreateClassCourseRequest request, HttpContext context, SmartGymDbContext db, ClassCourseWorkflowService workflow) =>
        {
            if (!TryGetUserId(context, out var actorId)) return Results.Unauthorized();
            var coachId = await CoachProfileResolver.FindByUserIdAsync(db, actorId, activeOnly: true);
            if (!coachId.HasValue) return Results.BadRequest(new { message = "Tài khoản Coach chưa có hồ sơ hoạt động." });
            var result = await workflow.CreateAsync(request, actorId, coachId.Value, approveImmediately: false);
            return result.Result != null ? Results.Created($"/api/class-courses/{result.Result.CourseId}", result.Result) : Results.BadRequest(new { message = result.Error });
        }).RequireAuthorization(policy => policy.RequireRole("coach"));

        group.MapPut("/{courseId:guid}/approve", async (Guid courseId, HttpContext context, ClassCourseWorkflowService workflow) =>
        {
            if (!TryGetUserId(context, out var actorId)) return Results.Unauthorized();
            var result = await workflow.ApproveAsync(courseId, actorId);
            return result.Success ? Results.Ok(new { message = "Đã duyệt toàn bộ khóa học." }) : Results.BadRequest(new { message = result.Error });
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        group.MapPost("/{courseId:guid}/enroll", async (Guid courseId, EnrollClassCourseRequest request, HttpContext context, ClassCourseWorkflowService workflow) =>
        {
            if (!TryGetUserId(context, out var userId)) return Results.Unauthorized();
            var result = await workflow.EnrollAsync(courseId, userId, request);
            return result.Result != null ? Results.Ok(result.Result) : Results.BadRequest(new { message = result.Error });
        }).RequireAuthorization(policy => policy.RequireRole("member"));
    }

    private static bool TryGetUserId(HttpContext context, out Guid userId) =>
        Guid.TryParse(context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? context.User.FindFirst("sub")?.Value, out userId);
}
