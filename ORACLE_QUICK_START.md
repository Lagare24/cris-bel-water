# Oracle Cloud Deployment - Quick Start

## What Was Set Up

I've prepared your WaterRefill.Api project for Oracle Cloud deployment. Here's what was created:

### Files Created/Modified:

1. **Program.cs** ✅ Modified
   - Added dynamic PORT binding for Oracle Cloud
   - App now listens on environment variable `PORT`

2. **appsettings.Production.json** ✅ New
   - Production configuration with placeholder environment variables
   - Configured for PostgreSQL with SSL

3. **manifest.json** ✅ New
   - Oracle Application Container Cloud Service deployment manifest
   - Specifies .NET 10.0 runtime

4. **Dockerfile** ✅ New
   - Multi-stage Docker build for optimized image size
   - Based on .NET 10.0 runtime
   - Includes health check endpoint

5. **.dockerignore** ✅ New
   - Optimizes Docker build context

6. **k8s-deployment.yaml** ✅ New
   - Kubernetes deployment for OKE (Oracle Kubernetes Engine)
   - Includes autoscaling, health checks, security policies

7. **deploy.ps1** ✅ New
   - PowerShell automation script for deployment
   - Supports building, packaging, and Docker operations

8. **ORACLE_DEPLOYMENT.md** ✅ New
   - Comprehensive deployment guide with 3 deployment options

---

## Quick Start (Choose Your Deployment Method)

### Option 1: Oracle Application Container Cloud Service (Easiest) ⭐

```powershell
# 1. Build and package the application
cd WaterRefill.Api
.\deploy.ps1 -Action build
.\deploy.ps1 -Action package

# 2. Create a file called .env with your production settings:
# ASPNETCORE_ENVIRONMENT=Production
# DB_HOST=your-postgres-host
# DB_USER=your-db-user
# DB_PASSWORD=your-password
# JWT_KEY=your-secret-key-min-32-chars

# 3. Go to Oracle Cloud Console
#    → Application Container Cloud Service
#    → Create Application → DotNet
#    → Upload waterrefill-api-1.0.0.zip
#    → Add environment variables
#    → Create
```

**Expected Result:** Your API will be live at a URL like:
```
https://waterrefill-api-timestamp.us-phoenix-1.container.cloud.oracle.com
```

---

### Option 2: Docker + Oracle Container Registry

```powershell
# 1. Build Docker image
.\deploy.ps1 -Action docker-build

# 2. Push to Oracle Container Registry
.\deploy.ps1 -Action docker-push -OracleNamespace yourNamespace

# 3. Deploy to OKE (Kubernetes)
kubectl apply -f k8s-deployment.yaml
```

---

### Option 3: Standalone VM

```bash
# On your Oracle Cloud Compute instance:
sudo apt-get update
sudo apt-get install -y dotnet-runtime-10.0

# Copy files and set up systemd service
# (See ORACLE_DEPLOYMENT.md for detailed steps)
```

---

## Environment Variables You Need

Before deploying, prepare these values:

```
ASPNETCORE_ENVIRONMENT=Production          # Keep this
DB_HOST=postgres.xxxxx.oracle.com          # Your PostgreSQL host
DB_PORT=5432                                # Usually 5432
DB_NAME=waterrefill                         # Database name
DB_USER=postgres_user                       # DB username
DB_PASSWORD=secure_password                 # DB password
JWT_KEY=your-secret-min-32-chars           # JWT signing key (32+ chars!)
CORS_ORIGINS=https://your-frontend-url    # Your frontend URL
```

---

## Database Setup

You need a PostgreSQL database. Choose one:

1. **Oracle Database Service for PostgreSQL** (Recommended for Oracle Cloud)
2. **AWS RDS for PostgreSQL** (Works fine from Oracle Cloud)
3. **Azure Database for PostgreSQL** (Works fine)
4. **Self-hosted PostgreSQL on Oracle Compute** (More work to manage)

Once created, note the connection details and set environment variables.

---

## Verify Everything Works

After deployment:

```powershell
# Test API health
Invoke-WebRequest -Uri "https://your-app-url/swagger"

# Test database connection
Invoke-WebRequest -Uri "https://your-app-url/api/products"

# View logs in Oracle Console
# → Application → View Logs
```

---

## Troubleshooting Checklist

- [ ] PostgreSQL connection string is correct
- [ ] JWT_KEY is set and at least 32 characters
- [ ] DATABASE_PASSWORD is URL-encoded if it contains special chars
- [ ] CORS origins include your frontend URL
- [ ] PORT environment variable is used (already configured)
- [ ] Security groups allow traffic on port 8080
- [ ] Database backups are configured

---

## Next Steps

1. **Create Oracle Cloud Account** (if you don't have one)
2. **Set up PostgreSQL database** on Oracle Cloud or external provider
3. **Gather credentials** (DB host, user, password, JWT key)
4. **Run deployment script** or follow ORACLE_DEPLOYMENT.md
5. **Test the API** from the deployed URL
6. **Update frontend** to point to new API URL
7. **Monitor logs** in Oracle Cloud Console

---

## Files to Reference

- **Detailed Guide:** [ORACLE_DEPLOYMENT.md](ORACLE_DEPLOYMENT.md)
- **Deployment Script:** [deploy.ps1](deploy.ps1)
- **Kubernetes Config:** [k8s-deployment.yaml](k8s-deployment.yaml)
- **Docker Config:** [Dockerfile](Dockerfile)

---

## Support & Questions

- **Oracle Cloud Docs:** https://docs.oracle.com/en/cloud/paas/app-container-cloud/
- **Npgsql Connection Strings:** https://www.npgsql.org/doc/connection-string-parameters.html
- **ASP.NET Core Deployment:** https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/

---

**Ready to deploy?** Start with Option 1 - it's the simplest!
