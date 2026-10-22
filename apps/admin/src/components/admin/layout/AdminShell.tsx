"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./Sidebar";
import { AdminTopbar } from "./Topbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main id="admin-main" className="min-h-screen w-full">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="ml-64 flex flex-1 flex-col transition-all">
        <AdminTopbar />
        <main id="admin-main" className="flex-1 p-6 pt-20">
          {children}
        </main>
      </div>
    </div>
  );
}
