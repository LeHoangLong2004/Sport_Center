using System;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartGym.Application.Interfaces;

namespace SmartGym.Infrastructure.AI;

/// <summary>
/// Backend-only Gemini transport adapter for Flow 5. It never logs prompts,
/// response bodies, or API keys, and keeps provider concerns outside Application.
/// </summary>
public sealed class GeminiRecommendationProvider : IAiRecommendationProvider
{
    private const string ProviderName = "gemini";
    private readonly HttpClient _httpClient;
    private readonly GeminiOptions _options;
    private readonly IAiQuotaLimiter _quotaLimiter;
    private readonly ILogger<GeminiRecommendationProvider> _logger;

    public GeminiRecommendationProvider(
        HttpClient httpClient,
        IOptions<GeminiOptions> options,
        IAiQuotaLimiter quotaLimiter,
        ILogger<GeminiRecommendationProvider> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _quotaLimiter = quotaLimiter;
        _logger = logger;
    }

    public async Task<AiProviderResponse> GenerateAsync(
        AiProviderRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled || string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogDebug(
                "Gemini provider is disabled or missing its backend API key. CorrelationId: {CorrelationId}",
                request.CorrelationId);
            return Failure("ai_provider_not_configured", "Gemini provider chưa được bật hoặc chưa có API key.");
        }

        if (string.IsNullOrWhiteSpace(request.Prompt))
            return Failure("ai_prompt_empty", "Prompt gửi tới AI không được để trống.");

        var maxPromptCharacters = Math.Clamp(_options.MaxPromptCharacters, 1000, 100000);
        if (request.Prompt.Length > maxPromptCharacters)
            return Failure("ai_prompt_too_large", "Prompt vượt quá giới hạn cho phép.");

        var quotaKey = $"{ProviderName}:{_options.Model}";
        if (!_quotaLimiter.TryAcquire(
                quotaKey,
                _options.MaxRequestsPerMinute,
                out var retryAfter))
        {
            _logger.LogWarning(
                "Gemini local quota reached. RetryAfterSeconds: {RetryAfterSeconds}. CorrelationId: {CorrelationId}",
                Math.Round(retryAfter.TotalSeconds, 1),
                request.CorrelationId);
            return Failure("ai_quota_exceeded", "Đã đạt giới hạn số lần gọi AI trong một phút.");
        }

        var endpoint = BuildEndpoint();
        var payloadJson = JsonSerializer.Serialize(new
        {
            contents = new[]
            {
                new
                {
                    role = "user",
                    parts = new[] { new { text = request.Prompt } }
                }
            },
            generationConfig = new
            {
                temperature = 0.2,
                responseMimeType = "application/json"
            }
        });

        var maxAttempts = Math.Clamp(_options.MaxRetries, 0, 5) + 1;
        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            using var timeoutSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutSource.CancelAfter(TimeSpan.FromSeconds(Math.Clamp(_options.TimeoutSeconds, 5, 120)));

