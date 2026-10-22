namespace SmartGym.Infrastructure.AI;

public sealed class GeminiOptions
{
    public const string SectionName = "Gemini";

    public bool Enabled { get; init; }
    public string ApiKey { get; init; } = string.Empty;
    public string Endpoint { get; init; } = "https://generativelanguage.googleapis.com/v1beta/models";
    public string Model { get; init; } = "gemini-2.0-flash";
    public int TimeoutSeconds { get; init; } = 30;
    public int MaxRequestsPerMinute { get; init; } = 30;
    public int MaxRetries { get; init; } = 2;
    public int RetryBaseDelayMilliseconds { get; init; } = 250;
    public int MaxRetryDelaySeconds { get; init; } = 8;
    public int MaxPromptCharacters { get; init; } = 24000;
}
