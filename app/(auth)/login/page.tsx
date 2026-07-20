import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "Log in",
  description: "Return to your private Mycellium Studio project workspace.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCurrentUser()) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;

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
      <LoginForm />
    </section>
  );
}
