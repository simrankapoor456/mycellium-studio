"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction } from "@/app/(auth)/actions";
import { AuthFormMessage, AuthSubmitButton } from "@/components/auth/AuthFormParts";
import { FormField } from "@/components/ui/FormField";
import { initialActionState } from "@/lib/actions/action-state";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialActionState);

  return (
    <form action={action} className="mt-8 space-y-5">
      <FormField error={state.fieldErrors?.email?.[0]} htmlFor="login-email" label="Email">
        <input aria-describedby={state.fieldErrors?.email?.[0] ? "login-email-description" : undefined} autoComplete="email" className="form-control mt-2" id="login-email" name="email" required type="email" />
      </FormField>
      <FormField error={state.fieldErrors?.password?.[0]} htmlFor="login-password" label="Password">
        <input aria-describedby={state.fieldErrors?.password?.[0] ? "login-password-description" : undefined} autoComplete="current-password" className="form-control mt-2" id="login-password" name="password" required type="password" />
      </FormField>
      <AuthFormMessage state={state} />
      <AuthSubmitButton label="Sign in" pendingLabel="Signing in" />
      <p className="text-center text-sm text-ink/65">New to Mycellium? <Link className="font-bold text-forest underline-offset-4 hover:underline" href="/signup">Create an account</Link></p>
    </form>
  );
}
