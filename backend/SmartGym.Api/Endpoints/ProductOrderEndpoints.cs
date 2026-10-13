using System.Data.Common;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SmartGym.Api.Filters;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Api.Endpoints;

public static class ProductOrderEndpoints
{
    public static void MapProductOrderEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/product-orders").WithTags("Product Orders");

        group.MapPost("", CreateOrderAsync)
            .AddEndpointFilter(Authorize.Roles(UserRole.Member));

        group.MapGet("/my", async (SmartGymDbContext db, HttpContext context) =>
                await ReadOrdersForUserAsync(db, GetUserId(context)))
            .AddEndpointFilter(Authorize.Roles(UserRole.Member));

        group.MapGet("", async (SmartGymDbContext db) =>
                Results.Ok(await ReadOrdersAsync(db, null)))
            .AddEndpointFilter(Authorize.Roles(UserRole.CenterManager, UserRole.Receptionist));

        group.MapPut("/{invoiceId:guid}/confirm", ConfirmOrderAsync)
            .AddEndpointFilter(Authorize.Roles(UserRole.CenterManager, UserRole.Receptionist));

        group.MapPut("/{invoiceId:guid}/fulfillment", UpdateFulfillmentAsync)
            .AddEndpointFilter(Authorize.Roles(UserRole.CenterManager, UserRole.Receptionist));

        group.MapGet("/{invoiceId:guid}/messages", ReadMessagesAsync)
            .AddEndpointFilter(Authorize.Roles(UserRole.Member, UserRole.CenterManager, UserRole.Receptionist));

