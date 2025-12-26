# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Water Refilling Station Management System - Frontend application built with Next.js 16, React 19, and TypeScript. Features a modern glassmorphism design with navy/teal color scheme and dark mode support.

## Development Commands

```bash
# Start development server (default: http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Backend Connection

The frontend connects to a .NET backend API running on port 5179. Configure via environment variable:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:5179
```

**API Client**: `lib/api.ts` is an Axios instance with:
- Automatic JWT token attachment from localStorage
- Request/response logging (verbose console output)
- 401 redirect to /login on unauthorized responses
- Base URL defaulting to http://localhost:5179

## Architecture

### Tech Stack
- **Next.js 16.1.1** with App Router (not Pages Router)
- **React 19.2.3** - Client components with "use client" directive
- **TypeScript 5.9.3**
- **Tailwind CSS 4.1.18** - CRITICAL: Uses v4 syntax (breaking changes from v3)
- **shadcn/ui** - Component library built on Radix UI primitives
- **TanStack Table** - For advanced data tables
- **Recharts** - For chart visualizations
- **next-themes** - Dark mode implementation
- **Sonner** - Toast notifications
- **Lucide React** - Icon library

### Design System

**Color Scheme**: Professional Navy (#0056e0) + Teal (#00e6c3)
- Primary: Navy-500 (#0056e0) for main actions, sales metrics
- Accent: Teal-500 (#00e6c3) for revenue, highlights
- Full palettes defined in `tailwind.config.ts` (50-950 shades)

**Glassmorphism Utilities**:
```css
.glass-card      /* Standard glass card with backdrop blur */
.glass-nav       /* Navigation bar glass effect */
.glass           /* Basic glass effect */
```

**Theme Variables**: Uses HSL CSS custom properties for light/dark modes
- Defined in `app/globals.css` under `:root` and `.dark`
- Semantic colors: --primary, --secondary, --accent, --destructive, --muted, etc.

### Critical Tailwind CSS 4 Compatibility

**IMPORTANT**: Tailwind CSS 4 has breaking changes from v3. When adding custom styles:

❌ **DO NOT USE** `@apply` with custom color utilities:
```css
/* WRONG - Will cause build errors */
.my-class {
  @apply bg-navy-500 text-teal-400;
}
```

✅ **USE** vanilla CSS with direct hex values or CSS variables:
```css
/* CORRECT */
.my-class {
  background-color: #0056e0;  /* Direct hex */
  color: hsl(var(--primary));  /* CSS variable */
}

.dark .my-class {
  background-color: #4d94ff;  /* Dark mode variant */
}
```

**Reference**: See `app/globals.css` scrollbar styling (lines 102-134) for correct v4 patterns.

### Page Structure

All pages follow this pattern:
```tsx
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { PageHeader } from "@/components/page-header";
// ... shadcn components, icons, toast
import api from "@/lib/api";

export default function Page() {
  // State management
  // API calls with try/catch and toast notifications
  // Return JSX with navy/teal gradient background
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 via-background to-teal-50 dark:from-navy-950 dark:via-background dark:to-teal-950">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="..." description="..." />
        {/* Content with glass-card styling */}
      </div>
    </div>
  );
}
```

### Component Organization

**shadcn/ui components**: `components/ui/` (23 components)
- Installed via `npx shadcn@latest add <component>`
- DO NOT edit these directly (they're auto-generated)
- Configuration in `components.json`

**Custom reusable components**:
- `components/Navbar.tsx` - Main navigation with theme toggle
- `components/page-header.tsx` - Consistent page titles
- `components/stats-card.tsx` - Animated stat cards with number counters
- `components/loading.tsx` - LoadingSpinner and skeleton loaders
- `components/empty-state.tsx` - Empty data displays
- `components/confirmation-dialog.tsx` - Reusable delete confirmations

**Data table suite**: `components/data-table/`
- `data-table.tsx` - Generic table with TanStack Table (TypeScript generics)
- `data-table-toolbar.tsx` - Search and filters
- `data-table-column-header.tsx` - Sortable headers
- `data-table-pagination.tsx` - Pagination controls

**Chart components**: `components/charts/`
- `line-chart.tsx`, `bar-chart.tsx`, `pie-chart.tsx`, `area-chart.tsx`
- All use Recharts with glass-card containers
- Navy/teal color schemes with dark mode support

### Data Flow Patterns

**API Requests**:
```tsx
const fetchData = async () => {
  try {
    const response = await api.get("/api/endpoint");
    setData(response.data || []);
  } catch (err) {
    console.error("Error:", err);
    toast.error("Failed to fetch data");
  } finally {
    setLoading(false);
  }
};
```

**Form Submissions**:
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSubmitting(true);

  try {
    await api.post("/api/endpoint", payload);
    toast.success("Success message");
    router.push("/redirect");
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Default error";
    setError(errorMsg);
    toast.error(errorMsg);
  } finally {
    setSubmitting(false);
  }
};
```

**DataTable Column Definitions**:
```tsx
const columns: ColumnDef<Type>[] = [
  {
    accessorKey: "field",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Label" />
    ),
    cell: ({ row }) => <div>{row.getValue("field")}</div>,
  },
  // ... more columns
];
```

### Authentication Flow

1. User logs in at `/login` (credentials: admin/admin123 or staff1/staff123)
2. Backend returns JWT token
3. Token stored in `localStorage.setItem("token", token)`
4. All API requests include `Authorization: Bearer ${token}` via axios interceptor
5. 401 responses trigger logout and redirect to `/login`

**Protected Routes**: Implement using middleware or layout-level checks (currently not enforced in code).

### Styling Conventions

- Use `glass-card` className for main content cards
- Background gradients: `from-navy-50 via-background to-teal-50` (light) / `from-navy-950 via-background to-teal-950` (dark)
- Buttons: Default navy gradient, can override with `className="bg-green-600"` etc.
- Icons: Lucide React with `className="h-4 w-4"` or `h-5 w-5`
- Spacing: `gap-4`, `gap-6`, `space-y-4`, `mb-6`
- Container: `container mx-auto px-4 py-8`

### Toast Notifications

Replace all `alert()` and `confirm()` calls with:
```tsx
import { toast } from "sonner";

toast.success("Success message");
toast.error("Error message");
toast.promise(asyncFunction(), {
  loading: "Loading...",
  success: "Done!",
  error: "Failed",
});
```

### Adding New Pages

1. Create `app/new-page/page.tsx` with "use client" directive
2. Import Navbar, PageHeader, shadcn components
3. Use navy/teal gradient background
4. Add glass-card styling to content sections
5. Implement API calls with toast notifications
6. Add navigation link to `components/Navbar.tsx`

### Adding shadcn Components

```bash
# Add a new shadcn component
npx shadcn@latest add <component-name>

# Examples
npx shadcn@latest add form
npx shadcn@latest add command
```

This creates files in `components/ui/` - do not manually edit them.

### Common Patterns

**Stock Level Badges** (Products):
```tsx
const getStockBadge = (quantity: number) => {
  if (quantity < 10) return <Badge variant="destructive">Low Stock</Badge>;
  if (quantity < 50) return <Badge className="bg-yellow-500">Medium</Badge>;
  return <Badge className="bg-green-500">In Stock</Badge>;
};
```

**Date Formatting**:
```tsx
import { format } from "date-fns";

format(new Date(date), "MMM dd, yyyy")  // Short: Jan 01, 2024
format(new Date(date), "PPpp")           // Full: Jan 1, 2024, 12:00 PM
```

**Loading States**:
```tsx
if (loading) return <LoadingSpinner />;
```

**Empty States**:
```tsx
{data.length === 0 && <EmptyState icon={Icon} title="..." description="..." />}
```

### File Import Aliases

- `@/components/*` → `components/*`
- `@/lib/*` → `lib/*`
- `@/app/*` → `app/*`

Configured in `tsconfig.json` and `components.json`.

## Known Issues & Gotchas

1. **Tailwind CSS 4 Breaking Changes**: Cannot use `@apply` with custom color utilities. Use vanilla CSS with hex colors.

2. **Dark Mode**: Requires `<html suppressHydrationWarning>` in layout.tsx to prevent hydration warnings.

3. **shadcn Select with Numbers**: Convert to string for value prop:
   ```tsx
   <Select value={id?.toString()} onValueChange={(v) => setId(parseInt(v))}>
   ```

4. **Backend Port**: Default is 5179 (matches .NET launchSettings.json). Update `.env.local` if different.

5. **Verbose Logging**: `lib/api.ts` has extensive console.log statements for debugging. Remove in production.

6. **Client Components**: All pages use "use client" directive (no Server Components pattern currently).

## Demo Credentials

- **Admin**: username: `admin` / password: `admin123`
- **Staff**: username: `staff1` / password: `staff123`

Displayed on login page for convenience.
