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
public sealed partial class ChatStoreService
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

