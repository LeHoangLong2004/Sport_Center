using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;

namespace SmartGym.Infrastructure.Persistence.EF;

public class InvoiceRepository : IInvoiceRepository
{
    private readonly SmartGymDbContext _context;

    public InvoiceRepository(SmartGymDbContext context)
    {
        _context = context;
    }

    public async Task<Invoice?> GetByIdAsync(Guid id)
    {
        return await _context.Invoices
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task AddAsync(Invoice invoice)
    {
        await _context.Invoices.AddAsync(invoice);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Invoice invoice)
    {
        _context.Invoices.Update(invoice);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Invoice>> GetAllAsync()
    {
        return await _context.Invoices
            .Include(i => i.User)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Invoice>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Invoices
            .Include(i => i.User)
            .Where(i => i.UserId == userId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }
}
