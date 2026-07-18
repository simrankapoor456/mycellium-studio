"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signupAction } from "@/app/(auth)/actions";
import { AuthFormMessage, AuthSubmitButton } from "@/components/auth/AuthFormParts";
import { FormField } from "@/components/ui/FormField";
import { initialActionState } from "@/lib/actions/action-state";

export function SignupForm() {
  const [state, action] = useActionState(signupAction, initialActionState);

  return (
    <form action={action} className="mt-8 space-y-5">
      <FormField error={state.fieldErrors?.displayName?.[0]} htmlFor="signup-name" label="Name">
        <input aria-describedby={state.fieldErrors?.displayName?.[0] ? "signup-name-description" : undefined} autoComplete="name" className="form-control mt-2" id="signup-name" name="displayName" required />
      </FormField>
      <FormField error={state.fieldErrors?.email?.[0]} htmlFor="signup-email" label="Email">
        <input aria-describedby={state.fieldErrors?.email?.[0] ? "signup-email-description" : undefined} autoComplete="email" className="form-control mt-2" id="signup-email" name="email" required type="email" />
      </FormField>
      <FormField error={state.fieldErrors?.password?.[0]} hint="Use at least 8 characters." htmlFor="signup-password" label="Password">
        <input aria-describedby="signup-password-description" autoComplete="new-password" className="form-control mt-2" id="signup-password" minLength={8} name="password" required type="password" />
      </FormField>
      <FormField error={state.fieldErrors?.confirmPassword?.[0]} htmlFor="signup-password-confirm" label="Confirm password">
        <input aria-describedby={state.fieldErrors?.confirmPassword?.[0] ? "signup-password-confirm-description" : undefined} autoComplete="new-password" className="form-control mt-2" id="signup-password-confirm" minLength={8} name="confirmPassword" required type="password" />
      </FormField>
      <AuthFormMessage state={state} />
      <AuthSubmitButton label="Create account" pendingLabel="Creating account" />
      <p className="text-center text-sm text-ink/65">Already have an account? <Link className="font-bold text-forest underline-offset-4 hover:underline" href="/login">Sign in</Link></p>
    </form>
  );
}
