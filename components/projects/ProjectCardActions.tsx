"use client";

import { useActionState, useCallback, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { deleteProjectAction, duplicateProjectAction, renameProjectAction } from "@/app/(protected)/projects/actions";
import { TextField } from "@/components/forms/FormControls";
import { FormActionMessage, FormSubmitButton } from "@/components/forms/FormStatus";
import { useTrustedForm } from "@/components/forms/useTrustedForm";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { initialActionState } from "@/lib/actions/action-state";
import { ProjectRenameInputSchema } from "@/lib/domain/project/schemas";

function DuplicateButton() {
  const { pending } = useFormStatus();
  return <Button className="px-3" disabled={pending} type="submit" variant="quiet">{pending ? "Duplicating" : "Duplicate"}</Button>;
}

export function ProjectCardActions({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [renameState, renameAction] = useActionState(renameProjectAction, initialActionState);
  const [duplicateState, duplicateAction] = useActionState(duplicateProjectAction, initialActionState);
  const [deleteState, deleteAction] = useActionState(deleteProjectAction, initialActionState);
  const [name, setName] = useState(projectName);
  const renameFormRef = useRef<HTMLFormElement>(null);
  const validateRename = useCallback((formData: FormData) => {
    const parsed = ProjectRenameInputSchema.safeParse({ projectId: formData.get("projectId"), name: formData.get("name") });
    return parsed.success ? {} : parsed.error.flatten().fieldErrors;
  }, []);
  const renameTrust = useTrustedForm({ dirty: name !== projectName, formRef: renameFormRef, serverState: renameState, validate: validateRename });
  const message = [duplicateState, deleteState].find((state) => state.status !== "idle");

  return (
    <div className="mt-5 border-t border-line pt-4">
      <details>
        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-bold text-forest">Rename project</summary>
        <form action={renameAction} className="mt-2 grid gap-2" noValidate onSubmit={renameTrust.onSubmit} ref={renameFormRef}>
          <input name="projectId" type="hidden" value={projectId} />
          <TextField error={renameTrust.fieldErrors.name?.[0]} id={`rename-${projectId}`} label="New project name" maxLength={120} name="name" onChange={(event) => { setName(event.currentTarget.value); renameTrust.onFieldChange("name"); }} requirement="required" value={name} />
          <FormSubmitButton dirty={name !== projectName} idleLabel="Save name" pendingLabel="Saving name" state={renameTrust.state} />
          <FormActionMessage state={renameTrust.state} />
        </form>
      </details>
      <div className="flex flex-wrap items-center gap-2">
        <form action={duplicateAction}>
          <input name="projectId" type="hidden" value={projectId} />
          <DuplicateButton />
        </form>
        <ConfirmDialog confirmLabel="Delete project" description={`Delete “${projectName}” and its saved discovery messages. This action cannot be undone.`} formAction={deleteAction} hiddenFields={[{ name: "projectId", value: projectId }]} title="Delete this project?" triggerLabel="Delete" />
      </div>
      {message ? <FormActionMessage state={message} /> : null}
    </div>
  );
}
