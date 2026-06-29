import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { CurrencyProvider } from "@/lib/currency-context";
import { PRODUCT_BRAND_NAME, PRODUCT_TAGLINE } from "@/lib/branding";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: `${PRODUCT_BRAND_NAME} - ${PRODUCT_TAGLINE}`,
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
            {/* Global toast behavior for all screens: close button + visible timed lifetime. */}
            <Toaster position="top-right" richColors closeButton duration={5000} />
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
