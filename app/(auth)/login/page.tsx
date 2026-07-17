import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/AuthForms";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function LoginPage() {
  if (await getCurrentUser()) {
    redirect("/dashboard");
  }

  return (
    <section className="mt-10 rounded-[2rem] border border-line bg-paper/85 p-7 shadow-xl shadow-forest/5 sm:p-9">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">Welcome back</p>
      <h1 className="mt-3 font-serif text-4xl text-forest">Sign in</h1>
      <p className="mt-3 leading-7 text-forest/70">Return to your private planning workspace.</p>
      <LoginForm />
    </section>
  );
}
