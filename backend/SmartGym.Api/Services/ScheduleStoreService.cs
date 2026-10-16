using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;

namespace SmartGym.Api.Services
{
    public class ScheduleSessionRecord
    {
        public string Id { get; set; } = "";
        public string Type { get; set; } = "group"; // "group" | "pt" | "open_pt"
        public string? ClassId { get; set; }
        public string ClassName { get; set; } = "";
        public string Sport { get; set; } = "Gym";
        public string Level { get; set; } = "Cơ bản";
        public string Date { get; set; } = "";
        public string StartTime { get; set; } = "";
        public string EndTime { get; set; } = "";
        public string Room { get; set; } = "";
        public string CoachId { get; set; } = "";
        public string CoachName { get; set; } = "HLV SportCenter";
        public int Capacity { get; set; } = 1;
        public int RegisteredCount { get; set; } = 0;
        public string Status { get; set; } = "sắp diễn ra"; // "sắp diễn ra" | "đang diễn ra" | "hoàn thành" | "đã hủy"
        public string AttendanceStatus { get; set; } = "chưa điểm danh"; // "chưa điểm danh" | "có mặt" | "vắng" | "có phép"
        public string CoachNote { get; set; } = "";
        public string? MemberId { get; set; }
        public string? MemberName { get; set; }
        public string? MemberPhone { get; set; }
        public string? MemberEmail { get; set; }
        public string? Goal { get; set; }
        public string? UserNote { get; set; }
        public string? CancelReason { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class BookPtSessionRequest
    {
        public string? SlotId { get; set; }
        public string? Name { get; set; }
        public string? Sport { get; set; }
        public string? Level { get; set; }
        public string? Date { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public string? Room { get; set; }
        public string? CoachId { get; set; }
        public string? CoachName { get; set; }
        public string? MemberId { get; set; }
        public string? MemberName { get; set; }
        public string? MemberPhone { get; set; }
        public string? MemberEmail { get; set; }
        public string? Goal { get; set; }
        public string? CoachNote { get; set; }
    }

    public class ScheduleStoreService
    {
        private readonly string _storageFilePath;
        private readonly object _lock = new();
        private readonly ILogger<ScheduleStoreService> _logger;
        private List<ScheduleSessionRecord> _sessions = new();

        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            WriteIndented = true,
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public ScheduleStoreService(ILogger<ScheduleStoreService> logger)
        {
            _logger = logger;
            var baseDir = AppContext.BaseDirectory;
            var dataDir = Path.Combine(baseDir, "data");
            if (!Directory.Exists(dataDir))
            {
                try { Directory.CreateDirectory(dataDir); } catch { }
            }

            _storageFilePath = Path.Combine(dataDir, "schedule_store.json");
            LoadFromDisk();
        }

        private void LoadFromDisk()
        {
            lock (_lock)
            {
                try
                {
                    if (File.Exists(_storageFilePath))
                    {
                        var json = File.ReadAllText(_storageFilePath);
                        if (!string.IsNullOrWhiteSpace(json))
                        {
                            var loaded = JsonSerializer.Deserialize<List<ScheduleSessionRecord>>(json, _jsonOptions);
                            if (loaded != null && loaded.Count > 0)
                            {
                                _sessions = loaded;
                                return;
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("Failed loading schedule store: {Error}. Seeding defaults.", ex.Message);
                }

                _sessions = SeedDefaultSessions();
                SaveToDiskInternal();
            }
        }

        private void SaveToDiskInternal()
        {
            try
            {
                var json = JsonSerializer.Serialize(_sessions, _jsonOptions);
                File.WriteAllText(_storageFilePath, json);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Failed saving schedule store: {Error}", ex.Message);
            }
        }

        private List<ScheduleSessionRecord> SeedDefaultSessions()
        {
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var tomorrow = DateTime.UtcNow.AddDays(1).ToString("yyyy-MM-dd");
            var in2Days = DateTime.UtcNow.AddDays(2).ToString("yyyy-MM-dd");

            return new List<ScheduleSessionRecord>
            {
                new ScheduleSessionRecord
                {
                    Id = "pt-open-nam-01",
                    Type = "open_pt",
                    ClassName = "Lịch trống 1–1 (HLV Nam)",
                    Sport = "Gym",
                    Level = "1-1 PT",
                    Date = tomorrow,
                    StartTime = "08:30",
                    EndTime = "09:30",
                    Room = "Khu PT 1-1 - Tầng 1",
                    CoachId = "25f50fba-506a-4edf-9db7-43f77f6741a4",
                    CoachName = "HLV Hồ Xuân Ánh Nam",
                    Capacity = 1,
                    RegisteredCount = 0,
                    Status = "sắp diễn ra",
                    AttendanceStatus = "chưa điểm danh",
                    CoachNote = "Nhận kèm cá nhân siết mỡ, tăng cơ ngực và thể lực"
                },
                new ScheduleSessionRecord
                {
                    Id = "pt-open-nam-02",
                    Type = "open_pt",
                    ClassName = "Lịch trống 1–1 (HLV Nam)",
                    Sport = "Boxing",
                    Level = "1-1 PT",
                    Date = in2Days,
                    StartTime = "14:00",
                    EndTime = "15:30",
                    Room = "Ring PT 1-1",
                    CoachId = "25f50fba-506a-4edf-9db7-43f77f6741a4",
                    CoachName = "HLV Hồ Xuân Ánh Nam",
                    Capacity = 1,
                    RegisteredCount = 0,
                    Status = "sắp diễn ra",
                    AttendanceStatus = "chưa điểm danh",
                    CoachNote = "Kèm boxing cardio, rèn phản xạ và thể lực chiến đấu"
                },
                new ScheduleSessionRecord
                {
                    Id = "pt-sample-01",
                    Type = "pt",
                    ClassName = "Kèm 1-1: Nguyễn Văn An",
                    Sport = "Gym",
                    Level = "1-1 PT",
                    Date = today,
                    StartTime = "07:00",
                    EndTime = "08:30",
                    Room = "Khu PT 1-1",
                    CoachId = "25f50fba-506a-4edf-9db7-43f77f6741a4",
                    CoachName = "HLV Hồ Xuân Ánh Nam",
                    Capacity = 1,
                    RegisteredCount = 1,
                    Status = "hoàn thành",
                    AttendanceStatus = "có mặt",
                    MemberName = "Nguyễn Văn An",
                    MemberPhone = "0912345678",
                    Goal = "Tăng cơ giảm mỡ",
                    CoachNote = "Đã hoàn thành tốt 5 hiệp Bench Press và Barbell Row. Form chuẩn."
                },
                new ScheduleSessionRecord
                {
                    Id = "pt-booked-anam-01",
                    Type = "pt",
                    ClassName = "Kèm 1-1: Phản xạ & Sức bền",
                    Sport = "Gym",
                    Level = "1-1 PT",
                    Date = tomorrow,
                    StartTime = "14:00",
                    EndTime = "15:00",
                    Room = "Ring PT 1-1",
                    CoachId = "25f50fba-506a-4edf-9db7-43f77f6741a4",
                    CoachName = "HLV Hồ Xuân Ánh Nam",
                    Capacity = 1,
                    RegisteredCount = 1,
                    Status = "sắp diễn ra",
                    AttendanceStatus = "chưa điểm danh",
                    MemberId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                    MemberName = "Hồ Xuân Ánh Nam",
                    MemberEmail = "hoxuananhnam@gmail.com",
                    MemberPhone = "0989123788",
                    Goal = "Phản xạ & Sức bền",
                    CoachNote = "Kèm kỹ thuật đấm thẳng và xoay hông."
                },
                new ScheduleSessionRecord
                {
                    Id = "pt-booked-anam-02",
                    Type = "pt",
                    ClassName = "Kèm 1-1: Tăng cơ cốt lõi (Core & Leg)",
                    Sport = "Gym",
                    Level = "1-1 PT",
                    Date = in2Days,
                    StartTime = "08:30",
                    EndTime = "09:30",
                    Room = "Khu PT 1-1 - Tầng 1",
                    CoachId = "25f50fba-506a-4edf-9db7-43f77f6741a4",
                    CoachName = "HLV Hồ Xuân Ánh Nam",
                    Capacity = 1,
                    RegisteredCount = 1,
                    Status = "sắp diễn ra",
                    AttendanceStatus = "chưa điểm danh",
                    MemberId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                    MemberName = "Hồ Xuân Ánh Nam",
                    MemberEmail = "hoxuananhnam@gmail.com",
                    MemberPhone = "0989123788",
                    Goal = "Tăng cơ & Siết nét",
                    CoachNote = "Tập trung nhóm cơ ngực và tay sau."
                }
            };
        }

        public List<ScheduleSessionRecord> GetAllSessions()
        {
            lock (_lock)
            {
                return _sessions.ToList();
            }
        }

        public List<ScheduleSessionRecord> GetSessionsForCoach(string? coachId)
        {
            lock (_lock)
            {
                if (string.IsNullOrWhiteSpace(coachId))
                    return new List<ScheduleSessionRecord>();

                return _sessions
                    .Where(s => string.Equals(s.CoachId, coachId, System.StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }
        }

        public List<ScheduleSessionRecord> GetSessionsForMember(string? memberId)
        {
            lock (_lock)
            {
                return _sessions
                    .Where(s => s.Type != "open_pt" && (
                        (!string.IsNullOrEmpty(memberId) && s.MemberId == memberId) ||
                        (memberId == "m-demo" && (s.MemberId == "m-demo" || s.MemberId == "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"))
                    ))
                    .ToList();
            }
        }

        public List<ScheduleSessionRecord> GetAvailablePtSlots()
        {
            lock (_lock)
            {
                return _sessions
                    .Where(s => s.Type == "open_pt" && s.RegisteredCount == 0 && s.Status != "đã hủy")
                    .ToList();
            }
        }

        public ScheduleSessionRecord BookPtSlot(BookPtSessionRequest req)
        {
            lock (_lock)
            {
                var existingSlot = !string.IsNullOrWhiteSpace(req.SlotId)
                    ? _sessions.FirstOrDefault(s => s.Id == req.SlotId)
                    : null;

                ScheduleSessionRecord booked;
                if (existingSlot != null)
                {
                    booked = existingSlot;
                    booked.Type = "pt";
                    booked.ClassName = !string.IsNullOrWhiteSpace(req.Name) ? req.Name : $"Kèm 1-1: {booked.Sport} ({req.Goal})";
                    booked.RegisteredCount = 1;
                    booked.Status = "sắp diễn ra";
                    booked.AttendanceStatus = "chưa điểm danh";
                    booked.MemberId = req.MemberId ?? "";
                    booked.MemberName = req.MemberName ?? "Hội viên";
                    booked.MemberPhone = req.MemberPhone ?? "";
                    booked.MemberEmail = req.MemberEmail ?? "";
                    booked.Goal = req.Goal ?? "Rèn luyện thể lực";
                    booked.CoachNote = req.CoachNote ?? $"Mục tiêu HV: {booked.Goal}";
                    booked.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    booked = new ScheduleSessionRecord
                    {
                        Id = $"pt-booked-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                        Type = "pt",
                        ClassName = req.Name ?? $"Kèm 1-1: {req.Sport ?? "Gym"} ({req.Goal})",
                        Sport = req.Sport ?? "Gym",
                        Level = "1-1 PT",
                        Date = req.Date ?? DateTime.UtcNow.AddDays(1).ToString("yyyy-MM-dd"),
                        StartTime = req.StartTime ?? "08:30",
                        EndTime = req.EndTime ?? "09:30",
                        Room = req.Room ?? "Khu PT 1-1 - Tầng 1",
                        CoachId = req.CoachId ?? "",
                        CoachName = req.CoachName ?? "HLV SportCenter",
                        Capacity = 1,
                        RegisteredCount = 1,
                        Status = "sắp diễn ra",
                        AttendanceStatus = "chưa điểm danh",
                        MemberId = req.MemberId ?? "",
                        MemberName = req.MemberName ?? "Hội viên",
                        MemberPhone = req.MemberPhone ?? "",
                        MemberEmail = req.MemberEmail ?? "",
                        Goal = req.Goal ?? "Rèn luyện thể lực",
                        CoachNote = req.CoachNote ?? $"Mục tiêu HV: {req.Goal}",
                        UpdatedAt = DateTime.UtcNow
                    };
                    _sessions.Insert(0, booked);
                }

                SaveToDiskInternal();
                return booked;
            }
        }

        public bool CancelBooking(string sessionId, string reason)
        {
            lock (_lock)
            {
                var found = _sessions.FirstOrDefault(s => s.Id == sessionId);
                if (found != null)
                {
                    found.Status = "đã hủy";
                    found.CancelReason = reason;
                    found.UpdatedAt = DateTime.UtcNow;
                    SaveToDiskInternal();
                    return true;
                }
                return false;
            }
        }

        public bool UpdateAttendance(string sessionId, string status, string coachNote)
        {
            lock (_lock)
            {
                var found = _sessions.FirstOrDefault(s => s.Id == sessionId);
                if (found != null)
                {
                    found.AttendanceStatus = status;
                    if (!string.IsNullOrWhiteSpace(coachNote))
                    {
                        found.CoachNote = coachNote;
                    }
                    if (status == "có mặt")
                    {
                        found.Status = "hoàn thành";
                    }
                    found.UpdatedAt = DateTime.UtcNow;
                    SaveToDiskInternal();
                    return true;
                }
                return false;
            }
        }
    }
}
