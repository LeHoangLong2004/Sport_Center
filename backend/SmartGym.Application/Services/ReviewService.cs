using System;
using System.Collections.Generic;
using System.Linq;
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
            CreatedAt = r.CreatedAt
        });
    }
}
