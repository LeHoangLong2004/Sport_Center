using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.WorkoutPlans;

namespace SmartGym.Application.Interfaces;

public interface IHomeworkProgressService
{
    Task<HomeworkProgressResponse> AssignHomeworkAsync(Guid coachId, AssignHomeworkRequest request);
    Task<IEnumerable<HomeworkProgressResponse>> GetMemberHomeworksAsync(Guid memberId);
    Task<bool> UpdateProgressAsync(Guid memberId, Guid homeworkId, UpdateHomeworkProgressRequest request);
}
