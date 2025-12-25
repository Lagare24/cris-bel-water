"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container flex items-center justify-between py-4">
        <Link href="/dashboard" className="text-2xl font-bold">
          Water Station
        </Link>

        <div className="hidden md:flex space-x-6">
          <Link href="/dashboard" className="hover:text-blue-200">
            Dashboard
          </Link>
          <Link href="/clients" className="hover:text-blue-200">
            Clients
          </Link>
          <Link href="/products" className="hover:text-blue-200">
            Products
          </Link>
          <Link href="/sales" className="hover:text-blue-200">
            Sales
          </Link>
          <Link href="/reports" className="hover:text-blue-200">
            Reports
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
