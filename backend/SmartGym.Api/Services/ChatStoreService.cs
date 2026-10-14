using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;

namespace SmartGym.Api.Services
{
    public class ChatMessageItem
    {
        public string Id { get; set; } = "";
        public string Sender { get; set; } = "coach"; // "coach" | "member" | "manager" | "other_member"
        public string SenderName { get; set; } = "";
        public string Text { get; set; } = "";
        public string Timestamp { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class ChatConversationRecord
    {
        public string Id { get; set; } = "";
        public string Type { get; set; } = "direct"; // "direct" | "class"
        public string Category { get; set; } = "coach"; // "coach" | "member" | "manager" | "class"
        public string RoleTag { get; set; } = "HLV"; // "HLV" | "HỘI VIÊN" | "QUẢN LÝ" | "LỄ TÂN" | "NHÓM LỚP"
        public string BadgeColor { get; set; } = "orange"; // "orange" | "emerald" | "blue" | "purple"
        
        public string CoachTitle { get; set; } = "";
        public string CoachSubtitle { get; set; } = "";
        public string MemberTitle { get; set; } = "";
        public string MemberSubtitle { get; set; } = "";
        public string Avatar { get; set; } = "";
        public string CoachAvatar { get; set; } = "";
        public string LastMessage { get; set; } = "";
        public string LastTime { get; set; } = "";
        public int UnreadCount { get; set; }
        public bool Online { get; set; } = true;
        public string CoachId { get; set; } = "";
        public string CoachName { get; set; } = "";
        public string MemberId { get; set; } = "";
        public string MemberName { get; set; } = "";
        public List<ChatMessageItem> Messages { get; set; } = new();
    }

    public class ChatConversationViewModel
    {
        public string Id { get; set; } = "";
        public string Type { get; set; } = "direct";
        public string Category { get; set; } = "coach";
        public string RoleTag { get; set; } = "HLV";
        public string BadgeColor { get; set; } = "orange";
        
        public string Title { get; set; } = "";
        public string Subtitle { get; set; } = "";
        public string Avatar { get; set; } = "";
        public string LastMessage { get; set; } = "";
        public string LastTime { get; set; } = "";
        public int UnreadCount { get; set; }
        public bool Online { get; set; } = true;
        public string CoachId { get; set; } = "";
        public string CoachName { get; set; } = "";
        public string MemberId { get; set; } = "";
        public string MemberName { get; set; } = "";
        public List<ChatMessageItem> Messages { get; set; } = new();
    }

    public class ChatStoreService
    {
        private readonly string _storageFilePath;
        private readonly object _lock = new();
        private readonly ILogger<ChatStoreService> _logger;
        private List<ChatConversationRecord> _conversations = new();

        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            WriteIndented = true,
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public ChatStoreService(ILogger<ChatStoreService> logger)
        {
            _logger = logger;

            var baseDir = AppContext.BaseDirectory;
            var dataDir = Path.Combine(baseDir, "data");
            if (!Directory.Exists(dataDir))
            {
                try { Directory.CreateDirectory(dataDir); } catch { /* ignore */ }
            }

            _storageFilePath = Path.Combine(dataDir, "chat_conversations.json");
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
                            var loaded = JsonSerializer.Deserialize<List<ChatConversationRecord>>(json, _jsonOptions);
                            if (loaded != null && loaded.Count > 0)
                            {
                                _conversations = loaded;

                                // Ensure crucial conversations exist
                                EnsureSeedItem("conv-nam", CreateNamConversation());
                                EnsureSeedItem("conv-manager", CreateManagerConversation());
                                EnsureSeedItem("conv-reception", CreateReceptionConversation());
                                EnsureSeedItem("conv-member-an", CreateMemberAnConversation());

                                SaveToDiskInternal();
                                _logger.LogInformation("Loaded {Count} chat conversations from persistent file: {Path}", _conversations.Count, _storageFilePath);
                                return;
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("Failed to load chat store file from {Path}: {Error}. Re-initializing defaults.", _storageFilePath, ex.Message);
                }

                // Seed defaults
                _conversations = CreateInitialConversations();
                SaveToDiskInternal();
                _logger.LogInformation("Initialized and saved initial chat conversations to: {Path}", _storageFilePath);
            }
        }

        private void EnsureSeedItem(string convId, ChatConversationRecord record)
        {
            if (!_conversations.Any(c => c.Id == convId))
            {
                _conversations.Insert(0, record);
            }
        }

        private void SaveToDiskInternal()
        {
            try
            {
                var dir = Path.GetDirectoryName(_storageFilePath);
                if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                }

                var json = JsonSerializer.Serialize(_conversations, _jsonOptions);
                File.WriteAllText(_storageFilePath, json);

                // Also backup to current directory if accessible
                try
                {
                    var localDataDir = Path.Combine(Directory.GetCurrentDirectory(), "data");
                    if (!Directory.Exists(localDataDir)) Directory.CreateDirectory(localDataDir);
                    File.WriteAllText(Path.Combine(localDataDir, "chat_conversations.json"), json);
                }
                catch { /* ignore */ }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to persist chat data to {Path}", _storageFilePath);
            }
        }

