using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartGym.Api.Services;

// ── Public DTOs ────────────────────────────────────────────────────────────────

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

// ── Internal DB row types (used only by ChatStoreService) ──────────────────────

internal sealed class ChatConversationRow
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

internal sealed class ChatMessageRow
{
    [Column("id")] public string Id { get; set; } = "";
    [Column("sender")] public string Sender { get; set; } = "";
    [Column("sender_name")] public string? SenderName { get; set; }
    [Column("text")] public string Text { get; set; } = "";
    [Column("timestamp")] public string Timestamp { get; set; } = "";
    [Column("created_at")] public DateTime CreatedAt { get; set; }
}

internal sealed class ChatAccessRow { [Column("id")] public string Id { get; set; } = ""; }
internal sealed class ChatIdRow { [Column("id")] public string Id { get; set; } = ""; }

internal sealed class ChatUserRow
{
    [Column("id")] public Guid Id { get; set; }
    [Column("full_name")] public string FullName { get; set; } = "";
    [Column("avatar_url")] public string? AvatarUrl { get; set; }
}

internal sealed class BookedCoachRow
{
    [Column("coach_id")] public string CoachId { get; set; } = "";
    [Column("coach_name")] public string CoachName { get; set; } = "";
    [Column("coach_avatar")] public string? CoachAvatar { get; set; }
    [Column("class_name")] public string ClassName { get; set; } = "";
    [Column("schedule_time")] public DateTime ScheduleTime { get; set; }
}
