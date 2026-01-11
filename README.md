# Water Refilling Station Management System

## Project Overview
A complete full-stack management system for water refilling stations built with **.NET 10** and **Next.js 16**. Features a modern, minimalist UI with professional navy theme and comprehensive inventory management.

### ✨ Key Features:
- 🔐 **Authentication**: JWT-based login with role-based access (Admin/Staff)
- 👥 **User Management**: CRUD operations with secure password hashing
- 👤 **Client Management**: Track customer information with walk-in support
- 📦 **Smart Inventory**: Real-time stock tracking with automatic updates
- 💰 **Sales Management**: Multi-item sales with stock validation
- 📊 **Reporting**: Date-filtered sales reports with CSV/PDF export
- 📄 **PDF Invoices**: Professional invoice generation with QuestPDF
- 🎨 **Minimalist UI**: Clean, professional interface with navy theme
- 🌓 **Dark Mode**: Seamless theme switching for extended use
- 📱 **Responsive**: Works perfectly on desktop, tablet, and mobile
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
- `DataSeeder`: Seeds database with demo data including Walk-in Customer

**Key Backend Features:**
- ✅ **Inventory Management**: Automatic stock reduction on sales
- ✅ **Stock Validation**: Prevents overselling with detailed error messages
- ✅ **Walk-in Support**: Default client for anonymous customers
- ✅ **Transaction Safety**: Database transactions ensure data consistency
- ✅ **Soft Deletes**: Preserve data integrity with IsActive flags

### Frontend (Next.js 16 + Tailwind CSS v4)
**Technology Stack:**
- Next.js 16.1.1 with App Router and Turbopack
- React 19 with TypeScript (strict mode)
- Tailwind CSS v4 with custom navy theme
- shadcn/ui components for modern, accessible UI
- TanStack Table for advanced data tables
- next-themes for dark mode support
- Axios for API calls with JWT interceptors
- Sonner for toast notifications

