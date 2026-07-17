"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  deleteProjectAction,
  duplicateProjectAction,
  renameProjectAction,
} from "@/app/(protected)/projects/actions";
import { initialActionState } from "@/lib/actions/action-state";

function ActionButton({ children, danger = false }: { children: React.ReactNode; danger?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      className={
        danger
          ? "text-sm font-bold text-clay hover:underline disabled:opacity-50"
          : "text-sm font-bold text-ocean hover:underline disabled:opacity-50"
      }
      disabled={pending}
      type="submit"
    >
      {pending ? "Working…" : children}
    </button>
  );
}

export function ProjectCardActions({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [renameState, renameAction] = useActionState(renameProjectAction, initialActionState);
  const [duplicateState, duplicateAction] = useActionState(duplicateProjectAction, initialActionState);
  const [deleteState, deleteAction] = useActionState(deleteProjectAction, initialActionState);
  const message = [renameState, duplicateState, deleteState].find((state) => state.status !== "idle");

  return (
    <div className="mt-5 border-t border-line pt-4">
      <details>
        <summary className="cursor-pointer text-sm font-bold text-ocean">Rename</summary>
        <form action={renameAction} className="mt-3 flex gap-2">
          <input name="projectId" type="hidden" value={projectId} />
          <input
            aria-label="New project name"
            className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ocean"
            defaultValue={projectName}
            maxLength={120}
            name="name"
            required
          />
          <button className="rounded-xl bg-forest px-3 py-2 text-sm font-bold text-white" type="submit">
            Save
          </button>
        </form>
      </details>
      <div className="mt-3 flex gap-4">
        <form action={duplicateAction}>
          <input name="projectId" type="hidden" value={projectId} />
          <ActionButton>Duplicate</ActionButton>
        </form>
        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (!window.confirm(`Delete “${projectName}”? This cannot be undone.`)) {
              event.preventDefault();
            }
          }}
        >
          <input name="projectId" type="hidden" value={projectId} />
          <ActionButton danger>Delete</ActionButton>
        </form>
      </div>
      {message ? (
        <p className={message.status === "error" ? "mt-3 text-sm text-clay" : "mt-3 text-sm text-forest"} role="status">
          {message.message}
        </p>
      ) : null}
    </div>
  );
}
