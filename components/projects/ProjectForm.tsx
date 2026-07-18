"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createProjectAction, updateProjectMetadataAction } from "@/app/(protected)/projects/actions";
import { ProjectBasicsFields } from "@/components/projects/ProjectBasicsFields";
import { ProjectPlanningFields } from "@/components/projects/ProjectPlanningFields";
import { Button } from "@/components/ui/Button";
import { initialActionState } from "@/lib/actions/action-state";
import type { Project } from "@/lib/domain/project/schemas";

function ProjectSubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  const label = editing ? "Save starting context" : "Start this project";

  return <Button disabled={pending} type="submit">{pending ? "Saving the foundation" : label}</Button>;
}

export function ProjectForm({ project }: { project?: Project }) {
  const [state, action] = useActionState(project ? updateProjectMetadataAction : createProjectAction, initialActionState);

  return (
    <form action={action} className="mt-9 grid gap-6 sm:grid-cols-2">
      <ProjectBasicsFields fieldErrors={state.fieldErrors} project={project} />
      <ProjectPlanningFields fieldErrors={state.fieldErrors} project={project} />
      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6 sm:col-span-2">
        <ProjectSubmitButton editing={Boolean(project)} />
        {state.status === "error" ? <p className="text-sm font-medium text-clay" role="status">{state.message}</p> : null}
      </div>
    </form>
  );
}
