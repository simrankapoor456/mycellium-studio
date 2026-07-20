import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getSafeReturnPath } from "@/lib/auth/return-path";

export const metadata: Metadata = {
  title: "Log in",
  description: "Return to your private Mycellium Studio project workspace.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  const returnPath = getSafeReturnPath(next);

  if (await getCurrentUser()) {
    redirect(returnPath);
  }

  return (
    <section aria-labelledby="login-title" className="auth-form-page">
      <p className="auth-form-page__kicker">Welcome back</p>
      <h1 id="login-title">Return to your studio</h1>
      <p>Your product context, decisions, and open questions are ready where you left them.</p>
      {error === "confirmation" ? (
        <p className="mt-6 border border-clay/35 bg-clay/10 p-4 text-sm leading-6 text-clay" role="alert">
          The confirmation link is invalid or expired. Request a new confirmation email by signing up again.
        </p>
      ) : null}
      <LoginForm returnTo={returnPath} />
    </section>
  );
}
