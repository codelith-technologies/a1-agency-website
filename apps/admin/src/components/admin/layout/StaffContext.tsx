"use client";

import { createContext, useContext } from "react";
import type { StaffSession } from "@a1/database";
import { canAccessAdminRoute } from "@/lib/permissions";

export const StaffContext = createContext<{
  session: StaffSession;
  logout: () => Promise<void>;
} | null>(null);

export function useStaff() {
  const staff = useContext(StaffContext);
  if (!staff) throw new Error("Staff controls require verified staff access.");
  return staff;
}

export function StaffRouteAccess({ href, children }: {
  href: string;
  children: React.ReactNode;
}) {
  const { session } = useStaff();
  return canAccessAdminRoute(session.role, href) ? children : null;
}
