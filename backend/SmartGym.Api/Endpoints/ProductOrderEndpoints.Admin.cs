using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

public static partial class ProductOrderEndpoints
{
    private static async Task<IResult> ConfirmOrderAsync(
        Guid invoiceId,
        SmartGymDbContext db,
        HttpContext context)
    {
        var actorId = GetUserId(context);
        if (actorId is null)
            return Results.Unauthorized();

        await using var connection = db.Database.GetDbConnection();
        await connection.OpenAsync();
        await using var transaction = await connection.BeginTransactionAsync();

        try
        {
            var items = await ReadOrderItemsAsync(connection, transaction, invoiceId);
            if (items.Count == 0)
            {
                await transaction.RollbackAsync();
                return Results.BadRequest(new { message = "Order does not exist or has already been processed." });
            }

            foreach (var item in items)
            {
                var changedStock = await ExecuteAsync(connection, transaction, """
                    UPDATE products
                    SET stock_quantity = stock_quantity - @quantity
                    WHERE id = @productId
                      AND status = TRUE
                      AND stock_quantity >= @quantity;
                    """, ("productId", item.ProductId), ("quantity", item.Quantity));

                if (changedStock == 0)
                {
                    await transaction.RollbackAsync();
                    return Results.BadRequest(new { message = $"Product '{item.Name}' does not have enough stock." });
                }
            }

            var changed = await ExecuteAsync(connection, transaction, """
                UPDATE invoices
                SET payment_status = 'completed',
                    paid_at = NOW(),
                    created_by = @actorId,
                    fulfillment_status = CASE
                        WHEN fulfillment_status = 'pending' THEN 'preparing'
                        ELSE fulfillment_status
                    END
                WHERE id = @invoiceId
                  AND payment_status = 'pending';
                """, ("invoiceId", invoiceId), ("actorId", actorId.Value));

            if (changed == 0)
            {
                await transaction.RollbackAsync();
                return Results.BadRequest(new { message = "Order does not exist or has already been processed." });
            }

            await transaction.CommitAsync();
            return Results.Ok(new { message = "Order confirmed." });
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static async Task<IResult> UpdateFulfillmentAsync(
        Guid invoiceId,
        UpdateFulfillmentRequest request,
        SmartGymDbContext db,
        HttpContext context)
    {
        var actorId = GetUserId(context);
        if (actorId is null)
            return Results.Unauthorized();

        var status = NormalizeFulfillmentStatus(request.Status);
        if (status is null)
            return Results.BadRequest(new { message = "Trạng thái giao hàng không hợp lệ." });

        await using var connection = db.Database.GetDbConnection();
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            UPDATE invoices
            SET fulfillment_status = @status,
                assigned_to = CASE
                    WHEN @status IN ('preparing', 'delivering') THEN COALESCE(assigned_to, @actorId)
                    ELSE assigned_to
                END,
                fulfilled_at = CASE
                    WHEN @status IN ('delivered', 'cancelled') THEN NOW()
                    ELSE fulfilled_at
                END,
                delivery_location = COALESCE(NULLIF(@deliveryLocation, ''), delivery_location)
            WHERE id = @invoiceId
              AND (@status = 'cancelled' OR payment_status = 'completed');
            """;
        AddParameter(command, "status", status);
        AddParameter(command, "actorId", actorId.Value);
        AddParameter(command, "deliveryLocation", request.DeliveryLocation?.Trim());
        AddParameter(command, "invoiceId", invoiceId);

        if (await command.ExecuteNonQueryAsync() == 0)
            return Results.BadRequest(new { message = "Đơn chưa được thanh toán hoặc không tồn tại." });

        return Results.Ok(new { message = "Đã cập nhật trạng thái đơn hàng.", status });
    }

    private static async Task<IResult> ReadMessagesAsync(
        Guid invoiceId,
        SmartGymDbContext db,
        HttpContext context)
    {
        var staffAccess = IsStaff(context);
        var userId = staffAccess ? null : GetUserId(context);
        if (!staffAccess && userId is null)
            return Results.Unauthorized();

        var connection = db.Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
            await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        var memberOrderJoin = staffAccess
            ? ""
            : "INNER JOIN invoices owner_invoice ON owner_invoice.id = m.invoice_id AND owner_invoice.user_id = @userId";
        command.CommandText = $"""
            SELECT m.id, m.sender_id, COALESCE(u.full_name, 'Nhân viên'), m.message, m.created_at
            FROM product_order_messages m
            {memberOrderJoin}
            LEFT JOIN users u ON u.id = m.sender_id
            WHERE m.invoice_id = @invoiceId
            ORDER BY m.created_at ASC;
            """;
        AddParameter(command, "invoiceId", invoiceId);
        if (userId is not null)
            AddParameter(command, "userId", userId.Value);

        var messages = new List<ProductOrderMessageResponse>();
        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            messages.Add(new ProductOrderMessageResponse(
                reader.GetGuid(0),
                reader.GetGuid(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetDateTime(4)));
        }

        return Results.Ok(messages);
    }

    private static async Task<IResult> AddMessageAsync(
        Guid invoiceId,
        ProductOrderMessageRequest request,
        SmartGymDbContext db,
        HttpContext context)
    {
        var senderId = GetUserId(context);
        if (senderId is null || string.IsNullOrWhiteSpace(request.Message))
            return Results.BadRequest(new { message = "Nội dung tin nhắn không được để trống." });

        if (!await CanAccessOrderAsync(invoiceId, db, context))
            return Results.NotFound(new { message = "Không tìm thấy đơn hàng." });

        var connection = db.Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
            await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            INSERT INTO product_order_messages (id, invoice_id, sender_id, message, created_at)
            VALUES (@id, @invoiceId, @senderId, @message, NOW())
            RETURNING id, created_at;
            """;
        AddParameter(command, "id", Guid.NewGuid());
        AddParameter(command, "invoiceId", invoiceId);
        AddParameter(command, "senderId", senderId.Value);
        AddParameter(command, "message", request.Message.Trim());

        await using var reader = await command.ExecuteReaderAsync();
        await reader.ReadAsync();
        var senderName = context.User.FindFirstValue(ClaimTypes.Name) ?? "Nhân viên";
        return Results.Created($"/api/product-orders/{invoiceId}/messages", new
        {
            id = reader.GetGuid(0),
            invoiceId,
            senderId,
            senderName,
            message = request.Message.Trim(),
            createdAt = reader.GetDateTime(1),
        });
    }

    private static async Task<bool> CanAccessOrderAsync(
        Guid invoiceId,
        SmartGymDbContext db,
        HttpContext context)
    {
        if (IsStaff(context))
            return true;

        var userId = GetUserId(context);
        if (userId is null)
            return false;

        var connection = db.Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
            await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT EXISTS (
                SELECT 1 FROM invoices WHERE id = @invoiceId AND user_id = @userId
            );
            """;
        AddParameter(command, "invoiceId", invoiceId);
        AddParameter(command, "userId", userId.Value);
        return (bool)(await command.ExecuteScalarAsync() ?? false);
    }

    private static async Task<List<ProductOrderResponse>> ReadOrdersAsync(
        SmartGymDbContext db,
        Guid? userId)
    {
        await using var connection = db.Database.GetDbConnection();
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        var userFilter = userId is null ? "" : "WHERE i.user_id = @userId";
        command.CommandText = $"""
            SELECT
                i.id,
                i.user_id,
                COALESCE(u.full_name, 'Customer'),
                i.total_amount,
                COALESCE(i.payment_method, 'counter'),
                COALESCE(i.payment_status, 'pending'),
                i.created_at,
                COALESCE(i.fulfillment_method, 'counter_pickup'),
                COALESCE(i.fulfillment_status, 'pending'),
                i.delivery_location,
                COALESCE(assigned.full_name, ''),
                i.paid_at,
                (
                    SELECT COUNT(*)
                    FROM product_order_messages order_message
                    WHERE order_message.invoice_id = i.id
                ) AS message_count,
                ii.product_id,
                p.name,
                ii.quantity,
                ii.unit_price
            FROM invoices i
            LEFT JOIN users u ON u.id = i.user_id
            LEFT JOIN users assigned ON assigned.id = i.assigned_to
            INNER JOIN invoice_items ii ON ii.invoice_id = i.id
            INNER JOIN products p ON p.id = ii.product_id
            {userFilter}
            ORDER BY i.created_at DESC;
            """;
        if (userId is not null)
            AddParameter(command, "userId", userId.Value);

        await using var reader = await command.ExecuteReaderAsync();
        var orders = new Dictionary<Guid, ProductOrderBuilder>();
        while (await reader.ReadAsync())
        {
            var id = reader.GetGuid(0);
            if (!orders.TryGetValue(id, out var order))
            {
                order = new ProductOrderBuilder
                {
                    Id = id,
                    UserId = reader.IsDBNull(1) ? Guid.Empty : reader.GetGuid(1),
                    CustomerName = reader.GetString(2),
                    TotalAmount = reader.GetDecimal(3),
                    PaymentMethod = reader.GetString(4),
                    Status = reader.GetString(5),
                    CreatedAt = reader.GetDateTime(6),
                    FulfillmentMethod = reader.GetString(7),
                    FulfillmentStatus = reader.GetString(8),
                    DeliveryLocation = reader.IsDBNull(9) ? null : reader.GetString(9),
                    AssignedToName = reader.GetString(10),
                    PaidAt = reader.IsDBNull(11) ? null : reader.GetDateTime(11),
                    MessageCount = Convert.ToInt32(reader.GetInt64(12)),
                };
                orders[id] = order;
            }

            order.Items.Add(new ProductOrderItemResponse(
                reader.GetGuid(13),
                reader.GetString(14),
                reader.GetInt32(15),
                reader.GetDecimal(16)));
        }

        return orders.Values.Select(order => order.ToResponse()).ToList();
    }

    private static async Task<List<OrderStockItem>> ReadOrderItemsAsync(
        DbConnection connection,
        DbTransaction transaction,
        Guid invoiceId)
    {
        await using var command = connection.CreateCommand();
        command.Transaction = transaction;
        command.CommandText = """
            SELECT ii.product_id, p.name, ii.quantity
            FROM invoice_items ii
            INNER JOIN products p ON p.id = ii.product_id
            INNER JOIN invoices i ON i.id = ii.invoice_id
            WHERE ii.invoice_id = @invoiceId
              AND i.payment_status = 'pending';
            """;
        AddParameter(command, "invoiceId", invoiceId);

        var items = new List<OrderStockItem>();
        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            items.Add(new OrderStockItem(reader.GetGuid(0), reader.GetString(1), reader.GetInt32(2)));
        }

        return items;
    }
}
