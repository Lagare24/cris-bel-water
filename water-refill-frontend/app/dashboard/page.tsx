"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import Link from "next/link";

interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalClients: number;
  totalProducts: number;
}

export default function DashboardPage() {
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
          totalRevenue: sales.reduce((sum: number, s: any) => sum + (s.totalAmount || 0), 0),
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

  return (
    <div>
      <Navbar />
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium">Total Sales</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalSales}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium">Total Clients</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.totalClients}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium">Total Products</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.totalProducts}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/sales/add"
            className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 text-center"
          >
            <h2 className="text-xl font-bold mb-2">Create New Sale</h2>
            <p>Record a new transaction</p>
          </Link>

          <Link
            href="/reports"
            className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 text-center"
          >
            <h2 className="text-xl font-bold mb-2">View Reports</h2>
            <p>Generate sales and inventory reports</p>
          </Link>

          <Link
            href="/clients"
            className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 text-center"
          >
            <h2 className="text-xl font-bold mb-2">Manage Clients</h2>
            <p>View and manage client accounts</p>
          </Link>

          <Link
            href="/products"
            className="bg-orange-600 text-white p-6 rounded-lg hover:bg-orange-700 text-center"
          >
            <h2 className="text-xl font-bold mb-2">Manage Products</h2>
            <p>Manage inventory and pricing</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
