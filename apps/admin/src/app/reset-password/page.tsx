"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createSupabaseBrowserClient, getStaffSession, signOutStaff } from "@a1/database";

export default function ResetPasswordPage() {
  const [recovering, setRecovering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const pending = useRef(false);

  useEffect(() => {
    try {
      const client = createSupabaseBrowserClient();
      if (!client) return;
      const { data } = client.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          setRecovering(true);
          setMessage("");
          // Remove token-bearing fragments after the SDK consumes them.
          window.history.replaceState(null, "", window.location.pathname);
        } else if (event === "SIGNED_OUT") {
          setRecovering(false);
        }
      });
      return () => data.subscription.unsubscribe();
    } catch {
      // Submission reports a safe configuration error.
    }
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending.current) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    pending.current = true;
    setBusy(true);
    setMessage("");
    try {
      const client = createSupabaseBrowserClient();
      if (!client) {
        setMessage("Password recovery is not configured. Contact your administrator.");
        return;
      }
      if (recovering) {
        const password = String(fields.get("password") || "");
        if (password.length < 12 || password !== fields.get("confirm")) {
          setMessage("Use at least 12 characters and enter the same password twice.");
          return;
        }
        const staff = await getStaffSession();
        if (!staff.session) {
          setMessage("This recovery session cannot update a staff password. Request a new link or contact your administrator.");
          return;
        }
        const { error } = await client.auth.updateUser({ password });
        if (error) {
          setMessage("The password could not be updated. Use a stronger password or request a new recovery link.");
          return;
        }
        await signOutStaff();
        setRecovering(false);
        setMessage("Password updated. Return to sign in with your new password.");
        form.reset();
      } else {
        const email = String(fields.get("email") || "").trim().toLowerCase();
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}${basePath}/reset-password`,
        });
        // Identical response for unknown/known addresses and provider errors.
        setMessage(error
          ? "The request could not be completed. Please try again later or contact your administrator."
          : "If this address is eligible, a recovery email will arrive shortly. Open its link in this browser.");
      }
    } catch {
      setMessage("Password recovery is temporarily unavailable. Please try again.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <section className="w-full max-w-md rounded-2xl border border-navy-700 bg-navy-900 p-8 text-white">
        <h1 className="text-xl font-semibold">{recovering ? "Choose a new password" : "Reset your staff password"}</h1>
        <p className="mt-2 text-sm text-navy-200">Recovery does not create an account or grant staff access.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {recovering ? <>
            <label className="block text-sm">New password
              <input name="password" type="password" autoComplete="new-password" minLength={12} required className="mt-2 w-full rounded border border-navy-600 bg-navy-950 p-3" />
            </label>
            <label className="block text-sm">Confirm password
              <input name="confirm" type="password" autoComplete="new-password" minLength={12} required className="mt-2 w-full rounded border border-navy-600 bg-navy-950 p-3" />
            </label>
          </> : <label className="block text-sm">Email address
            <input name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded border border-navy-600 bg-navy-950 p-3" />
          </label>}
          <button disabled={busy} className="w-full rounded bg-brand-gold px-4 py-3 font-semibold text-brand-black disabled:opacity-60">
            {busy ? "Please wait..." : recovering ? "Update password" : "Send recovery email"}
          </button>
        </form>
        {message && <p role="status" className="mt-4 text-sm">{message}</p>}
        <Link href="/login" className="mt-6 inline-block text-sm underline">Return to sign in</Link>
      </section>
    </div>
  );
}
