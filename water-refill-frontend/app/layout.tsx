import type { Metadata } from "next";
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
