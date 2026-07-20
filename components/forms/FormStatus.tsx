"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";
import type { ActionState } from "@/lib/actions/action-state";

export function DirtyIndicator({ dirty }: { dirty: boolean }) {
  return <span aria-live="polite" className="form-dirty-indicator" data-dirty={dirty}>{dirty ? "Unsaved changes" : "All changes saved"}</span>;
}

export function FormActionMessage({ state }: { state: ActionState }) {
  if (state.status === "idle") return null;
  return (
    <div aria-live="polite" className="form-action-message" data-kind={state.errorKind} data-status={state.status} role={state.status === "error" ? "alert" : "status"}>
      <span>{state.message}</span>
      {state.errorKind === "authentication" ? <Link href="/login">Sign in again</Link> : null}
    </div>
  );
}

export function FormSubmitButton({
  idleLabel,
  pendingLabel,
  state,
  dirty = false,
}: Readonly<{ idleLabel: string; pendingLabel: string; state: ActionState; dirty?: boolean }>) {
  const { pending } = useFormStatus();
  const label = pending ? pendingLabel : state.status === "success" && !dirty ? "Saved" : state.status === "error" && state.retryable ? "Retry" : idleLabel;
  return <Button aria-busy={pending} disabled={pending} type="submit">{label}</Button>;
}

export function FormLoading({ label }: { label: string }) {
  return <span aria-live="polite" className="form-loading" role="status">{label}</span>;
}

export function SuccessToast({ message }: { message: string }) {
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShown(false), 3_500);
    return () => window.clearTimeout(timer);
  }, []);

  return shown ? <div className="form-success-toast" role="status">{message}</div> : null;
}
