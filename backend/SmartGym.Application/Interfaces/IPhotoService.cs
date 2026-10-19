using System.IO;
using System.Threading.Tasks;

namespace SmartGym.Application.Interfaces;

public interface IPhotoService
{
    Task<(bool Success, string? Url, string? ErrorMessage)> UploadImageAsync(
        Stream stream,
        string fileName,
        string folder = "sports"
    );
}
