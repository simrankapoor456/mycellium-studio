"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/lib/actions/action-state";
import { requireUser } from "@/lib/auth/current-user";
import { projectInputFromFormData } from "@/lib/domain/project/form-data";
import {
  ProjectCreateInputSchema,
  ProjectIdInputSchema,
  ProjectMetadataUpdateInputSchema,
  ProjectRenameInputSchema,
} from "@/lib/domain/project/schemas";
import { toProjectErrorMessage } from "@/lib/errors/safe-error";
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
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await requireUser();
  let projectId: string;

  try {
    const project = await createProject(parsed.data, user.id);
    projectId = project.id;
  } catch (error) {
    return { status: "error", message: toProjectErrorMessage(error) };
  }

  revalidatePath("/dashboard");
  redirect(`/projects/${projectId}`);
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
    return {
      status: "error",
      message: "Enter a valid project name.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await requireUser();

  try {
    const project = await renameProject(parsed.data.projectId, parsed.data.name, user.id);
    if (!project) {
      return { status: "error", message: "Project not found." };
    }
  } catch (error) {
    return { status: "error", message: toProjectErrorMessage(error) };
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
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await requireUser();
  const { projectId, ...metadata } = parsed.data;

  try {
    const project = await updateProjectMetadata(projectId, metadata, user.id);
    if (!project) {
      return { status: "error", message: "Project not found." };
    }
  } catch (error) {
    return { status: "error", message: toProjectErrorMessage(error) };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function duplicateProjectAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = ProjectIdInputSchema.safeParse({ projectId: formData.get("projectId") });
  if (!parsed.success) {
    return { status: "error", message: "Project not found." };
  }

  const user = await requireUser();

  try {
    const project = await duplicateProject(parsed.data.projectId, user.id);
    if (!project) {
      return { status: "error", message: "Project not found." };
    }
  } catch (error) {
    return { status: "error", message: toProjectErrorMessage(error) };
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

  const user = await requireUser();

  try {
    const deleted = await deleteProject(parsed.data.projectId, user.id);
    if (!deleted) {
      return { status: "error", message: "Project not found." };
    }
  } catch (error) {
    return { status: "error", message: toProjectErrorMessage(error) };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
