using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Infrastructure.Services;

public class InvoicePdfService(SmartGymDbContext db) : IPdfService
{
    // Color shortcuts
    private static readonly string Blue3  = Colors.Blue.Darken3;
    private static readonly string Blue2  = Colors.Blue.Darken2;
    private static readonly string Grey1  = Colors.Grey.Lighten1;
    private static readonly string Grey2  = Colors.Grey.Darken2;
    private static readonly string Grey4  = Colors.Grey.Lighten4;

    public async Task<byte[]> GenerateInvoicePdfAsync(Guid invoiceId)
    {
        var invoice = await db.Invoices.Include(i => i.User)
            .FirstOrDefaultAsync(i => i.Id == invoiceId)
            ?? throw new Exception("Khong tim thay hoa don nay");

        var sub = await db.Subscriptions.Include(s => s.Package)
            .Where(s => s.UserId == invoice.UserId)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(s => Math.Abs((s.CreatedAt - invoice.CreatedAt).TotalMinutes) < 30);

        return Document.Create(c => c.Page(p =>
        {
            p.Size(PageSizes.A4);
            p.Margin(2, Unit.Centimetre);
            p.PageColor(Colors.White);
            p.DefaultTextStyle(x => x.FontSize(11).FontFamily(Fonts.Arial));
            p.Header().Element(ComposeHeader);
            p.Content().Element(c2 => ComposeContent(c2, invoice, sub));
            p.Footer().Element(ComposeFooter);
        })).GeneratePdf();
    }

    // ── Header ───────────────────────────────────────────────────────────────

    private void ComposeHeader(IContainer c)
    {
        c.BorderBottom(1).BorderColor(Blue3).PaddingBottom(12).Row(row =>
        {
            row.RelativeItem().Column(col =>
            {
                col.Item().Text("SMART GYM FITNESS").FontSize(22).Bold().FontColor(Blue3);
                SmallGrey(col, "123 Duong Ton Duc Thang, Quan 1, TP. Ho Chi Minh");
                SmallGrey(col, "Hotline: 1900 1234  |  Email: support@smartgym.vn");
                col.Item().Text("Website: www.smartgym.vn").FontSize(9).FontColor(Colors.Blue.Medium);
            });
            row.ConstantItem(160).AlignRight().Column(col =>
            {
                col.Item().Text("BIEN LAI THANH TOAN").FontSize(13).Bold().FontColor(Blue3);
                col.Item().PaddingTop(2).Text("(Payment Receipt)").FontSize(9).Italic().FontColor(Colors.Grey.Darken1);
            });
        });
    }

    // ── Content ──────────────────────────────────────────────────────────────

