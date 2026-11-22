import { createSupabaseBrowserClient } from "./client";

export type StaffRole = "owner" | "administrator" | "recruiter" | "content_editor";

export type StaffSession = {
  userId: string;
  email: string;
  role: StaffRole;
  displayName: string | null;
};

export async function signInStaff(email: string, password: string): Promise<
  | { session: StaffSession; error: null }
  | { session: null; error: string }
> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { session: null, error: "Supabase is not configured." };

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

  if (authError) return { session: null, error: "Invalid email or password." };
  if (!authData.user) return { session: null, error: "Authentication failed." };

  const { data: profile, error: profileError } = await supabase
    .from("staff_profiles")
    .select("user_id,role,display_name,active")
    .eq("user_id", authData.user.id)
    .eq("active", true)
    .maybeSingle();

  if (profileError) return { session: null, error: "Could not verify staff access." };
  if (!profile) {
    await supabase.auth.signOut();
    return { session: null, error: "This account is not an active staff account." };
  }

  return {
    session: {
      userId: profile.user_id,
      email: authData.user.email ?? email.trim().toLowerCase(),
      role: profile.role as StaffRole,
      displayName: profile.display_name,
    },
    error: null,
  };
}

export async function getStaffSession(): Promise<
  | { session: StaffSession; error: null }
  | { session: null; error: string }
> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { session: null, error: "Supabase is not configured." };

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { session: null, error: "Please sign in." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("staff_profiles")
    .select("user_id,role,display_name,active")
    .eq("user_id", userData.user.id)
    .eq("active", true)
    .maybeSingle();

  if (profileError) return { session: null, error: "Could not verify staff access." };
  if (!profile) return { session: null, error: "This account is not an active staff account." };

  return {
    session: {
      userId: profile.user_id,
      email: userData.user.email ?? "",
      role: profile.role as StaffRole,
      displayName: profile.display_name,
    },
    error: null,
  };
}

export async function signOutStaff(): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  if (supabase) await supabase.auth.signOut();
  clearStaffSessionMarker();
}

export function setStaffSessionMarker(): void {
  document.cookie = "a1-admin-session=1; Path=/; Max-Age=28800; SameSite=Lax";
}

export function clearStaffSessionMarker(): void {
  document.cookie = "a1-admin-session=; Path=/; Max-Age=0; SameSite=Lax";
}
