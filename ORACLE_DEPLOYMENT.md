# Oracle Cloud Deployment Guide - WaterRefill.Api

## Prerequisites

1. **Oracle Cloud Account** - With Application Container Cloud Service or Container Registry access
2. **.NET 10.0 SDK** - Installed on your local machine
3. **Docker** - For containerized deployment (optional but recommended)
4. **Oracle Cloud CLI** - For command-line deployment
5. **PostgreSQL Instance** - Running on Oracle Cloud or external provider

## Step 1: Configure Your PostgreSQL Database on Oracle Cloud

### Option A: Oracle Database PostgreSQL Service
1. Navigate to Oracle Cloud Console
2. Create a PostgreSQL Database instance
3. Note the connection details:
   - Host
   - Port (typically 5432)
   - Database name
   - Username
   - Password

### Option B: External PostgreSQL Provider
You can use services like:
- AWS RDS for PostgreSQL
- Azure Database for PostgreSQL
- Any PostgreSQL instance accessible from Oracle Cloud

## Step 2: Prepare Environment Variables

Before deployment, set up these environment variables on Oracle Cloud:

```
ASPNETCORE_ENVIRONMENT=Production
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=waterrefill
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
JWT_KEY=your-super-secret-jwt-key-min-32-chars
PORT=8080 (automatically set by Oracle Cloud)
```

## Step 3: Deployment Options

### Option A: Using Oracle Application Container Cloud Service (Recommended for .NET)

#### 3A.1 Build the Application Locally

```powershell
cd WaterRefill.Api
dotnet restore
dotnet build -c Release
dotnet publish -c Release -r linux-x64 --self-contained
```

#### 3A.2 Prepare Deployment Package

1. Navigate to the publish directory:
   ```
   WaterRefill.Api/bin/Release/net10.0/linux-x64/publish
   ```

2. Create a deployment archive:
   ```powershell
   # Copy manifest.json to the publish directory
   Copy-Item manifest.json -Destination bin/Release/net10.0/linux-x64/publish/

   # Create zip archive
   Compress-Archive -Path bin/Release/net10.0/linux-x64/publish -DestinationPath waterrefill-api.zip
   ```

#### 3A.3 Deploy via Oracle Cloud Console

1. Open Oracle Cloud Console
2. Navigate to **Application Container Cloud Service**
3. Click **Create Application**
4. Select **DotNet** as runtime
5. Upload `waterrefill-api.zip`
6. Configure:
   - **Application Name**: waterrefill-api
   - **Instances**: 2 (for HA)
   - **Memory**: 2GB per instance
7. Add environment variables:
   - Under "Deployment Variables", add all environment variables from Step 2
8. Click **Create**
9. Wait for deployment to complete (typically 3-5 minutes)

#### 3A.4 Get Application URL

Once deployed, Oracle Cloud will provide you with a URL like:
```
https://waterrefill-api-{timestamp}.{region}.container.cloud.oracle.com
```

---

### Option B: Using Oracle Container Registry + Kubernetes (More Flexible)

#### 3B.1 Build Docker Image

```powershell
# Build the Docker image
docker build -t waterrefill-api:1.0.0 .

# Tag for Oracle Container Registry
docker tag waterrefill-api:1.0.0 {region}.ocir.io/{namespace}/waterrefill-api:1.0.0
```

#### 3B.2 Push to Oracle Container Registry

```powershell
# Login to OCIR
docker login {region}.ocir.io

# Push image
docker push {region}.ocir.io/{namespace}/waterrefill-api:1.0.0
```

#### 3B.3 Deploy to OKE (Oracle Kubernetes Engine)

See the included `k8s-deployment.yaml` for Kubernetes deployment configuration.

---

### Option C: Standalone VM Deployment

For simpler deployments on a compute instance:

```bash
# On Oracle Cloud Compute Instance (Ubuntu/Linux)

# Install .NET runtime
sudo apt-get update
sudo apt-get install -y dotnet-runtime-10.0

# Copy application files
scp -r WaterRefill.Api/bin/Release/net10.0/linux-x64/publish/* user@instance:/opt/waterrefill/

# Create systemd service
sudo nano /etc/systemd/system/waterrefill.service
```

Add the following content:
```ini
[Unit]
Description=WaterRefill API Service
After=network.target

[Service]
Type=simple
User=waterrefill
WorkingDirectory=/opt/waterrefill
ExecStart=/usr/bin/dotnet /opt/waterrefill/WaterRefill.Api.dll
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="ASPNETCORE_ENVIRONMENT=Production"
Environment="DB_HOST={your-db-host}"
Environment="DB_PORT=5432"
Environment="DB_NAME=waterrefill"
Environment="DB_USER={db-user}"
Environment="DB_PASSWORD={db-password}"
Environment="JWT_KEY={jwt-key}"

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable waterrefill
sudo systemctl start waterrefill
sudo systemctl status waterrefill
```

---

## Step 4: Database Migrations

### Run migrations before or after deployment:

#### Option A: During Build
The application automatically runs migrations on startup via `DataSeeder.SeedDataAsync()` in Program.cs.

#### Option B: Manual Migration
```powershell
# From the API directory
dotnet ef database update -c WaterRefillContext
```

---

## Step 5: Verify Deployment

Once deployed, verify with:

```powershell
# Check API health
Invoke-WebRequest -Uri "https://your-app-url/swagger"

# Check specific endpoints
Invoke-WebRequest -Uri "https://your-app-url/api/products"
```

---

## Step 6: Configure Frontend

Update your Next.js frontend to point to the deployed API:

In `water-refill-frontend/lib/api.ts`, update the base URL:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  'https://your-oracle-cloud-app-url';
```

---

## Troubleshooting

### Common Issues

1. **Connection refused to PostgreSQL**
   - Verify database credentials in environment variables
   - Check security group rules allow access from app to database
   - Ensure database is running

2. **JWT key not found**
   - Confirm `JWT_KEY` environment variable is set
   - Must be at least 32 characters

3. **Port binding errors**
   - Don't hardcode ports; use `Environment.GetEnvironmentVariable("PORT")`
   - This is already configured in the updated Program.cs

4. **SSL/TLS errors**
   - Add SSL Mode=Require to PostgreSQL connection string
   - This is configured in appsettings.Production.json

### View Logs

**Oracle Application Container Cloud Service:**
```
Navigate to Application Console → Select your app → View Logs
```

**Docker/Kubernetes:**
```bash
kubectl logs deployment/waterrefill-api
docker logs {container-id}
```

---

## Performance & Security Considerations

1. **Enable HTTPS**: Oracle Cloud provides free SSL certificates
2. **Auto-scaling**: Configure based on CPU/memory metrics
3. **Database Backup**: Set up automated PostgreSQL backups
4. **Monitoring**: Use Oracle Application Performance Monitoring
5. **Security**: Update CORS origins in appsettings.Production.json to match frontend URL
6. **JWT Secret**: Use a strong, unique JWT key (min 32 characters)

---

## Rollback Plan

To rollback to previous version:
1. Keep previous .zip/Docker image
2. In Oracle Cloud Console, stop current version
3. Deploy previous package with same name (will replace)

---

## Additional Resources

- [Oracle Application Container Cloud Service Documentation](https://docs.oracle.com/en/cloud/paas/app-container-cloud/index.html)
- [.NET Core Deployment Guide](https://docs.microsoft.com/en-us/dotnet/core/deploying/index)
- [PostgreSQL Connection Strings](https://www.npgsql.org/doc/connection-string-parameters.html)
