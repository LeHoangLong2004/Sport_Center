using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.Reviews;

namespace SmartGym.Application.Interfaces;

/// <summary>
/// Giao diện dịch vụ Đánh giá & Nhận xét Huấn luyện viên (Review Service).
/// Cho phép hội viên chấm điểm sao và phản hồi chất lượng giảng dạy của HLV.
/// </summary>
public interface IReviewService
{
    Task<ReviewResponse> CreateReviewAsync(Guid memberId, CreateReviewRequest request);
    Task<IEnumerable<ReviewResponse>> GetCoachReviewsAsync(Guid coachId);
    Task<IEnumerable<ReviewResponse>> GetMemberReviewsAsync(Guid memberId);
}
