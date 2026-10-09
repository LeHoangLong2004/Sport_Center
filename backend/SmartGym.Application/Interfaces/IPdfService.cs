using System;
using System.Threading.Tasks;

namespace SmartGym.Application.Interfaces;

public interface IPdfService
{
    /// <summary>
    /// Generates a PDF byte array for a given invoice ID.
    /// </summary>
    Task<byte[]> GenerateInvoicePdfAsync(Guid invoiceId);
}
