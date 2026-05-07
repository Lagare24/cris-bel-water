import axios, { AxiosInstance } from "axios";

// Default to backend dev port from launchSettings.json
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

console.log("🔧 [API] Initializing API client with base URL:", API_BASE);

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("📤 [API] Request to:", config.method?.toUpperCase(), config.url);
  console.log("📤 [API] Token present:", token ? "YES" : "NO");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("📤 [API] Authorization header added");
  }
  return config;
});

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => {
    console.log("📥 [API] Response from:", response.config.url, "- Status:", response.status);
    return response;
  },
  (error) => {
    console.error("📥 [API] Response error:", error.message);
    if (error.response?.status === 401) {
      console.warn("⚠️ [API] 401 Unauthorized - removing token and redirecting to login");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
