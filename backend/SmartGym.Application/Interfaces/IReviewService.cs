using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.Reviews;

namespace SmartGym.Application.Interfaces;

public interface IReviewService
{
    Task<ReviewResponse> CreateReviewAsync(Guid memberId, CreateReviewRequest request);
    Task<IEnumerable<ReviewResponse>> GetCoachReviewsAsync(Guid coachId);
}
