using System;
using System.Data;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Interfaces;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Infrastructure.Services;

public sealed class ProductOrderPaymentService(SmartGymDbContext db) : IProductOrderPaymentService
{
    public async Task<bool> FinalizeAsync(Guid invoiceId, CancellationToken cancellationToken = default)
    {
        var connection = db.Database.GetDbConnection();
        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync(cancellationToken);

        await using var countCommand = connection.CreateCommand();
        countCommand.CommandText = "SELECT COUNT(*) FROM invoice_items WHERE invoice_id = @invoiceId";
        AddParameter(countCommand, "invoiceId", invoiceId);
        var itemCount = Convert.ToInt32(await countCommand.ExecuteScalarAsync(cancellationToken));

        if (itemCount == 0)
            return true;

        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        try
        {
            await using var stockCommand = connection.CreateCommand();
            stockCommand.Transaction = transaction;
            stockCommand.CommandText = """
                UPDATE products AS p
                SET stock_quantity = p.stock_quantity - i.quantity
                FROM invoice_items AS i
                WHERE i.invoice_id = @invoiceId
                  AND p.id = i.product_id
                  AND p.status = TRUE
                  AND p.stock_quantity >= i.quantity;
                """;
            AddParameter(stockCommand, "invoiceId", invoiceId);

            var changedRows = await stockCommand.ExecuteNonQueryAsync(cancellationToken);
            if (changedRows != itemCount)
            {
                await transaction.RollbackAsync(cancellationToken);
                return false;
            }

            await using var fulfillmentCommand = connection.CreateCommand();
            fulfillmentCommand.Transaction = transaction;
            fulfillmentCommand.CommandText = """
                UPDATE invoices
                SET fulfillment_status = CASE
                    WHEN fulfillment_status = 'pending' THEN 'preparing'
                    ELSE fulfillment_status
                END
                WHERE id = @invoiceId
                  AND payment_status = 'pending';
                """;
            AddParameter(fulfillmentCommand, "invoiceId", invoiceId);
            await fulfillmentCommand.ExecuteNonQueryAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);
            return true;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private static void AddParameter(System.Data.Common.DbCommand command, string name, object value)
    {
        var parameter = command.CreateParameter();
        parameter.ParameterName = name;
        parameter.Value = value;
        command.Parameters.Add(parameter);
    }
}
