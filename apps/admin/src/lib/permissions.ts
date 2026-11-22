import type { StaffRole } from "@a1/database";

// Mirrors management policies, not public SELECT. RLS remains authoritative.
const recruitment: readonly StaffRole[] = ["owner", "administrator", "recruiter"];
const content: readonly StaffRole[] = ["owner", "administrator", "content_editor"];
const routes: Record<string, readonly StaffRole[]> = {
  "/jobs": recruitment,
  "/applicants": recruitment,
  "/employer-requests": recruitment,
  "/contact-messages": recruitment,
  "/taxonomy/countries": content,
  "/taxonomy/categories": content,
  "/reviews": content,
  "/media": content,
  "/announcements": content,
  "/events": content,
  "/faqs": content,
  "/team": content,
  "/staff": ["owner"],
  "/audit-logs": ["owner", "administrator"],
};

export function normalizeAdminPath(pathname: string): string {
  let path = pathname.split(/[?#]/, 1)[0].replace(/\\/g, "/").replace(/\/+/g, "/");
  if (!path.startsWith("/")) path = `/${path}`;

  const configuredBasePath =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/+$/, "")
      : undefined;
  const basePathPrefixes = [
    configuredBasePath,
    "/a1-agency-website/admin",
    "/a1-agency-website",
    "/admin",
  ].filter((prefix): prefix is string => Boolean(prefix));

  for (const prefix of basePathPrefixes.sort((a, b) => b.length - a.length)) {
    if (path === prefix) {
      path = "/";
      break;
    }
    if (path.startsWith(`${prefix}/`)) {
      path = path.slice(prefix.length) || "/";
      break;
    }
  }

  return path.replace(/\/+$/, "") || "/";
}

export function canAccessAdminRoute(role: StaffRole, pathname: string): boolean {
  if (!["owner", "administrator", "recruiter", "content_editor"].includes(role)) return false;
  const path = normalizeAdminPath(pathname);
  if (path === "/dashboard" || path === "/") return true;
  return Object.entries(routes).some(([route, roles]) =>
    (path === route || path.startsWith(`${route}/`)) && roles.includes(role),
  );
}
