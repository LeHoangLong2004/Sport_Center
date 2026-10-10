using System;
using System.Threading.Tasks;
using SmartGym.Domain.Entities;

namespace SmartGym.Application.Interfaces;

public interface IInvoiceRepository
{
    Task<Invoice?> GetByIdAsync(Guid id);
    Task AddAsync(Invoice invoice);
    Task UpdateAsync(Invoice invoice);
    Task<System.Collections.Generic.IEnumerable<Invoice>> GetAllAsync();
    Task<System.Collections.Generic.IEnumerable<Invoice>> GetByUserIdAsync(Guid userId);
}
