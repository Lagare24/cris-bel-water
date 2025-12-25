# Water Refilling Station Management System

## Project Overview
This is a generic management system for water refilling stations. It provides tools to manage:
- User management (admin/staff)
- Client management
- Product inventory
- Sales and sale items tracking
- Invoice generation (PDF/email)
- Reporting (daily/monthly)

This project is structured for easy AI-assisted development while keeping business logic and UX review in human control.

## General Development Instructions

### Backend (.NET 8 Web API)
- Use WaterRefillContext as DbContext
- Implement controllers for:
  - Users
  - Clients
  - Products
  - Sales
  - SaleItems
- Use proper HTTP status codes for all endpoints
- Include input validation for models
- Automatically calculate totals in Sales from SaleItems
- Generate PDF invoices using QuestPDF
- Email invoices optionally using MailKit

### Frontend (Next.js + Tailwind)
- Pages:
  - /login
  - /dashboard
  - /clients
  - /products
  - /sales
  - /sales/add
  - /reports
- Use Axios for API calls
- Forms should validate user inputs
- /sales/add page:
  - Allow multiple products with quantity
  - Automatically calculate subtotal and total
- Dashboard provides overview metrics and quick links to reports

### Git Workflow
- main branch: stable, deployable
- dev branch: active development
- Feature branches: feature/<module-name>
- Commit messages example:
  - feat(sales): add POST API for sales
  - fix(clients): correct email validation

### Database
- SQL Server (LocalDB) connection: (localdb)\MSSQLLocalDB
- Tables:
  - Users
  - Clients
  - Products
  - Sales
  - SaleItems
- Use EF Core migrations to update schema

### AI Usage Guidelines
- Feed instructions in modular chunks per feature
- Focus AI on boilerplate code generation
- Manually review business rules, UX, and validation
- Commit and test generated code frequently
- Keep naming generic inside the code for reusability

## Getting Started
1. Clone the repository
git clone https://github.com/<username>/cris-bel-water.git
cd cris-bel-water

2. Backend setup
cd WaterRefill.Api
dotnet restore
dotnet tool update --global dotnet-ef
dotnet ef database update

3. Frontend setup
cd water-refill-frontend
npm install
npm run dev

4. Configure appsettings.json connection string
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=WaterRefillDB;Trusted_Connection=True;"
  }
}

5. Run backend and frontend servers simultaneously
6. Open browser to http://localhost:3000 (frontend)

## Feature Development Checklist (for AI/Copilot)
### Backend
- [ ] Users CRUD API
- [ ] Clients CRUD API
- [ ] Products CRUD API
- [ ] Sales CRUD API
- [ ] SaleItems CRUD API
- [ ] PDF Invoice generation
- [ ] Email invoices (optional)

### Frontend
- [ ] Login page
- [ ] Dashboard page
- [ ] Clients management page
- [ ] Products management page
- [ ] Sales listing page
- [ ] Sales add/edit page with auto totals
- [ ] Reports page (daily/monthly)

## Notes
- Keep branch naming consistent: feature/<module-name>
- Always commit incremental changes and push to dev first
- AI-generated code is a boilerplate; ensure manual review for accuracy and business rules

## License
MIT License (optional)
