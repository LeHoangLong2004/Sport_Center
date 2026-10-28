using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Xunit;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;

namespace SmartGym.Tests;

public class Flow3InvoicesAndBillingTests
{
    public class BillingCalculator
    {
        private static readonly CultureInfo VnCulture = new("vi-VN");

        public static string FormatVnd(decimal amount)
        {
            return string.Format(VnCulture, "{0:N0} đ", amount);
        }

        public static string GenerateInvoiceCode(DateTime date, int sequentialNumber)
        {
            return $"INV-{date:yyyyMMdd}-{sequentialNumber:D4}";
        }

        public static (decimal Subtotal, decimal DiscountAmount, decimal VatAmount, decimal Total) CalculateOrderTotals(
            IEnumerable<(string ItemName, decimal UnitPrice, int Quantity)> items,
            int discountPct = 0,
            decimal vatPct = 8)
        {
            decimal subtotal = items.Sum(i => i.UnitPrice * i.Quantity);
            decimal discount = Math.Round(subtotal * (discountPct / 100m));
            decimal afterDiscount = subtotal - discount;
            decimal vat = Math.Round(afterDiscount * (vatPct / 100m));
            decimal total = afterDiscount + vat;

            return (subtotal, discount, vat, total);
        }

        public static bool CanTransitionStatus(PaymentStatus current, PaymentStatus target)
        {
            return (current, target) switch
            {
                (PaymentStatus.Pending, PaymentStatus.Completed) => true,
                (PaymentStatus.Pending, PaymentStatus.Failed) => true,
                (PaymentStatus.Completed, PaymentStatus.Refunded) => true,
                _ => false
            };
        }
    }

    [Fact]
    public void FormatVnd_ShouldFormatStandardVietnameseCurrency()
    {
        decimal amount = 1500000;
        string formatted = BillingCalculator.FormatVnd(amount);
        Assert.Contains("1.500.000", formatted);
        Assert.Contains("đ", formatted);
    }

    [Fact]
    public void GenerateInvoiceCode_ShouldProduceConsistentStandardCode()
    {
        var dt = new DateTime(2026, 10, 28);
        string code1 = BillingCalculator.GenerateInvoiceCode(dt, 1);
        string code2 = BillingCalculator.GenerateInvoiceCode(dt, 142);

        Assert.Equal("INV-20261028-0001", code1);
        Assert.Equal("INV-20261028-0142", code2);
    }

    [Fact]
    public void CalculateOrderTotals_ShouldApplyDiscountAndVatCorrectly()
    {
        var items = new List<(string, decimal, int)>
        {
            ("Gói Gym VIP", 1000000, 1),
            ("Bình nước SmartGym", 150000, 2)
        };

        // Subtotal = 1.000.000 + 300.000 = 1.300.000
        // Discount 10% = 130.000 -> After discount = 1.170.000
        // VAT 8% of 1.170.000 = 93.600
        // Total = 1.263.600
        var (subtotal, discount, vat, total) = BillingCalculator.CalculateOrderTotals(items, discountPct: 10, vatPct: 8);

        Assert.Equal(1300000, subtotal);
        Assert.Equal(130000, discount);
        Assert.Equal(93600, vat);
        Assert.Equal(1263600, total);
    }

    [Theory]
    [InlineData(PaymentStatus.Pending, PaymentStatus.Completed, true)]
    [InlineData(PaymentStatus.Pending, PaymentStatus.Failed, true)]
    [InlineData(PaymentStatus.Completed, PaymentStatus.Refunded, true)]
    [InlineData(PaymentStatus.Completed, PaymentStatus.Pending, false)]
    [InlineData(PaymentStatus.Failed, PaymentStatus.Completed, false)]
    [InlineData(PaymentStatus.Refunded, PaymentStatus.Completed, false)]
    public void CanTransitionStatus_ShouldEnforceStateTransitions(PaymentStatus current, PaymentStatus target, bool expected)
    {
        bool allowed = BillingCalculator.CanTransitionStatus(current, target);
        Assert.Equal(expected, allowed);
    }
}