        public List<ChatConversationViewModel> GetConversationsForCoach(string? coachId = null)
        {
            lock (_lock)
            {
                return _conversations.Select(c => new ChatConversationViewModel
                {
                    Id = c.Id,
                    Type = c.Type,
                    Category = c.Category,
                    RoleTag = c.RoleTag,
                    BadgeColor = c.BadgeColor,
                    Title = c.CoachTitle,
                    Subtitle = c.CoachSubtitle,
                    Avatar = c.Avatar,
                    LastMessage = c.LastMessage,
                    LastTime = c.LastTime,
                    UnreadCount = c.UnreadCount,
                    Online = c.Online,
                    CoachId = c.CoachId,
                    CoachName = c.CoachName,
                    MemberId = c.MemberId,
                    MemberName = c.MemberName,
                    Messages = c.Messages.ToList()
                }).ToList();
            }
        }

        public List<ChatConversationViewModel> GetConversationsForMember(string? memberId = null)
        {
            lock (_lock)
            {
                return _conversations.Select(c => new ChatConversationViewModel
                {
                    Id = c.Id,
                    Type = c.Type,
                    Category = c.Category,
                    RoleTag = c.RoleTag,
                    BadgeColor = c.BadgeColor,
                    Title = c.MemberTitle,
                    Subtitle = c.MemberSubtitle,
                    Avatar = c.Type == "direct" ? (!string.IsNullOrEmpty(c.CoachAvatar) ? c.CoachAvatar : c.Avatar) : c.Avatar,
                    LastMessage = c.LastMessage,
                    LastTime = c.LastTime,
                    UnreadCount = c.UnreadCount,
                    Online = c.Online,
                    CoachId = c.CoachId,
                    CoachName = c.CoachName,
                    MemberId = c.MemberId,
                    MemberName = c.MemberName,
                    Messages = c.Messages.ToList()
                }).ToList();
            }
        }

        public List<ChatMessageItem>? GetMessages(string conversationId)
        {
            lock (_lock)
            {
                var conv = _conversations.FirstOrDefault(c => c.Id.Equals(conversationId, StringComparison.OrdinalIgnoreCase));
                return conv?.Messages.ToList();
            }
        }

        public ChatMessageItem? AddMessage(string conversationId, string text, string sender, string? senderName = null)
        {
            if (string.IsNullOrWhiteSpace(text)) return null;

            lock (_lock)
            {
                var conv = _conversations.FirstOrDefault(c => c.Id.Equals(conversationId, StringComparison.OrdinalIgnoreCase));
                if (conv == null) return null;

                var timeStr = DateTime.Now.ToString("HH:mm");
                string effectiveSenderName = senderName ?? (sender == "coach" ? conv.CoachName : conv.MemberName);

                var newMsg = new ChatMessageItem
                {
                    Id = "msg-" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    Sender = sender,
                    SenderName = effectiveSenderName,
                    Text = text.Trim(),
                    Timestamp = timeStr,
                    CreatedAt = DateTime.UtcNow
                };

                conv.Messages.Add(newMsg);
                conv.LastTime = timeStr;
                conv.LastMessage = sender == "coach" 
                    ? $"Coach: {newMsg.Text}" 
                    : $"{effectiveSenderName}: {newMsg.Text}";

                SaveToDiskInternal();
                return newMsg;
            }
        }

