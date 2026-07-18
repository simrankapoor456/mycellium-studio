"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { deleteProjectAction, duplicateProjectAction, renameProjectAction } from "@/app/(protected)/projects/actions";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { initialActionState } from "@/lib/actions/action-state";

function DuplicateButton() {
  const { pending } = useFormStatus();
  return <Button className="px-3" disabled={pending} type="submit" variant="quiet">{pending ? "Duplicating" : "Duplicate"}</Button>;
}

export function ProjectCardActions({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [renameState, renameAction] = useActionState(renameProjectAction, initialActionState);
  const [duplicateState, duplicateAction] = useActionState(duplicateProjectAction, initialActionState);
  const [deleteState, deleteAction] = useActionState(deleteProjectAction, initialActionState);
  const message = [renameState, duplicateState, deleteState].find((state) => state.status !== "idle");

  return (
    <div className="mt-5 border-t border-line pt-4">
      <details>
        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-bold text-forest">Rename project</summary>
        <form action={renameAction} className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
          <input name="projectId" type="hidden" value={projectId} />
          <label className="sr-only" htmlFor={`rename-${projectId}`}>New project name</label>
          <input className="form-control" defaultValue={projectName} id={`rename-${projectId}`} maxLength={120} name="name" required />
          <Button type="submit">Save name</Button>
        </form>
      </details>
      <div className="flex flex-wrap items-center gap-2">
        <form action={duplicateAction}>
          <input name="projectId" type="hidden" value={projectId} />
          <DuplicateButton />
        </form>
        <ConfirmDialog confirmLabel="Delete project" description={`Delete “${projectName}” and its saved discovery messages. This action cannot be undone.`} formAction={deleteAction} hiddenFields={[{ name: "projectId", value: projectId }]} title="Delete this project?" triggerLabel="Delete" />
      </div>
      {message ? <p className={message.status === "error" ? "mt-3 text-sm text-clay" : "mt-3 text-sm text-forest"} role="status">{message.message}</p> : null}
    </div>
  );
}
