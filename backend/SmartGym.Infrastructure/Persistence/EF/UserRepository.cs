using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;
using System.Threading.Tasks;

namespace SmartGym.Infrastructure.Persistence.EF;

public class UserRepository : IUserRepository
{
    private readonly SmartGymDbContext _dbContext;

    public UserRepository(SmartGymDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbContext.Users.Include(u => u.Role).Include(u => u.CoachProfile).FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetByPhoneNumberAsync(string phoneNumber)
    {
        return await _dbContext.Users.Include(u => u.Role).Include(u => u.CoachProfile).FirstOrDefaultAsync(u => u.PhoneNumber == phoneNumber);
    }

    public async Task<User?> GetByIdAsync(System.Guid id)
    {
        return await _dbContext.Users.Include(u => u.Role).Include(u => u.CoachProfile).FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<System.Collections.Generic.IEnumerable<User>> GetAllUsersAsync()
    {
        return await _dbContext.Users.Include(u => u.Role).Include(u => u.CoachProfile).ToListAsync();
    }

    public async Task<System.Collections.Generic.IEnumerable<SmartGym.Application.DTOs.MemberLookupResponse>> GetMembersLookupAsync()
    {
        var members = await _dbContext.Users
            .Include(u => u.Role)
            .Where(u => u.Role != null && u.Role.Name == "member")
            .Select(u => new 
            {
                u.Id,
                u.FullName,
                u.PhoneNumber,
                u.AvatarUrl,
                u.Status,
                Subscription = _dbContext.Subscriptions
                    .Where(s => s.UserId == u.Id)
                    .OrderByDescending(s => s.EndDate)
                    .Select(s => new { s.EndDate, PackageName = s.Package != null ? s.Package.Name : null })
                    .FirstOrDefault()
            })
            .ToListAsync();

        return members.Select(m => {
            var isLocked = !m.Status;
            var isExpired = m.Subscription?.EndDate < System.DateTime.UtcNow;
            var isNotRegistered = m.Subscription == null;

            var status = isLocked ? "Tạm khóa" : 
                         isNotRegistered ? "Chưa đăng ký" : 
                         isExpired ? "Hết hạn" : "Đang hoạt động";

            var color = isLocked ? "red" : 
                        isNotRegistered ? "gray" : 
                        isExpired ? "orange" : "green";

            return new SmartGym.Application.DTOs.MemberLookupResponse
            {
                Id = m.Id,
                MemberCode = $"MB-{m.Id.ToString().Substring(0, 4).ToUpper()}",
                FullName = m.FullName,
                PhoneNumber = m.PhoneNumber,
                AvatarUrl = m.AvatarUrl ?? "https://ui-avatars.com/api/?name=" + System.Uri.EscapeDataString(m.FullName),
                PackageName = m.Subscription?.PackageName ?? "Chưa đăng ký",
                ExpiryDate = m.Subscription?.EndDate,
                Status = status,
                StatusColor = color
            };
        });
    }

    public async Task<Role?> GetRoleByNameAsync(string roleName)
    {
        return await _dbContext.Roles.FirstOrDefaultAsync(r => r.Name.ToLower() == roleName.ToLower());
    }

    public async Task<Role?> GetRoleByIdAsync(System.Guid id)
    {
        return await _dbContext.Roles.FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<System.Collections.Generic.IEnumerable<Role>> GetAllRolesAsync()
    {
        return await _dbContext.Roles.ToListAsync();
    }

    public async Task AddAsync(User user)
    {
        await _dbContext.Users.AddAsync(user);
        await _dbContext.SaveChangesAsync();
    }

    public async Task UpdateAsync(User user)
    {
        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync();
    }
}