        public ChatConversationViewModel StartOrGetConversation(
            string targetId,
            string targetName,
            string role, // "coach" | "member" | "manager" | "reception" | "class"
            string currentUserId,
            string currentUserName,
            string? avatar = null,
            string? subtitle = null)
        {
            lock (_lock)
            {
                // Check if existing conversation with this target exists
                var existing = _conversations.FirstOrDefault(c => 
                    c.Id.Equals($"conv-{targetId}", StringComparison.OrdinalIgnoreCase) ||
                    (c.Type == "direct" && c.CoachId.Equals(targetId, StringComparison.OrdinalIgnoreCase)) ||
                    c.MemberTitle.Contains(targetName, StringComparison.OrdinalIgnoreCase));

                if (existing != null)
                {
                    return new ChatConversationViewModel
                    {
                        Id = existing.Id,
                        Type = existing.Type,
                        Category = existing.Category,
                        RoleTag = existing.RoleTag,
                        BadgeColor = existing.BadgeColor,
                        Title = existing.MemberTitle,
                        Subtitle = existing.MemberSubtitle,
                        Avatar = existing.Avatar,
                        LastMessage = existing.LastMessage,
                        LastTime = existing.LastTime,
                        UnreadCount = existing.UnreadCount,
                        Online = existing.Online,
                        CoachId = existing.CoachId,
                        CoachName = existing.CoachName,
                        MemberId = existing.MemberId,
                        MemberName = existing.MemberName,
                        Messages = existing.Messages.ToList()
                    };
                }

                string category = role switch
                {
                    "coach" => "coach",
                    "member" => "member",
                    "manager" or "reception" or "staff" => "manager",
                    "class" => "class",
                    _ => "member"
                };

                string roleTag = role switch
                {
                    "coach" => "HLV",
                    "manager" => "QUẢN LÝ",
                    "reception" => "LỄ TÂN",
                    "class" => "NHÓM LỚP",
                    _ => "HỘI VIÊN"
                };

                string badgeColor = role switch
                {
                    "coach" => "orange",
                    "manager" => "blue",
                    "reception" => "teal",
                    "class" => "purple",
                    _ => "emerald"
                };

                var newId = "conv-" + (string.IsNullOrWhiteSpace(targetId) ? Guid.NewGuid().ToString("N")[..8] : targetId.Replace(" ", "-").ToLower());
                var newConv = new ChatConversationRecord
                {
                    Id = newId,
                    Type = category == "class" ? "class" : "direct",
                    Category = category,
                    RoleTag = roleTag,
                    BadgeColor = badgeColor,
                    CoachId = targetId,
                    CoachName = targetName,
                    MemberId = currentUserId,
                    MemberName = currentUserName,
                    CoachTitle = currentUserName,
                    CoachSubtitle = "Học viên SportCenter",
                    MemberTitle = targetName,
                    MemberSubtitle = subtitle ?? (roleTag + " · SportCenter"),
                    Avatar = avatar ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                    CoachAvatar = avatar ?? "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100&auto=format&fit=crop&q=80",
                    LastMessage = $"Bắt đầu cuộc trò chuyện với {targetName}",
                    LastTime = DateTime.Now.ToString("HH:mm"),
                    Online = true,
                    Messages = new List<ChatMessageItem>
                    {
                        new()
                        {
                            Id = "msg-" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                            Sender = role == "coach" ? "coach" : (role == "manager" ? "manager" : "other_member"),
                            SenderName = targetName,
                            Text = $"Chào bạn {currentUserName}, mình là {targetName}. Rất vui được kết nối và hỗ trợ bạn tại SportCenter!",
                            Timestamp = DateTime.Now.ToString("HH:mm"),
                            CreatedAt = DateTime.UtcNow
                        }
                    }
                };

                _conversations.Insert(0, newConv);
                SaveToDiskInternal();

                return new ChatConversationViewModel
                {
                    Id = newConv.Id,
                    Type = newConv.Type,
                    Category = newConv.Category,
                    RoleTag = newConv.RoleTag,
                    BadgeColor = newConv.BadgeColor,
                    Title = newConv.MemberTitle,
                    Subtitle = newConv.MemberSubtitle,
                    Avatar = newConv.Avatar,
                    LastMessage = newConv.LastMessage,
                    LastTime = newConv.LastTime,
                    UnreadCount = 0,
                    Online = true,
                    CoachId = newConv.CoachId,
                    CoachName = newConv.CoachName,
                    MemberId = newConv.MemberId,
                    MemberName = newConv.MemberName,
                    Messages = newConv.Messages.ToList()
                };
            }
        }

