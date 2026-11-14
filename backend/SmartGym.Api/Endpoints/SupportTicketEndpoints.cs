using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace SmartGym.Api.Endpoints;

public class SupportTicketModel
{
    public string id { get; set; } = "";
    public string userId { get; set; } = "m-demo";
    public string memberName { get; set; } = "Lê Quang Vinh";
    public string memberPhone { get; set; } = "0987654321";
    public string category { get; set; } = "Tư vấn dịch vụ & Gia hạn gói";
    public string subject { get; set; } = "";
    public string content { get; set; } = "";
    public string status { get; set; } = "open"; // "open" | "resolved"
    public string createdAt { get; set; } = "";
    public string? reply { get; set; }
    public string? repliedAt { get; set; }
    public string? repliedBy { get; set; }
}

public static class SupportTicketStore
{
    private static readonly string _filePath = Path.Combine(AppContext.BaseDirectory, "support_tickets.json");
    private static readonly object _lock = new();
    private static List<SupportTicketModel>? _cachedTickets;

    public static List<SupportTicketModel> GetAll()
    {
        lock (_lock)
        {
            if (_cachedTickets != null) return _cachedTickets;
            if (File.Exists(_filePath))
            {
                try
                {
                    var json = File.ReadAllText(_filePath);
                    _cachedTickets = JsonSerializer.Deserialize<List<SupportTicketModel>>(json) ?? new();
                    return _cachedTickets;
                }
                catch { }
            }

            _cachedTickets = new List<SupportTicketModel>
            {
                new SupportTicketModel
                {
                    id = "TCK-971",
                    userId = "m-demo",
                    memberName = "Lê Quang Vinh",
                    memberPhone = "0987654321",
                    category = "Tư vấn dịch vụ & Gia hạn gói",
                    subject = "Xin bảo lưu gói tập 2 tuần do đi công tác",
                    content = "Chào ban quản lý, tuần tới tôi có chuyến công tác từ ngày 15/11 đến 30/11 nên không thể đến phòng tập. Nhờ trung tâm hỗ trợ tạm dừng/bảo lưu thời hạn thẻ tập của tôi trong thời gian này giúp tôi với ạ. Xin cảm ơn!",
                    status = "open",
                    createdAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                }
            };
            SaveUnsafe();
            return _cachedTickets;
        }
    }

    public static SupportTicketModel Add(SupportTicketModel ticket)
    {
        lock (_lock)
        {
            var list = GetAll();
            list.Insert(0, ticket);
            SaveUnsafe();
            return ticket;
        }
    }

    public static SupportTicketModel? Reply(string id, string reply, string repliedBy = "Nguyễn Văn Lễ Tân")
    {
        lock (_lock)
        {
            var list = GetAll();
            var ticket = list.FirstOrDefault(t => t.id.Equals(id, StringComparison.OrdinalIgnoreCase));
            if (ticket == null) return null;

            ticket.reply = reply;
            ticket.repliedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
            ticket.repliedBy = repliedBy;
            ticket.status = "resolved";
            SaveUnsafe();
            return ticket;
        }
    }

    private static void SaveUnsafe()
    {
        try
        {
            if (_cachedTickets != null)
            {
                var json = JsonSerializer.Serialize(_cachedTickets, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(_filePath, json);
            }
        }
        catch { }
    }
}

public static class SupportTicketEndpoints
{
    public static void MapSupportTicketEndpoints(this IEndpointRouteBuilder app)
    {
        // ── Receptionist Support Endpoints ──
        var recGroup = app.MapGroup("/api/receptionist/support-tickets");

        recGroup.MapGet("", () =>
        {
            var list = SupportTicketStore.GetAll();
            return Results.Ok(new
            {
                total = list.Count,
                openCount = list.Count(t => t.status == "open"),
                resolvedCount = list.Count(t => t.status == "resolved"),
                tickets = list
            });
        })
        .WithTags("Receptionist Portal")
        .WithSummary("Danh sách toàn bộ phiếu hỗ trợ từ hội viên");

        recGroup.MapPost("/{id}/reply", (string id, [FromBody] JsonElement body) =>
        {
            var replyText = body.TryGetProperty("reply", out var r) ? r.GetString() : "";
            var staffName = body.TryGetProperty("repliedBy", out var s) ? s.GetString() : "Nguyễn Văn Lễ Tân";

            if (string.IsNullOrWhiteSpace(replyText))
            {
                return Results.BadRequest(new { message = "Vui lòng nhập nội dung phản hồi cho hội viên." });
            }

            var updated = SupportTicketStore.Reply(id, replyText.Trim(), staffName ?? "Nguyễn Văn Lễ Tân");
            if (updated == null)
            {
                return Results.NotFound(new { message = "Không tìm thấy mã phiếu hỗ trợ này." });
            }

            return Results.Ok(new
            {
                success = true,
                message = "Đã phản hồi và xử lý phiếu thành công!",
                ticket = updated
            });
        })
        .WithTags("Receptionist Portal")
        .WithSummary("Lễ tân phản hồi và giải quyết phiếu hỗ trợ");
    }
}

