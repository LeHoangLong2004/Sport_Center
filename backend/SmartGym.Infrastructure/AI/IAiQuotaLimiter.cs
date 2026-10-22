using System;
using System.Collections.Concurrent;
using System.Collections.Generic;

namespace SmartGym.Infrastructure.AI;

public interface IAiQuotaLimiter
{
    bool TryAcquire(string key, int maxRequestsPerMinute, out TimeSpan retryAfter);
}

/// <summary>
/// Process-local quota guard for the AI provider. It protects a local/demo
/// instance without storing quota state in the database.
/// </summary>
public sealed class InMemoryAiQuotaLimiter : IAiQuotaLimiter
{
    private readonly ConcurrentDictionary<string, Queue<DateTimeOffset>> _windows = new();

    public bool TryAcquire(
        string key,
        int maxRequestsPerMinute,
        out TimeSpan retryAfter)
    {
        if (maxRequestsPerMinute <= 0)
        {
            retryAfter = TimeSpan.Zero;
            return true;
        }

        var window = _windows.GetOrAdd(key, _ => new Queue<DateTimeOffset>());
        var now = DateTimeOffset.UtcNow;
        var cutoff = now - TimeSpan.FromMinutes(1);

        lock (window)
        {
            while (window.Count > 0 && window.Peek() <= cutoff)
                window.Dequeue();

            if (window.Count >= maxRequestsPerMinute)
            {
                retryAfter = window.Peek() + TimeSpan.FromMinutes(1) - now;
                return false;
            }

            window.Enqueue(now);
            retryAfter = TimeSpan.Zero;
            return true;
        }
    }
}
