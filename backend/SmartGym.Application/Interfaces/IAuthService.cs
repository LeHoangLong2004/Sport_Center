using SmartGym.Application.DTOs;
using System.Threading.Tasks;

namespace SmartGym.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
}