        // Keep backward-compatible signature
        public ChatConversationViewModel StartOrGetDirectConversation(string coachId, string coachName, string memberId, string memberName)
        {
            return StartOrGetConversation(coachId, coachName, "coach", memberId, memberName);
        }

        private static ChatConversationRecord CreateNamConversation()
        {
            return new ChatConversationRecord
            {
                Id = "conv-nam",
                Type = "direct",
                Category = "coach",
                RoleTag = "HLV",
                BadgeColor = "orange",
                CoachId = "25F50FBA",
                CoachName = "HLV Nam",
                MemberId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                MemberName = "Hồ Xuân Ánh Nam",
                CoachTitle = "Hồ Xuân Ánh Nam",
                CoachSubtitle = "Học viên PT Kèm 1-1 (Tài khoản Member)",
                MemberTitle = "HLV Nam (PT Thể Hình)",
                MemberSubtitle = "HLV Huấn luyện viên cá nhân 1-1",
                Avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                CoachAvatar = "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100&auto=format&fit=crop&q=80",
                LastMessage = "Thầy ơi, buổi tập sáng mai 7h em đến sớm 10 phút khởi động trước nhé ạ!",
                LastTime = "14:20",
                UnreadCount = 0,
                Online = true,
                Messages = new List<ChatMessageItem>
                {
                    new() { Id = "nam1", Sender = "coach", SenderName = "HLV Nam", Text = "Chào Nam! Tuần này cơ bắp của bạn sau buổi tập chân hồi phục thế nào rồi?", Timestamp = "09:15" },
                    new() { Id = "nam2", Sender = "member", SenderName = "Hồ Xuân Ánh Nam", Text = "Dạ đỡ mỏi đùi rồi thầy ơi, form Squat bài trước em làm thấy vào mông đùi rất tốt ạ.", Timestamp = "09:30" },
                    new() { Id = "nam3", Sender = "coach", SenderName = "HLV Nam", Text = "Tốt lắm! Nhớ nạp đủ 120g protein/ngày và uống tối thiểu 2.5 lít nước nhé.", Timestamp = "09:35" },
                    new() { Id = "nam4", Sender = "member", SenderName = "Hồ Xuân Ánh Nam", Text = "Thầy ơi, buổi tập sáng mai 7h em đến sớm 10 phút khởi động trước nhé ạ!", Timestamp = "14:20" }
                }
            };
        }

        private static ChatConversationRecord CreateManagerConversation()
        {
            return new ChatConversationRecord
            {
                Id = "conv-manager",
                Type = "direct",
                Category = "manager",
                RoleTag = "QUẢN LÝ",
                BadgeColor = "blue",
                CoachId = "mgr-01",
                CoachName = "Quản lý Trung tâm",
                MemberId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                MemberName = "Hồ Xuân Ánh Nam",
                CoachTitle = "Hồ Xuân Ánh Nam (Member)",
                CoachSubtitle = "Hội viên cần hỗ trợ",
                MemberTitle = "Quản lý Trung tâm SportCenter",
                MemberSubtitle = "Ban Quản lý & Tiếp nhận phản ánh dịch vụ",
                Avatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
                CoachAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
                LastMessage = "Ban quản lý SportCenter luôn sẵn sàng hỗ trợ giải đáp mọi thắc mắc của bạn.",
                LastTime = "08:00",
                UnreadCount = 0,
                Online = true,
                Messages = new List<ChatMessageItem>
                {
                    new() { Id = "mgr-1", Sender = "manager", SenderName = "Quản lý Trung tâm", Text = "Chào bạn Hồ Xuân Ánh Nam! Ban quản lý SportCenter luôn sẵn sàng tiếp nhận ý kiến và giải quyết thắc mắc về hợp đồng, cơ sở vật chất hay đổi gói tập.", Timestamp = "08:00" }
                }
            };
        }

