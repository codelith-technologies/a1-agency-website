"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clearStaffSessionMarker, getStaffSession } from "@a1/database";
import { AdminSidebar } from "./Sidebar";
import { AdminTopbar } from "./Topbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [authState, setAuthState] = useState<"checking" | "authorized" | "unauthorized">(
    isLoginPage ? "authorized" : "checking",
  );

  useEffect(() => {
    if (isLoginPage) return;

    let active = true;
    getStaffSession().then((result) => {
      if (!active) return;
      if (result.error) {
        setAuthState("unauthorized");
        clearStaffSessionMarker();
        window.location.replace("/login");
        return;
      }
      setAuthState("authorized");
    });

    return () => {
      active = false;
    };
  }, [isLoginPage, pathname]);

  if (isLoginPage) {
    return <main id="admin-main" className="min-h-screen w-full">{children}</main>;
  }

  if (authState === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Verifying staff access...</p>
      </main>
    );
  }

  if (authState === "unauthorized") {
    return null;
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
