using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.Reviews;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _repository;

    public ReviewService(IReviewRepository repository)
    {
        _repository = repository;
    }

    public async Task<ReviewResponse> CreateReviewAsync(Guid memberId, CreateReviewRequest request)
    {
        if (request.Rating < 1 || request.Rating > 5)
        {
            throw new ArgumentException("Rating must be between 1 and 5.");
        }

        var review = new Review
        {
            MemberId = memberId,
            CoachId = request.CoachId,
            Rating = request.Rating,
            Comment = request.Comment,
            SessionId = request.SessionId,
            SessionName = request.SessionName,
            TagsJson = JsonSerializer.Serialize(request.Tags ?? new List<string>()),
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.CreateAsync(review);

        return new ReviewResponse
        {
            Id = created.Id,
            MemberId = created.MemberId,
            CoachId = created.CoachId,
            Rating = created.Rating,
            Comment = created.Comment,
            SessionId = created.SessionId,
            SessionName = created.SessionName,
            Tags = ParseTags(created.TagsJson),
            CreatedAt = created.CreatedAt
        };
    }

    public async Task<IEnumerable<ReviewResponse>> GetCoachReviewsAsync(Guid coachId)
    {
        var reviews = await _repository.GetByCoachIdAsync(coachId);
        
        return reviews.Select(r => new ReviewResponse
        {
            Id = r.Id,
            MemberId = r.MemberId,
            MemberName = r.Member?.FullName ?? "Unknown Member",
            CoachId = r.CoachId,
            Rating = r.Rating,
            Comment = r.Comment,
            SessionId = r.SessionId,
            SessionName = r.SessionName,
            Tags = ParseTags(r.TagsJson),
            CreatedAt = r.CreatedAt
        });
    }

    public async Task<IEnumerable<ReviewResponse>> GetMemberReviewsAsync(Guid memberId)
    {
        var reviews = await _repository.GetByMemberIdAsync(memberId);

        return reviews.Select(r => new ReviewResponse
        {
            Id = r.Id,
            MemberId = r.MemberId,
            MemberName = r.Member?.FullName ?? string.Empty,
            CoachId = r.CoachId,
            Rating = r.Rating,
            Comment = r.Comment,
            SessionId = r.SessionId,
            SessionName = r.SessionName,
            Tags = ParseTags(r.TagsJson),
            CreatedAt = r.CreatedAt
        });
    }

    private static List<string> ParseTags(string? tagsJson)
    {
        if (string.IsNullOrWhiteSpace(tagsJson)) return new List<string>();

        try
        {
            return JsonSerializer.Deserialize<List<string>>(tagsJson) ?? new List<string>();
        }
        catch (JsonException)
        {
            return new List<string>();
        }
    }
}
