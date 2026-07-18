import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/SignupForm";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a private Mycellium Studio project workspace.",
};

export default async function SignupPage() {
  if (await getCurrentUser()) {
    redirect("/dashboard");
  }

  return (
    <section aria-labelledby="signup-title">
      <p className="font-mono text-sm font-bold text-moss">Personal workspace</p>
      <h1 className="display-type mt-3 text-4xl text-forest" id="signup-title">Give the first project a foundation</h1>
      <p className="mt-4 leading-7 text-ink/65">Create a secure account for project context, decisions, and the upcoming guided discovery flow.</p>
      <SignupForm />
    </section>
  );
}
