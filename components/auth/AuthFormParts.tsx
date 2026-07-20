"use client";

import { FormActionMessage, FormSubmitButton } from "@/components/forms/FormStatus";
import type { ActionState } from "@/lib/actions/action-state";

export function AuthFormMessage({ state }: { state: ActionState }) {
  return <FormActionMessage state={state} />;
}

export function AuthSubmitButton({ label, pendingLabel, state }: { label: string; pendingLabel: string; state: ActionState }) {
  return <div className="auth-submit"><FormSubmitButton idleLabel={label} pendingLabel={pendingLabel} state={state} /></div>;
}