        private static ChatConversationRecord CreateReceptionConversation()
        {
            return new ChatConversationRecord
            {
                Id = "conv-reception",
                Type = "direct",
                Category = "manager",
                RoleTag = "LỄ TÂN",
                BadgeColor = "blue",
                CoachId = "rec-01",
                CoachName = "Quầy Lễ Tân",
                MemberId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                MemberName = "Hồ Xuân Ánh Nam",
                CoachTitle = "Hồ Xuân Ánh Nam (Member)",
                CoachSubtitle = "Hỏi thông tin check-in",
                MemberTitle = "Quầy Lễ Tân & Dịch Vụ Hội Viên",
                MemberSubtitle = "Check-in thẻ, Khóa tủ & Gia hạn gói",
                Avatar = "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
                CoachAvatar = "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
                LastMessage = "Quầy Lễ tân mở cửa từ 06:00 đến 22:00 hàng ngày.",
                LastTime = "08:15",
                UnreadCount = 0,
                Online = true,
                Messages = new List<ChatMessageItem>
                {
                    new() { Id = "rec-1", Sender = "manager", SenderName = "Quầy Lễ Tân", Text = "Dạ chào anh Nam, quầy Lễ tân mở cửa hỗ trợ từ 06:00 - 22:00 hàng ngày. Anh cần hỗ trợ kiểm tra thời hạn gói tập hay dịch vụ tủ đồ cá nhân không ạ?", Timestamp = "08:15" }
                }
            };
        }

        private static ChatConversationRecord CreateMemberAnConversation()
        {
            return new ChatConversationRecord
            {
                Id = "conv-member-an",
                Type = "direct",
                Category = "member",
                RoleTag = "HỘI VIÊN",
                BadgeColor = "emerald",
                CoachId = "m-01",
                CoachName = "Nguyễn Văn An",
                MemberId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                MemberName = "Hồ Xuân Ánh Nam",
                CoachTitle = "Hồ Xuân Ánh Nam",
                CoachSubtitle = "Học viên bạn tập",
                MemberTitle = "Nguyễn Văn An",
                MemberSubtitle = "Hội viên Thể thao · Bạn tập Gym",
                Avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
                CoachAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
                LastMessage = "Chiều nay tầm 17h30 bạn có qua phòng gym tập ngực không, tập chung đổi tạ cho vui nhé!",
                LastTime = "09:30",
                UnreadCount = 0,
                Online = true,
                Messages = new List<ChatMessageItem>
                {
                    new() { Id = "an-1", Sender = "other_member", SenderName = "Nguyễn Văn An", Text = "Chào bạn Nam! Chiều nay tầm 17h30 bạn có qua phòng gym tập bài ngực không, tập chung đổi tạ cho vui nhé!", Timestamp = "09:30" }
                }
            };
        }