    private void ComposeContent(IContainer c,
        SmartGym.Domain.Entities.Invoice invoice,
        SmartGym.Domain.Entities.Subscription? sub)
    {
        var user = invoice.User;
        var pkg  = sub?.Package;

        var pkgName    = pkg?.Name ?? "Goi dich vu Gym";
        var pkgType    = pkg?.PackageType?.ToLowerInvariant() switch
        {
            "membership" => "Goi thanh vien",
            "sport"      => "Goi tap the thao",
            _            => "Goi dich vu"
        };
        var billing    = sub?.BillingPeriod?.ToLowerInvariant() switch
        {
            "monthly" => "Hang thang (Monthly)",
            "yearly"  => "Hang nam (Yearly)",
            _         => "---"
        };
        var validity   = sub is not null ? $"{sub.StartDate:dd/MM/yyyy} - {sub.EndDate:dd/MM/yyyy}" : "---";
        var basePrice  = sub is not null ? sub.TotalAmount + sub.DiscountAmount : invoice.TotalAmount;
        var discount   = sub?.DiscountAmount ?? 0;
        var discPct    = sub?.DiscountPct    ?? 0;
        var total      = invoice.TotalAmount;

        var (statusLabel, statusColor) = invoice.Status switch
        {
            PaymentStatus.Completed => ("DA THANH TOAN",  Colors.Green.Darken2),
            PaymentStatus.Pending   => ("CHO THANH TOAN", Colors.Orange.Darken2),
            PaymentStatus.Refunded  => ("DA HOAN TIEN",   Colors.Purple.Darken2),
            PaymentStatus.Failed    => ("THAT BAI",        Colors.Red.Darken2),
            _                       => ("HET HAN",         Colors.Grey.Darken2)
        };

        c.PaddingVertical(8).Column(col =>
        {
            col.Spacing(14);

            // Mã + ngày + badge trạng thái
            col.Item().Row(row =>
            {
                row.RelativeItem().Column(inner =>
                {
                    inner.Item().Text(t => { t.Span("Ma bien lai: ").SemiBold(); t.Span(invoice.InvoiceNumber).FontColor(Blue2).SemiBold(); });
                    inner.Item().PaddingTop(2).Text(t => { t.Span("Ngay lap: ").SemiBold(); t.Span(invoice.CreatedAt.ToLocalTime().ToString("dd/MM/yyyy HH:mm")); });
                    if (invoice.PaidAt.HasValue)
                        inner.Item().PaddingTop(2).Text(t => { t.Span("Ngay thanh toan: ").SemiBold(); t.Span(invoice.PaidAt.Value.ToLocalTime().ToString("dd/MM/yyyy HH:mm")); });
                });
                row.ConstantItem(130).AlignRight().AlignMiddle()
                    .Border(1.5f).BorderColor(statusColor).Padding(6)
                    .Text(statusLabel).FontSize(10).Bold().FontColor(statusColor).AlignCenter();
            });

            col.Item().LineHorizontal(0.5f).LineColor(Grey1);

            // Thông tin khách hàng
            SectionTitle(col, "THONG TIN KHACH HANG");
            col.Item().Background(Grey4).Padding(10).Table(t =>
            {
                t.ColumnsDefinition(cd => { cd.RelativeColumn(1); cd.RelativeColumn(2); cd.RelativeColumn(1); cd.RelativeColumn(2); });
                InfoRow(t, "Ho va ten:",    user?.FullName    ?? "---", "So dien thoai:", user?.PhoneNumber ?? "---");
                InfoRow(t, "Email:",         user?.Email       ?? "---", "Ma hoi vien:",   invoice.UserId.ToString("N")[..8].ToUpperInvariant());
            });

            // Chi tiết dịch vụ
            SectionTitle(col, "CHI TIET DICH VU");
            col.Item().Table(t =>
            {
                t.ColumnsDefinition(cd => { cd.ConstantColumn(32); cd.RelativeColumn(4); cd.RelativeColumn(1); cd.RelativeColumn(1.2f); });
                t.Header(h =>
                {
                    HdrCell(h.Cell(), "STT",              center: true);
                    HdrCell(h.Cell(), "Noi dung dich vu");
                    HdrCell(h.Cell(), "Ky han");
                    HdrCell(h.Cell(), "Thanh tien",       right: true);
                    h.Cell().ColumnSpan(4).BorderBottom(1.5f).BorderColor(Blue3);
                });

                t.Cell().PaddingTop(8).PaddingBottom(4).Text("1").AlignCenter();
                t.Cell().PaddingTop(8).PaddingBottom(4).Column(inner =>
                {
                    inner.Item().Text(pkgName).SemiBold();
                    inner.Item().Text($"Loai: {pkgType}").FontSize(9).FontColor(Grey2);
                    inner.Item().Text($"Hieu luc: {validity}").FontSize(9).FontColor(Grey2);
                });
                t.Cell().PaddingTop(8).PaddingBottom(4).Text(billing).FontSize(9);
                t.Cell().PaddingTop(8).PaddingBottom(4).AlignRight().Text($"{basePrice:N0} VND").SemiBold();
                t.Cell().ColumnSpan(4).BorderBottom(0.5f).BorderColor(Grey1);
            });

            // Tổng tiền
            col.Item().AlignRight().Width(260).Table(t =>
            {
                t.ColumnsDefinition(cd => { cd.RelativeColumn(2); cd.RelativeColumn(1); });
                SummaryRow(t, "Gia goc:", $"{basePrice:N0} VND");
                if (discount > 0)
                    SummaryRow(t, $"Giam gia ({discPct:0}%):", $"- {discount:N0} VND", Colors.Green.Darken2);
                t.Cell().ColumnSpan(2).BorderBottom(1).BorderColor(Grey1).PaddingBottom(4);
                t.Cell().PaddingTop(6).Text("TONG CONG:").Bold().FontSize(13);
                t.Cell().PaddingTop(6).AlignRight().Text($"{total:N0} VND").Bold().FontSize(13).FontColor(Blue3);
            });

            col.Item().LineHorizontal(0.5f).LineColor(Grey1);

            // Hình thức & ghi chú
            col.Item().Text(t => { t.Span("Hinh thuc thanh toan: ").SemiBold(); t.Span(invoice.PaymentMethod.ToDisplayName()); });
            col.Item().PaddingTop(6).Background(Colors.Yellow.Lighten4).Padding(8)
                .Text("Ghi chu: Bien lai nay la bang chung hop le cho giao dich thanh toan tai Smart Gym Fitness. Vui long luu giu de doi chieu khi can thiet.")
                .FontSize(9).Italic().FontColor(Grey2);
        });
    }

