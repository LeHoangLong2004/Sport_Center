using SmartGym.Application.DTOs;
using System.Threading.Tasks;

namespace SmartGym.Application.Interfaces;

/// <summary>
/// Giao diện dịch vụ Xác thực & Đăng nhập (Authentication Service).
/// Cung cấp nghiệp vụ đăng ký tài khoản mới và đăng nhập sinh token JWT.
/// </summary>
public interface IAuthService
{
    /// <summary>Đăng ký tài khoản người dùng mới</summary>
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    /// <summary>Xác thực đăng nhập và cấp token</summary>
    Task<AuthResponse> LoginAsync(LoginRequest request);
}
