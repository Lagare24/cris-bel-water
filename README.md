# Water Refilling Station Management System

## Project Overview
A complete full-stack management system for water refilling stations built with **.NET 10** and **Next.js 16**.

### ✅ Features Implemented:
- 🔐 **Authentication**: JWT-based login with role-based access (Admin/Staff)
- 👥 **User Management**: CRUD operations with secure password hashing
- 👤 **Client Management**: Track customer information with soft-delete
- 📦 **Product Inventory**: Manage products with pricing, stock, and status
- 💰 **Sales Management**: Multi-item sales with automatic total calculation
- 📊 **Reporting**: Date-filtered sales reports with CSV/PDF export
- 📄 **PDF Invoices**: Professional invoice generation with QuestPDF
- 🎨 **Modern UI**: Responsive Next.js frontend with Tailwind CSS v4
- 🌱 **Demo Data**: Auto-seeded database with sample data for testing

## General Development Instructions

### Backend (.NET 10 Web API)
**Technology Stack:**
- ASP.NET Core Web API (.NET 10.0)
- Entity Framework Core with SQL Server LocalDB
- JWT Authentication with BCrypt password hashing
- QuestPDF for invoice generation
- Swagger/OpenAPI documentation

**Implemented Controllers:**
- `AuthController`: Login with JWT token generation
- `UsersController`: User CRUD with role management
- `ClientsController`: Client management with soft-delete
- `ProductsController`: Product inventory with stock tracking
- `SalesController`: Multi-item sales with automatic pricing
- `ReportsController`: Sales reports with CSV/PDF export

**Services:**
- `PricingService`: Calculates sale totals and applies business rules
- `InvoicePdfService`: Generates professional PDF invoices
- `DataSeeder`: Seeds database with demo data on first run

### Frontend (Next.js 16 + Tailwind CSS v4)
**Technology Stack:**
- Next.js 16.1.1 with App Router and Turbopack
- React 19 with TypeScript (strict mode)
- Tailwind CSS v4 for styling
- Axios for API calls with JWT interceptors

**Implemented Pages:**
- 🔐 `/login` - JWT authentication with token storage
- 📊 `/dashboard` - Overview with sales metrics and quick actions
- 👥 `/clients` - Full CRUD client management with status badges
- 📦 `/products` - Product inventory with price/stock management
- 🛒 `/sales` - Sales listing with date filters and detail modal
- ➕ `/sales/add` - Shopping cart-style sale creation:
  - Multi-product selection with stock validation
  - Dynamic quantity adjustment
  - Real-time subtotal and total calculation
  - Optional client selection (walk-in support)
- 📈 `/reports` - Sales reports with:
  - Date range and client filters
  - Summary statistics (sales count, revenue, items sold)
  - Export buttons for CSV and PDF formats

### Git Workflow
- main branch: stable, deployable
- dev branch: active development
- Feature branches: feature/<module-name>
- Commit messages example:
  - feat(sales): add POST API for sales
  - fix(clients): correct email validation

### Database Schema
**Connection:** SQL Server LocalDB - `(localdb)\MSSQLLocalDB`

**Tables:**
- `Users`: Id, Username, Password (hashed), Email, Role, CreatedAt
- `Clients`: Id, Name, Email, Phone, Address, IsActive, CreatedAt
- `Products`: Id, Name, Description, Price, Quantity, IsActive, CreatedAt
- `Sales`: Id, ClientId (nullable), SaleDate, TotalAmount
- `SaleItems`: Id, SaleId, ProductId, Quantity, UnitPrice

**Migrations Applied:**
- Initial schema creation
- User authentication fields
- Soft-delete support (IsActive)
- Sale-Client relationship (nullable for walk-ins)

**Demo Data Included:**
- 3 users (admin, staff1, staff2)
- 10 clients (various businesses and households)
- 15 products (different water types and containers)
- 30 sales transactions with line items

### AI Usage Guidelines
- Feed instructions in modular chunks per feature
- Focus AI on boilerplate code generation
- Manually review business rules, UX, and validation
- Commit and test generated code frequently
- Keep naming generic inside the code for reusability

## Getting Started

### Prerequisites
- .NET 10.0 SDK
- Node.js 18+ and npm
- SQL Server LocalDB (included with Visual Studio)

