"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    console.log("🟢 [LOGIN] handleLogin function called - FIRST LINE");
    e.preventDefault();
    console.log("🟢 [LOGIN] preventDefault called - form should NOT submit");
    console.log("🔵 [LOGIN] Form submitted");
    console.log("🔵 [LOGIN] Username:", username);
    console.log("🔵 [LOGIN] Password length:", password.length);
    
    setError("");
    setLoading(true);

    try {
      console.log("🔵 [LOGIN] Calling API at:", api.defaults.baseURL + "/api/auth/login");
      const response = await api.post("/api/auth/login", {
        username,
        password,
      });

      console.log("✅ [LOGIN] Response received:", response.status);
      console.log("✅ [LOGIN] Response data:", response.data);
      
      const { token } = response.data;
      console.log("✅ [LOGIN] Token extracted:", token ? token.substring(0, 20) + "..." : "NO TOKEN");
      
      if (!token) {
        throw new Error("No token received from server");
      }
      
      localStorage.setItem("token", token);
      console.log("✅ [LOGIN] Token saved to localStorage");
      
      const savedToken = localStorage.getItem("token");
      console.log("✅ [LOGIN] Verification - Token in storage:", savedToken ? "YES" : "NO");
      
      setTimeout(() => {
        console.log("🚀 [LOGIN] Navigating to dashboard...");
        router.push("/dashboard");
      }, 100);
    } catch (err: any) {
      console.error("❌ [LOGIN] Error occurred:", err);
      console.error("❌ [LOGIN] Error message:", err.message);
      console.error("❌ [LOGIN] Error response:", err.response?.data);
      console.error("❌ [LOGIN] Error status:", err.response?.status);
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
      console.log("🔵 [LOGIN] Loading state reset");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">Water Refilling</h1>
            <p className="text-blue-100 mt-2">Management System</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                <span className="font-semibold">Demo Credentials:</span>
              </p>
              <div className="mt-2 space-y-1 text-xs text-gray-500 text-center">
                <p>Admin: <span className="font-mono bg-gray-100 px-2 py-1 rounded">admin / admin123</span></p>
                <p>Staff: <span className="font-mono bg-gray-100 px-2 py-1 rounded">staff1 / staff123</span></p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
