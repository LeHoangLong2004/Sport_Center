using System;
using System.Threading;
using System.Threading.Tasks;

namespace SmartGym.Application.Interfaces;

public interface IProductOrderPaymentService
{
    /// <summary>
    /// Finalizes stock and fulfillment side effects for a paid product order.
    /// Returns true for non-product invoices so package payments keep working.
    /// </summary>
    Task<bool> FinalizeAsync(Guid invoiceId, CancellationToken cancellationToken = default);
}
