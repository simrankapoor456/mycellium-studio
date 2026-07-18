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
    <section aria-labelledby="login-title">
      <p className="font-mono text-sm font-bold text-moss">Welcome back</p>
      <h1 className="display-type mt-3 text-4xl text-forest" id="login-title">Log in to your studio</h1>
      <p className="mt-4 leading-7 text-ink/65">Your product thinking is here, with every decision and open question where you left it.</p>
      {error === "confirmation" ? (
        <p className="mt-6 border border-clay/35 bg-clay/10 p-4 text-sm leading-6 text-clay" role="alert">
          The confirmation link is invalid or expired. Request a new confirmation email by signing up again.
        </p>
      ) : null}
      <LoginForm />
    </section>
  );
}
