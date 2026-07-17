"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { loginAction, signupAction } from "@/app/(auth)/actions";
import { initialActionState, type ActionState } from "@/lib/actions/action-state";

const inputClassName =
  "mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-forest outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/15";

function FieldError({ state, name }: { state: ActionState; name: string }) {
  const message = state.fieldErrors?.[name]?.[0];
  return message ? <p className="mt-1 text-sm text-clay">{message}</p> : null;
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="w-full rounded-full bg-ocean px-5 py-3 font-bold text-white transition hover:bg-forest disabled:cursor-wait disabled:opacity-65"
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function FormMessage({ state }: { state: ActionState }) {
  if (state.status === "idle") {
    return null;
  }

  return (
    <p
      className={state.status === "success" ? "text-sm text-forest" : "text-sm text-clay"}
      role="status"
    >
      {state.message}
    </p>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialActionState);

  return (
    <form action={action} className="mt-8 space-y-5">
      <label className="block text-sm font-semibold text-forest">
        Email
        <input className={inputClassName} name="email" type="email" autoComplete="email" required />
        <FieldError state={state} name="email" />
      </label>
      <label className="block text-sm font-semibold text-forest">
        Password
        <input
          className={inputClassName}
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <FieldError state={state} name="password" />
      </label>
      <FormMessage state={state} />
      <SubmitButton label="Sign in" pendingLabel="Signing in…" />
      <p className="text-center text-sm text-forest/70">
        New here?{" "}
        <Link className="font-bold text-ocean hover:underline" href="/signup">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const [state, action] = useActionState(signupAction, initialActionState);

  return (
    <form action={action} className="mt-8 space-y-5">
      <label className="block text-sm font-semibold text-forest">
        Name
        <input className={inputClassName} name="displayName" autoComplete="name" required />
        <FieldError state={state} name="displayName" />
      </label>
      <label className="block text-sm font-semibold text-forest">
        Email
        <input className={inputClassName} name="email" type="email" autoComplete="email" required />
        <FieldError state={state} name="email" />
      </label>
      <label className="block text-sm font-semibold text-forest">
        Password
        <input
          className={inputClassName}
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <FieldError state={state} name="password" />
      </label>
      <label className="block text-sm font-semibold text-forest">
        Confirm password
        <input
          className={inputClassName}
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <FieldError state={state} name="confirmPassword" />
      </label>
      <FormMessage state={state} />
      <SubmitButton label="Create account" pendingLabel="Creating account…" />
      <p className="text-center text-sm text-forest/70">
        Already have an account?{" "}
        <Link className="font-bold text-ocean hover:underline" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
