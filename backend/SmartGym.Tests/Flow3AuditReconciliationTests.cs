using System;
using System.Linq;
using SmartGym.Tests.Fixtures;
using Xunit;

namespace SmartGym.Tests;

public class Flow3AuditReconciliationTests
{
    [Fact]
    public void HistoricalAuditTransactions_ShouldHaveValidRecords()
    {
        var records = SmartGymAuditTransactionFixtures.HistoricalAuditTransactions;
        Assert.NotNull(records);
        Assert.True(records.Count >= 200, $"Expected at least 200 audit records, found {records.Count}");
    }

    [Fact]
    public void AllTransactions_MustHaveUniqueTransactionIds()
    {
        var records = SmartGymAuditTransactionFixtures.HistoricalAuditTransactions;
        var duplicates = records.GroupBy(r => r.TransactionId).Where(g => g.Count() > 1).ToList();
        Assert.Empty(duplicates);
    }

    [Fact]
    public void FinancialMath_NetPaidAmountMustMatchFormula()
    {
        var records = SmartGymAuditTransactionFixtures.HistoricalAuditTransactions;
        foreach (var r in records)
        {
            decimal calculatedNet = r.GrossAmount - r.DiscountAmount + r.VatAmount;
            Assert.Equal(calculatedNet, r.NetPaidAmount);
        }
    }

    [Fact]
    public void AllTransactions_MustHaveReconciliationHash()
    {
        var records = SmartGymAuditTransactionFixtures.HistoricalAuditTransactions;
        foreach (var r in records)
        {
            Assert.StartsWith("SHA256-", r.ReconciliationHash);
            Assert.False(string.IsNullOrWhiteSpace(r.BankReferenceCode));
        }
    }

    [Theory]
    [InlineData("MB Bank SePay QR")]
    [InlineData("VNPay Gateway")]
    [InlineData("Counter Cashier")]
    [InlineData("MoMo Wallet")]
    public void HistoricalTransactions_ShouldSpanAllActiveGateways(string gateway)
    {
        var records = SmartGymAuditTransactionFixtures.HistoricalAuditTransactions;
        var exists = records.Any(r => r.PaymentGateway.Equals(gateway, StringComparison.OrdinalIgnoreCase));
        Assert.True(exists, $"Gateway {gateway} must have audit history.");
    }

    [Fact]
    public void HistoricalTransactions_AllTimestampsMustBeValidUtc()
    {
        var records = SmartGymAuditTransactionFixtures.HistoricalAuditTransactions;
        foreach (var r in records)
        {
            Assert.Equal(DateTimeKind.Utc, r.TimestampUtc.Kind);
            Assert.True(r.TimestampUtc.Year >= 2026);
        }
    }
}
