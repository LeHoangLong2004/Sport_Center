using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using SmartGym.Domain.Enums;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace SmartGym.Api.Serialization;

/// <summary>
/// Swagger hiển thị đúng giá trị thực tế mà API nhận/trả cho hình thức thanh toán
/// (qr | card | wallet | counter | bank_transfer) và trạng thái thanh toán (pending | completed | ...).
/// </summary>
public class PaymentEnumSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type == typeof(PaymentMethod))
        {
            schema.Type = "string";
            schema.Format = null;
            schema.Enum = Enum.GetValues<PaymentMethod>()
                .Select(value => (IOpenApiAny)new OpenApiString(value.ToDbValue()))
                .ToList<IOpenApiAny>();
        }
        else if (context.Type == typeof(PaymentStatus))
        {
            schema.Type = "string";
            schema.Format = null;
            schema.Enum = Enum.GetValues<PaymentStatus>()
                .Select(value => (IOpenApiAny)new OpenApiString(value.ToString().ToLowerInvariant()))
                .ToList<IOpenApiAny>();
        }
    }
}