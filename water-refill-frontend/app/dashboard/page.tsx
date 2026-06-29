"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { PageHeader } from "@/components/page-header";
import { StatsCard } from "@/components/stats-card";
import { LoadingSpinner } from "@/components/loading";
import { useCurrency } from "@/lib/currency-context";
import api from "@/lib/api";
import Link from "next/link";
import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  Plus,
  FileText,
  UserPlus,
  PackagePlus,
} from "lucide-react";

interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalClients: number;
  totalProducts: number;
}

export default function DashboardPage() {
  const { convertAmount, currency } = useCurrency();
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalClients: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [salesRes, clientsRes, productsRes] = await Promise.all([
          api.get("/api/sales"),
          api.get("/api/clients"),
          api.get("/api/products"),
        ]);

        const sales = salesRes.data || [];
        const clients = clientsRes.data || [];
        const products = productsRes.data || [];

        setStats({
          totalSales: sales.length,
          totalRevenue: sales.reduce(
            (sum: number, s: any) => sum + (s.totalAmount || 0),
            0
          ),
          totalClients: clients.length,
          totalProducts: products.length,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      href: "/sales/add",
      icon: Plus,
      title: "Create New Sale",
      description: "Record a new transaction",
      iconClass: "bg-primary/12 text-primary",
      hoverColor: "hover:border-primary",
    },
    {
      href: "/reports",
      icon: FileText,
      title: "View Reports",
      description: "Sales and analytics insights",
      iconClass: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
      hoverColor: "hover:border-slate-500",
    },
    {
      href: "/clients",
      icon: UserPlus,
      title: "Manage Clients",
      description: "View and manage accounts",
      iconClass: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
      hoverColor: "hover:border-slate-400",
    },
    {
      href: "/products",
      icon: PackagePlus,
      title: "Manage Products",
      description: "Inventory and pricing",
      iconClass: "bg-stone-500/15 text-stone-700 dark:text-stone-300",
      hoverColor: "hover:border-stone-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's your business overview."
        />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Sales"
                value={stats.totalSales}
                icon={ShoppingCart}
                variant="navy"
              />
              <StatsCard
                title="Total Revenue"
                value={convertAmount(stats.totalRevenue).toFixed(2)}
                icon={DollarSign}
                prefix={currency === "USD" ? "$" : "₱"}
                variant="slate"
              />
              <StatsCard
                title="Total Clients"
                value={stats.totalClients}
                icon={Users}
                variant="gray"
              />
              <StatsCard
                title="Total Products"
                value={stats.totalProducts}
                icon={Package}
                variant="slate"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`group glass-card p-6 rounded-xl border transition-colors ${action.hoverColor} hover:bg-muted/35 cursor-pointer`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-lg ${action.iconClass}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {action.title}
                        </h2>
                        <p className="text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