        group.MapPost("/{invoiceId:guid}/messages", AddMessageAsync)
            .AddEndpointFilter(Authorize.Roles(UserRole.Member, UserRole.CenterManager, UserRole.Receptionist));
    }

    private static async Task<IResult> CreateOrderAsync(
        CreateProductOrderRequest request,
        SmartGymDbContext db,
        global::Supabase.Client supabase,
        HttpContext context,
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("ProductOrderEndpoints");
        var userId = GetUserId(context);
        if (userId is null)
            return Results.Unauthorized();

        var requestedItems = request.Items?
            .Where(item => item.Quantity > 0)
            .GroupBy(item => item.ProductId)
            .Select(group => new ProductOrderItemRequest(group.Key, group.Sum(item => item.Quantity)))
            .ToList() ?? [];

        if (requestedItems.Count == 0)
            return Results.BadRequest(new { message = "Cart is empty." });

        var products = (await supabase.From<ProductModel>().Get()).Models
            .Where(product => product.Status)
            .ToDictionary(product => product.Id);

        var lines = new List<ProductOrderLine>();
        foreach (var item in requestedItems)
        {
            if (!products.TryGetValue(item.ProductId, out var product))
                return Results.BadRequest(new { message = "A product no longer exists." });

            if (product.StockQuantity < item.Quantity)
                return Results.BadRequest(new { message = $"Product '{product.Name}' does not have enough stock." });

            lines.Add(new ProductOrderLine(product.Id, product.Name, item.Quantity, product.Price));
        }

        var paymentMethod = NormalizePaymentMethod(request.PaymentMethod);
        var fulfillmentMethod = NormalizeFulfillmentMethod(request.FulfillmentMethod);
        var deliveryLocation = request.DeliveryLocation?.Trim();
        if (fulfillmentMethod == "in_center_delivery" && string.IsNullOrWhiteSpace(deliveryLocation))
            return Results.BadRequest(new { message = "Vui lòng nhập vị trí nhận hàng trong trung tâm." });

        var invoiceId = Guid.NewGuid();
        var total = lines.Sum(line => line.Quantity * line.UnitPrice);

        await using var connection = db.Database.GetDbConnection();
        await connection.OpenAsync();
        await using var transaction = await connection.BeginTransactionAsync();

        try
        {
            await ExecuteAsync(connection, transaction, """
                INSERT INTO invoices
                    (id, user_id, total_amount, payment_method, payment_status,
                     fulfillment_method, fulfillment_status, delivery_location, created_at)
                VALUES
                    (@id, @userId, @totalAmount, @paymentMethod, 'pending',
                     @fulfillmentMethod, 'pending', @deliveryLocation, NOW())
                """, ("id", invoiceId), ("userId", userId.Value),
                ("totalAmount", total), ("paymentMethod", paymentMethod),
                ("fulfillmentMethod", fulfillmentMethod), ("deliveryLocation", deliveryLocation));

            foreach (var line in lines)
            {
                await ExecuteAsync(connection, transaction, """
                    INSERT INTO invoice_items (id, invoice_id, product_id, quantity, unit_price)
                    VALUES (@id, @invoiceId, @productId, @quantity, @unitPrice)
                    """, ("id", Guid.NewGuid()), ("invoiceId", invoiceId), ("productId", line.ProductId),
                    ("quantity", line.Quantity), ("unitPrice", line.UnitPrice));
            }

            await transaction.CommitAsync();
        }
        catch (Exception exception)
        {
            await transaction.RollbackAsync();
            logger.LogError(exception, "Could not create product order for member {MemberId}.", userId);
            return Results.Problem(
                title: "Không thể tạo đơn hàng.",
                detail: "Đơn hàng chưa được ghi nhận. Vui lòng thử lại hoặc báo lễ tân.",
                statusCode: StatusCodes.Status500InternalServerError);
        }

        return Results.Created($"/api/product-orders/{invoiceId}", new
        {
            id = invoiceId,
            totalAmount = total,
            paymentMethod,
            status = "pending",
            fulfillmentMethod,
            fulfillmentStatus = "pending",
            deliveryLocation,
            items = lines.Select(line => new
            {
                productId = line.ProductId,
                name = line.Name,
                quantity = line.Quantity,
                unitPrice = line.UnitPrice,
                lineTotal = line.Quantity * line.UnitPrice,
            }),
        });
    }

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

    private static async Task<IResult> ReadOrdersForUserAsync(SmartGymDbContext db, Guid? userId)
    {
        return userId is null
            ? Results.Unauthorized()
            : Results.Ok(await ReadOrdersAsync(db, userId));
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

    private static async Task<int> ExecuteAsync(
        DbConnection connection,
        DbTransaction transaction,
        string sql,
        params (string Name, object? Value)[] parameters)
    {
        await using var command = connection.CreateCommand();
        command.Transaction = transaction;
        command.CommandText = sql;
        foreach (var (name, value) in parameters)
            AddParameter(command, name, value);
        return await command.ExecuteNonQueryAsync();
    }

    private static void AddParameter(DbCommand command, string name, object? value)
    {
        var parameter = command.CreateParameter();
        parameter.ParameterName = name;
        parameter.Value = value ?? DBNull.Value;
        command.Parameters.Add(parameter);
    }

    private static Guid? GetUserId(HttpContext context)
    {
        var value = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? context.User.FindFirstValue("sub");
        return Guid.TryParse(value, out var id) ? id : null;
    }

    private static string NormalizePaymentMethod(string? value) => value?.Trim().ToLowerInvariant() switch
    {
        "qr" or "qrcode" => "qr",
        "card" or "credit_card" => "card",
        "wallet" or "ewallet" => "wallet",
        "bank_transfer" or "banktransfer" => "bank_transfer",
        _ => "counter",
    };

    private static string NormalizeFulfillmentMethod(string? value) => value?.Trim().ToLowerInvariant() switch
    {
        "delivery" or "in_center_delivery" => "in_center_delivery",
        _ => "counter_pickup",
    };

    private static string? NormalizeFulfillmentStatus(string? value) => value?.Trim().ToLowerInvariant() switch
    {
        "pending" or "preparing" or "ready" or "delivering" or "delivered" or "cancelled" => value.Trim().ToLowerInvariant(),
        _ => null,
    };

    private static bool IsStaff(HttpContext context)
    {
        var role = context.User.FindFirstValue(ClaimTypes.Role);
        return Enum.TryParse<UserRole>(role, true, out var userRole)
            && userRole is UserRole.CenterManager or UserRole.Receptionist;
    }

    private sealed record ProductOrderLine(Guid ProductId, string Name, int Quantity, decimal UnitPrice);
    private sealed record OrderStockItem(Guid ProductId, string Name, int Quantity);

    private sealed class ProductOrderBuilder
    {
        public Guid Id { get; init; }
        public Guid UserId { get; init; }
        public string CustomerName { get; init; } = "";
        public decimal TotalAmount { get; init; }
        public string PaymentMethod { get; init; } = "counter";
        public string Status { get; init; } = "pending";
        public DateTime CreatedAt { get; init; }
        public string FulfillmentMethod { get; init; } = "counter_pickup";
        public string FulfillmentStatus { get; init; } = "pending";
        public string? DeliveryLocation { get; init; }
        public string AssignedToName { get; init; } = "";
        public DateTime? PaidAt { get; init; }
        public int MessageCount { get; init; }
        public List<ProductOrderItemResponse> Items { get; } = [];

        public ProductOrderResponse ToResponse() => new(
            Id,
            UserId,
            CustomerName,
            TotalAmount,
            PaymentMethod,
            Status,
            CreatedAt,
            FulfillmentMethod,
            FulfillmentStatus,
            DeliveryLocation,
            AssignedToName,
            PaidAt,
            MessageCount,
            Items);
    }

    public sealed record ProductOrderItemRequest(Guid ProductId, int Quantity);

    public sealed record CreateProductOrderRequest(
        List<ProductOrderItemRequest> Items,
        string? PaymentMethod,
        string? FulfillmentMethod,
        string? DeliveryLocation);

    public sealed record UpdateFulfillmentRequest(string Status, string? DeliveryLocation);

    public sealed record ProductOrderMessageRequest(string Message);

    public sealed record ProductOrderMessageResponse(
        Guid Id,
        Guid SenderId,
        string SenderName,
        string Message,
        DateTime CreatedAt);

    public sealed record ProductOrderItemResponse(
        Guid ProductId,
        string Name,
        int Quantity,
        decimal UnitPrice)
    {
        public decimal LineTotal => Quantity * UnitPrice;
    }

    public sealed record ProductOrderResponse(
        Guid Id,
        Guid UserId,
        string CustomerName,
        decimal TotalAmount,
        string PaymentMethod,
        string Status,
        DateTime CreatedAt,
        string FulfillmentMethod,
        string FulfillmentStatus,
        string? DeliveryLocation,
        string AssignedToName,
        DateTime? PaidAt,
        int MessageCount,
        IReadOnlyList<ProductOrderItemResponse> Items);
}
