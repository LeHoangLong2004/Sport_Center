using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmartGym.Application.Common;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Application.Services;
using SmartGym.Api.Services;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Phần mở rộng (partial) của ClassEndpoints chuyên xử lý nghiệp vụ Đặt chỗ lớp học (Class Booking).
/// Bao gồm: thanh toán trực tiếp/tại quầy, hủy đặt lớp và nhân viên đặt hộ.
/// </summary>
public static partial class ClassEndpoints
{
    /// <summary>
    /// Đăng ký các route đặt chỗ lớp học vào nhóm route của lớp học.
    /// </summary>
    /// <param name="classGroup">Nhóm route /api/classes</param>
    private static void MapClassBookingEndpoints(RouteGroupBuilder classGroup)
    {
        // 1. Legacy direct booking without payment (disabled)
        /// <summary>
        /// POST /api/classes/{id}/book
        /// Luồng đặt lớp trực tiếp không thanh toán đã ngừng sử dụng.
        /// Quyền hạn yêu cầu: Member, Admin hoặc Manager.
        /// </summary>
        classGroup.MapPost(
            "/{id:guid}/book",
            async (HttpContext context) =>
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdClaim, out _))
                    return Results.Unauthorized();

                return Results.BadRequest(new { message = "Vui lòng sử dụng luồng thanh toán để đăng ký lớp học." });
            }
        )
        .RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));

        // Validate the course before presenting payment. Seats are booked only after payment succeeds.
        classGroup.MapPost("/{id:guid}/payment-hold", async (
            Guid id, [FromBody] StartClassPaymentHoldRequest request, HttpContext context,
            ClassService service, SmartGymDbContext db, PackageCatalogService packageCatalogService,
            ILoggerFactory loggerFactory, CancellationToken cancellationToken) =>
        {
            var logger = loggerFactory.CreateLogger("ClassPaymentHold");
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId)) return Results.Unauthorized();
            var memo = (request.PaymentMemo ?? "").Trim();
            if (memo.Length < 12 || !memo.StartsWith("DATLOP ", StringComparison.OrdinalIgnoreCase))
                return Results.BadRequest(new { message = "Mã thanh toán không hợp lệ." });

            // Payment-hold schema is initialized at API startup. Avoid DDL and a
            // global expiration sweep on every checkout attempt.
            await ExpireMemberClassPaymentHoldsAsync(db, userId, id);
            var nowLocal = DateOnly.FromDateTime(CenterTime.ToLocal(DateTime.UtcNow));
            var prices = await db.Database.SqlQueryRaw<ClassPriceSnapshotRaw>(
                """
                SELECT root.id AS "RootId", root.sport_id AS "SportId",
                       GREATEST(COALESCE(root.total_sessions, 1), 1) AS "TotalSessions",
                       active_price.id AS "PricingVersionId", active_price.price_per_session AS "PricePerSession"
                FROM classes current_class
                LEFT JOIN classes root ON root.id = COALESCE(current_class.parent_id, current_class.id)
                LEFT JOIN LATERAL (
                    SELECT p.id, p.price_per_session FROM sport_class_pricing p
                    WHERE p.sport_id = root.sport_id AND p.is_active = TRUE
                      AND p.effective_from <= {1} AND (p.effective_to IS NULL OR p.effective_to >= {1})
                    ORDER BY p.effective_from DESC, p.created_at DESC LIMIT 1
                ) active_price ON TRUE
                WHERE current_class.id = {0}
                """, id, nowLocal).ToListAsync();
            var price = prices.SingleOrDefault();
            if (price?.PricePerSession is null || price.PricingVersionId is null)
                return Results.BadRequest(new { message = "Lớp học chưa có học phí hợp lệ." });
            var originalAmount = price.PricePerSession.Value * price.TotalSessions;
            var activeMembership = await packageCatalogService.GetActiveMembershipAsync(userId, DateTime.UtcNow, cancellationToken);
            var groupDiscountPct = activeMembership?.GroupDiscountPct ?? 0m;
            var amount = Math.Max(0m, decimal.Round(
                originalAmount * (100m - groupDiscountPct) / 100m,
                0,
                MidpointRounding.AwayFromZero));

            var existingHold = await db.Database.SqlQueryRaw<ClassPaymentHoldRaw>(
                "SELECT id AS \"Id\", user_id AS \"UserId\", class_id AS \"ClassId\", payment_memo AS \"PaymentMemo\", invoice_id AS \"InvoiceId\", amount AS \"Amount\", expires_at AS \"ExpiresAt\" FROM class_booking_payment_holds WHERE user_id = {0} AND class_id = {1} AND status = 'active' AND expires_at > now() ORDER BY created_at DESC LIMIT 1",
                userId, id).FirstOrDefaultAsync();
            if (existingHold is not null)
            {
                var appliedDiscountPct = originalAmount > 0
                    ? decimal.Round((originalAmount - existingHold.Amount) * 100m / originalAmount, 0, MidpointRounding.AwayFromZero)
                    : 0m;
                return Results.Ok(new
                {
                    success = true,
                    resumed = !string.Equals(existingHold.PaymentMemo, memo, StringComparison.Ordinal),
                    holdId = existingHold.Id,
                    paymentMemo = existingHold.PaymentMemo,
                    amount = existingHold.Amount,
                    originalAmount,
                    discountPctApplied = appliedDiscountPct,
                    membershipName = activeMembership?.Name ?? "Hội viên Cơ bản",
                    membershipTier = activeMembership?.Tier ?? "basic",
                    expiresAt = existingHold.ExpiresAt
                });
            }

            var (reserved, conflictMessage) = await service.BookClassAsync(userId, id, notify: false, bookingStatus: "pending_payment");
            if (!reserved)
            {
                // A repeated request with the same idempotency memo may arrive
                // while the first request is between reserving seats and saving
                // its payment hold. Reuse the first hold instead of surfacing a
                // false "already booked" error.
                var inFlightHold = await db.Database.SqlQueryRaw<ClassPaymentHoldRaw>(
                    "SELECT id AS \"Id\", user_id AS \"UserId\", class_id AS \"ClassId\", payment_memo AS \"PaymentMemo\", invoice_id AS \"InvoiceId\", amount AS \"Amount\", expires_at AS \"ExpiresAt\" FROM class_booking_payment_holds WHERE user_id = {0} AND class_id = {1} AND payment_memo = {2} AND status = 'active' AND expires_at > now() ORDER BY created_at DESC LIMIT 1",
                    userId, id, memo).FirstOrDefaultAsync();
                if (inFlightHold is not null)
                {
                    return Results.Ok(new
                    {
                        success = true,
                        resumed = true,
                        holdId = inFlightHold.Id,
                        paymentMemo = inFlightHold.PaymentMemo,
                        amount = inFlightHold.Amount,
                        originalAmount,
                        discountPctApplied = originalAmount > 0 ? decimal.Round((originalAmount - inFlightHold.Amount) * 100m / originalAmount, 0, MidpointRounding.AwayFromZero) : 0m,
                        membershipName = activeMembership?.Name ?? "Hội viên Cơ bản",
                        membershipTier = activeMembership?.Tier ?? "basic",
                        expiresAt = inFlightHold.ExpiresAt
                    });
                }

                return Results.Conflict(new { message = conflictMessage ?? "Không thể giữ chỗ cho lớp học." });
            }

            var invoice = new Invoice
            {
                Id = Guid.NewGuid(), UserId = userId, ClassId = price.RootId,
                TotalAmount = amount, PaymentMethod = PaymentMethod.QRCode,
                Status = PaymentStatus.Pending, CreatedAt = DateTime.UtcNow
            };
            await db.Invoices.AddAsync(invoice);
            await db.SaveChangesAsync();
            var expiresAt = DateTime.UtcNow.AddMinutes(10);
            try
            {
                var inserted = await db.Database.ExecuteSqlRawAsync(
                    "INSERT INTO class_booking_payment_holds (user_id, class_id, invoice_id, payment_memo, amount, expires_at) VALUES ({0}, {1}, {2}, {3}, {4}, {5}) ON CONFLICT (payment_memo) DO NOTHING",
                    userId, id, invoice.Id, memo, amount, expiresAt);

                var persistedHold = await db.Database.SqlQueryRaw<ClassPaymentHoldRaw>(
                    "SELECT id AS \"Id\", user_id AS \"UserId\", class_id AS \"ClassId\", payment_memo AS \"PaymentMemo\", invoice_id AS \"InvoiceId\", amount AS \"Amount\", expires_at AS \"ExpiresAt\" FROM class_booking_payment_holds WHERE user_id = {0} AND class_id = {1} AND payment_memo = {2} AND status = 'active' AND expires_at > now() ORDER BY created_at DESC LIMIT 1",
                    userId, id, memo).FirstOrDefaultAsync();

                if (persistedHold is not null)
                {
                    if (persistedHold.InvoiceId != invoice.Id)
                    {
                        db.Invoices.Remove(invoice);
                        await db.SaveChangesAsync();
                    }

                    return Results.Ok(new
                    {
                        success = true,
                        resumed = inserted == 0,
                        holdId = persistedHold.Id,
                        paymentMemo = persistedHold.PaymentMemo,
                        amount = persistedHold.Amount,
                        originalAmount,
                        discountPctApplied = originalAmount > 0 ? decimal.Round((originalAmount - persistedHold.Amount) * 100m / originalAmount, 0, MidpointRounding.AwayFromZero) : 0m,
                        membershipName = activeMembership?.Name ?? "Hội viên Cơ bản",
                        membershipTier = activeMembership?.Tier ?? "basic",
                        expiresAt = persistedHold.ExpiresAt
                    });
                }

                throw new InvalidOperationException("Payment hold insert did not create or find an active hold.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Could not persist payment hold for member {MemberId}, class {ClassId}.", userId, id);

                // A database/network exception can happen after PostgreSQL has
                // committed the insert. Check for the hold before undoing the
                // reservation, so a retry cannot destroy a valid checkout.
                ClassPaymentHoldRaw? committedHold = null;
                try
                {
                    committedHold = await db.Database.SqlQueryRaw<ClassPaymentHoldRaw>(
                        "SELECT id AS \"Id\", user_id AS \"UserId\", class_id AS \"ClassId\", payment_memo AS \"PaymentMemo\", invoice_id AS \"InvoiceId\", amount AS \"Amount\", expires_at AS \"ExpiresAt\" FROM class_booking_payment_holds WHERE user_id = {0} AND class_id = {1} AND payment_memo = {2} AND status = 'active' AND expires_at > now() ORDER BY created_at DESC LIMIT 1",
                        userId, id, memo).FirstOrDefaultAsync();
                }
                catch (Exception lookupException)
                {
                    logger.LogError(lookupException, "Could not verify payment hold after persistence failure for member {MemberId}, class {ClassId}.", userId, id);
                }

                if (committedHold is not null)
                {
                    if (committedHold.InvoiceId != invoice.Id)
                    {
                        db.Invoices.Remove(invoice);
                        await db.SaveChangesAsync();
                    }

                    return Results.Ok(new
                    {
                        success = true,
                        resumed = true,
                        holdId = committedHold.Id,
                        paymentMemo = committedHold.PaymentMemo,
                        amount = committedHold.Amount,
                        originalAmount,
                        discountPctApplied = originalAmount > 0 ? decimal.Round((originalAmount - committedHold.Amount) * 100m / originalAmount, 0, MidpointRounding.AwayFromZero) : 0m,
                        membershipName = activeMembership?.Name ?? "Hội viên Cơ bản",
                        membershipTier = activeMembership?.Tier ?? "basic",
                        expiresAt = committedHold.ExpiresAt
                    });
                }

                db.Invoices.Remove(invoice);
                await db.SaveChangesAsync();
                return Results.Conflict(new { message = "Không thể khởi tạo thanh toán. Vui lòng thử lại.", detail = ex.Message });
            }
        }).RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));

        classGroup.MapDelete("/{id:guid}/payment-hold", async (
            Guid id, [FromQuery] string? memo, HttpContext context, SmartGymDbContext db) =>
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId)) return Results.Unauthorized();
            var cleanMemo = (memo ?? "").Trim();
            var hold = await db.Database.SqlQueryRaw<ClassPaymentHoldRaw>(
                "SELECT id AS \"Id\", user_id AS \"UserId\", class_id AS \"ClassId\", payment_memo AS \"PaymentMemo\", invoice_id AS \"InvoiceId\", amount AS \"Amount\", expires_at AS \"ExpiresAt\" FROM class_booking_payment_holds WHERE user_id = {0} AND class_id = {1} AND payment_memo = {2} AND status = 'active'",
                userId, id, cleanMemo).FirstOrDefaultAsync();
            if (hold is null) return Results.Ok(new { success = true });
            await ReleaseClassPaymentHoldAsync(db, userId, id, cleanMemo, "cancelled");
            return Results.Ok(new { success = true });
        }).RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));

        // 2. Pay and Book Class (Direct purchase or Pay at Counter)
        /// <summary>
        /// POST /api/classes/{id}/pay-and-book
        /// Đặt chỗ lớp học kèm thanh toán trực tiếp (qua mã QR chuyển khoản hoặc thanh toán tại quầy).
        /// Tự động tạo bản ghi Payment & Invoice tương ứng.
        /// </summary>
        classGroup.MapPost(
            "/{id:guid}/pay-and-book",
            async (Guid id, [FromBody] PayAndBookClassRequest? request, HttpContext context, ClassService service,
                SmartGymDbContext db, IGroupClassRepository repository, PackageCatalogService packageCatalogService, CancellationToken cancellationToken) =>
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdClaim, out var userId))
                    return Results.Unauthorized();

                var method = request?.PaymentMethod ?? "qr";
                var today = DateOnly.FromDateTime(CenterTime.ToLocal(DateTime.UtcNow));
                var priceRows = await db.Database.SqlQueryRaw<ClassPriceSnapshotRaw>(
                    """
                    SELECT root.id AS "RootId",
                           root.sport_id AS "SportId",
                           GREATEST(COALESCE(root.total_sessions, 1), 1) AS "TotalSessions",
                           active_price.id AS "PricingVersionId",
                           active_price.price_per_session AS "PricePerSession"
                    FROM classes current_class
                    LEFT JOIN classes root ON root.id = COALESCE(current_class.parent_id, current_class.id)
                    LEFT JOIN LATERAL (
                        SELECT p.id, p.price_per_session
                        FROM sport_class_pricing p
                        WHERE p.sport_id = root.sport_id
                          AND p.is_active = TRUE
                          AND p.effective_from <= {1}
                          AND (p.effective_to IS NULL OR p.effective_to >= {1})
                        ORDER BY p.effective_from DESC, p.created_at DESC
                        LIMIT 1
                    ) active_price ON TRUE
                    WHERE current_class.id = {0}
                    """, id, today).ToListAsync();
                var pricing = priceRows.SingleOrDefault();
                if (pricing == null)
                    return Results.NotFound(new { message = "Không tìm thấy lớp học." });
                if (pricing.PricingVersionId == null || pricing.PricePerSession == null)
                    return Results.BadRequest(new { message = "Khóa học chưa có học phí được chốt. Vui lòng liên hệ quản lý trung tâm." });

                // Tạm thời dùng bảng giá hiệu lực hiện tại trong DB, bỏ qua course_fee_snapshot.
                var originalAmount = pricing.PricePerSession.Value * pricing.TotalSessions;
                var activeMembership = await packageCatalogService.GetActiveMembershipAsync(userId, DateTime.UtcNow, cancellationToken);
                var groupDiscountPct = activeMembership?.GroupDiscountPct ?? 0m;
                var amount = Math.Max(0m, decimal.Round(
                    originalAmount * (100m - groupDiscountPct) / 100m,
                    0,
                    MidpointRounding.AwayFromZero));
                var isWallet = method.ToLower() is "wallet" or "ewallet";
                var deductedFromWallet = false;

                var paymentMemo = (request?.PaymentMemo ?? "").Trim();
                var paymentHold = string.IsNullOrWhiteSpace(paymentMemo) ? null : await db.Database
                    .SqlQueryRaw<ClassPaymentAttemptRaw>(
                        "SELECT id AS \"Id\", invoice_id AS \"InvoiceId\", user_id AS \"UserId\", class_id AS \"ClassId\", payment_memo AS \"PaymentMemo\", amount AS \"Amount\", expires_at AS \"ExpiresAt\", status AS \"Status\", sepay_transaction_id AS \"SePayTransactionId\" FROM class_booking_payment_holds WHERE user_id = {0} AND class_id = {1} AND payment_memo = {2} AND ((status = 'active' AND expires_at > now()) OR sepay_transaction_id IS NOT NULL OR status = 'completed') ORDER BY created_at DESC LIMIT 1",
                        userId, id, paymentMemo).FirstOrDefaultAsync();

                if (paymentHold is null)
                {
                    if (method.Equals("qr", StringComparison.OrdinalIgnoreCase) && SePayWebhookEndpoints.WasMemoConsumed(paymentMemo, amount))
                    {
                        await ReleaseClassPaymentHoldAsync(db, userId, id, paymentMemo, "expired");
                        await db.Database.ExecuteSqlRawAsync(
                            "UPDATE class_booking_payment_holds SET status = 'refund_required', paid_at = now() WHERE user_id = {0} AND class_id = {1} AND payment_memo = {2} AND status IN ('expired', 'cancelled')",
                            userId, id, paymentMemo);
                        return Results.Conflict(new { message = "Khoản QR đã được ngân hàng ghi nhận nhưng lượt giữ chỗ đã hết hạn. Giao dịch đã được đánh dấu để Trung tâm đối soát và hoàn tiền; lớp chưa được đặt." });
                    }
                    return Results.Conflict(new { message = "Lượt giữ chỗ không còn hiệu lực. Hãy kiểm tra xung đột và tạo lượt thanh toán mới." });
                }

                amount = paymentHold.Amount;
                var heldIsCounter = method.ToLower() is "counter" or "cashatcounter";
                var qrPaymentConfirmed = false;
                if (!isWallet && !heldIsCounter)
                {
                    qrPaymentConfirmed = !string.IsNullOrWhiteSpace(paymentHold.SePayTransactionId)
                        || SePayWebhookEndpoints.WasMemoConsumed(paymentMemo, amount);
                    if (!qrPaymentConfirmed)
                        return Results.BadRequest(new { message = "Chưa xác nhận được giao dịch QR hợp lệ cho lượt thanh toán này." });
                }

                var holdInvoice = await db.Invoices.FirstOrDefaultAsync(x => x.Id == paymentHold.InvoiceId && x.UserId == userId);
                if (holdInvoice is null)
                    return Results.Conflict(new { message = "Không tìm thấy hóa đơn cho lượt thanh toán." });

                if (string.Equals(paymentHold.Status, "completed", StringComparison.OrdinalIgnoreCase))
                {
                    var existingBookings = await db.Database.SqlQueryRaw<int>(
                        "SELECT COUNT(*) AS \"Value\" FROM class_bookings WHERE user_id = {0} AND class_id IN (SELECT id FROM classes WHERE id = {1} OR parent_id = {1} OR (parent_id IS NOT NULL AND parent_id = (SELECT parent_id FROM classes WHERE id = {1}))) AND LOWER(status) IN ('confirmed', 'pending', 'approved')",
                        userId, id).SingleAsync();
                    if (existingBookings > 0)
                    {
                        var isCompleted = holdInvoice.Status == PaymentStatus.Completed;
                        return Results.Ok(new
                        {
                            success = true,
                            isCounter = holdInvoice.PaymentMethod == PaymentMethod.CashAtCounter,
                            paymentStatus = isCompleted ? "completed" : "pending",
                            message = "Thanh toán và đăng ký lớp đã được ghi nhận trước đó.",
                            invoiceId = holdInvoice.Id,
                            amount = paymentHold.Amount,
                            classInfo = await service.GetClassDetailAsync(id)
                        });
                    }
                }

                if (isWallet)
                {
                    var curBalance = await MemberEndpoints.GetMemberBalanceAsync(db, userId);
                    if (curBalance < amount)
                        return Results.BadRequest(new { message = $"Số dư ví không đủ (hiện có {curBalance:N0} đ). Vui lòng nạp thêm tiền vào ví!" });
                }

                decimal? heldBookingBalance = null;
                if (isWallet && amount > 0)
                {
                    var (deductOk, newBalance, deductError) = await MemberEndpoints.DeductFromWalletAsync(db, userId, amount, $"Thanh toán đặt lớp học (Mã: {id.ToString()[..8]})");
                    if (!deductOk) return Results.BadRequest(new { message = deductError ?? "Số dư ví không đủ." });
                    deductedFromWallet = true;
                    heldBookingBalance = newBalance;
                }

                // Compatibility for payment holds created before checkout stopped writing pending_payment bookings.
                var legacyPendingCount = await db.Database.SqlQueryRaw<int>(
                    "SELECT COUNT(*) AS \"Value\" FROM class_bookings WHERE user_id = {0} AND class_id IN (SELECT id FROM classes WHERE id = {1} OR parent_id = {1} OR (parent_id IS NOT NULL AND parent_id = (SELECT parent_id FROM classes WHERE id = {1}))) AND LOWER(status) = 'pending_payment'",
                    userId, id).SingleAsync();
                var bookingResult = legacyPendingCount > 0
                    ? (IsSuccess: await db.Database.ExecuteSqlRawAsync(
                        "UPDATE class_bookings SET status = {2}, subscription_id = NULL WHERE user_id = {0} AND class_id IN (SELECT id FROM classes WHERE id = {1} OR parent_id = {1} OR (parent_id IS NOT NULL AND parent_id = (SELECT parent_id FROM classes WHERE id = {1}))) AND LOWER(status) = 'pending_payment'",
                        userId, id, heldIsCounter ? "pending" : "confirmed") > 0, ErrorMessage: (string?)null)
                    : await service.BookClassAsync(userId, id, notify: true, bookingStatus: heldIsCounter ? "pending" : "confirmed");

                if (!bookingResult.IsSuccess)
                {
                    if (deductedFromWallet) await MemberEndpoints.RefundToWalletAsync(db, userId, amount, "Hoàn tiền do lượt giữ chỗ đã mất");
                    if (qrPaymentConfirmed)
                    {
                        holdInvoice.PaymentMethod = PaymentMethod.QRCode;
                        holdInvoice.Status = PaymentStatus.Completed;
                        holdInvoice.PaidAt = DateTime.UtcNow;
                        await db.Database.ExecuteSqlRawAsync(
                            "UPDATE class_booking_payment_holds SET status = 'refund_required', paid_at = COALESCE(paid_at, now()) WHERE id = {0} AND user_id = {1} AND status IN ('active', 'expired', 'cancelled', 'refund_required')",
                            paymentHold.Id, userId);
                        await db.SaveChangesAsync();
                        await repository.NotifyManagersAsync(
                            "Cần đối soát thanh toán đặt lớp",
                            $"Đã nhận thanh toán cho lớp nhưng không thể ghi nhận đăng ký: {bookingResult.ErrorMessage ?? "lịch học không còn chỗ phù hợp"}. Vui lòng kiểm tra hóa đơn {holdInvoice.Id} để xử lý hoàn tiền.",
                            "class",
                            id);
                        return Results.Conflict(new { message = "Ngân hàng đã xác nhận thanh toán nhưng lịch không còn phù hợp. Hệ thống đã báo Quản lý để đối soát và hoàn tiền; lớp chưa được đăng ký." });
                    }

                    await ReleaseClassPaymentHoldAsync(db, userId, id, paymentMemo, "cancelled");
                    return Results.Conflict(new { message = bookingResult.ErrorMessage ?? "Lịch học không còn chỗ phù hợp để đăng ký." });
                }

                holdInvoice.PaymentMethod = heldIsCounter ? PaymentMethod.CashAtCounter : isWallet ? PaymentMethod.EWallet : PaymentMethod.QRCode;
                holdInvoice.Status = heldIsCounter ? PaymentStatus.Pending : PaymentStatus.Completed;
                holdInvoice.PaidAt = heldIsCounter ? null : DateTime.UtcNow;
                await db.Database.ExecuteSqlRawAsync(
                    "UPDATE class_booking_payment_holds SET status = 'completed', paid_at = CASE WHEN {2} THEN NULL ELSE COALESCE(paid_at, now()) END WHERE id = {0} AND user_id = {1} AND status IN ('active', 'expired', 'cancelled', 'refund_required')",
                    paymentHold.Id, userId, heldIsCounter);
                await db.SaveChangesAsync();
                var heldClassDetail = await service.GetClassDetailAsync(id);
                return Results.Ok(new { success = true, isCounter = heldIsCounter, paymentStatus = heldIsCounter ? "pending" : "completed", message = heldIsCounter ? "Đã giữ chỗ thành công. Vui lòng thanh toán tại quầy trước giờ học." : "Thanh toán và đặt lớp thành công.", invoiceId = holdInvoice.Id, amount, classInfo = heldClassDetail, newBalance = heldBookingBalance });
            }
        )
        .RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));

        // 3. Cancel Booking
        /// <summary>
        /// POST /api/classes/{id}/cancel-booking
        /// Hủy lượt đặt chỗ của hội viên đối với một lớp học.
        /// Tự động hoàn tiền vào Ví hội viên nếu đơn đặt chỗ đã thanh toán thành công.
        /// Quyền hạn yêu cầu: Member, Admin hoặc Manager.
        /// </summary>
        classGroup.MapPost(
            "/{id:guid}/cancel-booking",
            async (Guid id, HttpContext context, ClassService service, SmartGymDbContext db) =>
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdClaim, out var userId))
                    return Results.Unauthorized();

                return await ProcessCancelBookingInternalAsync(id, userId, isStaffAction: false, service, db);
            }
        )
        .RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));

        // 3.1 Cancel Booking For Member (Staff/Receptionist Action)
        /// <summary>
        /// POST /api/classes/{id}/cancel-for-member
        /// Nhân viên lễ tân hoặc quản lý hủy lịch đặt lớp hộ cho một hội viên tại quầy.
        /// Quyền hạn yêu cầu: Receptionist, Manager, Staff hoặc Admin.
        /// </summary>
        classGroup.MapPost(
            "/{id:guid}/cancel-for-member",
            async (Guid id, [FromBody] CancelForMemberRequest request, ClassService service, SmartGymDbContext db) =>
            {
                if (request == null || request.MemberId == Guid.Empty)
                    return Results.BadRequest(new { message = "Vui lòng chọn hội viên cần hủy lịch." });

                return await ProcessCancelBookingInternalAsync(id, request.MemberId, isStaffAction: true, service, db);
            }
        )
        .RequireAuthorization(policy => policy.RequireRole("receptionist", "admin", "manager", "staff"));

        // 4. Receptionist / Manager Book For Member
        /// <summary>
        /// POST /api/classes/{id}/book-for-member
        /// Nhân viên lễ tân hoặc Quản lý đặt chỗ lớp học hộ cho một hội viên tại quầy.
        /// Quyền hạn yêu cầu: Manager, Receptionist hoặc Admin.
        /// </summary>
        classGroup.MapPost(
            "/{id:guid}/book-for-member",
            async (Guid id, [FromBody] BookForMemberRequest request, ClassService service,
                SmartGymDbContext db, PackageCatalogService packageCatalogService,
                CancellationToken cancellationToken) =>
            {
                if (request == null || request.MemberId == Guid.Empty)
                    return Results.BadRequest(new { message = "Vui lòng chọn hội viên cần đặt lớp." });

                var quote = await GetReceptionistClassBookingQuoteAsync(
                    db, packageCatalogService, request.MemberId, id, cancellationToken);
                if (quote is null)
                    return Results.BadRequest(new { message = "Lớp học chưa có bảng giá hiệu lực nên chưa thể tạo đơn thu tiền." });

                var invoice = new Invoice
                {
                    Id = Guid.NewGuid(),
                    UserId = request.MemberId,
                    ClassId = quote.RootId,
                    TotalAmount = quote.TotalAmount,
                    PaymentMethod = PaymentMethod.CashAtCounter,
                    Status = PaymentStatus.Pending,
                    CreatedAt = DateTime.UtcNow,
                };
                db.Invoices.Add(invoice);
                await db.SaveChangesAsync(cancellationToken);

                var (isSuccess, errorMessage) = await service.BookClassAsync(
                    request.MemberId, id, bookingStatus: "pending");
                if (!isSuccess)
                {
                    invoice.Status = PaymentStatus.Failed;
                    await db.SaveChangesAsync(cancellationToken);
                    return Results.BadRequest(new { message = errorMessage });
                }

                ClassDetailResponse? classDetail = null;
                try
                {
                    classDetail = await service.GetClassDetailAsync(id);
                }
                catch { }

                return Results.Ok(new 
                { 
                    message = quote.TotalAmount > 0
                        ? $"Đã giữ chỗ và tạo đơn chờ thu {quote.TotalAmount:N0} đ tại quầy."
                        : "Đặt lớp thành công. Hội viên được miễn phí theo quyền lợi hiện có.",
                    pricing = quote,
                    classInfo = classDetail
                });
            }
        )
        .RequireAuthorization(policy => policy.RequireRole("receptionist", "admin", "manager", "staff"));

        classGroup.MapGet("/{id:guid}/member-booking-quote", async (
            Guid id, [FromQuery] Guid memberId, SmartGymDbContext db,
            PackageCatalogService packageCatalogService, CancellationToken cancellationToken) =>
        {
            if (memberId == Guid.Empty)
                return Results.BadRequest(new { message = "Vui lòng chọn hội viên." });

            var quote = await GetReceptionistClassBookingQuoteAsync(
                db, packageCatalogService, memberId, id, cancellationToken);
            if (quote is null)
                return Results.NotFound(new { message = "Không tìm thấy lớp hoặc lớp chưa có bảng giá hiệu lực." });

            return Results.Ok(quote);
        })
        .RequireAuthorization(policy => policy.RequireRole("receptionist", "admin", "manager", "staff"));
    }

    private static async Task<ReceptionistClassBookingQuoteRaw?> GetReceptionistClassBookingQuoteAsync(
        SmartGymDbContext db,
        PackageCatalogService packageCatalogService,
        Guid memberId,
        Guid classId,
        CancellationToken cancellationToken)
    {
        var effectiveDate = DateOnly.FromDateTime(CenterTime.ToLocal(DateTime.UtcNow));
        var prices = await db.Database.SqlQueryRaw<ReceptionistClassBookingPriceRaw>("""
            SELECT root.id AS "RootId",
                   root.class_name AS "ClassName",
                   GREATEST(COALESCE(root.total_sessions, 1), 1) AS "TotalSessions",
                   COALESCE(root.price_per_session_snapshot, active_price.price_per_session) AS "PricePerSession",
                   COALESCE(root.course_fee_snapshot,
                       COALESCE(root.price_per_session_snapshot, active_price.price_per_session)
                           * GREATEST(COALESCE(root.total_sessions, 1), 1)) AS "CourseSubtotal"
            FROM classes current_class
            JOIN classes root ON root.id = COALESCE(current_class.parent_id, current_class.id)
            LEFT JOIN LATERAL (
                SELECT p.price_per_session
                FROM sport_class_pricing p
                WHERE p.sport_id = root.sport_id AND p.is_active = TRUE
                  AND p.effective_from <= {1}
                  AND (p.effective_to IS NULL OR p.effective_to >= {1})
                ORDER BY p.effective_from DESC, p.created_at DESC
                LIMIT 1
            ) active_price ON TRUE
            WHERE current_class.id = {0}
            """, classId, effectiveDate).FirstOrDefaultAsync(cancellationToken);

        if (prices is null || (prices.CourseSubtotal is null && prices.PricePerSession is null))
            return null;

        var membership = await packageCatalogService.GetActiveMembershipAsync(
            memberId, DateTime.UtcNow, cancellationToken);
        var discountPct = Math.Clamp(membership?.GroupDiscountPct ?? 0m, 0m, 100m);
        var subtotal = prices.CourseSubtotal
            ?? prices.PricePerSession!.Value * Math.Max(1, prices.TotalSessions);
        var discountAmount = decimal.Round(subtotal * discountPct / 100m, 0, MidpointRounding.AwayFromZero);

        return new ReceptionistClassBookingQuoteRaw
        {
            RootId = prices.RootId,
            ClassName = prices.ClassName,
            TotalSessions = Math.Max(1, prices.TotalSessions),
            MembershipName = membership?.Name ?? "Hội viên Cơ bản",
            MembershipTier = membership?.Tier ?? "basic",
            Subtotal = subtotal,
            DiscountPct = discountPct,
            DiscountAmount = discountAmount,
            TotalAmount = Math.Max(0m, subtotal - discountAmount),
        };
    }

    private static async Task ExpireMemberClassPaymentHoldsAsync(SmartGymDbContext db, Guid userId, Guid classId)
    {
        var expired = await db.Database.SqlQueryRaw<ClassPaymentHoldRaw>(
            "SELECT id AS \"Id\", invoice_id AS \"InvoiceId\", user_id AS \"UserId\", class_id AS \"ClassId\", payment_memo AS \"PaymentMemo\", amount AS \"Amount\", expires_at AS \"ExpiresAt\" FROM class_booking_payment_holds WHERE user_id = {0} AND class_id = {1} AND status = 'active' AND expires_at <= now()",
            userId, classId)
            .ToListAsync();
        foreach (var hold in expired)
            await ReleaseClassPaymentHoldAsync(db, hold.UserId, hold.ClassId, hold.PaymentMemo, "expired");

        // Recover old pending_payment rows left behind by an interrupted checkout
        // (for example, an API crash between reserving sessions and saving a hold).
        await db.Database.ExecuteSqlRawAsync(
            """
            WITH stale AS (
                UPDATE class_bookings b
                SET status = 'expired'
                WHERE b.user_id = {0}
                  AND b.class_id IN (SELECT id FROM classes WHERE id = {1} OR parent_id = {1} OR (parent_id IS NOT NULL AND parent_id = (SELECT parent_id FROM classes WHERE id = {1})))
                  AND LOWER(b.status) = 'pending_payment'
                  AND b.created_at <= now() - interval '10 minutes'
                  AND NOT EXISTS (
                      SELECT 1 FROM class_booking_payment_holds h
                      WHERE h.user_id = b.user_id AND h.class_id = b.class_id
                        AND h.status = 'active' AND h.expires_at > now()
                  )
                RETURNING b.class_id
            ), counts AS (
                SELECT class_id, COUNT(*) AS amount FROM stale GROUP BY class_id
            )
            UPDATE classes c
            SET current_enrolled = GREATEST(0, c.current_enrolled - counts.amount)
            FROM counts WHERE c.id = counts.class_id
            """, userId, classId);
    }

    private static async Task ReleaseClassPaymentHoldAsync(SmartGymDbContext db, Guid userId, Guid classId, string memo, string holdStatus)
    {
        var strategy = db.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            await using var tx = await db.Database.BeginTransactionAsync();
            var sessions = await db.Database.SqlQueryRaw<ClassBookingSessionIdRaw>(
                "SELECT b.class_id AS \"ClassId\" FROM class_bookings b WHERE b.user_id = {0} AND b.class_id IN (SELECT id FROM classes WHERE id = {1} OR parent_id = {1} OR (parent_id IS NOT NULL AND parent_id = (SELECT parent_id FROM classes WHERE id = {1}))) AND LOWER(b.status) = 'pending_payment'",
                userId, classId).ToListAsync();
            foreach (var group in sessions.GroupBy(x => x.ClassId))
            {
                var count = group.Count();
                await db.Database.ExecuteSqlRawAsync(
                    "UPDATE class_bookings SET status = {2} WHERE user_id = {0} AND class_id = {1} AND LOWER(status) = 'pending_payment'",
                    userId, group.Key, holdStatus == "expired" ? "expired" : "cancelled");
                await db.Database.ExecuteSqlRawAsync(
                    "UPDATE classes SET current_enrolled = GREATEST(0, current_enrolled - {1}) WHERE id = {0}", group.Key, count);
            }
            await db.Database.ExecuteSqlRawAsync(
                "UPDATE class_booking_payment_holds SET status = {2} WHERE user_id = {0} AND class_id = {1} AND payment_memo = {3} AND status = 'active'",
                userId, classId, holdStatus, memo);
            await db.Database.ExecuteSqlRawAsync(
                "UPDATE invoices SET payment_status = 'failed' WHERE id IN (SELECT invoice_id FROM class_booking_payment_holds WHERE user_id = {0} AND class_id = {1} AND payment_memo = {2}) AND payment_status = 'pending'",
                userId, classId, memo);
            await tx.CommitAsync();
        });
    }

    private static async Task<(bool Success, decimal NewBalance, bool AlreadyRefunded)> RefundClassInvoiceToWalletAsync(
        SmartGymDbContext db,
        Guid userId,
        Guid invoiceId,
        decimal amount,
        string note)
    {
        if (amount <= 0) return (false, 0m, false);

        // Stable reference makes retries safe: the same class invoice can only
        // credit the member wallet once, even if the cancellation request races.
        var referenceCode = $"CLASS-REFUND-{invoiceId:N}";
        var strategy = db.Database.CreateExecutionStrategy();
        var result = await strategy.ExecuteAsync(async () =>
        {
            await using var tx = await db.Database.BeginTransactionAsync();

            await db.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT INTO member_wallet_balances (user_id, balance, last_updated_at)
                SELECT {userId}, COALESCE(SUM(
                    CASE
                        WHEN status = 'completed' AND type IN ('topup', 'refund') THEN amount
                        WHEN status = 'completed' AND type = 'payment' THEN -amount
                        ELSE 0
                    END
                ), 0), now()
                FROM wallet_transactions
                WHERE user_id = {userId}
                ON CONFLICT (user_id) DO NOTHING
                """);

            var balances = await db.Database.SqlQueryRaw<decimal>(
                "SELECT balance AS \"Value\" FROM member_wallet_balances WHERE user_id = {0} FOR UPDATE", userId)
                .ToListAsync();
            var currentBalance = balances.FirstOrDefault();

            var priorRefunds = await db.Database.SqlQueryRaw<bool>(
                "SELECT EXISTS (SELECT 1 FROM wallet_transactions WHERE user_id = {0} AND reference_code = {1} AND type = 'refund' AND status = 'completed') AS \"Value\"",
                userId, referenceCode).ToListAsync();
            if (priorRefunds.FirstOrDefault())
            {
                await tx.CommitAsync();
                return (true, currentBalance, true);
            }

            var newBalance = currentBalance + amount;
            await db.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT INTO wallet_transactions (
                    id, user_id, type, amount, balance_after, method, status, reference_code, note, created_at
                ) VALUES (
                    {Guid.NewGuid()}, {userId}, 'refund', {amount}, {newBalance},
                    'Ví hoàn tiền', 'completed', {referenceCode}, {note}, now()
                )
                """);
            await db.Database.ExecuteSqlInterpolatedAsync($"""
                UPDATE member_wallet_balances
                SET balance = {newBalance}, last_updated_at = now()
                WHERE user_id = {userId}
                """);

            await tx.CommitAsync();
            return (true, newBalance, false);
        });

        if (result.Item1)
            MemberEndpoints.SetMemberWalletCache(userId, result.Item2);
        return result;
    }

    private static async Task<IResult> ProcessCancelBookingInternalAsync(
        Guid classId,
        Guid targetUserId,
        bool isStaffAction,
        ClassService service,
        SmartGymDbContext db)
    {
        ClassDetailResponse? classDetail = null;
        try
        {
            classDetail = await service.GetClassDetailAsync(classId);
        }
        catch { }

        // Kiểm tra thông tin đặt chỗ trước khi hủy
        CancelBookingInfoRaw? bookingRow = null;
        try
        {
            bookingRow = await db.Database
                .SqlQueryRaw<CancelBookingInfoRaw>(
                    """
                    SELECT id AS "Id", user_id AS "UserId", class_id AS "ClassId",
                           COALESCE(status, '') AS "Status",
                           COALESCE(created_at, now()) AS "CreatedAt",
                           subscription_id AS "SubscriptionId"
                    FROM class_bookings
                    WHERE user_id = {0} AND class_id = {1}
                    """,
                    targetUserId, classId)
                .FirstOrDefaultAsync();
        }
        catch { }

        var (isSuccess, isLate, errorMessage) = await service.CancelBookingAsync(targetUserId, classId);
        var alreadyCancelled = !isSuccess && string.Equals(bookingRow?.Status, "cancelled", StringComparison.OrdinalIgnoreCase);
        var canRecoverCancelledRefund = false;
        if (alreadyCancelled && classDetail is not null)
        {
            var classStartUtc = classDetail.ScheduleTime.Hour >= 6
                ? classDetail.ScheduleTime.AddHours(-7)
                : classDetail.ScheduleTime;
            var classEndUtc = classStartUtc.AddMinutes(classDetail.DurationMinutes);
            canRecoverCancelledRefund = DateTime.UtcNow < classEndUtc
                && (isStaffAction || DateTime.UtcNow.AddHours(2) < classStartUtc);
        }
        if (!isSuccess && !canRecoverCancelledRefund)
            return Results.BadRequest(new { message = errorMessage });

        // Link the payment to the class/course itself. A time window can pick an
        // unrelated invoice (or miss the class invoice) and silently skip refunds.
        var rootRows = await db.Database.SqlQueryRaw<ClassRootIdRaw>(
            "SELECT COALESCE(parent_id, id) AS \"RootClassId\" FROM classes WHERE id = {0}", classId)
            .ToListAsync();
        var rootClassId = rootRows.FirstOrDefault()?.RootClassId ?? classId;

        Invoice? bookingInvoice = null;
        try
        {
            bookingInvoice = await db.Invoices.FromSqlInterpolated($"""
                    SELECT i.*
                    FROM invoices i
                    WHERE i.user_id = {targetUserId}
                      AND (
                          i.class_id = {rootClassId}
                          OR i.id IN (
                              SELECT h.invoice_id
                              FROM class_booking_payment_holds h
                              WHERE h.user_id = {targetUserId}
                                AND h.class_id IN (
                                    SELECT id FROM classes WHERE id = {rootClassId} OR parent_id = {rootClassId}
                                )
                          )
                      )
                    ORDER BY CASE i.payment_status
                        WHEN 'completed' THEN 0
                        WHEN 'pending' THEN 1
                        ELSE 2
                    END, i.created_at DESC
                    LIMIT 1
                    """)
                .FirstOrDefaultAsync();
        }
        catch { }

        // Older records may predate payment-hold rows. Their invoices still
        // carry class_id, so use that exact relation as the compatibility path.
        if (bookingInvoice is null)
        {
            bookingInvoice = await db.Invoices
                .Where(i => i.UserId == targetUserId && i.ClassId == rootClassId)
                .OrderByDescending(i => i.CreatedAt)
                .FirstOrDefaultAsync();
        }

        // 1. Lượt đặt không phát sinh thanh toán:
        // - bookingRow.SubscriptionId có giá trị
        // - hoặc hóa đơn ghi nhận số tiền thanh toán = 0 đ (TotalAmount <= 0)
        // - hoặc không có hóa đơn thanh toán nào trong hệ thống
        var isFreeBooking = (bookingRow?.SubscriptionId.HasValue == true)
            || (bookingInvoice != null && bookingInvoice.TotalAmount <= 0)
            || bookingInvoice == null;

        // 2. Đặt vé lẻ trả sau tại quầy (pending): Chưa thanh toán tiền
        var wasCounterPending = (bookingRow != null &&
            string.Equals(bookingRow.Status, "pending", StringComparison.OrdinalIgnoreCase))
            || (bookingInvoice != null && bookingInvoice.PaymentMethod == PaymentMethod.CashAtCounter && bookingInvoice.Status == PaymentStatus.Pending);

        decimal refundAmount = 0m;
        bool isRefunded = false;
        decimal updatedBalance = 0m;

        // Hoàn tiền vào ví CHỈ KHI:
        // - ĐÃ THANH TOÁN TIỀN THỰC TẾ: bookingInvoice != null && bookingInvoice.TotalAmount > 0 && bookingInvoice.Status == PaymentStatus.Completed
        // - KHÔNG PHẢI MIỄN PHÍ: !isFreeBooking
        // - KHÔNG PHẢI TRẢ SAU TẠI QUẦY: !wasCounterPending
        // - HỦY TRƯỚC GIỜ HỌC TRÊN 2 TIẾNG HOẶC DO NHÂN VIÊN LỄ TÂN HỦY HỘ: (!isLate || isStaffAction)
        bool shouldRefund = !isFreeBooking && !wasCounterPending && (!isLate || isStaffAction || canRecoverCancelledRefund)
            && bookingInvoice != null && bookingInvoice.TotalAmount > 0 && bookingInvoice.Status == PaymentStatus.Completed;

        if (shouldRefund && bookingInvoice != null)
        {
            refundAmount = bookingInvoice.TotalAmount;
            if (refundAmount > 0)
            {
                var className = classDetail?.ClassName ?? "lớp học";
                var (refundSuccess, newBal, _) = await RefundClassInvoiceToWalletAsync(
                    db, targetUserId, bookingInvoice.Id, refundAmount,
                    $"Hoàn tiền hủy đặt lớp: {className}" + (isStaffAction ? " (Lễ tân hủy hộ)" : ""));
                if (refundSuccess)
                {
                    isRefunded = true;
                    updatedBalance = newBal;
                    bookingInvoice.Status = PaymentStatus.Refunded;
                    bookingInvoice.RefundedAmount = Math.Min(
                        bookingInvoice.TotalAmount,
                        Math.Max(bookingInvoice.RefundedAmount, refundAmount));
                    await db.SaveChangesAsync();
                }
            }
        }

        var targetClassName = classDetail?.ClassName ?? "lớp học";
        string message;
        if (isStaffAction)
        {
            if (isRefunded)
            {
                message = $"Đã hủy lịch tập lớp \"{targetClassName}\" hộ học viên thành công! Số tiền {refundAmount:N0} đ đã được hoàn lại vào Ví học viên.";
            }
            else if (isFreeBooking || bookingInvoice == null || bookingInvoice.TotalAmount <= 0)
            {
                message = $"Đã hủy lịch tập lớp \"{targetClassName}\" hộ học viên thành công! Suất tập gói môn của học viên đã được giải phóng.";
            }
            else if (wasCounterPending)
            {
                message = $"Đã hủy lịch giữ chỗ lớp \"{targetClassName}\" hộ học viên thành công (Chưa thanh toán tại quầy).";
            }
            else
            {
                message = $"Đã hủy lịch tập lớp \"{targetClassName}\" hộ học viên thành công.";
            }
        }
        else
        {
            if (isRefunded)
            {
                message = $"Đã hủy đặt lớp \"{targetClassName}\" thành công. Số tiền {refundAmount:N0} đ đã được hoàn lại vào Ví hội viên của bạn!";
            }
            else if (isFreeBooking || bookingInvoice == null || bookingInvoice.TotalAmount <= 0)
            {
                message = $"Đã hủy đặt lớp \"{targetClassName}\" thành công. Suất tập thuộc gói môn của bạn đã được giải phóng để bạn có thể đặt lịch tập khác!";
            }
            else if (isLate && !wasCounterPending)
            {
                message = $"Đã hủy đặt lớp \"{targetClassName}\" thành công. Chỗ học đã được giải phóng (Hủy muộn trong vòng 2 tiếng trước giờ học nên không hoàn tiền ví theo quy định).";
            }
            else if (wasCounterPending)
            {
                message = $"Đã hủy lịch giữ chỗ lớp \"{targetClassName}\" thành công (Chưa thanh toán tại quầy).";
            }
            else
            {
                message = $"Đã hủy đặt lớp \"{targetClassName}\" thành công.";
            }
        }

        return Results.Ok(new
        {
            success = true,
            message = message,
            refunded = isRefunded,
            refundAmount = isRefunded ? refundAmount : 0m,
            newBalance = updatedBalance
        });
    }
}

