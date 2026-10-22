namespace SmartGym.Infrastructure.AI;

public sealed class GeminiOptions
{
    public const string SectionName = "Gemini";

    public bool Enabled { get; set; }
    public string ApiKey { get; set; } = string.Empty;
    public string Endpoint { get; set; } = "https://generativelanguage.googleapis.com/v1beta/models";
    // gemini-2.0-flash is no longer available for this API key. Keep the
    // default on a current generateContent-capable Flash model.
    public string Model { get; set; } = "gemini-3.8-flash";
    public int TimeoutSeconds { get; set; } = 30;
    public int MaxRequestsPerMinute { get; set; } = 30;
    public int MaxRetries { get; set; } = 2;
    public int RetryBaseDelayMilliseconds { get; set; } = 250;
    public int MaxRetryDelaySeconds { get; set; } = 8;
    public int MaxPromptCharacters { get; set; } = 24000;
}