### 1. Clone the Repository
```bash
git clone https://github.com/<username>/cris-bel-water.git
cd cris-bel-water
```

### 2. Backend Setup
```bash
cd WaterRefill.Api
dotnet restore
dotnet tool update --global dotnet-ef
dotnet ef database update
```

The database will be **automatically seeded** with demo data on first run.

### 3. Frontend Setup
```bash
cd ../water-refill-frontend
npm install
```

### 4. Configuration

**Backend** (`appsettings.json`):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=WaterRefillDB;Trusted_Connection=True;"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyHere123456789",
    "Issuer": "WaterRefillAPI",
    "Audience": "WaterRefillClient"
  }
}
```

**Frontend** (`.env.local` - optional):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5179
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd WaterRefill.Api
dotnet run
```
API will run on: `http://localhost:5000`
Swagger UI: `http://localhost:5000/swagger`

**Terminal 2 - Frontend:**
```bash
cd water-refill-frontend
npm run dev
```
App will run on: `http://localhost:3000`

### 6. Login with Demo Credentials
- **Admin**: `admin` / `admin123`
- **Staff**: `staff1` / `staff123`

## Feature Development Status

### Backend ✅ Complete
- ✅ Authentication API (JWT)
- ✅ Users CRUD API
- ✅ Clients CRUD API with soft-delete
- ✅ Products CRUD API with soft-delete
- ✅ Sales CRUD API with multi-item support
- ✅ SaleItems automatic handling
- ✅ PricingService for business logic
- ✅ PDF Invoice generation (QuestPDF)
- ✅ CSV Export for reports
- ✅ Reports API with filters
- ✅ Database seeding with demo data
- ⬜ Email invoices (future enhancement)

### Frontend ✅ Complete
- ✅ Login page with JWT authentication
- ✅ Dashboard with metrics and quick actions
- ✅ Clients management (CRUD with modals)
- ✅ Products management (CRUD with stock)
- ✅ Sales listing with filters and details
- ✅ Sales creation (multi-product cart)
- ✅ Reports page with CSV/PDF export
- ✅ Responsive navigation and UI
- ⬜ User profile/settings (future)
- ⬜ Advanced analytics charts (future)

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Login with username/password, returns JWT token

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Clients
- `GET /api/clients` - Get all active clients
- `GET /api/clients/{id}` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Soft-delete client

### Products
- `GET /api/products` - Get all active products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Soft-delete product

### Sales
- `GET /api/sales` - Get sales with optional filters (startDate, endDate, clientId)
- `GET /api/sales/{id}` - Get sale with line items
- `POST /api/sales` - Create new sale with items
- `GET /api/sales/{id}/invoice/pdf` - Download PDF invoice

### Reports
- `GET /api/reports/sales` - Get sales summary (totalSales, totalRevenue, totalQuantity)
- `GET /api/reports/sales/csv` - Export sales report as CSV
- `GET /api/reports/sales/pdf` - Export sales report as PDF

**Note:** All endpoints except `/api/auth/login` require JWT Bearer token authentication.

## Project Structure

```
cris-bel-water/
├── WaterRefill.Api/              # Backend (.NET 10)
│   ├── Controllers/              # API endpoints
│   ├── Data/                     # DbContext and seeder
│   ├── DTOs/                     # Data transfer objects
│   ├── Models/                   # Entity models
│   ├── Services/                 # Business logic
│   └── Program.cs                # App configuration
│
├── water-refill-frontend/        # Frontend (Next.js 16)
│   ├── app/                      # App router pages
│   │   ├── clients/              # Client management
│   │   ├── dashboard/            # Dashboard page
│   │   ├── login/                # Login page
│   │   ├── products/             # Product management
│   │   ├── reports/              # Reports page
│   │   └── sales/                # Sales pages
│   ├── components/               # Reusable components
│   ├── lib/                      # API client (Axios)
│   └── public/                   # Static assets
│
└── README.md                     # This file
```

## Development Notes
- Branch naming: `feature/<module-name>`, `fix/<issue>`
- Commit frequently and push to `dev` branch first
- Test new features with demo data before production
- Review generated code for business logic accuracy

## License
MIT License (optional)
