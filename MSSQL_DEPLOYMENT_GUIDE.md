# WaterRefill API - MSSQL Deployment Guide (FreeASPHosting)

## ✅ Status: Ready for Deployment

Your API has been successfully migrated to **MSSQL** and tested locally with Docker.

---

## 📦 Deployment Package

**File:** `WaterRefill.Api.zip`  
**Size:** ~50-80 MB  
**Contains:** Complete API with MSSQL support, Swagger UI, and all dependencies

---

## 🗄️ Database Configuration

### Production (FreeASPHosting)
```
Server: sql.bsite.net\MSSQL2016SQL
Database: lagarepos_
Username: lagarepos_
Password: Test.123
Encryption: Disabled
```

### Local Testing (Docker)
```
Server: localhost,1433
Database: waterrefill
Username: sa
Password: YourPassword123!
Encryption: Disabled
```

---

## 📤 Deployment Steps

### Step 1: Upload to FreeASPHosting
1. Go to: https://freeasphosting.net/cp/fileManager.aspx
2. Navigate to **root folder** (public_html or domain root)
3. Upload `WaterRefill.Api.zip`
4. Right-click zip → Extract
5. Extract to **root** (not in /api subfolder)

### Step 2: Verify Files Uploaded
Navigate to the extracted folder and verify:
- ✓ `WaterRefill.Api.dll`
- ✓ `WaterRefill.Api.exe`
- ✓ `appsettings.Production.json` ⭐ IMPORTANT
- ✓ `web.config`
- ✓ `Migrations/` folder
- ✓ (100+ dependency DLL files)

### Step 3: Create Database
⚠️ **IMPORTANT:** Before API can start, create the MSSQL database:

**Option A: Automatic Migration (Recommended)**
- API will auto-create database on first run using migrations
- Requires proper permissions

**Option B: Manual Creation**
- Use FreeASPHosting's MSSQL Management panel
- Create database `lagarepos_`
- Assign user `lagarepos_` with full permissions
- Then run migrations: `dotnet ef database update`

### Step 4: Update Frontend API URL
Update your frontend to point to the hosted API:

```typescript
// next.config.ts or environment variable
NEXT_PUBLIC_API_BASE_URL=https://LagarePoS.bsite.net
```

### Step 5: Configure Startup
FreeASPHosting uses `web.config` to start the application automatically:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <aspNetCore processPath="dotnet" 
                  arguments=".\WaterRefill.Api.dll" 
                  stdoutLogEnabled="false" 
                  stdoutLogFile=".\logs\stdout" 
                  hostingModel="outOfProcess" />
    </system.webServer>
  </location>
</configuration>
```

---

## 🔍 Swagger API Documentation

### Access Swagger UI
Once deployed, access the interactive API documentation at:
```
https://LagarePoS.bsite.net/swagger
```

### Testing with Swagger
1. **Authentication:**
   - Click "Authorize" button in Swagger
   - Use `/api/auth/login` endpoint first
   - Copy the returned JWT token
   - Paste in Authorization box: `Bearer <token>`

2. **Try API Endpoints:**
   - Click on any endpoint
   - Click "Try it out"
   - Modify parameters if needed
   - Click "Execute"
   - View response

### Available Endpoints

#### Authentication
- `POST /auth/login` - User login (returns JWT token)

#### Clients
- `GET /clients` - List all clients
- `POST /clients` - Create new client
- `GET /clients/{id}` - Get client details
- `PUT /clients/{id}` - Update client
- `DELETE /clients/{id}` - Delete client

#### Products
- `GET /products` - List products
- `POST /products` - Create product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

#### Sales
- `GET /sales` - List sales
- `POST /sales` - Create sale
- `GET /sales/{id}` - Get sale details

#### Invoices
- `GET /invoices` - List invoices
- `POST /invoices` - Create invoice
- `GET /invoices/{id}/pdf` - Download invoice PDF

#### Reports
- `GET /reports/sales` - Sales analytics
- `GET /reports/sales/csv` - Export to CSV
- `GET /reports/sales/pdf` - Export to PDF

---

## 🧪 Local Testing with Docker

Your app is fully tested locally using MSSQL Docker container:

```bash
# Start MSSQL Docker container
docker compose up -d mssql

# Run migrations
dotnet ef database update

# Start API
dotnet run

# Access Swagger
http://localhost:5000/swagger
```

---

## ⚠️ Important Notes

### JWT Token
- Current key: `YourSuperSecretKeyThatIsAtLeast32CharactersLongForHS256Algorithm`
- **⚠️ Change this in production!**
- Update in `appsettings.Production.json` before deployment

### CORS
Allowed frontend domains:
- `https://lagare-pos.vercel.app`
- `https://LagarePoS.bsite.net`
- `http://localhost:3000` (for local dev)

### Database Constraints
- MSSQL 2016 SQL Server Express Edition
- 5 GB storage limit
- Single database per account

### Health Checks
Monitor API health:
```
GET https://LagarePoS.bsite.net/health
```

---

## 🔧 Troubleshooting

### API Won't Start
1. Check `appsettings.Production.json` exists in folder
2. Verify database connection string is correct
3. Check database exists and user has permissions
4. Review FreeASPHosting logs

### Swagger Not Loading
```
https://LagarePoS.bsite.net/api/swagger
```
If not found, verify:
- API is running (check logs)
- CORS is configured correctly
- Swagger URL is correct

### Database Connection Error
```
Server=sql.bsite.net\MSSQL2016SQL;Database=lagarepos_;User Id=lagarepos_;Password=Test.123;Encrypt=false;
```
Verify:
- Server name matches FreeASPHosting credentials
- Database name is correct (should have underscore)
- Username and password are exact

### 401 Unauthorized
- Token may have expired (60-minute expiration)
- Get new token from `/api/auth/login`
- Demo credentials:
  - Username: `admin`
  - Password: `admin123`

---

## 📝 Default Demo Users

**Admin:**
- Username: `admin`
- Password: `admin123`
- Role: Admin

**Staff:**
- Username: `staff1`
- Password: `staff123`
- Role: Staff

---

## 🚀 Performance Tips

1. **Enable Response Caching** (optional):
   ```csharp
   builder.Services.AddResponseCaching();
   ```

2. **Monitor Database Queries:**
   - Enable query logging in `appsettings.Production.json`
   - Set `Microsoft.EntityFrameworkCore` log level to `Warning`

3. **Use Connection Pooling:**
   - Already configured in connection string
   - Reuses connections for better performance

---

## 📞 Support

If issues arise:
1. Check FreeASPHosting error logs
2. Test locally with Docker first
3. Verify `appsettings.Production.json` configuration
4. Check database permissions

---

**Last Updated:** May 7, 2026  
**API Version:** .NET 9.0 with EF Core  
**Database:** MSSQL 2016 SQL Server Express
