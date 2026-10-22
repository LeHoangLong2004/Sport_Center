using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;
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

    private class InvoiceLineItem
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Validity { get; set; } = "---";
        public string PeriodOrQty { get; set; } = "---";
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    private class ClassBookingRaw
    {
        public Guid BookingId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public DateTime ScheduleTime { get; set; }
        public int? DurationMinutes { get; set; }
        public string? SportName { get; set; }
    }

    private class ProductItemRaw
    {
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public async Task<byte[]> GenerateInvoicePdfAsync(Guid invoiceId)
    {
        var invoice = await db.Invoices.Include(i => i.User)
            .FirstOrDefaultAsync(i => i.Id == invoiceId)
            ?? throw new Exception("Không tìm thấy hóa đơn này");

        var items = new List<InvoiceLineItem>();
        decimal discountAmount = 0;
        decimal discountPct = 0;

        // 1. Kiểm tra đơn hàng bán lẻ (Sản phẩm / Phụ kiện từ shop)
        try
        {
            var productItems = await db.Database.SqlQueryRaw<ProductItemRaw>(
                """
                SELECT p.name AS "ProductName", ii.quantity AS "Quantity", ii.unit_price AS "UnitPrice"
                FROM invoice_items ii
                JOIN products p ON p.id = ii.product_id
                WHERE ii.invoice_id = {0}
                """, invoice.Id)
                .ToListAsync();

            if (productItems.Count > 0)
            {
                foreach (var pi in productItems)
                {
                    items.Add(new InvoiceLineItem
                    {
                        Name = pi.ProductName,
                        Type = "Sản phẩm / Phụ kiện",
                        Validity = "Mua tại trung tâm",
                        PeriodOrQty = $"{pi.Quantity} món",
                        UnitPrice = pi.UnitPrice,
                        TotalPrice = pi.UnitPrice * pi.Quantity
                    });
                }
            }
        }
        catch { }

        // 2. Nếu không có sản phẩm bán lẻ, kiểm tra Gói hội viên / Gói môn tập (Subscriptions)
        if (items.Count == 0)
        {
            var userSubs = await db.Subscriptions
                .Include(s => s.Package)
                .Where(s => s.UserId == invoice.UserId)
                .OrderByDescending(s => s.CreatedAt)
                .Take(25)
                .ToListAsync();

            Subscription? matchedSub = null;

            // Ưu tiên 1: Cùng số tiền và thời điểm tạo gần nhau
            matchedSub = userSubs
                .Where(s => Math.Abs(s.TotalAmount - invoice.TotalAmount) < 1m)
                .OrderBy(s => Math.Abs((s.CreatedAt - invoice.CreatedAt).TotalSeconds))
                .FirstOrDefault();

            // Ưu tiên 2: Tạo trong vòng 24 giờ và số tiền khớp
            if (matchedSub == null)
            {
                matchedSub = userSubs
                    .Where(s => Math.Abs((s.CreatedAt - invoice.CreatedAt).TotalHours) < 24)
                    .OrderBy(s => Math.Abs((s.CreatedAt - invoice.CreatedAt).TotalSeconds))
                    .FirstOrDefault();
            }

            // Nếu hóa đơn có giá trị khác xa gói sub gần nhất (ví dụ invoice 150k nhưng sub 500k),
            // bỏ qua sub để kiểm tra xem có phải đơn đặt lớp học 150k hay không.
            if (matchedSub != null && Math.Abs(matchedSub.TotalAmount - invoice.TotalAmount) > 50000m)
            {
                // Kiểm tra xem có đơn đặt lớp không
                try
                {
                    var hasClassBooking = await db.Database.SqlQueryRaw<ClassBookingRaw>(
                        """
                        SELECT cb.id AS "BookingId", cb.created_at AS "CreatedAt",
                               COALESCE(c.class_name, 'Lớp học') AS "ClassName",
                               COALESCE(c.schedule_time, now()) AS "ScheduleTime",
                               c.duration_minutes AS "DurationMinutes",
                               s.name AS "SportName"
                        FROM class_bookings cb
                        JOIN classes c ON c.id = cb.class_id
                        LEFT JOIN sports s ON s.id = c.sport_id
                        WHERE cb.user_id = {0}
                        ORDER BY ABS(EXTRACT(EPOCH FROM (cb.created_at - {1}))) ASC
                        LIMIT 1
                        """, invoice.UserId, invoice.CreatedAt)
                        .FirstOrDefaultAsync();

                    if (hasClassBooking != null && Math.Abs((hasClassBooking.CreatedAt - invoice.CreatedAt).TotalHours) < 48)
                    {
                        matchedSub = null; // Chuyển sang xử lý class booking
                    }
                }
                catch { }
            }

            if (matchedSub != null)
            {
                discountAmount = matchedSub.DiscountAmount;
                discountPct = matchedSub.DiscountPct;

                string? pkgName = null;
                string? pkgCategory = null;
                string? pkgTier = null;
                string? pkgSport = null;
                int? durationMonths = matchedSub.DurationMonths;

                if (!string.IsNullOrWhiteSpace(matchedSub.PackageSnapshotJson))
                {
                    try
                    {
                        using var doc = JsonDocument.Parse(matchedSub.PackageSnapshotJson);
                        var root = doc.RootElement;
                        if (root.TryGetProperty("name", out var n) && !string.IsNullOrWhiteSpace(n.GetString()))
                            pkgName = n.GetString();
                        if (root.TryGetProperty("category", out var c))
                            pkgCategory = c.GetString();
                        if (root.TryGetProperty("tier", out var t))
                            pkgTier = t.GetString();
                        if (root.TryGetProperty("sport", out var sp))
                            pkgSport = sp.GetString();
                        if (root.TryGetProperty("durationMonths", out var dm) && dm.TryGetInt32(out var dmVal))
                            durationMonths ??= dmVal;
                    }
                    catch { }
                }

                pkgName ??= matchedSub.Package?.Name ?? GetKnownPackageName(matchedSub.PackageId);
                pkgCategory ??= matchedSub.Package?.PackageType;

                var resolvedName = !string.IsNullOrWhiteSpace(pkgName)
                    ? (pkgName.StartsWith("Gói", StringComparison.OrdinalIgnoreCase) || pkgName.StartsWith("Thẻ", StringComparison.OrdinalIgnoreCase) ? pkgName : $"Gói Hội viên {pkgName}")
                    : "Gói Hội viên SmartGym";

                var resolvedType = (pkgCategory ?? "").ToLowerInvariant() switch
                {
                    "membership" => "Gói thành viên",
                    "sport" => string.IsNullOrWhiteSpace(pkgSport) ? "Gói tập thể thao" : $"Gói môn {pkgSport}",
                    _ => "Gói hội viên"
                };

                string billing;
                if (durationMonths.HasValue && durationMonths.Value > 0)
                    billing = $"{durationMonths.Value} tháng";
                else if (matchedSub.BillingPeriod?.Contains("12", StringComparison.OrdinalIgnoreCase) == true || matchedSub.BillingPeriod?.Equals("yearly", StringComparison.OrdinalIgnoreCase) == true)
                    billing = "12 tháng (Hàng năm)";
                else if (matchedSub.BillingPeriod?.Contains("1", StringComparison.OrdinalIgnoreCase) == true || matchedSub.BillingPeriod?.Equals("monthly", StringComparison.OrdinalIgnoreCase) == true)
                    billing = "1 tháng (Hàng tháng)";
                else
                    billing = matchedSub.BillingPeriod ?? "1 tháng";

                var validity = matchedSub.StartDate != default && matchedSub.EndDate != default
                    ? $"{matchedSub.StartDate:dd/MM/yyyy} - {matchedSub.EndDate:dd/MM/yyyy}"
                    : "Kích hoạt theo kỳ hạn";

                var basePrice = matchedSub.TotalAmount + matchedSub.DiscountAmount > 0
                    ? matchedSub.TotalAmount + matchedSub.DiscountAmount
                    : invoice.TotalAmount;

                items.Add(new InvoiceLineItem
                {
                    Name = resolvedName,
                    Type = resolvedType,
                    Validity = validity,
                    PeriodOrQty = billing,
                    UnitPrice = basePrice,
                    TotalPrice = basePrice
                });
            }
        }

        // 3. Nếu chưa có item, kiểm tra Vé lớp học (Class Bookings)
        if (items.Count == 0)
        {
            try
            {
                var booking = await db.Database.SqlQueryRaw<ClassBookingRaw>(
                    """
                    SELECT cb.id AS "BookingId", cb.created_at AS "CreatedAt",
                           COALESCE(c.class_name, 'Lớp học') AS "ClassName",
                           COALESCE(c.schedule_time, now()) AS "ScheduleTime",
                           c.duration_minutes AS "DurationMinutes",
                           s.name AS "SportName"
                    FROM class_bookings cb
                    JOIN classes c ON c.id = cb.class_id
                    LEFT JOIN sports s ON s.id = c.sport_id
                    WHERE cb.user_id = {0}
                    ORDER BY ABS(EXTRACT(EPOCH FROM (cb.created_at - {1}))) ASC
                    LIMIT 1
                    """, invoice.UserId, invoice.CreatedAt)
                    .FirstOrDefaultAsync();

                if (booking != null && Math.Abs((booking.CreatedAt - invoice.CreatedAt).TotalHours) < 48)
                {
                    var sportText = !string.IsNullOrWhiteSpace(booking.SportName) ? $" ({booking.SportName})" : "";
                    items.Add(new InvoiceLineItem
                    {
                        Name = $"Vé lớp học: {booking.ClassName}{sportText}",
                        Type = "Vé lớp học (Class Booking)",
                        Validity = $"Lịch học: {booking.ScheduleTime.ToLocalTime():dd/MM/yyyy HH:mm}",
                        PeriodOrQty = $"{booking.DurationMinutes ?? 60} phút / buổi",
                        UnitPrice = invoice.TotalAmount,
                        TotalPrice = invoice.TotalAmount
                    });
                }
            }
            catch { }
        }

        // 4. Fallback thông minh dựa trên số tiền giao dịch
        if (items.Count == 0)
        {
            var (name, type, period, validity) = InferServiceFromAmount(invoice.TotalAmount, invoice.CreatedAt);
            items.Add(new InvoiceLineItem
            {
                Name = name,
                Type = type,
                Validity = validity,
                PeriodOrQty = period,
                UnitPrice = invoice.TotalAmount,
                TotalPrice = invoice.TotalAmount
            });
        }

        return Document.Create(c => c.Page(p =>
        {
            p.Size(PageSizes.A4);
            p.Margin(2, Unit.Centimetre);
            p.PageColor(Colors.White);
            p.DefaultTextStyle(x => x.FontSize(11).FontFamily("Lato"));
            p.Header().Element(ComposeHeader);
            p.Content().Element(c2 => ComposeContent(c2, invoice, items, discountAmount, discountPct));
            p.Footer().Element(ComposeFooter);
        })).GeneratePdf();
    }

    private static string? GetKnownPackageName(string? packageId) => packageId switch
    {
        "membership-basic" => "Gói Hội viên Cơ bản",
        "membership-plus" => "Gói Hội viên Plus",
        "membership-premium" => "Gói Hội viên Premium VIP",
        "vip_combo" => "Thẻ VIP Toàn Diện",
        "premium_fit" => "Premium Fitness",
        "yoga_pack" => "Gói Tập Yoga",
        "swim_pack" => "Gói Tập Bơi Lội",
        _ => null
    };

    private static (string Name, string Type, string Period, string Validity) InferServiceFromAmount(decimal amount, DateTime createdAt) => amount switch
    {
        149000m => ("Gói Hội viên Plus (1 tháng)", "Gói thành viên", "1 tháng", $"{createdAt.ToLocalTime():dd/MM/yyyy} - {createdAt.AddMonths(1).ToLocalTime():dd/MM/yyyy}"),
        299000m => ("Gói Hội viên Premium VIP (1 tháng)", "Gói thành viên", "1 tháng", $"{createdAt.ToLocalTime():dd/MM/yyyy} - {createdAt.AddMonths(1).ToLocalTime():dd/MM/yyyy}"),
        399000m => ("Gói Hội viên Plus (3 tháng)", "Gói thành viên", "3 tháng", $"{createdAt.ToLocalTime():dd/MM/yyyy} - {createdAt.AddMonths(3).ToLocalTime():dd/MM/yyyy}"),
        749000m => ("Gói Hội viên Plus (6 tháng)", "Gói thành viên", "6 tháng", $"{createdAt.ToLocalTime():dd/MM/yyyy} - {createdAt.AddMonths(6).ToLocalTime():dd/MM/yyyy}"),
        799000m => ("Gói Hội viên Premium VIP (3 tháng)", "Gói thành viên", "3 tháng", $"{createdAt.ToLocalTime():dd/MM/yyyy} - {createdAt.AddMonths(3).ToLocalTime():dd/MM/yyyy}"),
        1399000m => ("Gói Hội viên Plus (12 tháng)", "Gói thành viên", "12 tháng", $"{createdAt.ToLocalTime():dd/MM/yyyy} - {createdAt.AddYears(1).ToLocalTime():dd/MM/yyyy}"),
        1499000m => ("Gói Hội viên Premium VIP (6 tháng)", "Gói thành viên", "6 tháng", $"{createdAt.ToLocalTime():dd/MM/yyyy} - {createdAt.AddMonths(6).ToLocalTime():dd/MM/yyyy}"),
        2799000m => ("Gói Hội viên Premium VIP (12 tháng)", "Gói thành viên", "12 tháng", $"{createdAt.ToLocalTime():dd/MM/yyyy} - {createdAt.AddYears(1).ToLocalTime():dd/MM/yyyy}"),
        500000m => ("Gói Tập Yoga (1 tháng)", "Gói tập thể thao", "1 tháng", $"{createdAt.ToLocalTime():dd/MM/yyyy} - {createdAt.AddMonths(1).ToLocalTime():dd/MM/yyyy}"),
        600000m => ("Gói Tập Bơi Lội (1 tháng)", "Gói tập thể thao", "1 tháng", $"{createdAt.ToLocalTime():dd/MM/yyyy} - {createdAt.AddMonths(1).ToLocalTime():dd/MM/yyyy}"),
        800000m => ("Gói Premium Fitness (1 tháng)", "Gói thành viên", "1 tháng", $"{createdAt.ToLocalTime():dd/MM/yyyy} - {createdAt.AddMonths(1).ToLocalTime():dd/MM/yyyy}"),
        1200000m => ("Thẻ VIP Toàn Diện (1 tháng)", "Gói thành viên", "1 tháng", $"{createdAt.ToLocalTime():dd/MM/yyyy} - {createdAt.AddMonths(1).ToLocalTime():dd/MM/yyyy}"),
        150000m => ("Vé tham gia lớp học thể thao", "Vé lớp học", "1 buổi tập", $"Ngày đăng ký: {createdAt.ToLocalTime():dd/MM/yyyy}"),
        _ => ("Gói dịch vụ Hội viên & Thể thao", "Dịch vụ SmartGym", "Theo hợp đồng", $"Ngày lập: {createdAt.ToLocalTime():dd/MM/yyyy}")
    };

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
        List<InvoiceLineItem> items,
        decimal discountAmount,
        decimal discountPct)
    {
        var user = invoice.User;
        var total = invoice.TotalAmount;
        var subtotal = items.Sum(it => it.TotalPrice);
        if (subtotal < total) subtotal = total;

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
                t.ColumnsDefinition(cd => { cd.ConstantColumn(32); cd.RelativeColumn(4); cd.RelativeColumn(1.3f); cd.RelativeColumn(1.2f); });
                t.Header(h =>
                {
                    HdrCell(h.Cell(), "STT",              center: true);
                    HdrCell(h.Cell(), "Noi dung dich vu");
                    HdrCell(h.Cell(), "Ky han / SL");
                    HdrCell(h.Cell(), "Thanh tien",       right: true);
                    h.Cell().ColumnSpan(4).BorderBottom(1.5f).BorderColor(Blue3);
                });

                for (var i = 0; i < items.Count; i++)
                {
                    var item = items[i];
                    t.Cell().PaddingTop(8).PaddingBottom(4).Text((i + 1).ToString()).AlignCenter();
                    t.Cell().PaddingTop(8).PaddingBottom(4).Column(inner =>
                    {
                        inner.Item().Text(item.Name).SemiBold();
                        if (!string.IsNullOrWhiteSpace(item.Type))
                            inner.Item().Text($"Loai: {item.Type}").FontSize(9).FontColor(Grey2);
                        if (!string.IsNullOrWhiteSpace(item.Validity) && item.Validity != "---")
                            inner.Item().Text($"Hieu luc: {item.Validity}").FontSize(9).FontColor(Grey2);
                    });
                    t.Cell().PaddingTop(8).PaddingBottom(4).Text(item.PeriodOrQty).FontSize(9);
                    t.Cell().PaddingTop(8).PaddingBottom(4).AlignRight().Text($"{item.TotalPrice:N0} VND").SemiBold();
                    t.Cell().ColumnSpan(4).BorderBottom(0.5f).BorderColor(Grey1);
                }
            });

            // Tổng tiền
            col.Item().AlignRight().Width(280).Table(t =>
            {
                t.ColumnsDefinition(cd => { cd.RelativeColumn(2); cd.RelativeColumn(1.2f); });
                SummaryRow(t, "Gia goc:", $"{subtotal:N0} VND");
                if (discountAmount > 0)
                    SummaryRow(t, $"Giam gia ({discountPct:0}%):", $"- {discountAmount:N0} VND", Colors.Green.Darken2);
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

