"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";
import type { ActionState } from "@/lib/actions/action-state";

export function AuthFormMessage({ state }: { state: ActionState }) {
  if (state.status === "idle") {
    return null;
  }

  return (
    <p aria-live="polite" className={state.status === "success" ? "text-sm font-medium text-forest" : "text-sm font-medium text-clay"} role={state.status === "error" ? "alert" : "status"}>
      {state.message}
    </p>
  );
}

export function AuthSubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return <Button aria-busy={pending} className="w-full" disabled={pending} type="submit">{pending ? pendingLabel : label}</Button>;
}
