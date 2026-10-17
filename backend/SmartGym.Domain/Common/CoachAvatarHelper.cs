namespace SmartGym.Domain.Common;

public static class CoachAvatarHelper
{
    /// <summary>
    /// Chỉ lấy avatar thật từ tài khoản HLV trong database.
    /// Nếu tài khoản chưa có avatar thì trả về null, tuyệt đối KHÔNG gán ảnh AI mặc định.
    /// </summary>
    public static string? GetRealCoachAvatar(string? coachName, string? existingAvatar = null, Guid? coachId = null)
    {
        if (string.IsNullOrWhiteSpace(existingAvatar) || existingAvatar.Contains("ui-avatars.com"))
        {
            return null;
        }

        return existingAvatar.Trim();
    }
}
