using System;

namespace SmartGym.Application.Common;

/// <summary>
/// Quy đổi thời gian lưu trong database (UTC) sang múi giờ vận hành của trung tâm.
/// Database vẫn giữ UTC; chỉ đổi khi hiển thị cho người dùng.
/// </summary>
public static class CenterTime
{
    private static readonly TimeZoneInfo Zone = ResolveZone();

    public static DateTime ToLocal(DateTime value)
    {
        var utc = value.Kind == DateTimeKind.Utc
            ? value
            : value.Kind == DateTimeKind.Local
                ? value.ToUniversalTime()
                : DateTime.SpecifyKind(value, DateTimeKind.Utc);

        return TimeZoneInfo.ConvertTimeFromUtc(utc, Zone);
    }

    private static TimeZoneInfo ResolveZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
        }
        catch (TimeZoneNotFoundException)
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Asia/Bangkok");
        }
        catch (InvalidTimeZoneException)
        {
            return TimeZoneInfo.Utc;
        }
    }
}
