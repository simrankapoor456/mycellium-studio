import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/SignupForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getSafeReturnPath } from "@/lib/auth/return-path";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a private Mycellium Studio project workspace.",
};

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const returnPath = getSafeReturnPath(next);

  if (await getCurrentUser()) {
    redirect(returnPath);
  }

  return (
    <section aria-labelledby="signup-title" className="auth-form-page">
      <p className="auth-form-page__kicker">Personal workspace</p>
      <h1 id="signup-title">Give the first project a foundation</h1>
      <p>Create a private studio where scattered context can become a clear, traceable Product Blueprint.</p>
      <SignupForm returnTo={returnPath} />
    </section>
  );
}
