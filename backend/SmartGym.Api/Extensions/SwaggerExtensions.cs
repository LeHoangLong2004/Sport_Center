using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using SmartGym.Api.Serialization;

namespace SmartGym.Api.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSmartGymSwagger(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
            c.CustomSchemaIds(type => type.FullName?.Replace("+", ".") ?? type.Name);
            c.SchemaFilter<PaymentEnumSchemaFilter>();

            c.SwaggerDoc(
                "v1",
                new OpenApiInfo
                {
                    Title = "SmartGym API",
                    Version = "v1",
                    Description =
                        "REST API for the SmartGym Center management system (ASP.NET Core, PostgreSQL/Supabase).",
                }
            );

            c.AddSecurityDefinition(
                "Bearer",
                new OpenApiSecurityScheme
                {
                    Description = "Paste the JWT token here. Do not prefix it with 'Bearer'.",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                }
            );

            c.AddSecurityRequirement(
                new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer",
                            },
                        },
                        Array.Empty<string>()
                    },
                }
            );
        });

        return services;
    }

    public static WebApplication UseSmartGymSwagger(this WebApplication app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.DocumentTitle = "SmartGym API";
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartGym API v1");
        });
        return app;
    }
}
