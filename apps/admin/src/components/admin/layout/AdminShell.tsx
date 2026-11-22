"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clearStaffSessionMarker, createSupabaseBrowserClient, getStaffSession, signOutStaff, type StaffSession } from "@a1/database";
import { canAccessAdminRoute } from "@/lib/permissions";
import { StaffContext } from "./StaffContext";
import { AdminSidebar } from "./Sidebar";
import { AdminTopbar } from "./Topbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (["/login", "/reset-password"].includes(pathname.replace(/\/$/, ""))) {
    return <main id="admin-main" className="min-h-screen w-full">{children}</main>;
  }
  // Remount on navigation so previous-route authorization cannot flash.
  return <ProtectedShell key={pathname} pathname={pathname}>{children}</ProtectedShell>;
}

function ProtectedShell({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<StaffSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loggingOut = useRef(false);

  useEffect(() => {
    let active = true;
    let generation = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const verify = async () => {
      const request = ++generation;
      setSession(null);
      setError(null);
      try {
        const result = await getStaffSession();
        if (!active || loggingOut.current || request !== generation) return;
        if (!result.session) {
          clearStaffSessionMarker();
          setError(result.error || "Please sign in again.");
        } else {
          setSession(result.session);
        }
      } catch {
        if (active && request === generation) {
          clearStaffSessionMarker();
          setError("Staff access could not be verified. Please retry or sign in again.");
        }
      }
    };
    const scheduleVerification = () => {
      if (!active || loggingOut.current) return;
      ++generation;
      setSession(null);
      clearTimeout(timer);
      // Auth methods must run outside onAuthStateChange's locked callback.
      timer = setTimeout(() => { void verify(); }, 0);
    };
    let unsubscribe = () => {};
    try {
      const client = createSupabaseBrowserClient();
      if (client) {
        const { data } = client.auth.onAuthStateChange((event) => {
          if (!active) return;
          if (event === "SIGNED_OUT") {
            ++generation;
            clearTimeout(timer);
            setSession(null);
            clearStaffSessionMarker();
            router.replace("/login");
          } else {
            scheduleVerification();
          }
        });
        unsubscribe = () => data.subscription.unsubscribe();
      }
    } catch {
      // verify() reports configuration errors without rendering protected UI.
    }
    scheduleVerification();
    const onVisible = () => {
      if (document.visibilityState === "visible") scheduleVerification();
    };
    window.addEventListener("focus", scheduleVerification);
    document.addEventListener("visibilitychange", onVisible);
    // RLS checks activation per request; polling also updates idle UI.
    const interval = setInterval(onVisible, 60_000);
    return () => {
      active = false;
      ++generation;
      clearTimeout(timer);
      clearInterval(interval);
      unsubscribe();
      window.removeEventListener("focus", scheduleVerification);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  const logout = async () => {
    if (loggingOut.current) return;
    loggingOut.current = true;
    setSession(null);
    try {
      await signOutStaff();
      router.replace("/login");
    } catch {
      loggingOut.current = false;
      setError("Sign-out could not be completed. Retry before leaving this shared device.");
    }
  };

  if (!session) return (
    <main id="admin-main" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <p role={error ? "alert" : "status"} className="text-sm text-slate-600">{error || "Verifying staff access..."}</p>
      {error && <>
        <button onClick={() => window.location.reload()} className="text-sm underline">Retry verification</button>
        <button onClick={() => void logout()} className="text-sm underline">Sign out</button>
        <Link href="/login" className="text-sm underline">Return to sign in</Link>
      </>}
    </main>
  );

  return (
    <StaffContext.Provider value={{ session, logout }}>
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="ml-64 flex flex-1 flex-col transition-all">
        <AdminTopbar />
        <main id="admin-main" className="flex-1 p-6 pt-20">
          {canAccessAdminRoute(session.role, pathname) ? children : (
            <section role="alert" className="rounded-xl border border-slate-200 bg-white p-6">
              <h1 className="text-xl font-semibold">Access denied</h1>
              <p className="mt-2 text-sm text-slate-600">Your staff role does not permit access to this section.</p>
              <Link href="/dashboard" className="mt-4 inline-block text-sm underline">Return to dashboard</Link>
            </section>
          )}
        </main>
      </div>
    </div>
    </StaffContext.Provider>
  );
}
