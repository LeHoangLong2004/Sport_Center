using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces;
using SmartGym.Application.Services;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;

namespace SmartGym.Tests;

public class Flow3PaymentServiceTests
{
    private class MockUserRepository : IUserRepository
    {
        public readonly Dictionary<Guid, User> Users = new();
        public Task<User?> GetByIdAsync(Guid id) => Task.FromResult(Users.GetValueOrDefault(id));
        public Task<User?> GetByEmailAsync(string email) => Task.FromResult(Users.Values.FirstOrDefault(u => u.Email == email));
        public Task<User?> GetByPhoneNumberAsync(string phoneNumber) => Task.FromResult(Users.Values.FirstOrDefault(u => u.PhoneNumber == phoneNumber));
        public Task<IEnumerable<User>> GetAllUsersAsync() => Task.FromResult<IEnumerable<User>>(Users.Values);
        public Task<IEnumerable<MemberLookupResponse>> GetMembersLookupAsync() =>
            Task.FromResult<IEnumerable<MemberLookupResponse>>(Users.Values.Select(u => new MemberLookupResponse { Id = u.Id, FullName = u.FullName, Email = u.Email, PhoneNumber = u.PhoneNumber ?? "" }));
        public Task<Role?> GetRoleByNameAsync(string roleName) => Task.FromResult<Role?>(new Role { Id = Guid.NewGuid(), Name = roleName });
        public Task<Role?> GetRoleByIdAsync(Guid id) => Task.FromResult<Role?>(new Role { Id = id, Name = "Member" });
        public Task<IEnumerable<Role>> GetAllRolesAsync() => Task.FromResult<IEnumerable<Role>>(new List<Role>());
        public Task AddAsync(User user) { Users[user.Id] = user; return Task.CompletedTask; }
        public Task UpdateAsync(User user) { Users[user.Id] = user; return Task.CompletedTask; }
    }

    private class MockPackageRepository : IPackageRepository
    {
        public readonly Dictionary<string, Package> Packages = new();
        public Task<Package?> GetByIdAsync(string id) => Task.FromResult(Packages.GetValueOrDefault(id));
        public Task<IEnumerable<Package>> GetAllAsync() => Task.FromResult<IEnumerable<Package>>(Packages.Values);
        public Task AddAsync(Package package) { Packages[package.Id] = package; return Task.CompletedTask; }
        public Task UpdateAsync(Package package) { Packages[package.Id] = package; return Task.CompletedTask; }
        public Task DeleteAsync(string id) { Packages.Remove(id); return Task.CompletedTask; }
    }

    private class MockSubscriptionRepository : ISubscriptionRepository
    {
        public readonly List<Subscription> Subscriptions = new();
        public Task<Subscription?> GetByIdAsync(Guid id) => Task.FromResult(Subscriptions.FirstOrDefault(s => s.Id == id));
        public Task<IEnumerable<Subscription>> GetByUserIdAsync(Guid userId) => Task.FromResult<IEnumerable<Subscription>>(Subscriptions.Where(s => s.UserId == userId));
        public Task AddAsync(Subscription subscription) { Subscriptions.Add(subscription); return Task.CompletedTask; }
        public Task UpdateAsync(Subscription subscription) => Task.CompletedTask;
    }

    private class MockInvoiceRepository : IInvoiceRepository
    {
        public readonly List<Invoice> Invoices = new();
        public Task<Invoice?> GetByIdAsync(Guid id) => Task.FromResult(Invoices.FirstOrDefault(i => i.Id == id));
        public Task<IEnumerable<Invoice>> GetByUserIdAsync(Guid userId) => Task.FromResult<IEnumerable<Invoice>>(Invoices.Where(i => i.UserId == userId));
        public Task<IEnumerable<Invoice>> GetAllAsync() => Task.FromResult<IEnumerable<Invoice>>(Invoices);
        public Task AddAsync(Invoice invoice) { Invoices.Add(invoice); return Task.CompletedTask; }
        public Task UpdateAsync(Invoice invoice) => Task.CompletedTask;
    }

    private class MockPdfService : IPdfService
    {
        public Task<byte[]> GenerateInvoicePdfAsync(Guid invoiceId) => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
    }

    private class MockEmailService : IEmailService
    {
        public bool IsConfigured => true;
        public Task<bool> SendAsync(string to, string subject, string htmlBody, byte[]? attachmentBytes = null, string? attachmentName = null) => Task.FromResult(true);
    }

    private class MockVnPayGateway : IVnPayGateway
    {
        public bool IsConfigured => true;
        public string CreatePaymentUrl(Guid invoiceId, decimal amount, string orderInfo, string? clientIp, DateTime? createdAt = null) =>
            $"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef={invoiceId}&vnp_Amount={amount * 100}";
        public VnPayCallbackResult ValidateCallback(IReadOnlyDictionary<string, string> query) =>
            new VnPayCallbackResult(true, Guid.NewGuid(), "00", "VNPAY123456", "Thành công");
    }

    private class MockProductOrderPaymentService : IProductOrderPaymentService
    {
        public Task<bool> FinalizeAsync(Guid invoiceId, CancellationToken cancellationToken = default) => Task.FromResult(true);
    }

