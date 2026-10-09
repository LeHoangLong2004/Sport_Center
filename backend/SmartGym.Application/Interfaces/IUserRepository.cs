using SmartGym.Domain.Entities;
using System.Threading.Tasks;

namespace SmartGym.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByPhoneNumberAsync(string phoneNumber);
    Task<User?> GetByIdAsync(System.Guid id);
    Task<System.Collections.Generic.IEnumerable<User>> GetAllUsersAsync();
    Task<System.Collections.Generic.IEnumerable<SmartGym.Application.DTOs.MemberLookupResponse>> GetMembersLookupAsync();
    Task<Role?> GetRoleByNameAsync(string roleName);
    Task<Role?> GetRoleByIdAsync(System.Guid id);
    Task<System.Collections.Generic.IEnumerable<Role>> GetAllRolesAsync();
    Task AddAsync(User user);
    Task UpdateAsync(User user);
}
