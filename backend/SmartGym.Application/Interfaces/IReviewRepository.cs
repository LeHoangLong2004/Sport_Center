using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Interfaces;

public interface IReviewRepository
{
    Task<Review> CreateAsync(Review review);
    Task<IEnumerable<Review>> GetByCoachIdAsync(Guid coachId);
}
