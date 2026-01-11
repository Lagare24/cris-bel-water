"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { CurrencySelector } from "./currency-selector";
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
        backgroundColor: '#0044ad'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2 group">
            <div className="relative">
              <Droplet className="w-8 h-8 text-white group-hover:text-teal-200 transition-colors" />
              <div className="absolute inset-0 bg-teal-400 blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
            </div>
            <span className="text-white text-xl font-bold bg-gradient-to-r from-white to-teal-100 bg-clip-text text-transparent">
              Water Refilling
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-white px-4 py-2 rounded-lg transition-all font-medium relative group",
                  isActive(link.href)
                    ? "bg-white/20"
                    : "hover:bg-white/10"
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-teal-300 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <CurrencySelector />
            <ThemeToggle />
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="ml-2 bg-white/20 text-white hover:bg-white/30 transition-all font-medium backdrop-blur-sm"
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
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="glass-card">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <Droplet className="w-6 h-6 text-primary" />
                    <span>Water Refilling</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-3 mt-6">
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
