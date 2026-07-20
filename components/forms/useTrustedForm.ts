"use client";

import { useEffect, useMemo, useState, type FormEvent, type RefObject } from "react";

import type { ActionState, FieldErrors } from "@/lib/actions/action-state";
import { focusFirstInvalidField, hasFieldErrors } from "@/lib/forms/client-validation";

type ValidateForm = (formData: FormData) => FieldErrors;

export function useTrustedForm({
  dirty,
  formRef,
  serverState,
  validate,
  warnOnNavigate = true,
}: Readonly<{
  dirty: boolean;
  formRef: RefObject<HTMLFormElement | null>;
  serverState: ActionState;
  validate: ValidateForm;
  warnOnNavigate?: boolean;
}>) {
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [editedFields, setEditedFields] = useState<ReadonlySet<string>>(new Set());
  const [clientFailure, setClientFailure] = useState<ActionState | null>(null);

  const fieldErrors = useMemo(() => {
    const remainingServerErrors = Object.fromEntries(
      Object.entries(serverState.fieldErrors ?? {}).filter(([name]) => !editedFields.has(name)),
    );
    return { ...remainingServerErrors, ...clientErrors };
  }, [clientErrors, editedFields, serverState.fieldErrors]);
  const serverPresentationState = serverState.status === "success" && dirty
    || serverState.status === "error" && serverState.errorKind === "validation" && editedFields.size > 0
    ? { status: "idle" as const, message: "" }
    : serverState;
  const state = clientFailure ?? serverPresentationState;

  useEffect(() => {
    if (formRef.current && serverState.status === "error" && serverState.fieldErrors) {
      focusFirstInvalidField(formRef.current, serverState.fieldErrors);
    }
  }, [formRef, serverState]);

  useUnsavedChanges(warnOnNavigate && dirty && serverState.status !== "success");

  function onFieldChange(name: string) {
    setEditedFields((current) => new Set(current).add(name));
    setClientErrors((current) => {
      if (!(name in current)) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
    setClientFailure(null);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      event.preventDefault();
      setClientFailure({
        status: "error",
        message: "Could not reach the server. Your work is still here. Check your connection and retry.",
        errorKind: "network",
        retryable: true,
      });
      return;
    }

    const errors = validate(new FormData(form));
    setClientErrors(errors);
    setClientFailure(null);
    if (hasFieldErrors(errors)) {
      event.preventDefault();
      setClientFailure({ status: "error", message: "Fix the highlighted fields. Your work is still here.", errorKind: "validation", retryable: false });
      focusFirstInvalidField(form, errors);
    }
  }

  return { fieldErrors, onFieldChange, onSubmit, state };
}

export function useUnsavedChanges(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const confirmNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!target || target.target === "_blank" || target.hasAttribute("download")) return;
      const destination = new URL(target.href, window.location.href);
      const current = new URL(window.location.href);
      if (destination.origin !== current.origin || (destination.pathname === current.pathname && destination.search === current.search)) return;
      if (!window.confirm("You have unsaved changes. Leave without saving them?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", confirmNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", confirmNavigation, true);
    };
  }, [enabled]);
}
