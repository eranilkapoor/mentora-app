import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mentora CRM Admin",
  description:
    "Admin CRM portal for multi-tenant education CRM, admissions, marketing, finance, and analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
