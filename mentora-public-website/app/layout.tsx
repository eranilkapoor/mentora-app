import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mentora | Education CRM and AI tutoring platform",
  description:
    "Mentora combines education CRM, admissions, parent-managed learning, AI tutoring, assessments, payments, and analytics.",
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
