using System;
using System.Text.Json;
using System.Threading;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using SmartGym.Application.Interfaces;
using SmartGym.Infrastructure.AI;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints
{
    /// <summary>
    /// Flow 6 — Member AI Assistant.
    /// Reuses the Flow 5 Gemini provider (same backend-only API key + global quota limiter),
    /// injects the member's own data as context and returns a short answer plus a navigation action.
    /// </summary>
    public static partial class MemberEndpoints
    {
        private static void MapMemberAiAssistantEndpoints(RouteGroupBuilder group)
        {
            // POST /api/member/ai-ask — Flow 6 AI assistant
            group.MapPost("/ai-ask", async (
                HttpContext context,
                [FromBody] JsonElement body,
                SmartGymDbContext db,
                IAiRecommendationProvider aiProvider,
                IAiQuotaLimiter quotaLimiter,
                ILoggerFactory loggerFactory,
                CancellationToken cancellationToken) =>
            {
                var logger = loggerFactory.CreateLogger("Flow6.MemberAiAssistant");

                var question = body.ValueKind == JsonValueKind.Object && body.TryGetProperty("query", out var q) && q.ValueKind == JsonValueKind.String
                    ? (q.GetString() ?? string.Empty).Trim()
                    : string.Empty;

                if (string.IsNullOrWhiteSpace(question))
                    return Results.BadRequest(new { message = "Vui lòng nhập câu hỏi." });

                if (question.Length > AiMaxQuestionLength)
                    question = question[..AiMaxQuestionLength];

                var history = ReadChatHistory(body);
                var memberContext = await BuildMemberAiContextAsync(context, body, db, logger, cancellationToken);

                // Per-member throttle so a single user cannot exhaust the shared Flow 5/6 Gemini quota.
                var throttleKey = $"flow6:{memberContext.UserId ?? context.Connection.RemoteIpAddress?.ToString() ?? "anonymous"}";
                if (!quotaLimiter.TryAcquire(throttleKey, AiPerMemberRequestsPerMinute, out var retryAfter))
                {
                    return Results.Ok(BuildAiResult(
                        $"⏳ Bạn đang hỏi hơi nhanh. Vui lòng thử lại sau khoảng {Math.Max(1, (int)Math.Ceiling(retryAfter.TotalSeconds))} giây nhé!",
                        "none",
                        "throttled"));
                }

                var prompt = BuildMemberAiPrompt(memberContext, history, question);
                var correlationId = context.TraceIdentifier;

                AiProviderResponse aiResponse;
                try
                {
                    aiResponse = await aiProvider.GenerateAsync(new AiProviderRequest(prompt, correlationId), cancellationToken);
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    logger.LogWarning(ex, "Flow 6 AI provider threw an exception. CorrelationId: {CorrelationId}", correlationId);
                    aiResponse = AiProviderResponse.Failure("gemini", "unknown", "ai_provider_exception", ex.Message);
                }

                if (aiResponse.IsSuccess && TryParseAiAnswer(aiResponse.Content, out var answer, out var action))
                {
                    return Results.Ok(BuildAiResult(answer, action, "ai"));
                }

                if (!aiResponse.IsSuccess)
                {
                    logger.LogInformation(
                        "Flow 6 falling back to rule-based answer. ErrorCode: {ErrorCode}. CorrelationId: {CorrelationId}",
                        aiResponse.ErrorCode, correlationId);
                }

                var (fallbackAnswer, fallbackAction) = BuildFallbackAnswer(question, memberContext);
                return Results.Ok(BuildAiResult(fallbackAnswer, fallbackAction, "fallback"));
            })
            .WithTags("Member Portal")
            .WithSummary("Flow 6 — AI assistant for members (Gemini, shared with Flow 5)");
        }
    }
}
