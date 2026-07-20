"use client";

import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createProjectAction, updateProjectMetadataAction } from "@/app/(protected)/projects/actions";
import { DirtyIndicator, FormActionMessage, FormSubmitButton } from "@/components/forms/FormStatus";
import { useTrustedForm } from "@/components/forms/useTrustedForm";
import { FoundationPreview } from "@/components/projects/FoundationPreview";
import { ProjectBasicsFields } from "@/components/projects/ProjectBasicsFields";
import { ProjectPlanningFields } from "@/components/projects/ProjectPlanningFields";
import { initialActionState } from "@/lib/actions/action-state";
import { projectInputFromFormData } from "@/lib/domain/project/form-data";
import { getProjectFormValues, parseProjectDraft, type ProjectFormValues } from "@/lib/domain/project/form-values";
import { ProjectCreateInputSchema, ProjectMetadataUpdateInputSchema, type Project } from "@/lib/domain/project/schemas";

const DRAFT_KEY_PREFIX = "mycellium:project-draft:v1";

export function ProjectForm({ draftOwnerId = "local", project }: { draftOwnerId?: string; project?: Project }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState(project ? updateProjectMetadataAction : createProjectAction, initialActionState);
  const initialValues = useMemo(() => getProjectFormValues(project), [project]);
  const [values, setValues] = useState<ProjectFormValues>(initialValues);
  const [draftReady, setDraftReady] = useState(Boolean(project));
  const [draftRestored, setDraftRestored] = useState(false);
  const draftKey = `${DRAFT_KEY_PREFIX}:${draftOwnerId}`;
  const dirty = state.status !== "success" && JSON.stringify(values) !== JSON.stringify(initialValues);
  const validate = useCallback((formData: FormData) => {
    const candidate = project
      ? { ...projectInputFromFormData(formData), projectId: formData.get("projectId") }
      : projectInputFromFormData(formData);
    const parsed = (project ? ProjectMetadataUpdateInputSchema : ProjectCreateInputSchema).safeParse(candidate);
    return parsed.success ? {} : parsed.error.flatten().fieldErrors;
  }, [project]);
  const trust = useTrustedForm({ dirty, formRef, serverState: state, validate });

  useEffect(() => {
    if (project) return;
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem(draftKey);
      const draft = stored ? parseProjectDraft(stored) : null;
      if (draft) {
        setValues(draft);
        setDraftRestored(true);
      }
      setDraftReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [draftKey, project]);

  useEffect(() => {
    if (project || !draftReady || state.status === "success") return;
    const timer = window.setTimeout(() => {
      if (JSON.stringify(values) === JSON.stringify(initialValues)) {
        window.localStorage.removeItem(draftKey);
      } else {
        window.localStorage.setItem(draftKey, JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), values }));
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [draftKey, draftReady, initialValues, project, state.status, values]);

  useEffect(() => {
    if (state.status !== "success" || !state.redirectTo) return;
    if (!project) window.localStorage.removeItem(draftKey);
    const destination = state.redirectTo;
    const timer = window.setTimeout(() => router.push(destination), 250);
    return () => window.clearTimeout(timer);
  }, [draftKey, project, router, state]);

  function updateValue(name: keyof ProjectFormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    trust.onFieldChange(name);
  }

  return (
    <form action={action} className="project-idea-form" data-editing={Boolean(project)} noValidate onSubmit={trust.onSubmit} ref={formRef}>
      {project ? <input name="projectId" type="hidden" value={project.id} /> : null}
      <div className="project-idea-form__fields">
        <ProjectBasicsFields editing={Boolean(project)} fieldErrors={trust.fieldErrors} onChange={updateValue} values={values} />
        <ProjectPlanningFields fieldErrors={trust.fieldErrors} onChange={updateValue} values={values} />
        <footer className="project-idea-form__save">
          <div>
            <FormSubmitButton dirty={dirty} idleLabel={project ? "Save starting context" : "Start this project"} pendingLabel="Saving your work" state={trust.state} />
            <DirtyIndicator dirty={dirty} />
          </div>
          <FormActionMessage state={trust.state} />
          {draftRestored ? <p aria-live="polite" className="project-draft-restored">Draft restored from this browser.</p> : null}
        </footer>
      </div>
      {!project ? <FoundationPreview values={values} /> : null}
    </form>
  );
}
