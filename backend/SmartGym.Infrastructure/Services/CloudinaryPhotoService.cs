using System;
using System.IO;
using System.Threading.Tasks;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SmartGym.Application.Interfaces;

namespace SmartGym.Infrastructure.Services;

public class CloudinaryPhotoService : IPhotoService
{
    private readonly Cloudinary? _cloudinary;
    private readonly ILogger<CloudinaryPhotoService> _logger;
    private readonly bool _isConfigured;

    public CloudinaryPhotoService(IConfiguration configuration, ILogger<CloudinaryPhotoService> logger)
    {
        _logger = logger;
        var cloudName = configuration["Cloudinary:CloudName"]?.Trim().ToLowerInvariant();
        var apiKey = configuration["Cloudinary:ApiKey"]?.Trim();
        var apiSecret = configuration["Cloudinary:ApiSecret"]?.Trim();

        if (!string.IsNullOrWhiteSpace(cloudName) &&
            !string.IsNullOrWhiteSpace(apiKey) &&
            !string.IsNullOrWhiteSpace(apiSecret) &&
            !cloudName.Contains("your_") &&
            !apiKey.Contains("your_"))
        {
            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
            _isConfigured = true;
            _logger.LogInformation("Cloudinary photo service initialized for cloud: {CloudName}", cloudName);
        }
        else
        {
            _isConfigured = false;
            _logger.LogWarning("Cloudinary credentials are not configured or are placeholders. Operating in local wwwroot fallback mode.");
        }
    }

    public async Task<(bool Success, string? Url, string? ErrorMessage)> UploadImageAsync(
        Stream stream,
        string fileName,
        string folder = "sports"
    )
    {
        if (stream == null)
        {
            return (false, null, "File ảnh không hợp lệ.");
        }

        // Đọc toàn bộ file vào bộ nhớ để tránh ObjectDisposedException khi Cloudinary đóng stream
        byte[] fileBytes;
        try
        {
            using var memoryStream = new MemoryStream();
            await stream.CopyToAsync(memoryStream);
            fileBytes = memoryStream.ToArray();
            if (fileBytes.Length == 0)
            {
                return (false, null, "File ảnh rỗng hoặc không có dữ liệu.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to read image stream.");
            return (false, null, "Không thể đọc dữ liệu file ảnh.");
        }

        // 1. Upload lên Cloudinary nếu đã có cấu hình
        if (_isConfigured && _cloudinary != null)
        {
            try
            {
                using var uploadStream = new MemoryStream(fileBytes);
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(fileName, uploadStream),
                    Folder = $"smartgym/{folder}",
                    UseFilename = true,
                    UniqueFilename = true,
                    Overwrite = false,
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                if (uploadResult.Error != null)
                {
                    _logger.LogWarning("Cloudinary upload failed: {Message}. Falling back to local storage.", uploadResult.Error.Message);
                }
                else
                {
                    var secureUrl = uploadResult.SecureUrl?.ToString() ?? uploadResult.Url?.ToString();
                    if (!string.IsNullOrEmpty(secureUrl))
                    {
                        return (true, secureUrl, null);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Exception connecting to Cloudinary. Falling back to local storage.");
            }
        }

        // 2. Fallback: Lưu vào wwwroot/uploads/{folder} an toàn
        try
        {
            var rootDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", folder);
            Directory.CreateDirectory(rootDir);

            var generatedFileName = $"{Guid.NewGuid():N}{Path.GetExtension(fileName)}";
            var filePath = Path.Combine(rootDir, generatedFileName);

            await File.WriteAllBytesAsync(filePath, fileBytes);

            return (true, $"/uploads/{folder}/{generatedFileName}", null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save file to local storage.");
            return (false, null, $"Lỗi lưu ảnh cục bộ: {ex.Message}");
        }
    }
}
