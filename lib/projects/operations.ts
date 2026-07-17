import "server-only";

import { createProjectDuplicate } from "@/lib/domain/project/duplication";
import {
  ProjectOutputSchema,
  type Project,
  type ProjectCreateInput,
} from "@/lib/domain/project/schemas";
import { createClient } from "@/lib/supabase/server";

export async function listProjects(userId: string): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ProjectOutputSchema.array().parse(data);
}

export async function getProjectById(
  projectId: string,
  userId: string,
): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? ProjectOutputSchema.parse(data) : null;
}

export async function createProject(
  input: ProjectCreateInput,
  userId: string,
): Promise<Project> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description,
      project_type: input.projectType,
      target_users: input.targetUsers,
      team_size: input.teamSize,
      sprint_length: input.sprintLength,
      capacity: input.capacity,
      planning_depth: input.planningDepth,
      constraints: input.constraints,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return ProjectOutputSchema.parse(data);
}

export async function renameProject(
  projectId: string,
  name: string,
  userId: string,
): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ name })
    .eq("id", projectId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? ProjectOutputSchema.parse(data) : null;
}

export async function updateProjectMetadata(
  projectId: string,
  input: Omit<ProjectCreateInput, "name">,
  userId: string,
): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({
      description: input.description,
      project_type: input.projectType,
      target_users: input.targetUsers,
      team_size: input.teamSize,
      sprint_length: input.sprintLength,
      capacity: input.capacity,
      planning_depth: input.planningDepth,
      constraints: input.constraints,
    })
    .eq("id", projectId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? ProjectOutputSchema.parse(data) : null;
}

export async function duplicateProject(
  projectId: string,
  userId: string,
): Promise<Project | null> {
  const source = await getProjectById(projectId, userId);
  if (!source) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert(createProjectDuplicate(source, userId))
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return ProjectOutputSchema.parse(data);
}

export async function deleteProject(
  projectId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", userId)
    .select("id");

  if (error) {
    throw error;
  }

  return data.length === 1;
}
