using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Services;

public class ChatMessageItem
{
    public string Id { get; set; } = "";
    public string Sender { get; set; } = "coach";
    public string SenderName { get; set; } = "";
    public string Text { get; set; } = "";
    public string Timestamp { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
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

/// <summary>
/// DB-backed chat store. There is deliberately no JSON/mock fallback: every
/// conversation and message must belong to a real authenticated participant.
/// </summary>
public sealed class ChatStoreService
{
    private readonly SmartGymDbContext _db;

    public ChatStoreService(SmartGymDbContext db) => _db = db;

    public List<ChatConversationViewModel> GetConversationsForCoach(string? coachUserId)
    {
        var coachProfileId = ResolveCoachProfileId(coachUserId);
        if (string.IsNullOrWhiteSpace(coachProfileId)) return new();

        var rows = _db.Database.SqlQueryRaw<ChatConversationRow>(
            @"SELECT id::text AS id, type, category, role_tag, badge_color, coach_title, coach_subtitle,
                     member_title, member_subtitle, avatar, coach_avatar, last_message,
                     last_time, unread_count, online, coach_id::text AS coach_id, coach_name, member_id::text AS member_id,
                     member_name, updated_at
              FROM chat_conversations
              WHERE coach_id::text = {0} AND category IN ('coach', 'class')
              ORDER BY updated_at DESC NULLS LAST, id DESC", coachProfileId).ToList();

        return rows.Select(row => ToCoachView(row, GetMessagesInternal(row.Id))).ToList();
    }

    public List<ChatConversationViewModel> GetConversationsForMember(string? memberId)
    {
        if (string.IsNullOrWhiteSpace(memberId)) return new();

        var rows = _db.Database.SqlQueryRaw<ChatConversationRow>(
            @"SELECT id::text AS id, type, category, role_tag, badge_color, coach_title, coach_subtitle,
                     member_title, member_subtitle, avatar, coach_avatar, last_message,
                     last_time, unread_count, online, coach_id::text AS coach_id, coach_name, member_id::text AS member_id,
                     member_name, updated_at
              FROM chat_conversations
              WHERE member_id::text = {0}
              ORDER BY updated_at DESC NULLS LAST, id DESC", memberId).ToList();

        return rows.Select(row => ToMemberView(row, GetMessagesInternal(row.Id))).ToList();
    }

    public List<ChatMessageItem>? GetMessagesForCoach(string conversationId, string? coachUserId)
    {
        var coachProfileId = ResolveCoachProfileId(coachUserId);
        if (string.IsNullOrWhiteSpace(coachProfileId) ||
            !ConversationBelongsToCoach(conversationId, coachProfileId)) return null;

        return GetMessagesInternal(conversationId);
    }

    public List<ChatMessageItem>? GetMessagesForMember(string conversationId, string? memberId)
    {
        if (string.IsNullOrWhiteSpace(memberId) ||
            !ConversationBelongsToMember(conversationId, memberId)) return null;

        return GetMessagesInternal(conversationId);
    }

    public ChatMessageItem? AddMessage(
        string conversationId,
        string text,
        string sender,
        string? senderName,
        string? participantId)
    {
        if (string.IsNullOrWhiteSpace(text) || string.IsNullOrWhiteSpace(participantId)) return null;

        var conversation = GetConversation(conversationId);
        if (conversation == null) return null;

        var hasAccess = sender.Equals("coach", StringComparison.OrdinalIgnoreCase)
            ? ConversationBelongsToCoach(conversationId, ResolveCoachProfileId(participantId))
            : ConversationBelongsToMember(conversationId, participantId);
        if (!hasAccess) return null;

        var user = GetUser(participantId);
        var effectiveSenderName = string.IsNullOrWhiteSpace(user?.FullName)
            ? (senderName ?? (sender == "coach" ? conversation.CoachName : conversation.MemberName))
            : user.FullName;
        var now = DateTime.UtcNow;
        var message = new ChatMessageItem
        {
            Id = Guid.NewGuid().ToString("N"),
            Sender = sender,
            SenderName = effectiveSenderName,
            Text = text.Trim(),
            Timestamp = ToLocalTime(now).ToString("HH:mm"),
            CreatedAt = now
        };

        _db.Database.ExecuteSqlInterpolated($@"
            INSERT INTO chat_messages (id, conversation_id, sender, sender_name, text, timestamp, created_at)
            VALUES ({message.Id}, {conversationId}, {message.Sender}, {message.SenderName}, {message.Text}, {message.Timestamp}, {message.CreatedAt});
            UPDATE chat_conversations
            SET last_message = {message.Text}, last_time = {message.Timestamp}, updated_at = {message.CreatedAt}
            WHERE id::text = {conversationId};");

        return message;
    }

    public ChatConversationViewModel? StartOrGetConversation(
        string targetId,
        string targetName,
        string role,
        string currentUserId,
        string currentUserName,
        string? avatar = null,
        string? subtitle = null)
    {
        if (string.IsNullOrWhiteSpace(targetId) || string.IsNullOrWhiteSpace(currentUserId)) return null;

        var category = role switch
        {
            "coach" => "coach",
            "class" => "class",
            "manager" or "reception" or "staff" => "manager",
            "member" => "member",
            _ => "coach"
        };
        var type = category == "class" ? "class" : "direct";
        var existing = _db.Database.SqlQueryRaw<ChatConversationRow>(
            @"SELECT id::text AS id, type, category, role_tag, badge_color, coach_title, coach_subtitle,
                     member_title, member_subtitle, avatar, coach_avatar, last_message,
                     last_time, unread_count, online, coach_id::text AS coach_id, coach_name, member_id::text AS member_id,
                     member_name, updated_at
              FROM chat_conversations
              WHERE member_id::text = {0} AND coach_id::text = {1} AND category = {2}
              LIMIT 1", currentUserId, targetId, category).FirstOrDefault();

        if (existing != null)
            return ToMemberView(existing, GetMessagesInternal(existing.Id));

        var currentUser = GetUser(currentUserId);
        var memberDisplayName = string.IsNullOrWhiteSpace(currentUser?.FullName)
            ? currentUserName
            : currentUser.FullName;
        var memberAvatar = currentUser?.AvatarUrl ?? "";
        var roleTag = category switch
        {
            "coach" => "HLV",
            "class" => "NHÓM LỚP",
            "manager" => role == "reception" ? "LỄ TÂN" : "QUẢN LÝ",
            _ => "HỘI VIÊN"
        };
        var badgeColor = category switch
        {
            "coach" => "orange",
            "class" => "purple",
            "manager" => "blue",
            _ => "emerald"
        };
        var id = $"conv-{category}-{SanitizeId(targetId)}-{SanitizeId(currentUserId)}";
        var now = DateTime.UtcNow;
        var emptyLastMessage = "";
        var defaultMemberSubtitle = "Học viên SportCenter";
        var formattedTime = ToLocalTime(now).ToString("HH:mm");

        _db.Database.ExecuteSqlInterpolated($@"
            INSERT INTO chat_conversations
                (id, type, category, role_tag, badge_color, coach_title, coach_subtitle,
                 member_title, member_subtitle, avatar, coach_avatar, last_message,
                 last_time, unread_count, online, coach_id, coach_name, member_id,
                 member_name, updated_at)
            VALUES
                ({id}, {type}, {category}, {roleTag}, {badgeColor}, {memberDisplayName}, {defaultMemberSubtitle},
                 {targetName}, {subtitle ?? roleTag}, {memberAvatar}, {avatar ?? memberAvatar}, {emptyLastMessage},
                 {formattedTime}, {0}, {true}, {targetId}, {targetName}, {currentUserId},
                 {memberDisplayName}, {now});");

        var created = GetConversation(id);
        return created == null ? null : ToMemberView(created, GetMessagesInternal(created.Id));
    }

    public ChatConversationViewModel? StartOrGetDirectConversation(
        string coachId,
        string coachName,
        string memberId,
        string memberName) => StartOrGetConversation(coachId, coachName, "coach", memberId, memberName);

    /// <summary>
    /// Starts a conversation from the coach side with one of the coach's own
    /// members. The authenticated user id is resolved to coaches.id because
    /// chat_conversations.coach_id references the coach profile.
    /// </summary>
    public ChatConversationViewModel? StartOrGetCoachMemberConversation(
        string memberId,
        string coachUserId)
    {
        if (string.IsNullOrWhiteSpace(memberId) || string.IsNullOrWhiteSpace(coachUserId)) return null;

        var coachProfileId = ResolveCoachProfileId(coachUserId);
        if (string.IsNullOrWhiteSpace(coachProfileId)) return null;

        var member = GetUser(memberId);
        if (member == null) return null;

        // Do not allow a coach to open arbitrary member conversations. This
        // mirrors /api/coach/members: an active class booking or active PT
        // enrollment must connect the member to this coach.
        var belongsToCoach = _db.Database.SqlQueryRaw<AccessRow>(
            @"SELECT u.id::text AS id
              FROM users u
              INNER JOIN roles r ON r.id = u.role_id
              WHERE u.id::text = {0}
                AND u.status = TRUE
                AND LOWER(r.name) = 'member'
                AND (
                    EXISTS (
                        SELECT 1
                        FROM classes c
                        INNER JOIN class_bookings b ON b.class_id = c.id
                        WHERE c.coach_id::text = {1}
                          AND b.user_id::text = u.id::text
                          AND b.status NOT IN ('cancelled', 'rejected', 'class_cancelled')
                    )
                    OR EXISTS (
                        SELECT 1
                        FROM pt_enrollments pe
                        WHERE pe.coach_id::text = {1}
                          AND pe.user_id::text = u.id::text
                          AND pe.payment_status = 'completed'
                          AND pe.start_date <= CURRENT_DATE
                          AND pe.end_date >= CURRENT_DATE
                    )
                )",
            memberId,
            coachProfileId).Any();

        if (!belongsToCoach) return null;

        var existing = _db.Database.SqlQueryRaw<ChatConversationRow>(
            @"SELECT id::text AS id, type, category, role_tag, badge_color, coach_title, coach_subtitle,
                     member_title, member_subtitle, avatar, coach_avatar, last_message,
                     last_time, unread_count, online, coach_id::text AS coach_id, coach_name, member_id::text AS member_id,
                     member_name, updated_at
              FROM chat_conversations
              WHERE coach_id::text = {0} AND member_id::text = {1} AND category = 'coach'
              LIMIT 1", coachProfileId, memberId).FirstOrDefault();

        if (existing != null)
            return ToCoachView(existing, GetMessagesInternal(existing.Id));

        var coach = GetUser(coachUserId);
        var memberName = string.IsNullOrWhiteSpace(member.FullName) ? "Học viên" : member.FullName;
        var coachName = string.IsNullOrWhiteSpace(coach?.FullName) ? "HLV SportCenter" : coach.FullName;
        var memberAvatar = member.AvatarUrl ?? "";
        var coachAvatar = coach?.AvatarUrl ?? "";
        var id = $"conv-coach-{SanitizeId(coachProfileId)}-{SanitizeId(memberId)}";
        var now = DateTime.UtcNow;
        var formattedTime = ToLocalTime(now).ToString("HH:mm");

        _db.Database.ExecuteSqlInterpolated($@"
            INSERT INTO chat_conversations
                (id, type, category, role_tag, badge_color, coach_title, coach_subtitle,
                 member_title, member_subtitle, avatar, coach_avatar, last_message,
                 last_time, unread_count, online, coach_id, coach_name, member_id,
                 member_name, updated_at)
            VALUES
                ({id}, {"direct"}, {"coach"}, {"HỌC VIÊN"}, {"orange"}, {memberName}, {"Học viên phụ trách"},
                 {coachName}, {"Huấn luyện viên SportCenter"}, {memberAvatar}, {coachAvatar}, {""},
                 {formattedTime}, {0}, {true}, {coachProfileId}, {coachName}, {memberId},
                 {memberName}, {now});");

        var created = GetConversation(id);
        return created == null ? null : ToCoachView(created, GetMessagesInternal(created.Id));
    }

    private ChatConversationRow? GetConversation(string conversationId) =>
        _db.Database.SqlQueryRaw<ChatConversationRow>(
            @"SELECT id::text AS id, type, category, role_tag, badge_color, coach_title, coach_subtitle,
                     member_title, member_subtitle, avatar, coach_avatar, last_message,
                     last_time, unread_count, online, coach_id::text AS coach_id, coach_name, member_id::text AS member_id,
                     member_name, updated_at
              FROM chat_conversations WHERE id::text = {0}", conversationId).FirstOrDefault();

    private List<ChatMessageItem> GetMessagesInternal(string conversationId) =>
        _db.Database.SqlQueryRaw<ChatMessageRow>(
            @"SELECT id::text AS id, sender, sender_name, text, timestamp, created_at
              FROM chat_messages WHERE conversation_id::text = {0}
              ORDER BY created_at ASC, id ASC", conversationId)
        .ToList()
        .Select(row => new ChatMessageItem
        {
            Id = row.Id,
            Sender = row.Sender,
            SenderName = row.SenderName ?? "",
            Text = row.Text,
            Timestamp = row.Timestamp,
            CreatedAt = row.CreatedAt
        }).ToList();

    private bool ConversationBelongsToMember(string conversationId, string? memberId)
    {
        if (string.IsNullOrWhiteSpace(memberId)) return false;
        return _db.Database.SqlQueryRaw<AccessRow>(
            "SELECT id::text AS id FROM chat_conversations WHERE id::text = {0} AND member_id::text = {1}", conversationId, memberId).Any();
    }

    private bool ConversationBelongsToCoach(string conversationId, string? coachProfileId)
    {
        if (string.IsNullOrWhiteSpace(coachProfileId)) return false;
        return _db.Database.SqlQueryRaw<AccessRow>(
            "SELECT id::text AS id FROM chat_conversations WHERE id::text = {0} AND coach_id::text = {1} AND category IN ('coach', 'class')",
            conversationId, coachProfileId).Any();
    }

    private string? ResolveCoachProfileId(string? coachUserId)
    {
        if (!Guid.TryParse(coachUserId, out var parsedUserId)) return null;
        return _db.Database.SqlQueryRaw<IdRow>(
            "SELECT id::text AS id FROM coaches WHERE user_id = {0}", parsedUserId).FirstOrDefault()?.Id;
    }

    private UserRow? GetUser(string? userId)
    {
        if (!Guid.TryParse(userId, out var parsedUserId)) return null;
        return _db.Database.SqlQueryRaw<UserRow>(
            "SELECT id, full_name, avatar_url FROM users WHERE id = {0}", parsedUserId).FirstOrDefault();
    }

    private static ChatConversationViewModel ToCoachView(ChatConversationRow row, List<ChatMessageItem> messages) => new()
    {
        Id = row.Id,
        Type = row.Type,
        Category = row.Category,
        RoleTag = row.RoleTag,
        BadgeColor = row.BadgeColor,
        Title = row.CoachTitle,
        Subtitle = row.CoachSubtitle,
        Avatar = row.Avatar,
        LastMessage = row.LastMessage,
        LastTime = row.LastTime,
        UnreadCount = row.UnreadCount,
        Online = row.Online,
        CoachId = row.CoachId,
        CoachName = row.CoachName,
        MemberId = row.MemberId,
        MemberName = row.MemberName,
        Messages = messages
    };

    private static ChatConversationViewModel ToMemberView(ChatConversationRow row, List<ChatMessageItem> messages) => new()
    {
        Id = row.Id,
        Type = row.Type,
        Category = row.Category,
        RoleTag = row.RoleTag,
        BadgeColor = row.BadgeColor,
        Title = row.MemberTitle,
        Subtitle = row.MemberSubtitle,
        Avatar = string.IsNullOrWhiteSpace(row.CoachAvatar) ? row.Avatar : row.CoachAvatar,
        LastMessage = row.LastMessage,
        LastTime = row.LastTime,
        UnreadCount = row.UnreadCount,
        Online = row.Online,
        CoachId = row.CoachId,
        CoachName = row.CoachName,
        MemberId = row.MemberId,
        MemberName = row.MemberName,
        Messages = messages
    };

    private static string SanitizeId(string value)
    {
        var cleaned = new string(value.Where(char.IsLetterOrDigit).ToArray()).ToLowerInvariant();
        return string.IsNullOrEmpty(cleaned) ? Guid.NewGuid().ToString("N")[..8] : cleaned[..Math.Min(32, cleaned.Length)];
    }

    private static DateTime ToLocalTime(DateTime utc) =>
        TimeZoneInfo.ConvertTimeBySystemTimeZoneId(utc, "SE Asia Standard Time");

    private sealed class ChatConversationRow
    {
        [Column("id")] public string Id { get; set; } = "";
        [Column("type")] public string Type { get; set; } = "direct";
        [Column("category")] public string Category { get; set; } = "coach";
        [Column("role_tag")] public string RoleTag { get; set; } = "HLV";
        [Column("badge_color")] public string BadgeColor { get; set; } = "orange";
        [Column("coach_title")] public string CoachTitle { get; set; } = "";
        [Column("coach_subtitle")] public string CoachSubtitle { get; set; } = "";
        [Column("member_title")] public string MemberTitle { get; set; } = "";
        [Column("member_subtitle")] public string MemberSubtitle { get; set; } = "";
        [Column("avatar")] public string Avatar { get; set; } = "";
        [Column("coach_avatar")] public string CoachAvatar { get; set; } = "";
        [Column("last_message")] public string LastMessage { get; set; } = "";
        [Column("last_time")] public string LastTime { get; set; } = "";
        [Column("unread_count")] public int UnreadCount { get; set; }
        [Column("online")] public bool Online { get; set; } = true;
        [Column("coach_id")] public string CoachId { get; set; } = "";
        [Column("coach_name")] public string CoachName { get; set; } = "";
        [Column("member_id")] public string MemberId { get; set; } = "";
        [Column("member_name")] public string MemberName { get; set; } = "";
        [Column("updated_at")] public DateTime? UpdatedAt { get; set; }
    }

    private sealed class ChatMessageRow
    {
        [Column("id")] public string Id { get; set; } = "";
        [Column("sender")] public string Sender { get; set; } = "";
        [Column("sender_name")] public string? SenderName { get; set; }
        [Column("text")] public string Text { get; set; } = "";
        [Column("timestamp")] public string Timestamp { get; set; } = "";
        [Column("created_at")] public DateTime CreatedAt { get; set; }
    }

    private sealed class AccessRow { [Column("id")] public string Id { get; set; } = ""; }
    private sealed class IdRow { [Column("id")] public string Id { get; set; } = ""; }
    private sealed class UserRow
    {
        [Column("id")] public Guid Id { get; set; }
        [Column("full_name")] public string FullName { get; set; } = "";
        [Column("avatar_url")] public string? AvatarUrl { get; set; }
    }
}
