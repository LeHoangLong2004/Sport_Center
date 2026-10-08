using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Infrastructure.Services;

public class InvoicePdfService : IPdfService
{
    private readonly SmartGymDbContext _dbContext;

    public InvoicePdfService(SmartGymDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<byte[]> GenerateInvoicePdfAsync(Guid invoiceId)
    {
        // Fetch invoice details
        var invoice = await _dbContext.Invoices
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null)
        {
            throw new Exception("Không tìm thấy hóa đơn này");
        }

        // Generate PDF Document
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(12).FontFamily(Fonts.Arial));

                page.Header().Element(ComposeHeader);
                page.Content().Element(c => ComposeContent(c, invoice));
                page.Footer().AlignCenter().Text(x =>
                {
                    x.CurrentPageNumber();
                    x.Span(" / ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeHeader(IContainer container)
    {
        container.Row(row =>
        {
            row.RelativeItem().Column(column =>
            {
                column.Item().Text("SMART GYM FITNESS").FontSize(24).SemiBold().FontColor(Colors.Blue.Darken2);
                column.Item().Text("123 Đường Tôn Đức Thắng, Quận 1, TP.HCM");
                column.Item().Text("Hotline: 1900 1234");
            });

            row.ConstantItem(100).Height(50).Placeholder(); // Placeholder cho Logo
        });
    }

    private void ComposeContent(IContainer container, SmartGym.Domain.Entities.Invoice invoice)
    {
        container.PaddingVertical(1, Unit.Centimetre).Column(column =>
        {
            column.Spacing(20);

            column.Item().Text("HÓA ĐƠN THANH TOÁN").FontSize(20).SemiBold().AlignCenter();

            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(2);
                });

                table.Cell().Text("Mã hóa đơn:");
                table.Cell().Text(invoice.InvoiceNumber);

                table.Cell().Text("Khách hàng:");
                table.Cell().Text(invoice.User?.FullName ?? invoice.UserId.ToString());

                table.Cell().Text("Ngày tạo:");
                table.Cell().Text(invoice.CreatedAt.ToLocalTime().ToString("dd/MM/yyyy HH:mm"));

                table.Cell().Text("Trạng thái:");
                table.Cell().Text(invoice.Status.ToDisplayName());

                table.Cell().Text("Hình thức thanh toán:");
                table.Cell().Text(invoice.PaymentMethod.ToDisplayName());
            });

            column.Item().PaddingTop(25).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(50);
                    columns.RelativeColumn(3);
                    columns.RelativeColumn(1);
                });

                table.Header(header =>
                {
                    header.Cell().Text("#").SemiBold();
                    header.Cell().Text("Nội dung thanh toán").SemiBold();
                    header.Cell().AlignRight().Text("Thành tiền").SemiBold();
                    
                    header.Cell().ColumnSpan(3).PaddingTop(5).BorderBottom(1).BorderColor(Colors.Black);
                });

                table.Cell().PaddingTop(10).Text("1");
                table.Cell().PaddingTop(10).Text("Đăng ký / Gia hạn Gói Cước Gym");
                table.Cell().PaddingTop(10).AlignRight().Text($"{invoice.TotalAmount:N0} VNĐ");
            });

            column.Item().PaddingTop(25).AlignRight().Text($"Tổng cộng: {invoice.TotalAmount:N0} VNĐ").FontSize(16).SemiBold();

            column.Item().PaddingTop(10).AlignRight().Text(invoice.PaidAt.HasValue
                ? $"Đã thanh toán lúc {invoice.PaidAt.Value.ToLocalTime():dd/MM/yyyy HH:mm}"
                : "Chưa thanh toán").FontColor(Colors.Grey.Darken1);
        });
    }
}
