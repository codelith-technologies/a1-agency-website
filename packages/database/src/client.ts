import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabaseConfig = {
  url: string;
  publishableKey: string;
};

let browserClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
      && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim(),
  );
}

function readSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url && !publishableKey) return null;
  if (!url || !publishableKey) {
    throw new Error(
      "Both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required.",
    );
  }

  return { url, publishableKey };
}

/**
 * Creates a browser-safe client when Supabase is configured.
 * The client is created only when this function is called, so static builds
 * remain usable without environment variables.
 */
export function createSupabaseBrowserClient(): SupabaseClient | null {
  if (typeof window !== "undefined" && browserClient) return browserClient;
  const config = readSupabaseConfig();
  if (!config) return null;
  const client = createClient(config.url, config.publishableKey);
  // Never share authenticated state across server/static-render requests.
  if (typeof window !== "undefined") browserClient = client;
  return client;
}

export function createRequiredSupabaseBrowserClient(): SupabaseClient {
  const client = createSupabaseBrowserClient();
  if (!client) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return client;
}
