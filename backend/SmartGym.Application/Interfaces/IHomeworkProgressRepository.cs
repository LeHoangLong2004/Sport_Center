using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Interfaces;

public interface IHomeworkProgressRepository
{
    Task<HomeworkProgress> CreateAsync(HomeworkProgress progress);
    Task<HomeworkProgress?> GetByIdAsync(Guid id);
    Task<IEnumerable<HomeworkProgress>> GetByMemberIdAsync(Guid memberId);
    Task<bool> UpdateAsync(HomeworkProgress progress);
}