**Design System:**
- **Theme**: Professional navy (#0044ad) with neutral accents
- **Dark Mode**: Full support with optimized contrast
- **Components**: shadcn/ui for consistent, accessible design
- **Animations**: Smooth transitions and loading states
- **Typography**: System fonts for optimal readability

**Implemented Pages:**
- 🔐 `/login` - JWT authentication with modern card design
- 📊 `/dashboard` - Overview with:
  - Animated statistics cards
  - Quick action shortcuts
  - Real-time data display
- 👥 `/clients` - Full CRUD with advanced features:
  - Searchable, sortable data table
  - Status badges (Active/Inactive)
  - Modal-based forms
  - Inline editing
- 📦 `/products` - Inventory management with:
  - Color-coded stock levels (🔴 Low, 🟡 Medium, 🟢 In Stock)
  - Real-time stock updates
  - Price and quantity tracking
  - Search and filter capabilities
- 🛒 `/sales` - Sales management:
  - Advanced filtering (date range, client)
  - Detailed sale view modal
  - Professional invoice display
- ➕ `/sales/add` - Shopping cart experience:
  - Multi-product selection with live stock check
  - Dynamic quantity adjustment (+/- buttons)
  - Real-time subtotal and total calculation
  - Walk-in customer support (default client)
  - Stock validation before submission
- 📈 `/reports` - Business intelligence:
  - Date range and client filters
  - Summary statistics with animated cards
  - CSV export for Excel/accounting
  - PDF export for presentations

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
- 11 clients including Walk-in Customer (ID: 1)
- 15 products (various water types, containers, services)
- 30 sales transactions with line items
- Realistic stock levels and pricing

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
App will run on: `http://localhost:4000`

### 6. Login with Demo Credentials
- **Admin**: `admin` / `admin123` (full access)
- **Staff**: `staff1` / `staff123` (limited access)

### 7. Explore the Demo
See [DEMO_FLOW.md](./DEMO_FLOW.md) for a comprehensive demonstration guide.

## Feature Development Status

### Backend ✅ Complete
- ✅ Authentication API (JWT)
- ✅ Users CRUD API
- ✅ Clients CRUD API with soft-delete
- ✅ Products CRUD API with soft-delete
- ✅ Sales CRUD API with multi-item support
- ✅ **Automatic inventory management**
- ✅ **Stock validation on sale creation**
- ✅ SaleItems automatic handling
- ✅ PricingService for business logic
- ✅ PDF Invoice generation (QuestPDF)
- ✅ CSV Export for reports
- ✅ Reports API with filters
- ✅ Database seeding with Walk-in Customer
- ✅ Transaction-safe operations
- ⬜ Email invoices (future enhancement)
- ⬜ Low stock alerts (future enhancement)

### Frontend ✅ Complete
- ✅ Login page with modern design
- ✅ Dashboard with animated statistics
- ✅ Dark mode support with theme toggle
- ✅ Clients management (advanced data table)
- ✅ Products management (stock indicators)
- ✅ Sales listing with filters and details
- ✅ Sales creation (cart with stock validation)
- ✅ Reports page with CSV/PDF export
- ✅ Responsive navigation and UI
- ✅ Toast notifications (success/error)
- ✅ Loading states and skeletons
- ✅ Empty states with helpful messages
- ✅ Professional minimalist design
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
- `GET /api/sales/{id}` - Get sale with line items and client details
- `POST /api/sales` - Create new sale with automatic stock reduction
  - Validates stock availability before processing
  - Reduces product quantities automatically
  - Supports walk-in customers (clientId can be null or 1)
  - Returns detailed errors for insufficient stock
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
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── data-table/           # Advanced table components
│   │   └── ...                   # Custom components
│   ├── lib/                      # Utilities and API client
│   └── public/                   # Static assets
│
├── DEMO_FLOW.md                  # Demonstration guide
└── README.md                     # This file
```

## UI/UX Highlights

### Design Philosophy
- **Minimalist**: Clean, distraction-free interface focusing on essential information
- **Professional**: Navy (#0044ad) theme conveys trust and reliability
- **Accessible**: High contrast ratios, keyboard navigation, screen reader support
- **Responsive**: Mobile-first design that adapts to any screen size

### Color Palette
- **Primary Navy**: `#0044ad` - Main theme color for buttons, accents
- **Neutral Grays**: `slate-800`, `slate-600` - Secondary elements
- **Dark Mode**: Optimized colors for comfortable night viewing
- **Status Colors**: Red (low stock), Yellow (medium), Green (in stock)

### User Experience
- ⚡ **Fast**: Optimized loading with skeleton states
- 🎯 **Intuitive**: Consistent patterns across all pages
- ✅ **Feedback**: Toast notifications for all actions
- 🔍 **Searchable**: Quick find in all data tables
- 📊 **Visual**: Color-coded stock levels, status badges

## Development Notes
- Branch naming: `feature/<module-name>`, `fix/<issue>`
- Commit frequently and push to `dev` branch first
- Test new features with demo data before production
- Review generated code for business logic accuracy
- Stock levels update automatically on sale creation
- Walk-in Customer (ID: 1) is the default for anonymous sales

## Troubleshooting

### Frontend shows "Network Error"
- Ensure backend API is running on `http://localhost:5179`
- Check CORS settings in backend `Program.cs`

### Stock not updating after sale
- Restart backend API to apply inventory management code
- Check browser console for API errors

### Dark mode not working
- Clear browser cache and reload
- Check if theme toggle button is visible in navbar

### Database seed fails
- Drop database: `dotnet ef database drop --force`
- Recreate: `dotnet ef database update`

## Demo & Presentation
See [DEMO_FLOW.md](./DEMO_FLOW.md) for:
- Complete 15-20 minute demonstration script
- What to say at each step
- Q&A preparation
- Tips for successful client presentation

## License
MIT License
