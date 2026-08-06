import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Mentora CRM Admin",
    template: "%s | Mentora CRM",
  },
  description:
    "Admin CRM portal for multi-organization education CRM, admissions, marketing, finance, and analytics.",
  openGraph: {
    title: "Mentora CRM Admin",
    description:
      "Admin CRM portal for multi-organization education CRM, admissions, marketing, finance, and analytics.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