        private static List<ChatConversationRecord> CreateInitialConversations()
        {
            return new List<ChatConversationRecord>
            {
                CreateNamConversation(),
                CreateManagerConversation(),
                CreateReceptionConversation(),
                CreateMemberAnConversation(),
                new ChatConversationRecord
                {
                    Id = "conv-1",
                    Type = "direct",
                    Category = "coach",
                    RoleTag = "HLV",
                    BadgeColor = "orange",
                    CoachId = "coach-enam",
                    CoachName = "HLV Enam",
                    MemberId = "m-demo",
                    MemberName = "Học viên",
                    CoachTitle = "Hồ Xuân Ánh Nam",
                    CoachSubtitle = "Học viên PT 1-1",
                    MemberTitle = "HLV Enam (Master PT)",
                    MemberSubtitle = "HLV Thể hình & PT Cá nhân 1-1",
                    Avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                    CoachAvatar = "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100&auto=format&fit=crop&q=80",
                    LastMessage = "Thầy ơi, buổi tập sáng mai 7h em đến sớm 10 phút khởi động trước nhé ạ!",
                    LastTime = "14:20",
                    UnreadCount = 0,
                    Online = true,
                    Messages = new List<ChatMessageItem>
                    {
                        new() { Id = "m1", Sender = "coach", SenderName = "HLV Enam", Text = "Chào bạn, tuần này bạn cảm thấy cơ bắp phục hồi thế nào rồi?", Timestamp = "09:15" },
                        new() { Id = "m2", Sender = "member", SenderName = "Học viên", Text = "Dạ đỡ mỏi đùi rồi thầy, form Squat bài trước em làm thấy vào mông đùi rất tốt ạ.", Timestamp = "09:30" }
                    }
                },
                new ChatConversationRecord
                {
                    Id = "conv-2",
                    Type = "class",
                    Category = "class",
                    RoleTag = "NHÓM LỚP",
                    BadgeColor = "purple",
                    CoachId = "coach-02",
                    CoachName = "HLV Minh Tuyết",
                    MemberId = "cls-yoga-01",
                    MemberName = "Lớp Yoga Cơ Bản – Sáng 3-5-7",
                    CoachTitle = "Lớp Yoga Cơ Bản – Sáng 3-5-7",
                    CoachSubtitle = "Nhóm 12 học viên • Studio 2",
                    MemberTitle = "Lớp Yoga Cơ Bản – Sáng 3-5-7",
                    MemberSubtitle = "Nhóm lớp học • HLV Minh Tuyết",
                    Avatar = "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=100&auto=format&fit=crop&q=80",
                    CoachAvatar = "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=100&auto=format&fit=crop&q=80",
                    LastMessage = "Buổi mai lớp mình tập bài thở Pranayama nâng cao nhé!",
                    LastTime = "11:05",
                    UnreadCount = 0,
                    Online = true,
                    Messages = new List<ChatMessageItem>
                    {
                        new() { Id = "c1", Sender = "coach", SenderName = "HLV Minh Tuyết", Text = "Chào cả lớp, mọi người nhớ mang theo khăn riêng và thảm cá nhân nhé.", Timestamp = "Hôm qua" },
                        new() { Id = "c2", Sender = "coach", SenderName = "HLV Minh Tuyết", Text = "Buổi mai lớp mình tập bài thở Pranayama nâng cao nhé!", Timestamp = "11:05" },
                        new() { Id = "c3", Sender = "member", SenderName = "Lan Anh", Text = "Dạ vâng HLV ạ, sáng mai em sẽ đến sớm 10 phút ạ!", Timestamp = "11:15" }
                    }
                },
                new ChatConversationRecord
                {
                    Id = "conv-4",
                    Type = "class",
                    Category = "class",
                    RoleTag = "NHÓM LỚP",
                    BadgeColor = "purple",
                    CoachId = "coach-03",
                    CoachName = "HLV Hoàng Long",
                    MemberId = "cls-combat",
                    MemberName = "Gym Group BodyCombat",
                    CoachTitle = "Gym Group BodyCombat",
                    CoachSubtitle = "Nhóm lớp • 8 học viên",
                    MemberTitle = "Gym Group BodyCombat",
                    MemberSubtitle = "Nhóm cardio & kickfit • HLV Hoàng Long",
                    Avatar = "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100&auto=format&fit=crop&q=80",
                    CoachAvatar = "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100&auto=format&fit=crop&q=80",
                    LastMessage = "Ca hôm nay tập sung quá mọi người! Cảm ơn Coach nhiều ạ.",
                    LastTime = "Hôm qua",
                    UnreadCount = 0,
                    Online = true,
                    Messages = new List<ChatMessageItem>
                    {
                        new() { Id = "m40", Sender = "coach", SenderName = "HLV Hoàng Long", Text = "Hôm nay cả lớp tập rất tốt, nhịp độ cardio rất đều.", Timestamp = "Hôm qua 10:45" },
                        new() { Id = "m41", Sender = "member", SenderName = "Phạm Kiệt", Text = "Ca hôm nay tập sung quá mọi người! Cảm ơn Coach nhiều ạ.", Timestamp = "Hôm qua 11:00" }
                    }
                }
            };
        }
    }
}