    // ── Footer ───────────────────────────────────────────────────────────────

    private void ComposeFooter(IContainer c)
    {
        c.BorderTop(0.5f).BorderColor(Grey1).PaddingTop(8).Row(row =>
        {
            row.RelativeItem().Text(t =>
                t.Span("Cam on quy khach da tin tuong va su dung dich vu cua Smart Gym Fitness!")
                    .FontSize(9).Italic().FontColor(Grey2));

            row.ConstantItem(80).AlignRight().Text(t =>
            {
                t.Span("Trang ").FontSize(9).FontColor(Colors.Grey.Darken1);
                t.CurrentPageNumber().FontSize(9).FontColor(Colors.Grey.Darken1);
                t.Span(" / ").FontSize(9).FontColor(Colors.Grey.Darken1);
                t.TotalPages().FontSize(9).FontColor(Colors.Grey.Darken1);
            });
        });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static void SectionTitle(ColumnDescriptor col, string title) =>
        col.Item().Text(title).FontSize(10).Bold().FontColor(Colors.Blue.Darken3);

    private static void SmallGrey(ColumnDescriptor col, string text) =>
        col.Item().Text(text).FontSize(9).FontColor(Colors.Grey.Darken2);

    private static void HdrCell(IContainer h, string text, bool center = false, bool right = false)
    {
        var t = h.Background(Colors.Blue.Darken3).Padding(6)
            .Text(text).FontSize(9).Bold().FontColor(Colors.White);
        if (center) t.AlignCenter();
        if (right)  t.AlignRight();
    }

    private static void InfoRow(TableDescriptor t, string l1, string v1, string l2, string v2)
    {
        t.Cell().PaddingVertical(4).PaddingLeft(4).Text(l1).SemiBold().FontSize(9);
        t.Cell().PaddingVertical(4).Text(v1).FontSize(9);
        t.Cell().PaddingVertical(4).PaddingLeft(4).Text(l2).SemiBold().FontSize(9);
        t.Cell().PaddingVertical(4).Text(v2).FontSize(9);
    }

    private static void SummaryRow(TableDescriptor t, string label, string value, string? color = null)
    {
        t.Cell().PaddingVertical(3).Text(label).FontSize(10);
        var txt = t.Cell().PaddingVertical(3).AlignRight().Text(value).FontSize(10);
        if (color != null) txt.FontColor(color);
    }
}
