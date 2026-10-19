using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Services;

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

        var rows = QueryConversations($"WHERE coach_id::text = {{0}} AND category IN ('coach', 'class')", coachProfileId);
        return rows.Select(row => ToCoachView(row, GetMessagesInternal(row.Id))).ToList();
    }

    public List<ChatConversationViewModel> GetConversationsForMember(string? memberId)
    {
        if (string.IsNullOrWhiteSpace(memberId)) return new();
        EnsureMemberBookedCoachConversations(memberId);
        var rows = QueryConversations($"WHERE member_id::text = {{0}}", memberId);
        return rows.Select(row => ToMemberView(row, GetMessagesInternal(row.Id))).ToList();
    }

    private List<ChatConversationRow> QueryConversations(string whereClause, params object[] args)
    {
        var sql = $@"SELECT id::text AS id, type, category, role_tag, badge_color, coach_title, coach_subtitle,
                         member_title, member_subtitle, avatar, coach_avatar, last_message,
                         last_time, unread_count, online, coach_id::text AS coach_id, coach_name, member_id::text AS member_id,
                         member_name, updated_at
                  FROM chat_conversations
                  {whereClause}
                  ORDER BY updated_at DESC NULLS LAST, id DESC";
        return _db.Database.SqlQueryRaw<ChatConversationRow>(sql, args).ToList();
    }

    private void EnsureMemberBookedCoachConversations(string memberId)
    {
        try
        {
            try
            {
                _db.Database.ExecuteSqlRaw(
                    @"DELETE FROM chat_messages WHERE text LIKE 'Chào bạn! Tôi là HLV%';
                      UPDATE chat_conversations
                      SET last_message = '', last_time = ''
                      WHERE last_message LIKE 'Chào bạn! Tôi là HLV%';
                      UPDATE chat_conversations
                      SET coach_avatar = ''
                      WHERE coach_avatar = avatar AND category = 'coach';"
                );
            }
            catch { }

            var bookedCoaches = _db.Database.SqlQueryRaw<BookedCoachRow>(
                @"SELECT DISTINCT
                    c.coach_id::text AS coach_id,
                    COALESCE(u.full_name, 'Huấn luyện viên') AS coach_name,
                    COALESCE(u.avatar_url, '') AS coach_avatar,
                    COALESCE(c.class_name, 'Lớp học') AS class_name,
                    COALESCE(c.schedule_time, now()) AS schedule_time
                  FROM classes c
                  INNER JOIN class_bookings b ON b.class_id = c.id
                  LEFT JOIN coaches co ON co.id = c.coach_id
                  LEFT JOIN users u ON u.id = co.user_id
                  WHERE b.user_id::text = {0}
                    AND c.coach_id IS NOT NULL
                    AND b.status NOT IN ('cancelled', 'rejected', 'class_cancelled')",
                memberId).ToList();

            if (!bookedCoaches.Any()) return;

            var memberUser = GetUser(memberId);
            var memberName = string.IsNullOrWhiteSpace(memberUser?.FullName) ? "Học viên" : memberUser.FullName;
            var memberAvatar = memberUser?.AvatarUrl ?? "";

            foreach (var coach in bookedCoaches)
            {
                if (string.IsNullOrWhiteSpace(coach.CoachId)) continue;

                var exists = _db.Database.SqlQueryRaw<ChatAccessRow>(
                    @"SELECT id::text AS id FROM chat_conversations
                      WHERE member_id::text = {0} AND coach_id::text = {1} AND category = 'coach'
                      LIMIT 1",
                    memberId, coach.CoachId).Any();

                if (!exists)
                {
                    var convId = $"conv-coach-{SanitizeId(coach.CoachId)}-{SanitizeId(memberId)}";
                    var now = DateTime.UtcNow;
                    _db.Database.ExecuteSqlInterpolated($@"
                        INSERT INTO chat_conversations
                            (id, type, category, role_tag, badge_color, coach_title, coach_subtitle,
                             member_title, member_subtitle, avatar, coach_avatar, last_message,
                             last_time, unread_count, online, coach_id, coach_name, member_id,
                             member_name, updated_at)
                        VALUES
                            ({convId}, 'direct', 'coach', 'HLV', 'orange', {memberName}, 'Học viên lớp ' || {coach.ClassName},
                             {coach.CoachName}, 'HLV phụ trách lớp ' || {coach.ClassName}, {memberAvatar}, {coach.CoachAvatar ?? ""},
                             '', '', 0, true, {coach.CoachId}, {coach.CoachName}, {memberId},
                             {memberName}, {now});
                    ");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ChatStoreService] Không thể tự động tạo hội thoại với HLV: {ex.Message}");
        }
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

    public ChatMessageItem? AddMessage(string conversationId, string text, string sender, string? senderName, string? participantId)
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
        string targetId, string targetName, string role,
        string currentUserId, string currentUserName,
        string? avatar = null, string? subtitle = null, string? initialMessage = null)
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

        if (existing != null) return ToMemberView(existing, GetMessagesInternal(existing.Id));

        var currentUser = GetUser(currentUserId);
        var memberDisplayName = string.IsNullOrWhiteSpace(currentUser?.FullName) ? currentUserName : currentUser.FullName;
        var memberAvatar = currentUser?.AvatarUrl ?? "";
        var roleTag = category switch { "coach" => "HLV", "class" => "NHÓM LỚP", "manager" => role == "reception" ? "LỄ TÂN" : "QUẢN LÝ", _ => "HỘI VIÊN" };
        var badgeColor = category switch { "coach" => "orange", "class" => "purple", "manager" => "blue", _ => "emerald" };
        var id = $"conv-{category}-{SanitizeId(targetId)}-{SanitizeId(currentUserId)}";
        var now = DateTime.UtcNow;

        _db.Database.ExecuteSqlInterpolated($@"
            INSERT INTO chat_conversations
                (id, type, category, role_tag, badge_color, coach_title, coach_subtitle,
                 member_title, member_subtitle, avatar, coach_avatar, last_message,
                 last_time, unread_count, online, coach_id, coach_name, member_id,
                 member_name, updated_at)
            VALUES
                ({id}, {type}, {category}, {roleTag}, {badgeColor}, {memberDisplayName}, {"Học viên SportCenter"},
                 {targetName}, {subtitle ?? roleTag}, {memberAvatar}, {avatar ?? ""}, '',
                 '', {0}, {true}, {targetId}, {targetName}, {currentUserId},
                 {memberDisplayName}, {now});");

        var created = GetConversation(id);
        return created == null ? null : ToMemberView(created, GetMessagesInternal(created.Id));
    }

    public ChatConversationViewModel? StartOrGetDirectConversation(
        string coachId, string coachName, string memberId, string memberName)
        => StartOrGetConversation(coachId, coachName, "coach", memberId, memberName);

    /// <summary>
    /// Starts a conversation from the coach side with one of the coach's own
    /// members. The authenticated user id is resolved to coaches.id because
    /// chat_conversations.coach_id references the coach profile.
    /// </summary>
    public ChatConversationViewModel? StartOrGetCoachMemberConversation(string memberId, string coachUserId)
    {
        if (string.IsNullOrWhiteSpace(memberId) || string.IsNullOrWhiteSpace(coachUserId)) return null;

        var coachProfileId = ResolveCoachProfileId(coachUserId);
        if (string.IsNullOrWhiteSpace(coachProfileId)) return null;

        var member = GetUser(memberId);
        if (member == null) return null;

        var belongsToCoach = _db.Database.SqlQueryRaw<ChatAccessRow>(
            @"SELECT u.id::text AS id
              FROM users u
              INNER JOIN roles r ON r.id = u.role_id
              WHERE u.id::text = {0}
                AND u.status = TRUE
                AND LOWER(r.name) = 'member'
                AND (
                    EXISTS (
                        SELECT 1 FROM classes c
                        INNER JOIN class_bookings b ON b.class_id = c.id
                        WHERE c.coach_id::text = {1}
                          AND b.user_id::text = u.id::text
                          AND b.status NOT IN ('cancelled', 'rejected', 'class_cancelled')
                    )
                    OR EXISTS (
                        SELECT 1 FROM pt_enrollments pe
                        WHERE pe.coach_id::text = {1}
                          AND pe.user_id::text = u.id::text
                          AND pe.payment_status = 'completed'
                          AND pe.start_date <= CURRENT_DATE
                          AND pe.end_date >= CURRENT_DATE
                    )
                )",
            memberId, coachProfileId).Any();

        if (!belongsToCoach) return null;

        var existing = _db.Database.SqlQueryRaw<ChatConversationRow>(
            @"SELECT id::text AS id, type, category, role_tag, badge_color, coach_title, coach_subtitle,
                     member_title, member_subtitle, avatar, coach_avatar, last_message,
                     last_time, unread_count, online, coach_id::text AS coach_id, coach_name, member_id::text AS member_id,
                     member_name, updated_at
              FROM chat_conversations
              WHERE coach_id::text = {0} AND member_id::text = {1} AND category = 'coach'
              LIMIT 1", coachProfileId, memberId).FirstOrDefault();

        if (existing != null) return ToCoachView(existing, GetMessagesInternal(existing.Id));

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

    // ── Private helpers ──────────────────────────────────────────────────────

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
        return _db.Database.SqlQueryRaw<ChatAccessRow>(
            "SELECT id::text AS id FROM chat_conversations WHERE id::text = {0} AND member_id::text = {1}",
            conversationId, memberId).Any();
    }

    private bool ConversationBelongsToCoach(string conversationId, string? coachProfileId)
    {
        if (string.IsNullOrWhiteSpace(coachProfileId)) return false;
        return _db.Database.SqlQueryRaw<ChatAccessRow>(
            "SELECT id::text AS id FROM chat_conversations WHERE id::text = {0} AND coach_id::text = {1} AND category IN ('coach', 'class')",
            conversationId, coachProfileId).Any();
    }

    private string? ResolveCoachProfileId(string? coachUserId)
    {
        if (!Guid.TryParse(coachUserId, out var parsedUserId)) return null;
        return _db.Database.SqlQueryRaw<ChatIdRow>(
            "SELECT id::text AS id FROM coaches WHERE user_id = {0}", parsedUserId).FirstOrDefault()?.Id;
    }

    private ChatUserRow? GetUser(string? userId)
    {
        if (!Guid.TryParse(userId, out var parsedUserId)) return null;
        return _db.Database.SqlQueryRaw<ChatUserRow>(
            "SELECT id, full_name, avatar_url FROM users WHERE id = {0}", parsedUserId).FirstOrDefault();
    }

    private static ChatConversationViewModel ToCoachView(ChatConversationRow row, List<ChatMessageItem> messages) => new()
    {
        Id = row.Id, Type = row.Type, Category = row.Category, RoleTag = row.RoleTag,
        BadgeColor = row.BadgeColor, Title = row.CoachTitle, Subtitle = row.CoachSubtitle,
        Avatar = row.Avatar, LastMessage = row.LastMessage, LastTime = row.LastTime,
        UnreadCount = row.UnreadCount, Online = row.Online,
        CoachId = row.CoachId, CoachName = row.CoachName,
        MemberId = row.MemberId, MemberName = row.MemberName, Messages = messages
    };

    private static ChatConversationViewModel ToMemberView(ChatConversationRow row, List<ChatMessageItem> messages) => new()
    {
        Id = row.Id, Type = row.Type, Category = row.Category, RoleTag = row.RoleTag,
        BadgeColor = row.BadgeColor, Title = row.MemberTitle, Subtitle = row.MemberSubtitle,
        Avatar = row.Category == "member" ? (row.Avatar ?? "") : (row.CoachAvatar ?? ""),
        LastMessage = row.LastMessage, LastTime = row.LastTime,
        UnreadCount = row.UnreadCount, Online = row.Online,
        CoachId = row.CoachId, CoachName = row.CoachName,
        MemberId = row.MemberId, MemberName = row.MemberName, Messages = messages
    };

    private static string SanitizeId(string value)
    {
        var cleaned = new string(value.Where(char.IsLetterOrDigit).ToArray()).ToLowerInvariant();
        return string.IsNullOrEmpty(cleaned) ? Guid.NewGuid().ToString("N")[..8] : cleaned[..Math.Min(32, cleaned.Length)];
    }

    private static DateTime ToLocalTime(DateTime utc) =>
        TimeZoneInfo.ConvertTimeBySystemTimeZoneId(utc, "SE Asia Standard Time");
}
