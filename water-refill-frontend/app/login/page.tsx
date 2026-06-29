"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Droplet, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { PRODUCT_BRAND_NAME, PRODUCT_TAGLINE } from "@/lib/branding";

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-xl overflow-hidden border">
          {/* Header Section */}
          <div className="p-8 text-center border-b" style={{ backgroundColor: "hsl(var(--brand-surface))", color: "hsl(var(--brand-on-surface))" }}>
            <div>
              <div className="w-14 h-14 rounded-lg mx-auto mb-4 flex items-center justify-center bg-[hsl(var(--brand-on-surface)/0.15)]">
                <Droplet className="w-8 h-8 text-[hsl(var(--brand-on-surface))]" />
              </div>
              <h1 className="text-2xl font-semibold text-[hsl(var(--brand-on-surface))]">
                {PRODUCT_BRAND_NAME}
              </h1>
              <p className="text-[hsl(var(--brand-on-surface)/0.84)] mt-2 font-medium">{PRODUCT_TAGLINE}</p>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleLogin} className="p-8 space-y-6 bg-card">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="h-11"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
