# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["WaterRefill.Api.csproj", "./"]
RUN dotnet restore "WaterRefill.Api.csproj"

# Copy source code and build
COPY . .
RUN dotnet build "WaterRefill.Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "WaterRefill.Api.csproj" -c Release -o /app/publish --self-contained -r linux-x64

# Runtime stage
FROM mcr.microsoft.com/dotnet/runtime-deps:10.0-jammy
WORKDIR /app

# Install required dependencies for PostgreSQL and PDF generation
RUN apt-get update && apt-get install -y \
    libssl3 \
    libicu72 \
    && rm -rf /var/lib/apt/lists/*

# Copy published application
COPY --from=publish /app/publish .

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://0.0.0.0:8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run application
ENTRYPOINT ["./WaterRefill.Api"]
