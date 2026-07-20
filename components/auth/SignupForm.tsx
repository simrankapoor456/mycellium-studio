"use client";

import Link from "next/link";
import { useActionState, useCallback, useRef, useState } from "react";

import { signupAction } from "@/app/(auth)/actions";
import { AuthFormMessage, AuthSubmitButton } from "@/components/auth/AuthFormParts";
import { TextField } from "@/components/forms/FormControls";
import { useTrustedForm } from "@/components/forms/useTrustedForm";
import { initialActionState } from "@/lib/actions/action-state";
import { getAuthHref } from "@/lib/auth/return-path";
import { SignupSchema } from "@/lib/auth/schemas";

export function SignupForm({ returnTo = "/dashboard" }: { returnTo?: string }) {
  const [state, action] = useActionState(signupAction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState({ displayName: "", email: "", password: "", confirmPassword: "" });
  const validate = useCallback((formData: FormData) => {
    const parsed = SignupSchema.safeParse({ displayName: formData.get("displayName"), email: formData.get("email"), password: formData.get("password"), confirmPassword: formData.get("confirmPassword") });
    return parsed.success ? {} : parsed.error.flatten().fieldErrors;
  }, []);
  const trust = useTrustedForm({ dirty: Object.values(values).some(Boolean), formRef, serverState: state, validate });

  function update(name: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    trust.onFieldChange(name);
  }

  return (
    <form action={action} className="mt-8 space-y-5" noValidate onSubmit={trust.onSubmit} ref={formRef}>
      <input name="returnTo" type="hidden" value={returnTo} />
      <TextField autoComplete="name" error={trust.fieldErrors.displayName?.[0]} id="signup-name" label="Name" name="displayName" onChange={(event) => update("displayName", event.currentTarget.value)} requirement="required" value={values.displayName} />
      <TextField autoComplete="email" error={trust.fieldErrors.email?.[0]} id="signup-email" label="Email" name="email" onChange={(event) => update("email", event.currentTarget.value)} requirement="required" type="email" value={values.email} />
      <TextField autoComplete="new-password" error={trust.fieldErrors.password?.[0]} hint="Use at least 8 characters." id="signup-password" label="Password" maxLength={72} name="password" onChange={(event) => update("password", event.currentTarget.value)} requirement="required" type="password" value={values.password} />
      <TextField autoComplete="new-password" error={trust.fieldErrors.confirmPassword?.[0]} id="signup-password-confirm" label="Confirm password" maxLength={72} name="confirmPassword" onChange={(event) => update("confirmPassword", event.currentTarget.value)} requirement="required" type="password" value={values.confirmPassword} />
      <AuthFormMessage state={trust.state} />
      <AuthSubmitButton label="Create account" pendingLabel="Creating account" state={trust.state} />
      <p className="text-center text-sm text-ink/65">Already have an account? <Link className="font-bold text-forest underline-offset-4 hover:underline" href={getAuthHref("/login", returnTo)}>Sign in</Link></p>
    </form>
  );
}
