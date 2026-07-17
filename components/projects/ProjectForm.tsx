"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createProjectAction,
  updateProjectMetadataAction,
} from "@/app/(protected)/projects/actions";
import { initialActionState } from "@/lib/actions/action-state";
import type { Project } from "@/lib/domain/project/schemas";

const fieldClassName =
  "mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-forest outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/15";

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="rounded-full bg-ocean px-6 py-3 font-bold text-white transition hover:bg-forest disabled:cursor-wait disabled:opacity-65"
      disabled={pending}
      type="submit"
    >
      {pending ? "Saving project…" : editing ? "Save changes" : "Create project"}
    </button>
  );
}

export function ProjectForm({ project }: { project?: Project }) {
  const [state, action] = useActionState(
    project ? updateProjectMetadataAction : createProjectAction,
    initialActionState,
  );
  const error = (name: string) => state.fieldErrors?.[name]?.[0];

  return (
    <form action={action} className="mt-8 grid gap-6 sm:grid-cols-2">
      {project ? <input name="projectId" type="hidden" value={project.id} /> : (
        <label className="block text-sm font-semibold text-forest sm:col-span-2">
          Project name
          <input className={fieldClassName} name="name" maxLength={120} required />
          {error("name") ? <span className="mt-1 block text-sm text-clay">{error("name")}</span> : null}
        </label>
      )}

      <label className="block text-sm font-semibold text-forest sm:col-span-2">
        Description
        <textarea className={`${fieldClassName} min-h-28 resize-y`} name="description" maxLength={2000} defaultValue={project?.description ?? ""} />
      </label>

      <label className="block text-sm font-semibold text-forest">
        Project type
        <select className={fieldClassName} name="projectType" defaultValue={project?.project_type ?? "web-app"}>
          <option value="web-app">Web app</option>
          <option value="mobile-app">Mobile app</option>
          <option value="internal-tool">Internal tool</option>
          <option value="ai-product">AI product</option>
          <option value="data-pipeline">Data pipeline</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label className="block text-sm font-semibold text-forest">
        Planning depth
        <select className={fieldClassName} name="planningDepth" defaultValue={project?.planning_depth ?? "balanced"}>
          <option value="lean">Lean</option>
          <option value="balanced">Balanced</option>
          <option value="detailed">Detailed</option>
        </select>
      </label>

      <label className="block text-sm font-semibold text-forest sm:col-span-2">
        Target users
        <textarea className={`${fieldClassName} min-h-24 resize-y`} name="targetUsers" maxLength={1000} defaultValue={project?.target_users ?? ""} />
      </label>

      <label className="block text-sm font-semibold text-forest">
        Team size
        <input className={fieldClassName} name="teamSize" type="number" min={1} max={50} defaultValue={project?.team_size ?? 3} required />
        {error("teamSize") ? <span className="mt-1 block text-sm text-clay">{error("teamSize")}</span> : null}
      </label>

      <label className="block text-sm font-semibold text-forest">
        Sprint length
        <select className={fieldClassName} name="sprintLength" defaultValue={project?.sprint_length ?? "2-weeks"}>
          <option value="1-week">1 week</option>
          <option value="2-weeks">2 weeks</option>
          <option value="3-weeks">3 weeks</option>
          <option value="4-weeks">4 weeks</option>
        </select>
      </label>

      <label className="block text-sm font-semibold text-forest">
        Sprint capacity (points)
        <input className={fieldClassName} name="capacity" type="number" min={1} max={200} defaultValue={project?.capacity ?? 24} required />
        {error("capacity") ? <span className="mt-1 block text-sm text-clay">{error("capacity")}</span> : null}
      </label>

      <label className="block text-sm font-semibold text-forest sm:col-span-2">
        Constraints
        <textarea className={`${fieldClassName} min-h-28 resize-y`} name="constraints" maxLength={5000} defaultValue={project?.constraints ?? ""} />
      </label>

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <SubmitButton editing={Boolean(project)} />
        {state.status === "error" ? <p className="text-sm text-clay" role="status">{state.message}</p> : null}
      </div>
    </form>
  );
}
