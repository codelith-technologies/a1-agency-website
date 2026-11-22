"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@a1/database";
import styles from "./SupabaseDiagnostic.module.css";

type DiagnosticState =
  | { status: "checking" }
  | { status: "configured"; countries: number }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

export default function SupabaseDiagnostic() {
  const [state, setState] = useState<DiagnosticState>(() =>
    createSupabaseBrowserClient()
      ? { status: "checking" }
      : { status: "unconfigured" },
  );

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) return;

    let active = true;

    supabase
      .from("countries")
      .select("id", { count: "exact", head: true })
      .then(({ count, error }) => {
        if (!active) return;

        if (error) {
          setState({ status: "error", message: error.message });
          return;
        }

        setState({ status: "configured", countries: count ?? 0 });
      });

    return () => {
      active = false;
    };
  }, []);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <aside className={styles.panel} aria-label="Supabase development diagnostic">
      <h2 className={styles.heading}>Supabase connection</h2>
      {state.status === "checking" && <p className={styles.line}>Checking countries...</p>}
      {state.status === "unconfigured" && (
        <p className={`${styles.line} ${styles.error}`}>
          Not configured. Restart the web app after adding .env.local.
        </p>
      )}
      {state.status === "configured" && (
        <p className={`${styles.line} ${styles.ok}`}>
          Connected - {state.countries} public countries readable.
        </p>
      )}
      {state.status === "error" && (
        <p className={`${styles.line} ${styles.error}`}>Connection error: {state.message}</p>
      )}
    </aside>
  );
}
