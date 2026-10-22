import type { Metadata } from "next";
import "./globals.css";
import { AdminShell } from "@/components/admin/layout/AdminShell";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin — A-One Agency",
    default: "Admin Dashboard — A-One Agency",
  },
  description: "Administrative control center for A-One Agency operations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