public record CancelForMemberRequest(Guid MemberId);
public record PayAndBookClassRequest(string? PaymentMethod = "qr", decimal Amount = 150000, string? PaymentMemo = null);
public record StartClassPaymentHoldRequest(string? PaymentMemo);

public sealed class ClassPaymentHoldRaw
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ClassId { get; set; }
    public Guid? InvoiceId { get; set; }
    public string PaymentMemo { get; set; } = "";
    public decimal Amount { get; set; }
    public DateTime ExpiresAt { get; set; }
}

public sealed class ClassPaymentAttemptRaw
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ClassId { get; set; }
    public Guid? InvoiceId { get; set; }
    public string PaymentMemo { get; set; } = "";
    public decimal Amount { get; set; }
    public DateTime ExpiresAt { get; set; }
    public string Status { get; set; } = "active";
    public string? SePayTransactionId { get; set; }
}

public sealed class ClassBookingSessionIdRaw
{
    public Guid ClassId { get; set; }
}

public sealed class ClassPriceSnapshotRaw
{
    public Guid RootId { get; set; }
    public Guid SportId { get; set; }
    public int TotalSessions { get; set; }
    public Guid? PricingVersionId { get; set; }
    public decimal? PricePerSession { get; set; }
}

public class CancelBookingInfoRaw
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ClassId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public Guid? SubscriptionId { get; set; }
}

public sealed class ClassRootIdRaw
{
    public Guid RootClassId { get; set; }
}

public sealed class ReceptionistClassBookingQuoteRaw
{
    public Guid RootId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public int TotalSessions { get; set; }
    public string MembershipName { get; set; } = string.Empty;
    public string MembershipTier { get; set; } = "basic";
    public decimal Subtotal { get; set; }
    public decimal DiscountPct { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
}

public sealed class ReceptionistClassBookingPriceRaw
{
    public Guid RootId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public int TotalSessions { get; set; }
    public decimal? PricePerSession { get; set; }
    public decimal? CourseSubtotal { get; set; }
}
