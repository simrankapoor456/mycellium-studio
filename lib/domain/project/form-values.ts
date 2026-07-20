import type { Project } from "@/lib/domain/project/schemas";

export type ProjectFormValues = {
  name: string;
  description: string;
  projectType: string;
  customProjectType: string;
  targetUsers: string;
  teamSize: string;
  sprintLength: string;
  capacity: string;
  planningDepth: string;
  constraints: string;
};

export function getProjectFormValues(project?: Project): ProjectFormValues {
  return {
    name: project?.name ?? "",
    description: project?.description ?? "",
    projectType: project?.project_type ?? "",
    customProjectType: project?.custom_project_type ?? "",
    targetUsers: project?.target_users ?? "",
    teamSize: String(project?.team_size ?? 3),
    sprintLength: project?.sprint_length ?? "2-weeks",
    capacity: project?.capacity ? String(project.capacity) : "",
    planningDepth: project?.planning_depth ?? "",
    constraints: project?.constraints ?? "",
  };
}

export function parseProjectDraft(value: string): ProjectFormValues | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null || !("values" in parsed)) return null;
    const values = parsed.values;
    if (typeof values !== "object" || values === null) return null;
    const initial = getProjectFormValues();
    const entries = Object.entries(initial).map(([key, fallback]) => {
      const candidate = (values as Record<string, unknown>)[key];
      return [key, typeof candidate === "string" ? candidate : fallback];
    });
    return Object.fromEntries(entries) as ProjectFormValues;
  } catch {
    return null;
  }
}