    private (PaymentService service, MockUserRepository userRepo, MockPackageRepository packageRepo, MockInvoiceRepository invoiceRepo, MockSubscriptionRepository subRepo) CreateService()
    {
        var userRepo = new MockUserRepository();
        var packageRepo = new MockPackageRepository();
        var subRepo = new MockSubscriptionRepository();
        var invoiceRepo = new MockInvoiceRepository();
        var pdfService = new MockPdfService();
        var emailService = new MockEmailService();
        var vnPay = new MockVnPayGateway();
        var productOrder = new MockProductOrderPaymentService();

        var service = new PaymentService(subRepo, invoiceRepo, userRepo, packageRepo, pdfService, emailService, vnPay, productOrder);
        return (service, userRepo, packageRepo, invoiceRepo, subRepo);
    }

    [Fact]
    public async Task CreatePaymentAsync_ShouldFail_WhenAmountIsZeroOrNegative()
    {
        var (service, _, _, _, _) = CreateService();
        var res1 = await service.CreatePaymentAsync(Guid.NewGuid(), "pkg-1", 0, PaymentMethod.CashAtCounter);
        var res2 = await service.CreatePaymentAsync(Guid.NewGuid(), "pkg-1", -50000, PaymentMethod.CashAtCounter);

        Assert.False(res1.Success);
        Assert.Equal("Số tiền thanh toán phải lớn hơn 0.", res1.Message);
        Assert.False(res2.Success);
    }

    [Fact]
    public async Task CreatePaymentAsync_ShouldFail_WhenUserNotFound()
    {
        var (service, _, _, _, _) = CreateService();
        var res = await service.CreatePaymentAsync(Guid.NewGuid(), "pkg-1", 500000, PaymentMethod.CashAtCounter);

        Assert.False(res.Success);
        Assert.Equal("Không tìm thấy hội viên.", res.Message);
    }

    [Fact]
    public async Task CreatePaymentAsync_ShouldFail_WhenPackageNotFound()
    {
        var (service, userRepo, _, _, _) = CreateService();
        var userId = Guid.NewGuid();
        await userRepo.AddAsync(new User { Id = userId, FullName = "Nguyễn Văn A", Email = "a@smartgym.vn" });

        var res = await service.CreatePaymentAsync(userId, "non-existent-pkg", 500000, PaymentMethod.CashAtCounter);
        Assert.False(res.Success);
        Assert.Contains("Không tìm thấy gói tập", res.Message);
    }

    [Fact]
    public async Task CreatePaymentAsync_ShouldReusePendingInvoice_WhenDuplicateCreatedWithinTenMinutes()
    {
        var (service, userRepo, packageRepo, invoiceRepo, _) = CreateService();
        var userId = Guid.NewGuid();
        await userRepo.AddAsync(new User { Id = userId, FullName = "Trần Thị B", Email = "b@smartgym.vn" });
        await packageRepo.AddAsync(new Package { Id = "gym-monthly", Name = "Gym Tháng", MonthlyPrice = 500000 });

        var first = await service.CreatePaymentAsync(userId, "gym-monthly", 500000, PaymentMethod.BankTransfer);
        Assert.True(first.Success);

        var second = await service.CreatePaymentAsync(userId, "gym-monthly", 500000, PaymentMethod.BankTransfer);
        Assert.True(second.Success);
        Assert.True(second.IsDuplicateSuspected);
        Assert.Equal(first.InvoiceId, second.InvoiceId);
        Assert.Single(invoiceRepo.Invoices);
    }

    [Fact]
    public async Task ProcessPaymentAsync_ShouldCompleteInvoice_AndActivateSubscription()
    {
        var (service, userRepo, packageRepo, invoiceRepo, subRepo) = CreateService();
        var userId = Guid.NewGuid();
        await userRepo.AddAsync(new User { Id = userId, FullName = "Lê Văn C", Email = "c@smartgym.vn" });
        await packageRepo.AddAsync(new Package { Id = "gym-vip", Name = "Gym VIP", MonthlyPrice = 1500000 });

        var created = await service.CreatePaymentAsync(userId, "gym-vip", 1500000, PaymentMethod.BankTransfer, "quarterly");
        Assert.True(created.Success);

        var processSuccess = await service.ProcessPaymentAsync(created.InvoiceId);
        Assert.True(processSuccess);

        var inv = await invoiceRepo.GetByIdAsync(created.InvoiceId);
        Assert.NotNull(inv);
        Assert.Equal(PaymentStatus.Completed, inv.Status);
        Assert.NotNull(inv.PaidAt);

        var sub = subRepo.Subscriptions.FirstOrDefault(s => s.UserId == userId);
        Assert.NotNull(sub);
        Assert.Equal(PaymentStatus.Completed, sub.PaymentStatus);
    }

    [Theory]
    [InlineData("monthly", 28)]
    [InlineData("yearly", 365)]
    [InlineData("other", 28)] // defaults to monthly
    public async Task CreatePaymentAsync_ShouldCalculateCorrectBillingPeriod(string period, int expectedMinDays)
    {
        var (service, userRepo, packageRepo, _, subRepo) = CreateService();
        var userId = Guid.NewGuid();
        await userRepo.AddAsync(new User { Id = userId, FullName = "Hội Viên " + period, Email = $"user_{period}@smartgym.vn" });
        await packageRepo.AddAsync(new Package { Id = "pkg-" + period, Name = "Gói " + period, MonthlyPrice = 1000000 });

        var created = await service.CreatePaymentAsync(userId, "pkg-" + period, 1000000, PaymentMethod.CashAtCounter, period);
        Assert.True(created.Success);

        var sub = subRepo.Subscriptions.Last();
        var days = (sub.EndDate - sub.StartDate).TotalDays;
        Assert.True(days >= expectedMinDays, $"Expected at least {expectedMinDays} days for {period}, got {days}");
    }
}
