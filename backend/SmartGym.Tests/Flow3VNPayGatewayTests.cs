using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using Xunit;

namespace SmartGym.Tests;

public class Flow3VNPayGatewayTests
{
    public class VnPayMockHelper
    {
        public static string HmacSha512(string key, string inputData)
        {
            var hash = new StringBuilder();
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);
            byte[] inputBytes = Encoding.UTF8.GetBytes(inputData);
            using (var hmac = new HMACSHA512(keyBytes))
            {
                byte[] hashValue = hmac.ComputeHash(inputBytes);
                foreach (byte x in hashValue)
                {
                    hash.AppendFormat("{0:x2}", x);
                }
            }
            return hash.ToString();
        }

        public static string BuildSortedQueryString(IDictionary<string, string> parameters)
        {
            var sorted = new SortedDictionary<string, string>(parameters, StringComparer.Ordinal);
            var query = new StringBuilder();
            foreach (var kvp in sorted)
            {
                if (!string.IsNullOrEmpty(kvp.Value))
                {
                    if (query.Length > 0) query.Append('&');
                    query.Append(Uri.EscapeDataString(kvp.Key));
                    query.Append('=');
                    query.Append(Uri.EscapeDataString(kvp.Value));
                }
            }
            return query.ToString();
        }

        public static string MapResponseCodeToMessage(string responseCode) => responseCode switch
        {
            "00" => "Giao dịch thành công",
            "07" => "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
            "09" => "Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
            "10" => "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
            "11" => "Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
            "12" => "Thẻ/Tài khoản của khách hàng bị khóa.",
            "13" => "Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin vui lòng thực hiện lại giao dịch.",
            "24" => "Khách hàng hủy giao dịch",
            "51" => "Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
            "65" => "Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
            "75" => "Ngân hàng thanh toán đang bảo trì.",
            "79" => "KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại",
            _ => "Giao dịch thất bại / Không xác định"
        };
    }

    [Fact]
    public void HmacSha512_ShouldProduceConsistentHash()
    {
        string secret = "SECRETKEY123456789";
        string data = "vnp_Amount=10000000&vnp_Command=pay&vnp_OrderInfo=Thanh+toan+SmartGym";

        string hash1 = VnPayMockHelper.HmacSha512(secret, data);
        string hash2 = VnPayMockHelper.HmacSha512(secret, data);

        Assert.NotNull(hash1);
        Assert.Equal(128, hash1.Length);
        Assert.Equal(hash1, hash2);
    }

    [Fact]
    public void BuildSortedQueryString_ShouldSortParametersAlphabetically()
    {
        var dict = new Dictionary<string, string>
        {
            { "vnp_Version", "2.1.0" },
            { "vnp_Amount", "50000000" },
            { "vnp_Command", "pay" },
            { "vnp_CreateDate", "20261028090000" },
            { "vnp_CurrCode", "VND" }
        };

        var query = VnPayMockHelper.BuildSortedQueryString(dict);
        var expected = "vnp_Amount=50000000&vnp_Command=pay&vnp_CreateDate=20261028090000&vnp_CurrCode=VND&vnp_Version=2.1.0";

        Assert.Equal(expected, query);
    }

    [Theory]
    [InlineData("00", "Giao dịch thành công")]
    [InlineData("24", "Khách hàng hủy giao dịch")]
    [InlineData("51", "Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.")]
    [InlineData("75", "Ngân hàng thanh toán đang bảo trì.")]
    [InlineData("99", "Giao dịch thất bại / Không xác định")]
    public void MapResponseCode_ShouldReturnAccurateDescriptions(string code, string expectedMessage)
    {
        var message = VnPayMockHelper.MapResponseCodeToMessage(code);
        Assert.Equal(expectedMessage, message);
    }
}