            try
            {
                using var httpRequest = new HttpRequestMessage(HttpMethod.Post, endpoint)
                {
                    Content = new StringContent(payloadJson, Encoding.UTF8, "application/json")
                };
                // The key is sent only from the backend to Gemini and is never logged.
                httpRequest.Headers.TryAddWithoutValidation("x-goog-api-key", _options.ApiKey.Trim());

                using var response = await _httpClient.SendAsync(
                    httpRequest,
                    HttpCompletionOption.ResponseHeadersRead,
                    timeoutSource.Token);
                var responseBody = await response.Content.ReadAsStringAsync(timeoutSource.Token);

                if (response.IsSuccessStatusCode)
                    return ParseResponse(responseBody, request.CorrelationId);

                var statusCode = (int)response.StatusCode;
                if (!IsRetryable(response.StatusCode) || attempt == maxAttempts)
                {
                    _logger.LogWarning(
                        "Gemini request rejected with status {StatusCode}. Attempt: {Attempt}/{MaxAttempts}. CorrelationId: {CorrelationId}",
                        statusCode,
                        attempt,
                        maxAttempts,
                        request.CorrelationId);
                    return Failure(MapProviderError(statusCode), "Gemini provider không trả về kết quả thành công.");
                }

                var delay = GetRetryDelay(response, attempt);
                await DelayBeforeRetryAsync(delay, attempt, maxAttempts, request.CorrelationId, cancellationToken);
            }
            catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
            {
                if (attempt == maxAttempts)
                {
                    _logger.LogWarning(
                        "Gemini request timed out. Attempts: {Attempts}. CorrelationId: {CorrelationId}",
                        attempt,
                        request.CorrelationId);
                    return Failure("ai_provider_timeout", "Gemini provider phản hồi quá thời gian cho phép.");
                }

                var delay = GetRetryDelay(null, attempt);
                await DelayBeforeRetryAsync(delay, attempt, maxAttempts, request.CorrelationId, cancellationToken);
            }
            catch (HttpRequestException exception)
            {
                if (attempt == maxAttempts)
                {
                    _logger.LogWarning(
                        exception,
                        "Gemini request failed after retries. Attempts: {Attempts}. CorrelationId: {CorrelationId}",
                        attempt,
                        request.CorrelationId);
                    return Failure("ai_provider_unavailable", "Không thể kết nối tới Gemini provider.");
                }

                var delay = GetRetryDelay(null, attempt);
                _logger.LogWarning(
                    exception,
                    "Retrying Gemini request after transport failure. Attempt: {Attempt}/{MaxAttempts}. DelayMs: {DelayMs}. CorrelationId: {CorrelationId}",
                    attempt,
                    maxAttempts,
                    delay.TotalMilliseconds,
                    request.CorrelationId);
                await Task.Delay(delay, cancellationToken);
            }
        }

        return Failure("ai_provider_unavailable", "Không thể kết nối tới Gemini provider.");
    }

    private string BuildEndpoint()
    {
        var baseEndpoint = _options.Endpoint.TrimEnd('/');
        var model = Uri.EscapeDataString(_options.Model);
        return $"{baseEndpoint}/{model}:generateContent";
    }

    private AiProviderResponse ParseResponse(string responseBody, string? correlationId)
    {
        try
        {
            using var document = JsonDocument.Parse(responseBody);
            var root = document.RootElement;
            var text = root
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(text))
                return Failure("ai_response_empty", "Gemini trả về response nhưng không có nội dung.");

            var usage = root.TryGetProperty("usageMetadata", out var usageMetadata)
                ? usageMetadata
                : default;
            var inputTokens = ReadInt(usage, "promptTokenCount");
            var outputTokens = ReadInt(usage, "candidatesTokenCount");

            _logger.LogInformation(
                "Gemini request completed. InputTokens: {InputTokens}, OutputTokens: {OutputTokens}. CorrelationId: {CorrelationId}",
                inputTokens,
                outputTokens,
                correlationId);
            return AiProviderResponse.Success(
                ProviderName,
                _options.Model,
                text,
                inputTokens,
                outputTokens);
        }
        catch (JsonException exception)
        {
            _logger.LogWarning(exception, "Gemini returned invalid JSON envelope. CorrelationId: {CorrelationId}", correlationId);
            return Failure("ai_provider_invalid_response", "Gemini trả về response không đúng định dạng.");
        }
        catch (InvalidOperationException exception)
        {
            _logger.LogWarning(exception, "Gemini response is missing expected fields. CorrelationId: {CorrelationId}", correlationId);
            return Failure("ai_provider_invalid_response", "Gemini response thiếu trường kết quả cần thiết.");
        }
    }

    private async Task DelayBeforeRetryAsync(
        TimeSpan delay,
        int attempt,
        int maxAttempts,
        string? correlationId,
        CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Retrying Gemini request. Attempt: {Attempt}/{MaxAttempts}. DelayMs: {DelayMs}. CorrelationId: {CorrelationId}",
            attempt,
            maxAttempts,
            delay.TotalMilliseconds,
            correlationId);
        await Task.Delay(delay, cancellationToken);
    }

    private TimeSpan GetRetryDelay(HttpResponseMessage? response, int attempt)
    {
        var configuredMax = TimeSpan.FromSeconds(Math.Clamp(_options.MaxRetryDelaySeconds, 1, 60));
        var retryAfter = response?.Headers.RetryAfter?.Delta;
        if (retryAfter.HasValue)
            return retryAfter.Value <= configuredMax ? retryAfter.Value : configuredMax;

        var baseDelay = Math.Clamp(_options.RetryBaseDelayMilliseconds, 50, 5000);
        var exponentialMilliseconds = baseDelay * Math.Pow(2, Math.Max(0, attempt - 1));
        return TimeSpan.FromMilliseconds(Math.Min(exponentialMilliseconds, configuredMax.TotalMilliseconds));
    }

    private static bool IsRetryable(HttpStatusCode statusCode) =>
        statusCode == HttpStatusCode.RequestTimeout
        || (int)statusCode == 429
        || (int)statusCode >= 500;

    private static int? ReadInt(JsonElement element, string propertyName) =>
        element.ValueKind == JsonValueKind.Object
        && element.TryGetProperty(propertyName, out var value)
        && value.TryGetInt32(out var result)
            ? result
            : null;

    private static string MapProviderError(int statusCode) => statusCode switch
    {
        401 or 403 => "ai_provider_auth_error",
        429 => "ai_quota_exceeded",
        >= 500 => "ai_provider_error",
        _ => "ai_provider_request_rejected"
    };

    private AiProviderResponse Failure(string code, string message) =>
        AiProviderResponse.Failure(ProviderName, _options.Model, code, message);
}
