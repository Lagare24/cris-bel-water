"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { CurrencySelector } from "./currency-selector";
import { BrandThemeSelector } from "./brand-theme-selector";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Droplet, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRODUCT_BRAND_NAME } from "@/lib/branding";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/products", label: "Products" },
  { href: "/sales", label: "Sales" },
  { href: "/reports", label: "Reports" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      className="sticky top-0 z-50 border-b shadow-md"
      style={{
        backgroundColor: "hsl(var(--brand-surface))",
        color: "hsl(var(--brand-on-surface))",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2 group">
            <div className="relative">
              <Droplet className="w-8 h-8 text-[hsl(var(--brand-on-surface))] group-hover:text-[hsl(var(--accent))] transition-colors" />
              <div className="absolute inset-0 bg-[hsl(var(--accent))] blur-lg opacity-0 group-hover:opacity-45 transition-opacity" />
            </div>
            <span className="text-xl font-bold text-[hsl(var(--brand-on-surface))] group-hover:text-[hsl(var(--accent))] transition-colors">
              {PRODUCT_BRAND_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[hsl(var(--brand-on-surface))] px-4 py-2 rounded-lg transition-all font-medium relative group",
                  isActive(link.href)
                    ? "bg-[hsl(var(--brand-on-surface)/0.2)]"
                    : "hover:bg-[hsl(var(--brand-on-surface)/0.12)]"
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-[hsl(var(--accent))] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <CurrencySelector />
            <BrandThemeSelector />
            <ThemeToggle />
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="ml-2 border border-[hsl(var(--brand-on-surface)/0.28)] bg-[hsl(var(--brand-on-surface)/0.14)] text-[hsl(var(--brand-on-surface))] hover:bg-[hsl(var(--brand-on-surface)/0.24)] transition-all font-medium backdrop-blur-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[hsl(var(--brand-on-surface))]">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="glass-card">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <Droplet className="w-6 h-6 text-primary" />
                    <span>{PRODUCT_BRAND_NAME}</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-3 mt-6">
                  <div className="flex items-center gap-2">
                    <BrandThemeSelector />
                    <CurrencySelector />
                  </div>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "px-4 py-2 rounded-lg transition-all font-medium",
                        isActive(link.href)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="w-full justify-start"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
