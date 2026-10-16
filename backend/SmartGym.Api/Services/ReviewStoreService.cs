using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;

namespace SmartGym.Api.Services
{
    public class StoredReviewRecord
    {
        public string Id { get; set; } = "";
        public string CoachId { get; set; } = "";
        public string CoachName { get; set; } = "HLV SportCenter";
        public string MemberId { get; set; } = "";
        public string MemberName { get; set; } = "";
        public string AnonymizedMemberName { get; set; } = "";
        public int Rating { get; set; } = 5;
        public string Comment { get; set; } = "";
        public List<string> Tags { get; set; } = new();
        public string SessionId { get; set; } = "";
        public string SessionName { get; set; } = "Lớp tập luyện";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class CreateCoachReviewDto
    {
        public string? CoachId { get; set; }
        public string? CoachName { get; set; }
        public string? SessionId { get; set; }
        public string? SessionName { get; set; }
        public int Rating { get; set; } = 5;
        public string? Comment { get; set; }
        public List<string>? Tags { get; set; }
    }

    public class ReviewStoreService
    {
        private readonly string _storagePath;
        private readonly ILogger<ReviewStoreService> _logger;
        private readonly object _lock = new();

        public ReviewStoreService(ILogger<ReviewStoreService> logger)
        {
            _logger = logger;
            var dataDir = Path.Combine(AppContext.BaseDirectory, "data");
            if (!Directory.Exists(dataDir))
            {
                Directory.CreateDirectory(dataDir);
            }
            _storagePath = Path.Combine(dataDir, "coach_reviews.json");
            EnsureInitialData();
        }

        private void EnsureInitialData()
        {
            lock (_lock)
            {
                if (File.Exists(_storagePath))
                {
                    return;
                }

                var defaultReviews = new List<StoredReviewRecord>
                {
                    new StoredReviewRecord
                    {
                        Id = "rev-1",
                        CoachId = "25f50fba-506a-4edf-9db7-43f77f6741a4",
                        CoachName = "HLV Hồ Xuân Ánh Nam",
                        MemberId = "member-01",
                        MemberName = "Học viên Nguyễn Văn A",
                        AnonymizedMemberName = "Học viên ẩn danh #842",
                        Rating = 5,
                        SessionName = "Gym Group BodyCombat",
                        Comment = "Thầy hướng dẫn rất tận tâm, chỉnh sửa tư thế squat và deadlift cực kỳ chi tiết. Sau 1 tháng tập cảm thấy lưng không còn mỏi nữa!",
                        Tags = new List<string> { "Nhiệt tình", "Sửa form kỹ", "Động viên tích cực" },
                        CreatedAt = DateTime.UtcNow.AddDays(-10)
                    },
                    new StoredReviewRecord
                    {
                        Id = "rev-2",
                        CoachId = "25f50fba-506a-4edf-9db7-43f77f6741a4",
                        CoachName = "HLV Hồ Xuân Ánh Nam",
                        MemberId = "member-02",
                        MemberName = "Học viên Lê Thị B",
                        AnonymizedMemberName = "Học viên ẩn danh #319",
                        Rating = 5,
                        SessionName = "Yoga Phục Hồi",
                        Comment = "Lớp Yoga cơ bản siêu thích, thầy tạo không khí thoải mái, thở đúng cách giúp mình ngủ ngon hơn hẳn.",
                        Tags = new List<string> { "Âm nhạc thư giãn", "Đúng giờ", "Giảng dạy dễ hiểu" },
                        CreatedAt = DateTime.UtcNow.AddDays(-14)
                    },
                    new StoredReviewRecord
                    {
                        Id = "rev-3",
                        CoachId = "25f50fba-506a-4edf-9db7-43f77f6741a4",
                        CoachName = "HLV Hồ Xuân Ánh Nam",
                        MemberId = "member-03",
                        MemberName = "Học viên Trần C",
                        AnonymizedMemberName = "Học viên ẩn danh #507",
                        Rating = 4,
                        SessionName = "Boxing Cơ Bản",
                        Comment = "Giáo án tập thể lực rất chất lượng, khối lượng bài tập vừa sức. Hy vọng buổi sau có thêm bài tập bổ trợ cho cơ vai.",
                        Tags = new List<string> { "Bài tập đa dạng", "Nhiệt tình" },
                        CreatedAt = DateTime.UtcNow.AddDays(-22)
                    },
                    new StoredReviewRecord
                    {
                        Id = "rev-4",
                        CoachId = "25f50fba-506a-4edf-9db7-43f77f6741a4",
                        CoachName = "HLV Hồ Xuân Ánh Nam",
                        MemberId = "member-04",
                        MemberName = "Học viên Phạm D",
                        AnonymizedMemberName = "Học viên ẩn danh #192",
                        Rating = 5,
                        SessionName = "Yoga Cơ Bản – Lớp A",
                        Comment = "HLV nhiệt tình, đến lớp sớm chuẩn bị dụng cụ chu đáo. Luôn động viên học viên khi sắp đuối sức.",
                        Tags = new List<string> { "Đúng giờ", "Nhiệt tình" },
                        CreatedAt = DateTime.UtcNow.AddDays(-27)
                    }
                };

                SaveToFileNoLock(defaultReviews);
            }
        }

