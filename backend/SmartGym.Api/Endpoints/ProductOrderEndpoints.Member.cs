using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Api.Endpoints;

public static partial class ProductOrderEndpoints
{
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

    private static async Task<IResult> ReadOrdersForUserAsync(SmartGymDbContext db, Guid? userId)
    {
        return userId is null
            ? Results.Unauthorized()
            : Results.Ok(await ReadOrdersAsync(db, userId));
    }
}
