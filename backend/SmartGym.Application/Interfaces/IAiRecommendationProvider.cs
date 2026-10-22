using System;
using System.Threading;
using System.Threading.Tasks;

namespace SmartGym.Application.Interfaces;

public sealed record AiProviderRequest(
    string Prompt,
    string? CorrelationId = null);

public sealed record AiProviderResponse(
    bool IsSuccess,
    string Provider,
    string Model,
    string? Content,
    string? ErrorCode,
    string? ErrorMessage,
    int? InputTokens = null,
    int? OutputTokens = null)
{
    public static AiProviderResponse Success(
        string provider,
        string model,
        string content,
        int? inputTokens = null,
        int? outputTokens = null) => new(
        true,
        provider,
        model,
        content,
        null,
        null,
        inputTokens,
        outputTokens);

    public static AiProviderResponse Failure(
        string provider,
        string model,
        string errorCode,
        string errorMessage) => new(
        false,
        provider,
        model,
        null,
        errorCode,
        errorMessage);
}

public interface IAiRecommendationProvider
{
    Task<AiProviderResponse> GenerateAsync(
        AiProviderRequest request,
        CancellationToken cancellationToken = default);
}
