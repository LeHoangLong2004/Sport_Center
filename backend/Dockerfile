FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY SmartGym.Domain/*.csproj SmartGym.Domain/
COPY SmartGym.Application/*.csproj SmartGym.Application/
COPY SmartGym.Infrastructure/*.csproj SmartGym.Infrastructure/
COPY SmartGym.Api/*.csproj SmartGym.Api/

RUN dotnet restore SmartGym.Api/SmartGym.Api.csproj

# Copy the rest of the source code
COPY . .

# Build and publish in Release mode
RUN dotnet publish SmartGym.Api/SmartGym.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Environment settings
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "SmartGym.Api.dll"]

