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
