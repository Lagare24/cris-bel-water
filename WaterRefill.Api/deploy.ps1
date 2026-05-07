# WaterRefill.Api Oracle Cloud Deployment Script
# This script automates the deployment process to Oracle Application Container Cloud Service

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('build', 'package', 'deploy', 'docker-build', 'docker-push', 'all')]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [string]$OracleRegion = "us-phoenix-1",
    
    [Parameter(Mandatory=$false)]
    [string]$OracleNamespace,
    
    [Parameter(Mandatory=$false)]
    [string]$ApplicationName = "waterrefill-api",
    
    [Parameter(Mandatory=$false)]
    [string]$Version = "1.0.0",
    
    [Parameter(Mandatory=$false)]
    [switch]$Help
)

# Show help
if ($Help) {
    Write-Host @"
WaterRefill.Api Oracle Cloud Deployment Script

USAGE:
    .\deploy.ps1 -Action <action> [options]

ACTIONS:
    build           - Build the application for Release
    package         - Create deployment package (.zip)
    deploy          - Deploy to Oracle Application Container Cloud Service
    docker-build    - Build Docker image
    docker-push     - Push Docker image to Oracle Container Registry
    all             - Execute all steps (build, package, docker-build)

OPTIONS:
    -OracleRegion       Oracle Cloud region (default: us-phoenix-1)
    -OracleNamespace    Oracle Cloud namespace (required for Docker push)
    -ApplicationName    Application name (default: waterrefill-api)
    -Version            Application version (default: 1.0.0)
    -Help               Show this help message

EXAMPLES:
    # Build and package for Oracle ACCS
    .\deploy.ps1 -Action build
    .\deploy.ps1 -Action package

    # Build Docker image
    .\deploy.ps1 -Action docker-build -Version 1.0.0

    # Push to Oracle Container Registry
    .\deploy.ps1 -Action docker-push -OracleNamespace myorg -Version 1.0.0

    # Full workflow
    .\deploy.ps1 -Action all
"@
    exit 0
}

# Colors for output
$colors = @{
    'Success' = 'Green'
    'Error'   = 'Red'
    'Warning' = 'Yellow'
    'Info'    = 'Cyan'
}

function Write-Status {
    param([string]$Message, [string]$Status = 'Info')
    $color = $colors[$Status] ?? 'White'
    Write-Host "[$Status] $Message" -ForegroundColor $color
}

function Test-Prerequisites {
    Write-Status "Checking prerequisites..." "Info"
    
    $checks = @(
        @{ Name = "dotnet"; Check = { dotnet --version } },
        @{ Name = "git"; Check = { git --version } }
    )
    
    if ($Action -like "*docker*") {
        $checks += @{ Name = "docker"; Check = { docker --version } }
    }
    
    foreach ($check in $checks) {
        try {
            $result = & $check.Check
            Write-Status "$($check.Name) is installed" "Success"
        }
        catch {
            Write-Status "$($check.Name) is NOT installed. Please install it before proceeding." "Error"
            exit 1
        }
    }
}

function Build-Application {
    Write-Status "Building application..." "Info"
    
    if (!(Test-Path "WaterRefill.Api.csproj")) {
        Write-Status "Project file not found. Make sure you're in the WaterRefill.Api directory." "Error"
        exit 1
    }
    
    try {
        dotnet restore
        if ($LASTEXITCODE -ne 0) { throw "Restore failed" }
        
        dotnet build -c Release
        if ($LASTEXITCODE -ne 0) { throw "Build failed" }
        
        dotnet publish -c Release -r linux-x64 --self-contained
        if ($LASTEXITCODE -ne 0) { throw "Publish failed" }
        
        Write-Status "Application built successfully" "Success"
    }
    catch {
        Write-Status "Build failed: $_" "Error"
        exit 1
    }
}

