using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Services;

public sealed partial class ChatStoreService
{
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
}

