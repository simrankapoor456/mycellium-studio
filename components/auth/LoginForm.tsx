"use client";

import Link from "next/link";
import { useActionState, useCallback, useRef, useState } from "react";

import { loginAction } from "@/app/(auth)/actions";
import { AuthFormMessage, AuthSubmitButton } from "@/components/auth/AuthFormParts";
import { TextField } from "@/components/forms/FormControls";
import { useTrustedForm } from "@/components/forms/useTrustedForm";
import { initialActionState } from "@/lib/actions/action-state";
import { getAuthHref } from "@/lib/auth/return-path";
import { LoginSchema } from "@/lib/auth/schemas";

export function LoginForm({ returnTo = "/dashboard" }: { returnTo?: string }) {
  const [state, action] = useActionState(loginAction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const validate = useCallback((formData: FormData) => {
    const parsed = LoginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
    return parsed.success ? {} : parsed.error.flatten().fieldErrors;
  }, []);
  const trust = useTrustedForm({ dirty: Boolean(email || password), formRef, serverState: state, validate });

  return (
    <form action={action} className="mt-8 space-y-5" noValidate onSubmit={trust.onSubmit} ref={formRef}>
      <input name="returnTo" type="hidden" value={returnTo} />
      <TextField autoComplete="email" error={trust.fieldErrors.email?.[0]} id="login-email" label="Email" name="email" onChange={(event) => { setEmail(event.currentTarget.value); trust.onFieldChange("email"); }} requirement="required" type="email" value={email} />
      <TextField autoComplete="current-password" error={trust.fieldErrors.password?.[0]} id="login-password" label="Password" name="password" onChange={(event) => { setPassword(event.currentTarget.value); trust.onFieldChange("password"); }} requirement="required" type="password" value={password} />
      <AuthFormMessage state={trust.state} />
      <AuthSubmitButton label="Sign in" pendingLabel="Signing in" state={trust.state} />
      <p className="text-center text-sm text-ink/65">New to Mycellium? <Link className="font-bold text-forest underline-offset-4 hover:underline" href={getAuthHref("/signup", returnTo)}>Create an account</Link></p>
    </form>
  );
}
