import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { CurrencyProvider } from "@/lib/currency-context";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Water Refilling Station - Management System",
  description: "Manage users, clients, products, sales, and generate reports",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <CurrencyProvider>
            {children}
            <Toaster position="top-right" richColors />
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
