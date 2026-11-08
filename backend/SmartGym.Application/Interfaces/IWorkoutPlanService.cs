using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.WorkoutPlans;

namespace SmartGym.Application.Interfaces;

/// <summary>
/// Giao diện dịch vụ Quản lý Giáo án tập luyện (Workout Plan Service).
/// Cho phép Huấn luyện viên tạo, cập nhật và tra cứu kế hoạch bài tập cho học viên.
/// </summary>
public interface IWorkoutPlanService
{
    Task<WorkoutPlanResponse> CreatePlanAsync(Guid coachId, CreateWorkoutPlanRequest request);
    Task<WorkoutPlanResponse?> UpdatePlanAsync(Guid coachId, Guid planId, CreateWorkoutPlanRequest request);
    Task<WorkoutPlanResponse?> GetPlanByIdAsync(Guid id);
    Task<IEnumerable<WorkoutPlanResponse>> GetPlansByCoachIdAsync(Guid coachId);
}
