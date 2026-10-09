using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using SmartGym.Domain.Enums;

namespace SmartGym.Api.Serialization;

/// <summary>
/// Cho phép client gửi hình thức thanh toán dưới dạng số (0..4) hoặc mã ngắn
/// (<c>qr</c>, <c>card</c>, <c>wallet</c>, <c>counter</c>, <c>bank_transfer</c>) và luôn trả về mã ngắn.
/// </summary>
public class PaymentMethodJsonConverter : JsonConverter<PaymentMethod>
{
    public override PaymentMethod Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        switch (reader.TokenType)
        {
            case JsonTokenType.Number:
                return (PaymentMethod)reader.GetInt32();

            case JsonTokenType.String:
                var value = reader.GetString() ?? string.Empty;
                if (int.TryParse(value, out var number))
                {
                    return (PaymentMethod)number;
                }

                return PaymentMethodExtensions.ParseDbValue(value);

            default:
                throw new JsonException("Hình thức thanh toán không hợp lệ.");
        }
    }

    public override void Write(Utf8JsonWriter writer, PaymentMethod value, JsonSerializerOptions options) =>
        writer.WriteStringValue(value.ToDbValue());
}