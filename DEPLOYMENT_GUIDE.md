# WaterRefill API - Deployment Guide for freeasphosting.net

## ✅ Configuration Summary

Your production configuration has been set up with the following values:

### **Database Configuration**
- **Host:** `localhost`
- **Port:** `5432`
- **Database Name:** `lagarepos_waterrefill`
- **Username:** `lagarepos_wr`
- **Password:** `Test.123`
- **Database Type:** PostgreSQL

### **Frontend CORS Origins** (Allowed domains)
- `https://lagare-pos.vercel.app` (Your Vercel frontend)
- `https://LagarePoS.bsite.net` (Your hosting domain)
- `http://localhost:3000` (Local development)

### **JWT Configuration**
- **Key:** `YourSuperSecretKeyThatIsAtLeast32CharactersLongForHS256Algorithm`
- **Issuer:** `WaterRefill.Api`
- **Audience:** `WaterRefill.Api`
- **Token Expiration:** 60 minutes

---

## 📦 Deployment Steps

### **Step 1: Create PostgreSQL Database**

Contact freeasphosting and:
1. Request PostgreSQL database credentials (they may only offer SQL Server by default)
2. Or use a managed PostgreSQL service:
   - [ElephantSQL](https://www.elephantsql.com/) (Free tier available)
   - [Supabase](https://supabase.com/) (Free tier available)
   - [Railway.app](https://railway.app/) (Easy PostgreSQL hosting)

Once you have credentials, update `appsettings.Production.json`:
```json
"DefaultConnection": "Host=YOUR_DB_HOST;Port=5432;Database=YOUR_DB_NAME;Username=YOUR_USER;Password=YOUR_PASSWORD;Include Error Detail=true;"
```

### **Step 2: Upload Files via freeasphosting File Manager**

1. Open `publish` folder at: `C:\Users\Full Scale\Documents\GitHub\cris-bel-water\WaterRefill.Api\publish`
2. In freeasphosting file manager, create folder: `/api` or `/backend`
3. Upload **all contents** from `publish` folder:
   - `WaterRefill.Api.dll`
   - `appsettings.json`
   - `appsettings.Production.json` ⭐ **IMPORTANT**
   - `web.config`
   - All other runtime files

### **Step 3: Create/Update web.config**

If web.config doesn't exist in the publish folder, create it:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <aspNetCore processPath="dotnet" arguments=".\WaterRefill.Api.dll" stdoutLogEnabled="false" stdoutLogFile=".\logs\stdout" hostingModel="outOfProcess" />
    </system.webServer>
  </location>
</configuration>
```

### **Step 4: Update Frontend API URL**

In your frontend (`water-refill-frontend`), update the API URL:

```typescript
// next.config.ts
NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://LagarePoS.bsite.net/api",
```

Or use environment variable on Vercel:
```
NEXT_PUBLIC_API_BASE_URL=https://LagarePoS.bsite.net/api
```

### **Step 5: Test the API**

Once deployed, test the endpoints:
```
GET https://LagarePoS.bsite.net/api/swagger - API Documentation
POST https://LagarePoS.bsite.net/api/auth/login - Login endpoint
```

---

## ⚠️ Important Notes

### **Database Issue**
Your project uses **PostgreSQL**, but freeasphosting may only provide SQL Server. You need to:
- **Option A:** Use a separate PostgreSQL hosting service (recommended)
- **Option B:** Migrate your project to SQL Server (requires code changes)

### **Environment Variables**
Set these in freeasphosting control panel (if available):
```
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Host=...;Database=...;
```

### **Security Notes**
- ⚠️ **Change the JWT Key** in production to something more secure
- ⚠️ **Update database password** after first deployment
- ⚠️ **Enable SSL** in your PostgreSQL connection string if required

---

## 📋 Placeholder Meanings

| Placeholder | Meaning | Your Value |
|-------------|---------|-----------|
| `{DB_HOST}` | Database server hostname | `localhost` (or your PostgreSQL host) |
| `{DB_PORT}` | PostgreSQL port | `5432` |
| `{DB_NAME}` | Database name | `lagarepos_waterrefill` |
| `{DB_USER}` | Database username | `lagarepos_wr` |
| `{DB_PASSWORD}` | Database password | `Test.123` |
| `{JWT_KEY}` | JWT signing key (keep long!) | Already set |
| `CORS Origins` | Allowed frontend domains | vercel.app + bsite.net |

---

## 🔗 Next Steps

1. **Verify PostgreSQL availability** on freeasphosting (or choose alternative)
2. **Upload the `publish` folder contents** via file manager
3. **Test API endpoints** from browser or Postman
4. **Update frontend** to point to your hosted API
5. **Monitor logs** in freeasphosting control panel

Questions? Check the API logs at: `https://LagarePoS.bsite.net/api/swagger`