function Create-Package {
    Write-Status "Creating deployment package..." "Info"
    
    $publishDir = "bin/Release/net10.0/linux-x64/publish"
    $zipPath = "../waterrefill-api-$Version.zip"
    
    if (!(Test-Path $publishDir)) {
        Write-Status "Publish directory not found. Run build first." "Error"
        exit 1
    }
    
    try {
        # Copy manifest.json to publish directory
        if (Test-Path "manifest.json") {
            Copy-Item "manifest.json" -Destination "$publishDir/"
        }
        
        # Create zip archive
        if (Test-Path $zipPath) {
            Remove-Item $zipPath -Force
        }
        
        Compress-Archive -Path $publishDir -DestinationPath $zipPath
        Write-Status "Package created: $zipPath" "Success"
    }
    catch {
        Write-Status "Packaging failed: $_" "Error"
        exit 1
    }
}

function Build-Docker {
    Write-Status "Building Docker image..." "Info"
    
    try {
        docker build -t waterrefill-api:$Version .
        if ($LASTEXITCODE -ne 0) { throw "Docker build failed" }
        
        Write-Status "Docker image built successfully: waterrefill-api:$Version" "Success"
    }
    catch {
        Write-Status "Docker build failed: $_" "Error"
        exit 1
    }
}

function Push-Docker {
    if (!$OracleNamespace) {
        Write-Status "Oracle namespace is required for Docker push (-OracleNamespace)" "Error"
        exit 1
    }
    
    Write-Status "Pushing Docker image to Oracle Container Registry..." "Info"
    
    $registry = "$OracleRegion.ocir.io"
    $imageName = "$registry/$OracleNamespace/waterrefill-api:$Version"
    
    try {
        # Tag image
        docker tag waterrefill-api:$Version $imageName
        
        # Login to OCIR
        Write-Status "Logging in to Oracle Container Registry..." "Info"
        Write-Status "You may be prompted for credentials. Enter your Oracle Cloud username and auth token." "Warning"
        docker login $registry
        
        # Push image
        docker push $imageName
        if ($LASTEXITCODE -ne 0) { throw "Push failed" }
        
        Write-Status "Image pushed successfully: $imageName" "Success"
    }
    catch {
        Write-Status "Docker push failed: $_" "Error"
        exit 1
    }
}

function Deploy-Application {
    Write-Status "Preparing for deployment to Oracle Cloud..." "Info"
    Write-Status "Next steps:" "Info"
    Write-Host @"
1. Log in to Oracle Cloud Console
2. Navigate to Application Container Cloud Service
3. Click 'Create Application'
4. Select 'DotNet' runtime
5. Upload: waterrefill-api-$Version.zip
6. Configure:
   - Application Name: $ApplicationName
   - Instances: 2 (for HA)
   - Memory: 2GB per instance
7. Set Environment Variables:
   - ASPNETCORE_ENVIRONMENT = Production
   - DB_HOST = your-postgres-host
   - DB_PORT = 5432
   - DB_NAME = waterrefill
   - DB_USER = your-db-user
   - DB_PASSWORD = your-secure-password
   - JWT_KEY = your-super-secret-key
8. Click Create

For detailed instructions, see: ORACLE_DEPLOYMENT.md
"@
    Write-Status "Deployment file: waterrefill-api-$Version.zip" "Info"
}

# Main execution
Test-Prerequisites

switch ($Action) {
    'build' {
        Build-Application
    }
    'package' {
        if (!(Test-Path "bin/Release/net10.0/linux-x64/publish")) {
            Write-Status "Publish folder not found. Building first..." "Warning"
            Build-Application
        }
        Create-Package
    }
    'docker-build' {
        Build-Docker
    }
    'docker-push' {
        if (!(docker images waterrefill-api:$Version -q)) {
            Write-Status "Docker image not found. Building first..." "Warning"
            Build-Docker
        }
        Push-Docker
    }
    'all' {
        Build-Application
        Create-Package
        Build-Docker
    }
    default {
        Write-Status "Unknown action: $Action" "Error"
        exit 1
    }
}

Write-Status "Operation completed successfully!" "Success"