        private List<StoredReviewRecord> ReadFromFileNoLock()
        {
            try
            {
                if (!File.Exists(_storagePath))
                {
                    return new List<StoredReviewRecord>();
                }

                var json = File.ReadAllText(_storagePath);
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                return JsonSerializer.Deserialize<List<StoredReviewRecord>>(json, options) ?? new List<StoredReviewRecord>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to read reviews from file: {Path}", _storagePath);
                return new List<StoredReviewRecord>();
            }
        }

        private void SaveToFileNoLock(List<StoredReviewRecord> reviews)
        {
            try
            {
                var options = new JsonSerializerOptions
                {
                    WriteIndented = true
                };
                var json = JsonSerializer.Serialize(reviews, options);
                File.WriteAllText(_storagePath, json);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to write reviews to file: {Path}", _storagePath);
            }
        }

        public StoredReviewRecord AddReview(CreateCoachReviewDto dto, string memberId, string memberName)
        {
            lock (_lock)
            {
                var list = ReadFromFileNoLock();

                // Generate anonymous code like #741
                var hash = Math.Abs((memberId ?? "unknown").GetHashCode()) % 900 + 100;
                var anonName = $"Học viên ẩn danh #{hash}";

                var newRev = new StoredReviewRecord
                {
                    Id = $"rev-{Guid.NewGuid():N}",
                    CoachId = !string.IsNullOrWhiteSpace(dto.CoachId) ? dto.CoachId : "",
                    CoachName = !string.IsNullOrWhiteSpace(dto.CoachName) ? dto.CoachName : "HLV SportCenter",
                    MemberId = memberId,
                    MemberName = memberName,
                    AnonymizedMemberName = anonName,
                    Rating = Math.Clamp(dto.Rating, 1, 5),
                    Comment = dto.Comment?.Trim() ?? "",
                    Tags = dto.Tags ?? new List<string>(),
                    SessionId = dto.SessionId ?? "",
                    SessionName = !string.IsNullOrWhiteSpace(dto.SessionName) ? dto.SessionName : "Buổi tập PT 1-1",
                    CreatedAt = DateTime.UtcNow
                };

                list.Insert(0, newRev);
                SaveToFileNoLock(list);
                return newRev;
            }
        }

        public List<StoredReviewRecord> GetReviewsForCoach(string coachId)
        {
            lock (_lock)
            {
                var list = ReadFromFileNoLock();
                if (string.IsNullOrWhiteSpace(coachId))
                {
                    return list;
                }

                var normalized = coachId.Trim().ToLowerInvariant();
                return list
                    .Where(r =>
                        string.IsNullOrEmpty(r.CoachId)
                        || r.CoachId.ToLowerInvariant().Contains(normalized)
                        || normalized.Contains(r.CoachId.ToLowerInvariant())
                        || (normalized.Contains("25f50fba") && r.CoachId.ToLowerInvariant().Contains("25f50fba"))
                        || (normalized.Contains("coach-02") && r.CoachId.ToLowerInvariant().Contains("25f50fba"))
                    )
                    .OrderByDescending(r => r.CreatedAt)
                    .ToList();
            }
        }

        public List<StoredReviewRecord> GetReviewsForMember(string memberId)
        {
            lock (_lock)
            {
                var list = ReadFromFileNoLock();
                if (string.IsNullOrWhiteSpace(memberId))
                {
                    return list;
                }

                return list
                    .Where(r => r.MemberId.Equals(memberId, StringComparison.OrdinalIgnoreCase))
                    .OrderByDescending(r => r.CreatedAt)
                    .ToList();
            }
        }
    }
}
