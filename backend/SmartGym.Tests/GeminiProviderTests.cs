using System.Net;
using System.Net.Http;
using System.Threading;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using SmartGym.Application.Interfaces;
using SmartGym.Infrastructure.AI;
using Xunit;

namespace SmartGym.Tests;

public sealed class GeminiProviderTests
{
    [Fact]
    public async Task Provider_stays_disabled_without_api_key()
    {
        var handler = new SequenceHandler();
        var provider = CreateProvider(handler, new GeminiOptions { Enabled = true, ApiKey = "" });

        var result = await provider.GenerateAsync(new AiProviderRequest("prompt", "test-disabled"));

        Assert.False(result.IsSuccess);
        Assert.Equal("ai_provider_not_configured", result.ErrorCode);
        Assert.Equal(0, handler.CallCount);
    }

    [Fact]
    public async Task Provider_retries_transient_failure_without_logging_secret()
    {
        var handler = new SequenceHandler(
            new HttpResponseMessage(HttpStatusCode.ServiceUnavailable),
            JsonResponse("{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"{\\\"planName\\\":\\\"Test\\\"}\"}]}}],\"usageMetadata\":{\"promptTokenCount\":2,\"candidatesTokenCount\":3}}"));
        var provider = CreateProvider(handler, new GeminiOptions
        {
            Enabled = true,
            ApiKey = "test-secret",
            MaxRequestsPerMinute = 0,
            MaxRetries = 1,
            RetryBaseDelayMilliseconds = 1,
            MaxRetryDelaySeconds = 1,
            TimeoutSeconds = 5
        });

        var result = await provider.GenerateAsync(new AiProviderRequest("safe prompt", "test-retry"));

        Assert.True(result.IsSuccess);
        Assert.Equal(2, handler.CallCount);
        Assert.Equal(2, result.InputTokens);
        Assert.Equal(3, result.OutputTokens);
        Assert.Contains("test-secret", handler.ObservedHeaders);
    }

    [Fact]
    public void Quota_limiter_blocks_the_second_request_in_the_window()
    {
        var limiter = new InMemoryAiQuotaLimiter();

        Assert.True(limiter.TryAcquire("gemini:test", 1, out _));
        Assert.False(limiter.TryAcquire("gemini:test", 1, out var retryAfter));
        Assert.True(retryAfter > TimeSpan.Zero);
    }

    private static GeminiRecommendationProvider CreateProvider(
        SequenceHandler handler,
        GeminiOptions options) =>
        new(
            new HttpClient(handler) { BaseAddress = new Uri("https://test.invalid") },
            Options.Create(options),
            new InMemoryAiQuotaLimiter(),
            NullLogger<GeminiRecommendationProvider>.Instance);

    private static HttpResponseMessage JsonResponse(string body) =>
        new(HttpStatusCode.OK)
        {
            Content = new StringContent(body, System.Text.Encoding.UTF8, "application/json")
        };

    private sealed class SequenceHandler : HttpMessageHandler
    {
        private readonly Queue<HttpResponseMessage> _responses;
        public int CallCount { get; private set; }
        public string ObservedHeaders { get; private set; } = string.Empty;

        public SequenceHandler(params HttpResponseMessage[] responses) =>
            _responses = new Queue<HttpResponseMessage>(responses);

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            CallCount++;
            ObservedHeaders = string.Join(" ", request.Headers.SelectMany(header => header.Value));
            return Task.FromResult(_responses.Count > 0
                ? _responses.Dequeue()
                : new HttpResponseMessage(HttpStatusCode.InternalServerError));
        }
    }
}
