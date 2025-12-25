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
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            <span className="text-white text-xl font-bold">Water Refilling</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Link
              href="/dashboard"
              className="text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/clients"
              className="text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all font-medium"
            >
              Clients
            </Link>
            <Link
              href="/products"
              className="text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all font-medium"
            >
              Products
            </Link>
            <Link
              href="/sales"
              className="text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all font-medium"
            >
              Sales
            </Link>
            <Link
              href="/reports"
              className="text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all font-medium"
            >
              Reports
            </Link>
            <button
              onClick={handleLogout}
              className="ml-4 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all font-medium backdrop-blur-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
