"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { sessionExpiredActionState, validationActionState, type ActionState } from "@/lib/actions/action-state";
import { getCurrentUser } from "@/lib/auth/current-user";
import { projectInputFromFormData } from "@/lib/domain/project/form-data";
import {
  ProjectCreateInputSchema,
  ProjectIdInputSchema,
  ProjectMetadataUpdateInputSchema,
  ProjectRenameInputSchema,
} from "@/lib/domain/project/schemas";
import { toActionFailure } from "@/lib/errors/safe-error";
import {
  createProject,
  deleteProject,
  duplicateProject,
  renameProject,
  updateProjectMetadata,
} from "@/lib/projects/operations";

export async function createProjectAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = ProjectCreateInputSchema.safeParse(projectInputFromFormData(formData));

  if (!parsed.success) {
    return validationActionState("Fix the highlighted fields. Your draft has not been cleared.", parsed.error.flatten().fieldErrors);
  }

  const user = await getCurrentUser();
  if (!user) return sessionExpiredActionState();

  try {
    const project = await createProject(parsed.data, user.id);
    revalidatePath("/dashboard");
    return {
      status: "success",
      message: "Project created. Your draft is now saved.",
      redirectTo: `/projects/${project.id}`,
    };
  } catch (error) {
    return toActionFailure(error, {
      network: "Could not reach the server. Your draft is safe. Check your connection and retry.",
      database: "Unable to create the project. Your draft is safe. Retry in a moment.",
      permission: "You do not have permission to create this project.",
      unknown: "Unable to create the project. Your draft is safe. Retry.",
    });
  }
}

export async function renameProjectAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = ProjectRenameInputSchema.safeParse({
    projectId: formData.get("projectId"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return validationActionState("Project name is required.", parsed.error.flatten().fieldErrors);
  }

  const user = await getCurrentUser();
  if (!user) return sessionExpiredActionState();

  try {
    const project = await renameProject(parsed.data.projectId, parsed.data.name, user.id);
    if (!project) {
      return { status: "error", message: "Project not found." };
    }
  } catch (error) {
    return toActionFailure(error, { unknown: "The project could not be renamed. Retry." });
  }

  revalidatePath("/dashboard");
  revalidatePath(`/projects/${parsed.data.projectId}`);
  return { status: "success", message: "Project renamed." };
}

export async function updateProjectMetadataAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = ProjectMetadataUpdateInputSchema.safeParse({
    ...projectInputFromFormData(formData),
    projectId: formData.get("projectId"),
  });

  if (!parsed.success) {
    return validationActionState("Fix the highlighted fields. Your changes are still here.", parsed.error.flatten().fieldErrors);
  }

  const user = await getCurrentUser();
  if (!user) return sessionExpiredActionState();
  const { projectId, ...metadata } = parsed.data;

  try {
    const project = await updateProjectMetadata(projectId, metadata, user.id);
    if (!project) {
      return { status: "error", message: "Project not found." };
    }
  } catch (error) {
    return toActionFailure(error, {
      network: "Could not reach the server. Your changes are still here. Check your connection and retry.",
      database: "The project could not be saved. Your changes are still here. Retry in a moment.",
      unknown: "The project could not be saved. Your changes are still here. Retry.",
    });
  }

  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
  return { status: "success", message: "Project saved.", redirectTo: `/projects/${projectId}` };
}

export async function duplicateProjectAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = ProjectIdInputSchema.safeParse({ projectId: formData.get("projectId") });
  if (!parsed.success) {
    return { status: "error", message: "Project not found." };
  }

  const user = await getCurrentUser();
  if (!user) return sessionExpiredActionState();

  try {
    const project = await duplicateProject(parsed.data.projectId, user.id);
    if (!project) {
      return { status: "error", message: "Project not found." };
    }
  } catch (error) {
    return toActionFailure(error, { unknown: "The project could not be duplicated. Retry." });
  }

  revalidatePath("/dashboard");
  return { status: "success", message: "Project duplicated." };
}

export async function deleteProjectAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = ProjectIdInputSchema.safeParse({ projectId: formData.get("projectId") });
  if (!parsed.success) {
    return { status: "error", message: "Project not found." };
  }

  const user = await getCurrentUser();
  if (!user) return sessionExpiredActionState();

  try {
    const deleted = await deleteProject(parsed.data.projectId, user.id);
    if (!deleted) {
      return { status: "error", message: "Project not found." };
    }
  } catch (error) {
    return toActionFailure(error, { unknown: "The project could not be deleted. Retry." });
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
