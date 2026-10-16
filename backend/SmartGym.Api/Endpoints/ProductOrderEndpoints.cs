using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SmartGym.Api.Filters;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

public static partial class ProductOrderEndpoints
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
